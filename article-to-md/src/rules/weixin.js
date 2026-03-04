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
    '.video_iframe',
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
        '.video_iframe',
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

    // If the article has swiper indicator dots (.swiper_indicator_item_pc), extract
    // the full-size image URL from each dot's background-image style and append
    // the images to #js_content.
    //
    // Dot style: background-image: url("https://mmbiz.qpic.cn/.../300?wx_fmt=jpeg&wxfrom=12")
    // Full-size:                   https://mmbiz.qpic.cn/.../0?wx_fmt=jpeg
    await page.evaluate(() => {
      const indicators = document.querySelectorAll(
        '.share_media_swiper_wrp .swiper_indicator_item_pc'
      )
      if (!indicators.length) return

      const content = document.getElementById('js_content')
      if (!content) return

      indicators.forEach((dot) => {
        const style = dot.getAttribute('style') || dot.style.cssText || ''

        // Extract URL from background-image: url("...") or url('...')
        const match = style.match(/background-image\s*:\s*url\(\s*["']?([^"')]+)["']?\s*\)/)
        if (!match) return

        let url = match[1]
          // Decode HTML entities (&quot; → ")
          .replace(/&quot;/g, '"')
          .replace(/&amp;/g, '&')
          .trim()

        // Convert thumbnail size to full-size:
        // .../300?wx_fmt=jpeg&wxfrom=12  →  .../0?wx_fmt=jpeg
        url = url.replace(/\/\d+\?wx_fmt=(\w+).*$/, '/0?wx_fmt=$1')

        const img = document.createElement('img')
        img.setAttribute('src', url)

        const p = document.createElement('p')
        p.appendChild(img)
        content.appendChild(p)
      })
    })
  },

  retryOn: (body) => /## 环境异常/.test(body) && /当前环境异常，完成验证后即可继续访问/.test(body),
}
