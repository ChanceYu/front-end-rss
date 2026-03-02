/**
 * Chromium launch args that suppress automation signals.
 * @type {string[]}
 */
export const STEALTH_ARGS = [
  '--disable-blink-features=AutomationControlled',
  '--no-sandbox',
  '--disable-setuid-sandbox',
  '--disable-dev-shm-usage',
  '--disable-accelerated-2d-canvas',
  '--disable-gpu',
  '--window-size=1920,1080',
  '--start-maximized',
]

/**
 * Inject stealth patches into every new page before any navigation.
 * Removes all traces that Playwright / Chrome DevTools left in the JS runtime.
 *
 * @param {import('playwright').BrowserContext} context
 */
export async function applyStealthScripts(context) {
  await context.addInitScript(() => {
    // 1. Hide webdriver flag
    Object.defineProperty(navigator, 'webdriver', {
      get: () => undefined,
      configurable: true,
    })

    // 2. Spoof plugins so the list is non-empty (headless Chrome has none)
    const makePlugin = (name, desc, filename, mimeTypes) => {
      const plugin = Object.create(Plugin.prototype)
      Object.defineProperties(plugin, {
        name: { value: name },
        description: { value: desc },
        filename: { value: filename },
        length: { value: mimeTypes.length },
      })
      mimeTypes.forEach((mt, i) => {
        const mime = Object.create(MimeType.prototype)
        Object.defineProperties(mime, {
          type: { value: mt.type },
          suffixes: { value: mt.suffixes },
          description: { value: mt.desc },
          enabledPlugin: { value: plugin },
        })
        plugin[i] = mime
      })
      return plugin
    }

    const fakePlugins = [
      makePlugin('PDF Viewer', 'Portable Document Format', 'internal-pdf-viewer', [
        { type: 'application/pdf', suffixes: 'pdf', desc: '' },
        { type: 'text/pdf', suffixes: 'pdf', desc: '' },
      ]),
      makePlugin('Chrome PDF Viewer', 'Portable Document Format', 'internal-pdf-viewer', [
        { type: 'application/pdf', suffixes: 'pdf', desc: '' },
      ]),
      makePlugin('Chromium PDF Viewer', 'Portable Document Format', 'internal-pdf-viewer', [
        { type: 'application/pdf', suffixes: 'pdf', desc: '' },
      ]),
    ]

    Object.defineProperty(navigator, 'plugins', {
      get: () => {
        const arr = [...fakePlugins]
        arr.__proto__ = PluginArray.prototype
        return arr
      },
      configurable: true,
    })

    // 3. Spoof language list
    Object.defineProperty(navigator, 'languages', {
      get: () => ['zh-CN', 'zh', 'en-US', 'en'],
      configurable: true,
    })

    // 4. Add window.chrome runtime that real Chrome exposes
    if (!window.chrome) {
      Object.defineProperty(window, 'chrome', {
        value: {
          app: { isInstalled: false, InstallState: {}, RunningState: {} },
          runtime: { PlatformOs: {}, PlatformArch: {}, PlatformNaclArch: {}, RequestUpdateCheckStatus: {} },
          loadTimes: function () {},
          csi: function () {},
        },
        configurable: true,
        writable: true,
      })
    }

    // 5. Patch Permissions API (headless used to always return 'denied')
    if (navigator.permissions && navigator.permissions.query) {
      const originalQuery = navigator.permissions.query.bind(navigator.permissions)
      navigator.permissions.query = (params) => {
        if (params && params.name === 'notifications') {
          return Promise.resolve({
            state: Notification.permission === 'default' ? 'prompt' : Notification.permission,
            onchange: null,
          })
        }
        return originalQuery(params)
      }
    }

    // 6. Fix hairline feature detection used by some fingerprint scripts
    if (window.outerWidth === 0) {
      Object.defineProperty(window, 'outerWidth', { get: () => 1920 })
      Object.defineProperty(window, 'outerHeight', { get: () => 1080 })
    }

    // 7. Remove CDP-related properties that fingerprint scripts look for
    delete window.cdc_adoQpoasnfa76pfcZLmcfl_Array
    delete window.cdc_adoQpoasnfa76pfcZLmcfl_Promise
    delete window.cdc_adoQpoasnfa76pfcZLmcfl_Symbol
  })
}

/**
 * Simulate human-like behavior: random delays + light mouse movement.
 * Call this after page.goto() to reduce timing-based detection.
 *
 * @param {import('playwright').Page} page
 */
export async function simulateHuman(page) {
  const delay = (ms) => new Promise((r) => setTimeout(r, ms))

  // Random short pause after load
  await delay(800 + Math.random() * 1200)

  // Move the mouse to a few random positions
  const moves = 3 + Math.floor(Math.random() * 3)
  for (let i = 0; i < moves; i++) {
    await page.mouse.move(
      200 + Math.random() * 800,
      200 + Math.random() * 400,
      { steps: 10 + Math.floor(Math.random() * 20) },
    )
    await delay(100 + Math.random() * 300)
  }

  // Gentle scroll down then back
  await page.evaluate(() => window.scrollBy({ top: 300, behavior: 'smooth' }))
  await delay(500 + Math.random() * 500)
  await page.evaluate(() => window.scrollBy({ top: -100, behavior: 'smooth' }))
  await delay(300 + Math.random() * 300)
}
