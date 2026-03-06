import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import fs from 'fs-extra'
const { existsSync, removeSync, readJsonSync, outputJsonSync } = fs
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'

import once from './once.js'
import { uploadArticleFolder, uploadProcessedJson, uploadLinksJson } from './upload.js'
import { urlToMd5, withProcessedUpdate, regenerateSiteFiles, regenerateWritemd, QINIU_ENABLED } from './utils.js'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const ARTICLES_DIR = join(__dirname, '..', '..', 'data', 'articles')
const LINKS_PATH = join(__dirname, '..', '..', 'data', 'links.json')
const RSS_PATH = join(__dirname, '..', '..', 'data', 'rss.json')
const DELETED_PATH = join(__dirname, '..', '..', 'data', 'deleted.json')
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

    if (QINIU_ENABLED) {
      if (result?.md5) {
        try {
          const uploadResult = await uploadArticleFolder(result.md5)
          result.upload = uploadResult
        } catch (uploadErr) {
          console.error('[server] Upload article folder failed:', uploadErr.message)
          result.upload = { error: uploadErr.message }
        }
      }
      try {
        const pjResult = await uploadProcessedJson()
        result.uploadProcessedJson = pjResult
      } catch (pjErr) {
        console.error('[server] Upload processed.json failed:', pjErr.message)
        result.uploadProcessedJson = { error: pjErr.message }
      }
    }

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

  // 2. Remove from processed.json (mutex for concurrent safety)
  await withProcessedUpdate((p) => { if (link in p) delete p[link] })
  console.log(`[server] Removed from processed.json`)

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

  // 4. Append deleted URL to data/deleted.json
  if (removedFromLinks) {
    try {
      const deleted = existsSync(DELETED_PATH) ? readJsonSync(DELETED_PATH) : []
      if (Array.isArray(deleted) && !deleted.includes(link)) {
        deleted.push(link)
        outputJsonSync(DELETED_PATH, deleted)
        console.log(`[server] Appended to deleted.json`)
      }
    } catch (err) {
      console.warn(`[server] Failed to update deleted.json: ${err.message}`)
    }
  }

  try {
    await uploadProcessedJson()
    await uploadLinksJson()
    console.log('[server] Uploaded processed.json/links.json')
  } catch (err) {
    console.error('[server] Upload processed.json/links.json failed:', err.message)
  }

  let distRegenerated = false
  let writemdRegenerated = false
  if (removedFromLinks) {
    distRegenerated = regenerateSiteFiles().ok
    writemdRegenerated = regenerateWritemd().ok
  }

  return c.json({ ok: true, md5, removedFromLinks, distRegenerated, writemdRegenerated })
})

app.post('/article-to-md/remove-source', async (c) => {
  const body = await c.req.json().catch(() => null)
  const title = body?.title
  if (!title || typeof title !== 'string') {
    return c.json({ error: 'Missing or invalid field: title' }, 400)
  }

  console.log(`[server] Removing source: ${title}`)

  // 1. Remove from rss.json
  let rssRemoved = false
  try {
    const rssList = readJsonSync(RSS_PATH)
    const filtered = rssList.filter((item) => item.title !== title)
    if (filtered.length < rssList.length) {
      outputJsonSync(RSS_PATH, filtered)
      rssRemoved = true
      console.log(`[server] Removed from rss.json`)
    }
  } catch (err) {
    console.warn(`[server] Failed to update rss.json: ${err.message}`)
    return c.json({ error: `rss.json: ${err.message}` }, 500)
  }

  // 2. Get all article links for this source from links.json, then remove the source entry
  let linksToRemove = []
  try {
    const sources = readJsonSync(LINKS_PATH)
    const sourceIndex = sources.findIndex((s) => s.title === title)
    if (sourceIndex === -1) {
      const detailPath = join(PROJECT_ROOT, 'details', title.replace(/[\\/]/g, '') + '.md')
      if (existsSync(detailPath)) removeSync(detailPath)
      const writemdRegenerated = rssRemoved && regenerateWritemd().ok
      const distRegenerated = rssRemoved && regenerateSiteFiles().ok
      return c.json({
        ok: true,
        rssRemoved,
        articlesRemoved: 0,
        writemdRegenerated,
        distRegenerated,
      })
    }
    const source = sources[sourceIndex]
    linksToRemove = (source.items ?? []).map((item) => item.link).filter(Boolean)
    sources.splice(sourceIndex, 1)
    outputJsonSync(LINKS_PATH, sources)
    console.log(`[server] Removed source from links.json, ${linksToRemove.length} article(s)`)
  } catch (err) {
    console.warn(`[server] Failed to update links.json: ${err.message}`)
    return c.json({ error: `links.json: ${err.message}` }, 500)
  }

  // 3. For each article: remove from processed.json and delete article directory
  for (const link of linksToRemove) {
    const md5 = urlToMd5(link)
    await withProcessedUpdate((p) => { if (link in p) delete p[link] })
    const articleDir = join(ARTICLES_DIR, md5)
    if (existsSync(articleDir)) {
      removeSync(articleDir)
      console.log(`[server] Deleted directory: ${articleDir}`)
    }
  }

  // 4. Delete the source's detail page (details/<title>.md)
  const detailPath = join(PROJECT_ROOT, 'details', title.replace(/[\\/]/g, '') + '.md')
  if (existsSync(detailPath)) {
    removeSync(detailPath)
    console.log(`[server] Deleted detail page: ${detailPath}`)
  }

  // 5. Regenerate README/TAGS/details (writemd) and site dist (createFiles)
  const writemdRegenerated = regenerateWritemd().ok
  const distRegenerated = regenerateSiteFiles().ok

  return c.json({
    ok: true,
    rssRemoved,
    articlesRemoved: linksToRemove.length,
    writemdRegenerated,
    distRegenerated,
  })
})

serve({ fetch: app.fetch, port: PORT }, () => {
  console.log(`[server] Listening on http://localhost:${PORT}`)
  console.log(`[server] POST /article-to-md/once         { title?, link, date? }`)
  console.log(`[server] POST /article-to-md/remove      { link }`)
  console.log(`[server] POST /article-to-md/remove-source  { title }`)
})
