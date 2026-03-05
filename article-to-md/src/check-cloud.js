#!/usr/bin/env node
/**
 * 读取 data/processed.json，判断每一个文章对应的 .md 文件在云存储上是否存在，输出日志。
 * 缺失时输出文章标题和链接（标题来源于 data/links.json），并将缺失列表写入 data/check-missing.json。
 * 云存储 URL：ARTICLE_DATA_HOST/data/articles/<md5>/page.md
 *
 * 环境变量：
 *   ARTICLE_DATA_HOST  云存储根地址，默认 https://fed-data.chanceyu.com
 *   PROCESSED_JSON_PATH 可选，processed.json 路径
 *   LINKS_JSON_PATH    可选，links.json 路径，用于解析标题
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_DIR = path.join(__dirname, '..', '..', 'data')
const DEFAULT_PROCESSED = path.join(DATA_DIR, 'processed.json')
const DEFAULT_LINKS = path.join(DATA_DIR, 'links.json')
const MISSING_PATH = path.join(DATA_DIR, 'missing.json')
const DEFAULT_HOST = 'https://fed-data.chanceyu.com'

const ARTICLE_DATA_HOST = process.env.ARTICLE_DATA_HOST || DEFAULT_HOST
const PROCESSED_JSON_PATH = process.env.PROCESSED_JSON_PATH || DEFAULT_PROCESSED
const LINKS_JSON_PATH = process.env.LINKS_JSON_PATH || DEFAULT_LINKS

function loadProcessed() {
  if (!fs.existsSync(PROCESSED_JSON_PATH)) {
    console.error('processed.json 不存在:', PROCESSED_JSON_PATH)
    process.exit(1)
  }
  const raw = fs.readFileSync(PROCESSED_JSON_PATH, 'utf8')
  try {
    return JSON.parse(raw)
  } catch (e) {
    console.error('processed.json 解析失败:', e.message)
    process.exit(1)
  }
}

/** 从 links.json 构建 link -> { title, link } 映射，用于缺失时输出标题和链接 */
function loadLinksMap() {
  if (!fs.existsSync(LINKS_JSON_PATH)) {
    return {}
  }
  const raw = fs.readFileSync(LINKS_JSON_PATH, 'utf8')
  let sources
  try {
    sources = JSON.parse(raw)
  } catch {
    return {}
  }
  const map = {}
  if (Array.isArray(sources)) {
    for (const source of sources) {
      const items = source.items || []
      for (const item of items) {
        if (item.link) {
          map[item.link] = {...item}
        }
      }
    }
  }
  return map
}

async function headExists(url) {
  try {
    const res = await fetch(url, { method: 'HEAD', redirect: 'follow' })
    return res.ok
  } catch (e) {
    return false
  }
}

async function main() {
  const processed = loadProcessed()
  const linksMap = loadLinksMap()
  const entries = Object.entries(processed)
  const base = ARTICLE_DATA_HOST.replace(/\/$/, '')
  console.log('ARTICLE_DATA_HOST:', base)
  console.log('processed.json 条目数:', entries.length)
  console.log('links.json 条目数:', Object.keys(linksMap).length)
  console.log('')

  let exist = 0
  let missing = 0
  const missingList = []

  for (let i = 0; i < entries.length; i++) {
    const [url, md5] = entries[i]
    const mdUrl = `${base}/data/articles/${md5}/page.md`
    const ok = await headExists(mdUrl)
    if (ok) {
      exist++
    } else {
      missing++
      const info = linksMap[url] || { title: '(无标题)', link: url }
      missingList.push({ md5, ...info })
      console.log('[MISSING]', md5)
      console.log('  标题:', info.title)
      console.log('  链接:', info.link)
    }
    if ((i + 1) % 50 === 0) {
      console.log(`  ... 已检查 ${i + 1}/${entries.length}`)
    }
  }

  console.log('')
  console.log('--- 汇总 ---')
  console.log('存在:', exist)
  console.log('缺失:', missing)
  if (missingList.length > 0) {
    fs.writeFileSync(MISSING_PATH, JSON.stringify(missingList, null, 2), 'utf8')
    console.log('已保存缺失列表到:', MISSING_PATH)
    console.log('缺失列表（标题 + 链接）:')
    missingList.forEach(({ md5, title, link }) => {
      console.log('  ', md5)
      console.log('    标题:', title)
      console.log('    链接:', link)
    })
  } else {
    if (fs.existsSync(MISSING_PATH)) {
      fs.unlinkSync(MISSING_PATH)
      console.log('无缺失，已删除旧文件:', MISSING_PATH)
    }
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
