import { chromium } from 'playwright'
import TurndownService from 'turndown'
import dayjs from 'dayjs'
import { mkdirSync, writeFileSync, rmSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'

import * as cheerio from 'cheerio'

import { urlToMd5, loadProcessed, saveProcessed } from './utils.js'
import { getRuleForUrl } from './rules/index.js'
import { localizeImages } from './images.js'
import { STEALTH_ARGS, applyStealthScripts, simulateHuman } from './stealth.js'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

// Resolves to front-end-rss/data/articles/
const ARTICLES_DIR = join(__dirname, '..', '..', 'data', 'articles')

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

  // Clean up previous output so stale images don't accumulate
  if (force) {
    const articleDir = join(ARTICLES_DIR, md5)
    if (existsSync(articleDir)) {
      rmSync(articleDir, { recursive: true, force: true })
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

    // Wait for the content element to appear, best-effort
    await page
      .waitForSelector(rule.contentSelector, { timeout: 8_000 })
      .catch(() => {})



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
      document.querySelectorAll('pre').forEach((pre) => {
        const code = pre.querySelector('code') ?? pre
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

    // Extract inner HTML of the content element + log img situation
    const { contentHtml, contentImgs } = await page.evaluate((selector) => {
      const el = document.querySelector(selector)
      const html = el ? el.innerHTML : document.body.innerHTML
      // Capture src AFTER lazy-load normalization (data-src already replaced above)
      const imgs = [...(el ?? document.body).querySelectorAll('img')].map((img) => ({
        src: img.getAttribute('src') ?? '',
      }))
      return { contentHtml: html, contentImgs: imgs }
    }, rule.contentSelector)

    console.log(`[imgs] ${contentImgs.length} <img> tag(s) in content element`)
    contentImgs.forEach(({ src }) => console.log(`       src="${src.slice(0, 100)}"`))

    // Use cheerio to clean up the extracted HTML
    const $ = cheerio.load(contentHtml)

    // Remove excluded elements
    rule.excludeSelectors?.forEach((sel) => $(sel).remove())

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
      const isDataTable = $table.find('> * th, > * > * th, thead').length > 0

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

      // Data table: build GFM Markdown
      const rows = []
      $table.find('tr').each((_, tr) => {
        // Only direct cells of this table's rows (not from nested tables)
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

      if (!rows.length) { $table.remove(); continue }

      const cols = Math.max(...rows.map((r) => r.length))
      const normalised = rows.map((r) => {
        while (r.length < cols) r.push(' ')
        return r.slice(0, cols)
      })

      // Determine header row: explicit <thead> row or first row with <th> cells
      const headRowIdx = (() => {
        const theadRow = $table.find('thead tr').first()
        if (theadRow.length) {
          let idx = 0
          $table.find('tr').each((i, tr) => { if (tr === theadRow[0]) { idx = i } })
          return idx
        }
        // Fall back to first row if it contains <th>
        const firstTr = $table.find('tr').first()
        return firstTr.find('th').length ? 0 : -1
      })()

      const header = headRowIdx >= 0 ? normalised[headRowIdx] : normalised[0]
      const body = normalised.filter((_, i) => i !== (headRowIdx >= 0 ? headRowIdx : 0))

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
    // - use 2-space indent for continuation lines
    td.addRule('listItem', {
      filter: 'li',
      replacement(content, node, options) {
        content = content
          .replace(/^\n+/, '')
          .replace(/\n+$/, '')
          .replace(/\n/gm, '\n  ')

        const parent = node.parentNode
        const prefix =
          parent.nodeName === 'OL'
            ? `${Array.prototype.indexOf.call(parent.children, node) + 1}. `
            : `${options.bulletListMarker} `

        return prefix + content + (node.nextSibling ? '\n' : '')
      },
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

    // Remove duplicate H1 at the top of body — processor always prepends "# title"
    // so strip any leading H1 line that matches the article title (trim for safety)
    body = body.replace(
      new RegExp(`^#\\s+${title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\n+`, 'm'),
      '',
    )

    // Remove blank lines between adjacent list items (loose list → tight list)
    body = body.replace(/^([ \t]*[-*+\d][\.\s].+)\n\n(?=[ \t]*[-*+\d][\.\s])/gm, '$1\n')

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
    mkdirSync(articleDir, { recursive: true })
    const outputPath = join(articleDir, 'page.md')
    writeFileSync(outputPath, fileContent, 'utf-8')

    // Persist to processed map
    processed[link] = md5
    saveProcessed(processed)

    console.log(`[done]  → ${outputPath}`)
    return { success: true, md5, outputPath }
  } catch (err) {
    console.error(`[error] ${link}\n        ${err.message}`)
    return { error: err.message, md5 }
  } finally {
    await browser?.close()
  }
}