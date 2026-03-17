import { chromium } from 'playwright'
import TurndownService from 'turndown'
import dayjs from 'dayjs'
import fs from 'fs-extra'
const { existsSync, outputFileSync, readJsonSync, outputJsonSync, removeSync } = fs
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'

import * as cheerio from 'cheerio'

import { urlToMd5, loadProcessed, withProcessedUpdate } from './utils.js'
import { getRuleForUrl } from './rules/index.js'
import { localizeImages } from './images.js'
import { STEALTH_ARGS, applyStealthScripts, simulateHuman } from './stealth.js'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

// Resolves to front-end-rss/data/articles/
const ARTICLES_DIR = join(__dirname, '..', '..', 'data', 'articles')
const DELETED_PATH = join(__dirname, '..', '..', 'data', 'deleted.json')

/** Per-link lock so concurrent /once requests for the same article serialize. */
const linkLockChains = new Map()

/**
 * Run fn exclusively for this link (one at a time per link).
 * @param {string} link
 * @param {() => Promise<T>} fn
 * @returns {Promise<T>}
 * @template T
 */
async function withLinkLock(link, fn) {
  const prev = linkLockChains.get(link) ?? Promise.resolve()
  const run = prev.then(() => fn())
  linkLockChains.set(link, run)
  try {
    return await run
  } finally {
    if (linkLockChains.get(link) === run) linkLockChains.delete(link)
  }
}
const LINKS_PATH = join(__dirname, '..', '..', 'data', 'links.json')

/**
 * Extract a normalised language identifier from a raw class string.
 * Handles common patterns from highlight.js, Prism, SyntaxHighlighter, etc.
 * @param {string} raw - combined class attribute value(s)
 * @returns {string} e.g. "javascript", or "" when undetected
 */
