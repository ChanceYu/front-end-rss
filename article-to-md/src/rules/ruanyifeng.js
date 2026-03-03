/** @type {import('./index.js').SiteRule} */
export default {
  contentSelector: '#main-content',
  excludeSelectors: [],
  waitUntil: 'load',
  async preProcess(page) {
    const delay = (ms) => new Promise((r) => setTimeout(r, ms))

    // Give JS time to settle after 'load'
    await delay(1500 + Math.random() * 1000)

    // Replace submission-invitation paragraphs with <blockquote>
    await page.evaluate(() => {
      document.querySelectorAll('#main-content p').forEach((p) => {
        const text = p.textContent
        if (!text.includes('欢迎投稿') || !text.includes('@gmail.com')) return
        const blockquote = document.createElement('blockquote')
        blockquote.innerHTML = p.innerHTML
        p.replaceWith(blockquote)
      })
    })
  },
}
