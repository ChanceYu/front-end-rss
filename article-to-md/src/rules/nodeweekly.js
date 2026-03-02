/** @type {import('./index.js').SiteRule} */
export default {
  contentSelector: '#content',
  excludeSelectors: [
    '#together',
    'img[src="https://res.cloudinary.com/cpress/image/upload/v1653576619/lgfqinzbdqttwmhvljxb.png"]'
  ],
  waitUntil: 'load',
  async preProcess(page) {
    const delay = (ms) => new Promise((r) => setTimeout(r, ms))

    // Give JS time to settle after 'load'
    await delay(1500 + Math.random() * 1000)
  },
}
