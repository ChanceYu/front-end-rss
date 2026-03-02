/** @type {import('./index.js').SiteRule} */
export default {
  contentSelector: '#main-content',
  excludeSelectors: [],
  waitUntil: 'load',
  async preProcess(page) {
    const delay = (ms) => new Promise((r) => setTimeout(r, ms))

    // Give JS time to settle after 'load'
    await delay(1500 + Math.random() * 1000)
  },
}
