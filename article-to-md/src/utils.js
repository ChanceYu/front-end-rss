import 'dotenv/config'
import { createHash } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'
import fs from 'fs-extra'
const { existsSync, readJsonSync, outputJsonSync } = fs

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const PROCESSED_PATH = join(__dirname, '..', '..', 'data', 'processed.json')
const PROJECT_ROOT = join(__dirname, '..', '..')

export const QINIU_ENABLED = process.env.QINIU_ACCESS_KEY && process.env.QINIU_SECRET_KEY

/**
 * Convert a URL string to its MD5 hex digest
 * @param {string} url
 * @returns {string}
 */
export function urlToMd5(url) {
  return createHash('md5').update(url).digest('hex')
}

/**
 * Load the processed map from disk (url -> md5)
 * @returns {Record<string, string>}
 */
export function loadProcessed() {
  if (!existsSync(PROCESSED_PATH)) return {}
  try {
    return readJsonSync(PROCESSED_PATH)
  } catch {
    return {}
  }
}

/**
 * Persist the processed map to disk
 * @param {Record<string, string>} data
 */
export function saveProcessed(data) {
  outputJsonSync(PROCESSED_PATH, data)
}

let processedLock = Promise.resolve()

/**
 * Run a read-modify-write on processed.json under a mutex so concurrent
 * callers (e.g. multiple /article-to-md/once requests) do not overwrite each other.
 * @param {(data: Record<string, string>) => void} update - Mutate the loaded object; it will be saved after.
 * @returns {Promise<void>}
 */
export function withProcessedUpdate(update) {
  const next = processedLock.then(() => {
    const data = loadProcessed()
    update(data)
    saveProcessed(data)
  })
  processedLock = next.catch(() => {})
  return next
}

/**
 * Regenerate site dist/data JSON files (articles, indexes, etc.) by running createFiles.
 * @returns {{ ok: boolean, stdout?: string, error?: string }}
 */
export function regenerateSiteFiles() {
  try {
    const proc = spawnSync('node', ['-e', "require('./site/build/createFiles.js')()"], {
      cwd: PROJECT_ROOT,
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'pipe'],
    })
    if (proc.status === 0) {
      console.log(`[server] Regenerated dist/data JSON files`)
      return { ok: true, stdout: proc.stdout?.trim() }
    }
    const err = proc.stderr?.trim() || `exit ${proc.status}`
    console.warn(`[server] createFiles failed: ${err}`)
    return { ok: false, error: err }
  } catch (err) {
    console.warn(`[server] regenerateSiteFiles: ${err.message}`)
    return { ok: false, error: err.message }
  }
}

/**
 * Regenerate README.md, TAGS.md, details/*.md by running server/writemd with current links.json.
 * @returns {{ ok: boolean, error?: string }}
 */
export function regenerateWritemd(newData = { length: 0, titles: [], rss: {}, links: {}, articles: [] }) {
  const script = `
    const linksJson = require('./data/links.json');
    const writemd = require('./server/writemd');
    const newData = ${JSON.stringify(newData)};
    writemd(newData, linksJson).then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
  `
  try {
    const proc = spawnSync('node', ['-e', script], {
      cwd: PROJECT_ROOT,
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'pipe'],
    })
    if (proc.status === 0) {
      console.log(`[server] Regenerated README/TAGS/details (writemd)`)
      return { ok: true }
    }
    const err = proc.stderr?.trim() || proc.stdout?.trim() || `exit ${proc.status}`
    console.warn(`[server] writemd failed: ${err}`)
    return { ok: false, error: err }
  } catch (err) {
    console.warn(`[server] regenerateWritemd: ${err.message}`)
    return { ok: false, error: err.message }
  }
}