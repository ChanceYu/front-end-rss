import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { processArticle } from './processor.js'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

export default async function once(article) {
  const result = await processArticle(article, { force: true, headless: true })
  return result
}

// Only run directly when this file is the entry point, not when imported by server.js
if (process.argv[1].endsWith('once.js')) {
  const newArticlesPath = join(__dirname, '..', '..', 'server', 'node_modules', 'new-articles.json')

  if (existsSync(newArticlesPath)) {
    const articles = JSON.parse(readFileSync(newArticlesPath, 'utf-8'))
    console.log(`[once] Found ${articles.length} new article(s) to process`)
    for (const article of articles) {
      try {
        console.log(`[once] Processing: ${article.title}`)
        await once(article)
      } catch (err) {
        console.error(`[once] Failed: ${article.title} — ${err.message}`)
      }
    }
    console.log('[once] Done')
  } else {
    console.log('[once] No new-articles.json found, skipping')
  }
}
