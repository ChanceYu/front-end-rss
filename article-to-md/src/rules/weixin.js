/** @type {import('./index.js').SiteRule} */
export default {
  contentSelector: '#js_content',
  excludeSelectors: [
    '#js_pc_qr_code',
    '#js_author_name',
    '.rich_media_tool',
    '.rich_media_area_extra',
    '.rich_media_read_later',
    '#content_bottom_area',
    '#js_profile_qrcode',
    '.qr_code_pc_outer',
    'script',
    'style',
  ],
  // Use 'load' instead of 'networkidle' — WeChat keeps long-polling connections
  // open which prevents networkidle from ever firing.
  waitUntil: 'load',
  async preProcess(page) {
    const delay = (ms) => new Promise((r) => setTimeout(r, ms))

    // Give JS time to settle after 'load'
    await delay(1500 + Math.random() * 1000)

    // Remove any verification / paywall overlay injected after load
    await page.evaluate(() => {
      const selectors = [
        '#verify_box_new',
        '.weui-mask',
        '.weui-half-screen-dialog',
        '#login_modal_area',
        '.weui-dialog',
        '#js_dialog_tips',
      ]
      selectors.forEach((sel) => {
        document.querySelectorAll(sel).forEach((el) => el.remove())
      })

      // Restore content visibility in case WeChat blurred/hid it
      const content = document.getElementById('js_content')
      if (content) {
        content.style.visibility = 'visible'
        content.style.filter = 'none'
        content.style.opacity = '1'
      }
    })

    await delay(300)
  },
}
