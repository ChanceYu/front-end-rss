import weixinRule from './weixin.js'
import fenghenRule from './fenghen.js'
import nodeweeklyRule from './nodeweekly.js'
import javascriptweeklyRule from './javascriptweekly.js'
import zhangxinxuRule from './zhangxinxu.js'
import ruanyifengRule from './ruanyifeng.js'

/**
 * @typedef {Object} SiteRule
 * @property {string | string[]} contentSelector - CSS selector(s) for the main article content; array items are concatenated in order
 * @property {string[]} excludeSelectors - CSS selectors for elements to remove before conversion
 * @property {'load'|'domcontentloaded'|'networkidle'|'commit'} [waitUntil] - Playwright waitUntil option
 * @property {(page: import('playwright').Page) => Promise<void>} [preProcess] - Custom hook run after page load
 * @property {(td: import('turndown')) => void} [turndownRules] - Add custom Turndown rules
 * @property {(markdown: string) => string} [postProcess] - Transform the final Markdown string
 * @property {(markdown: string) => boolean} [retryOn] - Return true to retry the article once (e.g. anti-scraping page detected)
 * @property {(markdown: string) => boolean} [deleteOn] - Return true to delete all saved data for this article (e.g. article removed by author)
 */

/**
 * Domain -> rule mapping.
 * Keys are matched as substrings of the article hostname so subdomains are
 * covered automatically.
 * @type {Record<string, SiteRule>}
 */
const RULES = {
  'mp.weixin.qq.com': weixinRule,
  'fenghen.me': fenghenRule,
  'nodeweekly.com': nodeweeklyRule,
  'javascriptweekly.com': javascriptweeklyRule,
  'zhangxinxu.com': zhangxinxuRule,
  'ruanyifeng.com': ruanyifengRule,
}

/**
 * Return the rule for a given article URL.
 * Throws if no matching rule is found — add the domain to RULES first.
 * @param {string} url
 * @returns {SiteRule}
 */
export function getRuleForUrl(url) {
  let hostname
  try {
    hostname = new URL(url).hostname
  } catch {
    throw new Error(`无效的文章 URL：${url}`)
  }

  for (const [domain, rule] of Object.entries(RULES)) {
    if (hostname.includes(domain)) {
      return { ...rule }
    }
  }

  throw new Error(
    `未找到域名 "${hostname}" 的抓取规则。\n` +
      `请先在 src/rules/ 下新建规则文件，并在 src/rules/index.js 的 RULES 中注册该域名。`,
  )
}

export { RULES }
