import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'

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
    return JSON.parse(readFileSync(PROCESSED_PATH, 'utf-8'))
  } catch {
    return {}
  }
}

/**
 * Persist the processed map to disk
 * @param {Record<string, string>} data
 */
export function saveProcessed(data) {
  mkdirSync(join(PROCESSED_PATH, '..'), { recursive: true })
  writeFileSync(PROCESSED_PATH, JSON.stringify(data), 'utf-8')
}
