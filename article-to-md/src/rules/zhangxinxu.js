/** @type {import('./index.js').SiteRule} */
export default {
  contentSelector: '#content article',
  excludeSelectors: [
    '.navigation.nav_swipe',
    'p:contains("（本篇完）")',
  ],
  waitUntil: 'load',
  async preProcess(page) {
    const delay = (ms) => new Promise((r) => setTimeout(r, ms))

    // Give JS time to settle after 'load'
    await delay(1500 + Math.random() * 1000)
  },
}
