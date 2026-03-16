import sharp from 'sharp'
import fs from 'fs-extra'
const { ensureDirSync, writeFileSync } = fs
import { join, extname } from 'node:path'
import { createHash } from 'node:crypto'

/** Formats sharp can compress; others are saved as-is */
const COMPRESSIBLE = new Set(['jpeg', 'jpg', 'png', 'webp', 'avif'])

/**
 * Derive a stable filename from a URL using md5.
 * The extension is resolved from the actual image format detected by sharp so
 * CDN URLs without a meaningful extension are handled correctly.
 * @param {string} url
 * @param {string} detectedExt - e.g. '.jpeg'
 * @returns {string}
 */
function imageFilename(url, detectedExt) {
  const hash = createHash('md5').update(url).digest('hex')
  const urlExt = url.startsWith('data:') ? '' : extname(new URL(url).pathname).toLowerCase()
  const ext = detectedExt ?? (urlExt || '.jpg')
  return `${hash}${ext}`
}

const MAX_WIDTH = 1000

/**
 * Compress raw image bytes with sharp and write to destPath.
 * If original width > MAX_WIDTH, resizes to MAX_WIDTH with proportional scaling.
 * @param {Buffer} raw
 * @param {string} destPath
 */
async function compressAndSave(raw, destPath) {
  const image = sharp(raw)
  const meta = await image.metadata()
  const format = meta.format ?? 'jpeg'

  // Resize to max width with proportional scaling when larger (prevents distortion)
  let pipeline = image
  if (meta.width != null && meta.width > MAX_WIDTH) {
    pipeline = pipeline.resize({ width: MAX_WIDTH })
  }

  if (COMPRESSIBLE.has(format)) {
    switch (format) {
      case 'jpeg':
      case 'jpg':
        await pipeline.jpeg({ quality: 80, progressive: true }).toFile(destPath)
        break
      case 'png':
        await pipeline.png({ compressionLevel: 9, palette: true }).toFile(destPath)
        break
      case 'webp':
        await pipeline.webp({ quality: 80 }).toFile(destPath)
        break
      case 'avif':
        await pipeline.avif({ quality: 60 }).toFile(destPath)
        break
      default:
        await pipeline.toFile(destPath)
    }
  } else {
    if (meta.width != null && meta.width > MAX_WIDTH) {
      await pipeline.toFile(destPath)
    } else {
      writeFileSync(destPath, raw)
    }
  }

  return format
}

const FETCH_RETRY_MAX = 3
const FETCH_RETRY_DELAY_MS = 2000
const FETCH_CONCURRENCY = 2
const FETCH_DELAY_BETWEEN_MS = 400

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

/**
 * Fetch raw image bytes from a remote URL.
 * Prefers Playwright's APIRequestContext (carries browser session cookies) so
 * that CDNs requiring referrer/cookie auth (e.g. WeChat) work correctly.
 * Falls back to Node's built-in fetch when no context is supplied.
 * Retries on 429/503 with exponential backoff to avoid rate limits.
 *
 * @param {string} url
 * @param {string} pageOrigin - used as Referer for the fallback fetch
 * @param {import('playwright').BrowserContext|null} browserContext
 * @returns {Promise<Buffer>}
 */
async function fetchImageBuffer(url, pageOrigin, browserContext) {
  let lastErr
  for (let attempt = 0; attempt < FETCH_RETRY_MAX; attempt++) {
    try {
      if (browserContext) {
        const res = await browserContext.request.get(url, {
          headers: {
            Referer: pageOrigin,
            Accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
          },
          timeout: 20_000,
        })
        if (res.status() === 429 || res.status() === 503) {
          if (attempt === FETCH_RETRY_MAX - 1) throw new Error(`HTTP ${res.status()}`)
          await sleep(FETCH_RETRY_DELAY_MS * Math.pow(2, attempt))
          continue
        }
        if (!res.ok()) throw new Error(`HTTP ${res.status()}`)
        return Buffer.from(await res.body())
      }

      const res = await fetch(url, {
        signal: AbortSignal.timeout(20_000),
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/131.0.0.0 Safari/537.36',
          Referer: pageOrigin,
          Accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
        },
      })
      if (res.status === 429 || res.status === 503) {
        if (attempt === FETCH_RETRY_MAX - 1) throw new Error(`HTTP ${res.status}`)
        await sleep(FETCH_RETRY_DELAY_MS * Math.pow(2, attempt))
        continue
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return Buffer.from(await res.arrayBuffer())
    } catch (err) {
      lastErr = err
      if (attempt < FETCH_RETRY_MAX - 1) {
        await sleep(FETCH_RETRY_DELAY_MS * Math.pow(2, attempt))
      } else {
        throw lastErr
      }
    }
  }
  throw lastErr
}

