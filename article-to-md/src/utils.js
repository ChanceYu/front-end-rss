import { createHash } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'
import fs from 'fs-extra'
const { existsSync, readJsonSync, outputJsonSync } = fs

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const PROCESSED_PATH = join(__dirname, '..', '..', 'data', 'articles', 'processed.json')

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
