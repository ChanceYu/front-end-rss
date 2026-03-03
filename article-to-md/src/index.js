import { fileURLToPath } from 'node:url'
import { join } from 'node:path'
import fs from 'fs-extra'
const { readJsonSync } = fs

import dayjs from 'dayjs'

import { processArticle } from './processor.js'
import { loadProcessed } from './utils.js'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

// Resolve links.json relative to the project root (one level up from src/)
// The repository layout is: front-end-rss/article-to-md/src/index.js
//                            front-end-rss/data/links.json
const LINKS_PATH = join(__dirname, '..', '..', 'data', 'links.json')

/**
 * @typedef {Object} Article
 * @property {string} title
 * @property {string} link
 * @property {string} date
 * @property {string} [rssTitle]
 */

/**
 * @typedef {Object} ProcessAllOptions
 * @property {number}  [limit]              - Max number of articles to process in one run
 * @property {boolean} [skipProcessed=true] - Skip articles already in processed.json
 * @property {boolean} [headless=true]      - Run browser in headless mode
 */

/**
 * Flatten all articles from links.json, sort newest-first, then process
 * each one sequentially (shares a single browser launch per article via
 * processArticle).
 *
 * @param {ProcessAllOptions} [options]
 */
export async function processAll(options = {}) {
  const { limit, skipProcessed = true, headless = true } = options

  const sources = readJsonSync(LINKS_PATH)

  /** @type {Article[]} */
  const articles = sources
    .flatMap((source) => source.items ?? [])
    .filter((item) => item.link && item.date)
    .sort((a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf())

  const processed = loadProcessed()
  const pending = skipProcessed
    ? articles.filter((a) => !processed[a.link])
    : articles

  const target = limit ? pending.slice(0, limit) : pending

  console.log(`Total articles : ${articles.length}`)
  console.log(`Already done   : ${Object.keys(processed).length}`)
  console.log(`To process     : ${target.length}`)
  if (target.length === 0) {
    console.log('Nothing to do.')
    return
  }
  console.log('')

  let successCount = 0
  let skipCount = 0
  let errorCount = 0

  for (const article of target) {
    const result = await processArticle(article, { headless })
    if (result.success) successCount++
    else if (result.skipped) skipCount++
    else errorCount++
  }

  console.log(
    `\nFinished — success: ${successCount}, skipped: ${skipCount}, errors: ${errorCount}`,
  )
}

// ── CLI entry-point ──────────────────────────────────────────────────────────
// Parse simple --key=value flags from argv
function parseArgs(argv) {
  const args = {}
  for (const arg of argv) {
    const m = arg.match(/^--([^=]+)(?:=(.*))?$/)
    if (m) args[m[1]] = m[2] !== undefined ? m[2] : true
  }
  return args
}

const args = parseArgs(process.argv.slice(2))

const options = {
  limit: args.limit ? Number(args.limit) : undefined,
  skipProcessed: args.force ? false : true,
  headless: args.headless !== 'false',
}

processAll(options).catch((err) => {
  console.error(err)
  process.exit(1)
})
