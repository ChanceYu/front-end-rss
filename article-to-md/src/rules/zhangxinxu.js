/** @type {import('./index.js').SiteRule} */
export default {
  contentSelector: '#content article',
  excludeSelectors: [
    '.navigation.nav_swipe',
    'p:contains("（本篇完）")',
    '.wwads-cn',
    '.hljs a.copy',
    '.hljs a.revert',
  ],
  waitUntil: 'load',
  async preProcess(page) {
    const delay = (ms) => new Promise((r) => setTimeout(r, ms))

    // Give JS time to settle after 'load'
    await delay(1500 + Math.random() * 1000)

    // Replace the first child of <article> if it's a .link containing "zhangxinxu" with a <blockquote>
    await page.evaluate(() => {
      const article = document.querySelector('#content article')
      if (!article) return
      const first = article.firstElementChild
      if (!first || !first.classList.contains('link')) return
      if (!first.textContent.includes('zhangxinxu')) return
      const blockquote = document.createElement('blockquote')
      blockquote.innerHTML = first.innerHTML
      first.replaceWith(blockquote)
    })
  },
}