function detectLang(raw = '') {
  // language-xxx  /  lang-xxx  (Prism, highlight.js, standard)
  let m = raw.match(/\b(?:language|lang)-(\w+)/)
  if (m) return m[1]

  // hljs <lang>  or  <lang> hljs
  m = raw.match(/\bhljs\b[^a-z]*(\w+)/) ?? raw.match(/(\w+)[^a-z]*\bhljs\b/)
  if (m && m[1] !== 'hljs') return m[1]

  // brush: <lang>  (SyntaxHighlighter)
  m = raw.match(/\bbrush:\s*(\w+)/)
  if (m) return m[1]

  // prettyprint  (Google Code Prettify keeps lang in a separate class)
  m = raw.replace('prettyprint', '').match(/\b([\w+#-]{2,})\b/)
  if (m && !['code', 'pre', 'wrap', 'copy'].includes(m[1])) return m[1]

  return ''
}

/**
 * Replace strings matching known secret / token patterns with a safe
 * placeholder so GitHub push-protection never blocks a commit.
 *
 * Only well-known, high-entropy formats are targeted; plain prose that
 * merely mentions a token *prefix* (e.g. "tokens start with xoxb-") is
 * left untouched because it won't match the full pattern.
 *
 * @param {string} text
 * @returns {string}
 */
function sanitizeSecrets(text) {
  return (
    text
      // Slack  xoxb- / xoxp- / xoxa- / xoxr- / xoxs-
      .replace(/xox[baprs]-\d{10,13}-\d{10,13}-[0-9A-Za-z]{24,}/g, 'xox*-[REDACTED]')
      // GitHub classic PAT  ghp_ / gho_ / ghu_ / ghs_ / ghr_
      .replace(/gh[pousr]_[0-9A-Za-z]{36,}/g, 'gh*_[REDACTED]')
      // GitHub fine-grained PAT
      .replace(/github_pat_[0-9A-Za-z_]{82}/g, 'github_pat_[REDACTED]')
      // GitLab PAT
      .replace(/glpat-[0-9A-Za-z_-]{20}/g, 'glpat-[REDACTED]')
      // AWS Access Key ID
      .replace(/\bAKIA[0-9A-Z]{16}\b/g, 'AKIA[REDACTED]')
      // OpenAI secret key (classic format)
      .replace(/\bsk-[A-Za-z0-9]{20}T3BlbkFJ[A-Za-z0-9]{20}\b/g, 'sk-[REDACTED]')
      // npm token
      .replace(/\bnpm_[A-Za-z0-9]{36}\b/g, 'npm_[REDACTED]')
  )
}

/**
 * @typedef {Object} Article
 * @property {string} title
 * @property {string} link
 * @property {string} [date]
 * @property {string} [rssTitle]
 */

/**
 * @typedef {Object} ProcessOptions
 * @property {boolean} [force=false]    - Re-process even if already in processed.json
 * @property {boolean} [headless=true]  - Run browser in headless mode
 * @property {boolean} [_retried=false] - Internal flag to prevent infinite retry loops
 */

/**
 * @typedef {Object} ProcessResult
 * @property {boolean} [success]
 * @property {boolean} [skipped]
 * @property {string}  [error]
 * @property {string}  md5
 * @property {string}  [outputPath]
 */

/**
 * Process a single article: fetch via Playwright, convert to Markdown,
 * download & compress images, then save everything under
 * data/articles/<md5>/page.md  (images → data/articles/<md5>/images/).
 *
 * @param {Article} article
 * @param {ProcessOptions} [options]
 * @returns {Promise<ProcessResult>}
 */
export async function processArticle(article, options = {}) {
  const { force = false, headless = true } = options
  const { title, link, date } = article

  const md5 = urlToMd5(link)
  const processed = loadProcessed()

  if (!force && processed[link]) {
    console.log(`[skip] ${title}`)
    return { skipped: true, md5 }
  }

  return withLinkLock(link, async () => {
  // Clean up previous output so stale images don't accumulate
  if (force) {
    const articleDir = join(ARTICLES_DIR, md5)
    if (existsSync(articleDir)) {
      removeSync(articleDir)
      console.log(`[clean] ${articleDir}`)
    }
  }

  console.log(`[fetch] ${title}\n        ${link}`)

  const rule = getRuleForUrl(link)
  let browser

  try {
    browser = await chromium.launch({
      headless,
      args: STEALTH_ARGS,
    })
    const context = await browser.newContext({
      userAgent:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      viewport: { width: 1920, height: 1080 },
      locale: 'zh-CN',
      timezoneId: 'Asia/Shanghai',
      extraHTTPHeaders: {
        'Accept-Language': 'zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7',
        'sec-ch-ua': '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"macOS"',
      },
    })

    // Inject JS stealth patches before any page navigation
    await applyStealthScripts(context)

    const page = await context.newPage()

    await page.goto(link, {
      waitUntil: rule.waitUntil ?? 'networkidle',
      timeout: 30_000,
    })

    // Simulate human interaction to pass timing-based checks
    await simulateHuman(page)

    // Optional domain-specific hook (e.g. dismiss overlays)
    if (rule.preProcess) {
      await rule.preProcess(page)
    }

    // Wait for the content element(s) to appear, best-effort
    const contentSelectors = Array.isArray(rule.contentSelector)
      ? rule.contentSelector
      : [rule.contentSelector]
    await Promise.all(
      contentSelectors.map((sel) =>
        page.waitForSelector(sel, { timeout: 8_000 }).catch(() => {})
      )
    )



    // Resolve lazy-loaded images: prefer data-src (and other common lazy attrs)
    // Use setAttribute so the attribute is guaranteed to update in innerHTML.
    // Normalize to an absolute URL to handle protocol-relative (//cdn…) srcs.
    await page.evaluate(() => {
      document.querySelectorAll('img').forEach((img) => {
        const lazySrc =
          img.dataset.src ||
          img.dataset.original ||
          img.dataset.lazySrc ||
          img.dataset.lazyload
        if (lazySrc) {
          try {
            img.setAttribute('src', new URL(lazySrc, location.href).href)
          } catch {
            img.setAttribute('src', lazySrc)
          }
        }
      })
    })

    // Normalize code blocks so multi-line code is preserved correctly
    await page.evaluate(() => {
      // 1. <br> inside <pre>/<code> → real newline text node
      document.querySelectorAll('pre, code').forEach((el) => {
        el.querySelectorAll('br').forEach((br) => {
          br.replaceWith(document.createTextNode('\n'))
        })
      })

      // 2. Reconstruct <pre><code> from line-per-element patterns.
      //    Covers WeChat's own code block (each line is a <span> inside <code>)
      //    and other editors that wrap every line in a block element.
      //    Skip if the <pre> already carries an hljs class — in that case the
      //    child <span> elements are syntax-highlight tokens, not line containers.
      document.querySelectorAll('pre').forEach((pre) => {
        if (pre.classList.contains('hljs')) return
        const code = pre.querySelector('code') ?? pre
        if (code.classList.contains('hljs')) return
        const lines = code.querySelectorAll(
          ':scope > span, :scope > p, :scope > div, :scope > li',
        )
        // Only rewrite when there are multiple line elements and the
        // current textContent has no real newlines (i.e. it IS collapsed)
        if (lines.length > 1 && !code.textContent.includes('\n')) {
          const text = [...lines].map((l) => l.textContent).join('\n')
          code.textContent = text
        }
      })
    })

    // Extract inner HTML of the content element(s) + log img situation.
    // When contentSelector is an array, each matched element's innerHTML is
    // concatenated in order and separated by a blank line.
    // If an img's displayed width > content width - 20, mark data-rss-block-img so it renders on its own line in Markdown.
    const { contentHtml, contentImgs } = await page.evaluate((selectors) => {
      const els = selectors
        .map((sel) => document.querySelector(sel))
        .filter(Boolean)

      const imgSource = els.length ? els : [document.body]
      const contentWidthMargin = 20
      imgSource.forEach((el) => {
        const contentWidth = el.getBoundingClientRect().width
        el.querySelectorAll('img').forEach((img) => {
          const displayWidth = img.getBoundingClientRect().width
          if (displayWidth > contentWidth - contentWidthMargin) {
            img.setAttribute('data-rss-block-img', '1')
          }
        })
      })

      const html = els.length
        ? els.map((el) => el.innerHTML).join('\n')
        : document.body.innerHTML

      const imgs = imgSource.flatMap((el) =>
        [...el.querySelectorAll('img')].map((img) => ({
          src: img.getAttribute('src') ?? '',
        }))
      )
      return { contentHtml: html, contentImgs: imgs }
    }, contentSelectors)

    console.log(`[imgs] ${contentImgs.length} <img> tag(s) in content element`)
    contentImgs.forEach(({ src }) => console.log(`       src="${src.slice(0, 100)}"`))

    // Use cheerio to clean up the extracted HTML
    const $ = cheerio.load(contentHtml)

    // Remove excluded elements
    ;['script', 'style', ...(rule.excludeSelectors || [])].forEach((sel) => $(sel).remove())

    // Normalize image src to absolute URLs using the article page as base.
    // Handles protocol-relative (//cdn…) and relative (/path or ../path) srcs.
    $('img[src]').each((_, el) => {
      const src = $(el).attr('src')
      if (src && !src.startsWith('http')) {
        try {
          $(el).attr('src', new URL(src, link).href)
        } catch {}
      }
    })

    // Convert <table> elements before Turndown runs (turndown-plugin-gfm uses
    // browser-only table.rows / tr.cells which don't exist in Node.js DOM).
    //
    // Strategy:
    //   - Data table  (has <th> or <thead>) → convert to GFM Markdown table
    //   - Layout table (no headers)         → unwrap, keep cell content as-is
    //
    // Process from deepest nesting level first so inner tables are resolved
    // before their parent tables are evaluated.
    const tableMd = new Map() // placeholder → markdown string
    let tableIdx = 0

    const sortedTables = $('table').toArray().sort(
      (a, b) => $(b).parents('table').length - $(a).parents('table').length
    )

    for (const table of sortedTables) {
      const $table = $(table)
      const hasExplicitHeader = $table.find('> * th, > * > * th, thead').length > 0

      // Collect all rows first so we can check dimensions for implicit data tables
      const rows = []
      $table.find('tr').each((_, tr) => {
        const cells = $(tr).children('th, td').map((_, cell) => {
          return $(cell)
            .text()
            .replace(/[\n\r]+/g, ' ')
            .replace(/\s{2,}/g, ' ')
            .replace(/\|/g, '\\|')
            .trim() || ' '
        }).get()
        if (cells.length) rows.push(cells)
      })

      // A table with 2+ columns and 2+ rows is treated as a data table even
      // when it has no explicit <th>/<thead> markup (first row becomes header).
      // Single-column or single-row tables without headers are layout tables.
      const maxCols = rows.length ? Math.max(...rows.map((r) => r.length)) : 0
      const isDataTable = hasExplicitHeader || (rows.length >= 2 && maxCols >= 2)

      if (!isDataTable) {
        // Layout table: unwrap each <td>/<th> content, discard table chrome
        $table.find('tr').each((_, tr) => {
          // Separate cells with a newline so content doesn't run together
          const cellsHtml = $(tr).children('td, th').map((_, cell) => $(cell).html()).get().join('\n')
          $(tr).replaceWith(cellsHtml + '\n')
        })
        $table.replaceWith($table.html() ?? '')
        continue
      }

      if (!rows.length) { $table.remove(); continue }

      const cols = maxCols
      const normalised = rows.map((r) => {
        while (r.length < cols) r.push(' ')
        return r.slice(0, cols)
      })

      // Determine header row:
      //   1. explicit <thead> row
      //   2. first row whose cells are all <th>
      //   3. no explicit header → use first row as implicit header
      const headRowIdx = (() => {
        const theadRow = $table.find('thead tr').first()
        if (theadRow.length) {
          let idx = 0
          $table.find('tr').each((i, tr) => { if (tr === theadRow[0]) { idx = i } })
          return idx
        }
        const firstTr = $table.find('tr').first()
        if (firstTr.find('th').length) return 0
        // No explicit header: treat first row as header
        return 0
      })()

      const header = normalised[headRowIdx]
      const body = normalised.filter((_, i) => i !== headRowIdx)

      const mdLines = [
        '| ' + header.join(' | ') + ' |',
        '| ' + header.map(() => '---').join(' | ') + ' |',
        ...body.map((row) => '| ' + row.join(' | ') + ' |'),
      ]

      const key = `\x02MDTABLE${tableIdx++}\x03`
      tableMd.set(key, mdLines.join('\n'))
      $table.replaceWith(`<p>${key}</p>`)
    }

    // Unwrap <blockquote> that only contains <pre> (code blocks wrapped in quotes)
    $('blockquote').each((_, el) => {
      const $bq = $(el)
      const children = $bq.children()
      if (children.length === 1 && children.first().is('pre')) {
        $bq.replaceWith(children.first())
      }
    })

    // Remove any direct children of <pre> that are not <code> (e.g. copy-button
    // toolbars, line-number gutter spans injected by syntax highlighters).
    $('pre').each((_, el) => {
      // Remove non-<code> children, but keep elements that carry an hljs class
      // (highlight.js sometimes places <span class="hljs ..."> directly under <pre>)
      $(el).children(':not(code)').each((_, child) => {
        if (child.type !== 'tag') return
        const cls = $(child).attr('class') ?? ''
        if (!/hljs/.test(cls)) $(child).remove()
      })
    })

    // Merge multiple <code> siblings inside one <pre> into a single <code>.
    // Some sites emit one <code> per line / section inside the same <pre>.
    $('pre').each((_, el) => {
      const $pre = $(el)
      const $codes = $pre.children('code')
      if ($codes.length <= 1) return

      // Collect language class from first code that has one
      let langClass = ''
      $codes.each((_, code) => {
        if (!langClass) {
          const cls = $(code).attr('class') ?? ''
          if (/language-\S+/.test(cls)) langClass = cls.match(/language-\S+/)[0]
        }
      })

      // Join all code blocks with a newline, then replace with a single <code>
      const merged = $codes.map((_, code) => $(code).html()).get().join('\n')
      $pre.html(`<code${langClass ? ` class="${langClass}"` : ''}>${merged}</code>`)
    })

    // Ensure every <pre> that lacks a direct <code> child is wrapped in one
    // so Turndown always produces a fenced code block
    $('pre').each((_, el) => {
      if (!$(el).children('code').length) {
        $(el).html(`<code>${$(el).html()}</code>`)
      }
    })

    // Normalise language hints to `language-xxx` on the <code> element so
    // Turndown's fence rule picks up the identifier correctly.
    // Handles: language-js, lang-js, hljs javascript, brush: js, etc.
    $('pre').each((_, el) => {
      const $pre = $(el)
      const $code = $pre.children('code').first()
      if (!$code.length) return

      const raw = [$pre.attr('class'), $code.attr('class')].join(' ')
      const lang = detectLang(raw)
      if (lang) $code.attr('class', `language-${lang}`)
    })

    // Normalise invalid list nesting: ul/ol as direct child of ul/ol (sibling of li)
    // e.g. <ul><li>A</li><li>B</li><ul><li>B-1</li></ul></ul> → move inner ul into previous li (B)
    // Process deepest first so inner lists are re-parented before outer.
    const orphanLists = $('ul > ul, ul > ol, ol > ul, ol > ol').toArray()
      .sort((a, b) => $(b).parents('ul,ol').length - $(a).parents('ul,ol').length)
    orphanLists.forEach((el) => {
      const $el = $(el)
      const prev = $el.prev()[0]
      if (!prev || prev.type !== 'tag') return
      const prevTag = prev.name.toUpperCase()
      if (prevTag === 'LI') {
        $(prev).append($el)
      } else if (prevTag === 'UL' || prevTag === 'OL') {
        const lastLi = $(prev).children('li').last()[0]
        if (lastLi) $(lastLi).append($el)
      }
    })

    const cleanedHtml = $('body').html() ?? contentHtml

    // HTML → Markdown
    const td = new TurndownService({
      headingStyle: 'atx',
      codeBlockStyle: 'fenced',
      bulletListMarker: '-',
      hr: '---',
    })


    // Override list item rule:
    // - single space after the bullet marker (Turndown default is 3)
    // - strip trailing whitespace from each item
    // - use 2-space indent per nesting level for continuation lines (ul/ol nested in ul/ol)
    // - do not strip leading bullet/ordinal when content is multi-line (nested list)
    td.addRule('listItem', {
      filter: 'li',
      replacement(content, node, options) {
        const parent = node.parentNode
        const isOrdered = parent.nodeName === 'OL'

        // Count list nesting depth (ul/ol ancestors) for correct indent of nested lists
        let depth = 0
        let p = node.parentNode
        while (p && p.nodeType === 1) {
          if (p.nodeName === 'UL' || p.nodeName === 'OL') depth++
          p = p.parentNode
        }
        const indent = '  '.repeat(depth)

        content = content
          .replace(/^\n+/, '')
          .replace(/\n+$/, '')
          .replace(/\n/gm, `\n${indent}`)

        // Only strip leading bullet/ordinal on single-line content (site-injected noise).
        // Multi-line content may start with a nested list marker; leave it intact.
        const isSingleLine = !content.includes('\n')
        if (isSingleLine) {
          if (isOrdered) {
            content = content.replace(/^\d+\\?[.、\)]\s*/, '').replace(/^[①②③④⑤⑥⑦⑧⑨⑩]\s*/, '')
          } else {
            content = content.replace(/^\\?[•·\-–—]\s*/, '')
          }
        }

        const prefix = isOrdered
          ? `${Array.prototype.indexOf.call(parent.children, node) + 1}. `
          : `${options.bulletListMarker} `

        return prefix + content + (node.nextSibling ? '\n' : '')
      },
    })

    // Preserve <video> tags as raw HTML — Markdown has no native video syntax
    td.addRule('video', {
      filter: 'video',
      replacement(_, node) {
        const src = node.getAttribute('src') || ''
        if (!src) return ''
        const poster = node.getAttribute('poster') || ''
        const posterAttr = poster ? ` poster="${poster}"` : ''
        return `\n\n<video controls src="${src}"${posterAttr} style="max-width:100%"></video>\n\n`
      },
    })

    // Img with data-rss-block-img (display width > content width - 20): output on its own line in Markdown
    td.addRule('blockImage', {
      filter(node) {
        return node.nodeName === 'IMG' && node.getAttribute('data-rss-block-img') === '1'
      },
      replacement(_, node) {
        const alt = node.getAttribute('alt') || ''
        const src = node.getAttribute('src') || ''
        return `\n\n![${alt}](${src})\n\n`
      },
      priority: 2,
    })

    if (rule.turndownRules) {
      rule.turndownRules(td)
    }

    let body = td.turndown(cleanedHtml)

    // Restore Markdown tables from placeholders
    for (const [key, md] of tableMd) {
      body = body.replace(key, `\n\n${md}\n`)
    }

    // Remove anchor links, e.g. [#](#section-id) that many static-site generators inject
    body = body.replace(/\[#\]\(#[^)]*\)\s*/g, '')

    // Remove leading blank line inside fenced code blocks
    body = body.replace(/(^```[^\n]*\n)\n/gm, '$1')

    // Domain-specific markdown post-processing
    if (rule.postProcess) {
      body = rule.postProcess(body)
    }

    // Remove any H1 lines within the first 5 lines of body — "# title" is always
    // prepended separately in fileContent, so body itself must not start with one.
    {
      const lines = body.split('\n')
      for (let i = 0; i < Math.min(5, lines.length); i++) {
        if (/^# /.test(lines[i])) {
          lines.splice(i, 1)
          i--
        }
      }
      body = lines.join('\n')
    }

    // Collapse "orphan bullet" pattern: a lone •/· on its own line followed by
    // blank line(s) then the actual content.  Converts:
    //   •          →   - 内容
    //   (blank)
    //   内容
    body = body.replace(/^[•·] *\n\n+(.+)/gm, '- $1')

    // Remove empty list item lines: "- " / "* " / "1. " with nothing but spaces after
    body = body.replace(/^[ \t]*(?:[-*+]|\d+[.)])[ \t]*$/gm, '')

    // Remove blank lines between adjacent list items (loose list → tight list)
    body = body.replace(/^([ \t]*[-*+\d][\.\s].+)\n\n(?=[ \t]*[-*+\d][\.\s])/gm, '$1\n')

    // Collapse reference-number + blank-line(s) + http URL, keeping any prefix on its own line.
    // e.g. "参考资料\[5\]\n\nhttps://..." → "参考资料\n\[5\] https://..."
    // e.g. "\[5\]\n\nhttps://..."         → "\[5\] https://..."
    body = body.replace(/^(.*?)(\\?\[\d+\\?\])\s*\n\n+(https?:\/\/.+)/gm, (_, prefix, ref, url) => {
      return prefix ? `${prefix}\n\n${ref} ${url}` : `${ref} ${url}`
    })

    // Rule-configured retry: e.g. anti-scraping / environment-check page detected
    if (rule.retryOn?.(body)) {
      if (!options._retried) {
        console.warn(`[retry] ${link} — retryOn matched, retrying once…`)
        return processArticle(article, { ...options, force: true, _retried: true })
      }
      console.warn(`[skip]  ${link} — retryOn still matches after one retry`)
      return { error: 'retry condition persists after one retry', md5 }
    }

    // Rule-configured delete: e.g. article removed by its author
    if (rule.deleteOn?.(body)) {
      console.warn(`[delete] ${link} — deleteOn matched, cleaning up…`)
      const articleDir = join(ARTICLES_DIR, md5)
      if (existsSync(articleDir)) {
        removeSync(articleDir)
      }
      await withProcessedUpdate((p) => { if (link in p) delete p[link] })
      try {
        const sources = readJsonSync(LINKS_PATH)
        let changed = false
        for (const source of sources) {
          const before = source.items?.length ?? 0
          source.items = (source.items ?? []).filter((item) => item.link !== link)
          if (source.items.length < before) changed = true
        }
        if (changed) {
          outputJsonSync(LINKS_PATH, sources)
          const deleted = existsSync(DELETED_PATH) ? readJsonSync(DELETED_PATH) : []
          if (Array.isArray(deleted) && !deleted.includes(link)) {
            deleted.push(link)
            outputJsonSync(DELETED_PATH, deleted)
            console.log(`[processor] Appended to deleted.json`)
          }
        }
      } catch {}
      return { deleted: true, md5 }
    }

    // Count downloadable images using the same regex as localizeImages
    // (run on cleanedHtml so cheerio-normalised relative URLs are included)
    const cleanedImgSrcs = [
      ...cleanedHtml.matchAll(/<img[^>]+src="((?:https?:\/\/|data:image\/)[^"]+)"/gi),
    ].map((m) => m[1])
    const mdImgCount = new Set(cleanedImgSrcs).size
    if (mdImgCount === 0) {
      console.log('[imgs] No downloadable image URLs in content — nothing to download')
    } else {
      console.log(`[imgs] ${mdImgCount} unique image URL(s) to download`)
      if (mdImgCount !== contentImgs.length) {
        console.warn(`[imgs] ⚠ count mismatch: ${contentImgs.length} <img> tags vs ${mdImgCount} downloadable URLs`)
      }
    }

    // Download & compress images, rewrite references to local paths.
    // Pass the Playwright context so cookies/headers from the browser session
    // are used — required for CDNs that gate images behind referrer/cookies
    // (e.g. WeChat's mmbiz.qpic.cn).
    const articleDir = join(ARTICLES_DIR, md5)
    const imagesDir = join(articleDir, 'images')
    const pageOrigin = new URL(link).origin
    body = await localizeImages(body, imagesDir, context, pageOrigin)

    // Redact any token-like strings that would trigger GitHub secret scanning
    body = sanitizeSecrets(body)

    // Build YAML front-matter
    const formattedDate = date
      ? dayjs(date).format('YYYY-MM-DD')
      : dayjs().format('YYYY-MM-DD')

    const safeTitle = title.replace(/"/g, '\\"')
    const frontmatter = [
      '---',
      `title: "${safeTitle}"`,
      `link: "${link}"`,
      `date: ${formattedDate}`,
      `md5: ${md5}`,
      '---',
    ].join('\n')

    const fileContent = `${frontmatter}\n\n# ${title}\n\n${body}\n`

    // Write to data/articles/<md5>/page.md
    const outputPath = join(articleDir, 'page.md')
    outputFileSync(outputPath, fileContent, 'utf-8')

    // Persist to processed map (mutex so concurrent /once requests don't overwrite)
    await withProcessedUpdate((p) => { p[link] = md5 })

    console.log(`[done]  → ${outputPath}`)
    return { success: true, md5, outputPath }
  } catch (err) {
    console.error(`[error] ${link}\n        ${err.message}`)
    return { error: err.message, md5 }
  } finally {
    await browser?.close()
  }
  })
}