/**
 * Save a base64 data URL image to disk.
 * @param {string} dataUrl  - e.g. "data:image/png;base64,..."
 * @param {string} destDir
 * @returns {Promise<string>} local filename
 */
async function saveBase64Image(dataUrl, destDir) {
  ensureDirSync(destDir)

  const m = dataUrl.match(/^data:image\/(\w+);base64,(.+)$/)
  if (!m) throw new Error('Invalid data URL')

  const raw = Buffer.from(m[2], 'base64')

  // Use a placeholder ext first; compressAndSave detects the real format
  const placeholderExt = `.${m[1] === 'jpg' ? 'jpeg' : m[1]}`
  const filename = imageFilename(dataUrl, placeholderExt)
  const destPath = join(destDir, filename)

  await compressAndSave(raw, destPath)
  return filename
}

/**
 * Download a remote image, compress it with sharp and save to disk.
 * @param {string} url
 * @param {string} destDir
 * @param {string} pageOrigin
 * @param {import('playwright').BrowserContext|null} browserContext
 * @returns {Promise<string>} local filename
 */
async function downloadImage(url, destDir, pageOrigin, browserContext) {
  ensureDirSync(destDir)

  const raw = await fetchImageBuffer(url, pageOrigin, browserContext)

  const image = sharp(raw)
  const meta = await image.metadata()
  const format = meta.format ?? 'jpeg'
  const ext = `.${format === 'jpg' ? 'jpeg' : format}`
  const filename = imageFilename(url, ext)
  const destPath = join(destDir, filename)

  await compressAndSave(raw, destPath)
  return filename
}

/** Matches remote or base64 image URLs in Markdown ![]() syntax */
const MD_IMG_RE = /!\[([^\]]*)\]\(((?:https?:\/\/|data:image\/)[^)"\s]+)\)/g

/**
 * Find all images in a Markdown string (remote https:// and base64 data: URLs),
 * save & compress each one into `imagesDir`, then return the Markdown with URLs
 * rewritten to relative `./images/<filename>` paths.
 *
 * @param {string} markdown
 * @param {string} imagesDir - Absolute path to the images sub-directory
 * @param {import('playwright').BrowserContext|null} [browserContext]
 * @param {string} [pageOrigin] - Origin of the article page, used as Referer fallback
 * @returns {Promise<string>}
 */
/** Run async tasks with limited concurrency; optional delay before each start */
async function runWithConcurrency(tasks, concurrency, delayBetweenMs = 0) {
  const results = []
  let next = 0
  async function worker() {
    while (next < tasks.length) {
      const i = next++
      if (delayBetweenMs && i > 0) await sleep(delayBetweenMs)
      results[i] = await tasks[i]()
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, tasks.length) }, () => worker()))
  return results
}

export async function localizeImages(markdown, imagesDir, browserContext = null, pageOrigin = '') {
  const urls = new Set()
  for (const [, , url] of markdown.matchAll(MD_IMG_RE)) urls.add(url)

  if (urls.size === 0) return markdown

  const results = new Map()
  const urlList = [...urls]
  const tasks = urlList.map((url) => async () => {
    try {
      let filename
      if (url.startsWith('data:image/')) {
        filename = await saveBase64Image(url, imagesDir)
        console.log(`  [img] ✓ base64 → ${filename}`)
      } else {
        let origin = pageOrigin
        try { origin = new URL(url).origin } catch {}
        filename = await downloadImage(url, imagesDir, origin, browserContext)
        console.log(`  [img] ✓ ${filename}`)
      }
      results.set(url, filename)
      return filename
    } catch (err) {
      console.warn(`  [img] ✗ ${url.slice(0, 80)} — ${err.message}`)
      results.set(url, null)
      return null
    }
  })

  await runWithConcurrency(tasks, FETCH_CONCURRENCY, FETCH_DELAY_BETWEEN_MS)

  return markdown.replace(MD_IMG_RE, (full, alt, url) => {
    const filename = results.get(url)
    return filename ? `![${alt}](./images/${filename})` : full
  })
}
