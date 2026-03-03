import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import fs from 'fs-extra'
const { existsSync, removeSync, readJsonSync, outputJsonSync } = fs
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'

import once from './once.js'
import { urlToMd5, loadProcessed, saveProcessed } from './utils.js'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const ARTICLES_DIR = join(__dirname, '..', '..', 'data', 'articles')
const LINKS_PATH = join(__dirname, '..', '..', 'data', 'links.json')
const PROJECT_ROOT = join(__dirname, '..', '..')

const PORT = 8081

const app = new Hono()

app.use('*', cors())

app.post('/article-to-md/once', async (c) => {
  const article = await c.req.json().catch(() => null)

  if (!article?.link) {
    return c.json({ error: 'Missing required field: link' }, 400)
  }

  console.log(`[server] Processing: ${article.title ?? article.link}`)

  try {
    const result = await once(article)
    return c.json(result)
  } catch (err) {
    console.error('[server] Error:', err.message)
    return c.json({ error: err.message }, 500)
  }
})

app.post('/article-to-md/remove', async (c) => {
  const body = await c.req.json().catch(() => null)

  if (!body?.link) {
    return c.json({ error: 'Missing required field: link' }, 400)
  }

  const { link } = body
  const md5 = urlToMd5(link)

  console.log(`[server] Removing: ${link}`)

  // 1. Delete article directory
  const articleDir = join(ARTICLES_DIR, md5)
  if (existsSync(articleDir)) {
    removeSync(articleDir)
    console.log(`[server] Deleted directory: ${articleDir}`)
  }

  // 2. Remove from processed.json
  const processed = loadProcessed()
  if (link in processed) {
    delete processed[link]
    saveProcessed(processed)
    console.log(`[server] Removed from processed.json`)
  }

  // 3. Remove from links.json
  let removedFromLinks = false
  try {
    const sources = readJsonSync(LINKS_PATH)
    for (const source of sources) {
      const before = source.items?.length ?? 0
      source.items = (source.items ?? []).filter((item) => item.link !== link)
      if (source.items.length < before) removedFromLinks = true
    }
    if (removedFromLinks) {
      outputJsonSync(LINKS_PATH, sources)
      console.log(`[server] Removed from links.json`)
    }
  } catch (err) {
    console.warn(`[server] Failed to update links.json: ${err.message}`)
  }

  // 4. Regenerate dist/data JSON files via createFiles
  let distRegenerated = false
  if (removedFromLinks) {
    try {
      const proc = spawnSync('node', ['-e', "require('./site/build/createFiles.js')()"], {
        cwd: PROJECT_ROOT,
        encoding: 'utf-8',
        stdio: ['ignore', 'pipe', 'pipe'],
      })
      if (proc.status === 0) {
        distRegenerated = true
        console.log(`[server] Regenerated dist/data JSON files`)
        if (proc.stdout) console.log(proc.stdout.trim())
      } else {
        console.warn(`[server] createFiles exited with ${proc.status}: ${proc.stderr?.trim()}`)
      }
    } catch (err) {
      console.warn(`[server] Failed to regenerate dist/data: ${err.message}`)
    }
  }

  return c.json({ ok: true, md5, removedFromLinks, distRegenerated })
})

serve({ fetch: app.fetch, port: PORT }, () => {
  console.log(`[server] Listening on http://localhost:${PORT}`)
  console.log(`[server] POST /article-to-md/once    { title?, link, date? }`)
  console.log(`[server] POST /article-to-md/remove  { link }`)
})
