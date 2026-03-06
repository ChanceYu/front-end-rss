/**
 * 将项目根目录 data/ 下所有文件上传到七牛云存储。
 * - 独立运行：在 article-to-md 目录执行 pnpm run upload
 * - 被调用：可在 once.js 处理完成后执行 runUpload()
 *
 * 环境变量（必填，可在 .env 中配置）：
 *   QINIU_ACCESS_KEY  七牛 AK
 *   QINIU_SECRET_KEY  七牛 SK
 *   QINIU_BUCKET      空间名
 *
 * 可选：
 *   QINIU_PREFIX      对象 key 前缀，默认 "data/"
 *   QINIU_REGION      区域 ID，如 z0（华东），不设则自动解析
 */

import 'dotenv/config'
import { join, dirname, extname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'
import { createHash } from 'node:crypto'
import fs from 'fs-extra'

const { readFileSync, readdirSync, statSync, pathExistsSync } = fs

/** 计算本地文件的 MD5 */
function getFileMD5(filePath) {
  return createHash('md5').update(readFileSync(filePath)).digest('hex')
}

const __dirname = dirname(fileURLToPath(import.meta.url))
// 项目根目录的 data（article-to-md 在 repo 根下）
const DATA_DIR = join(__dirname, '..', '..', 'data')
const ARTICLES_DIR = join(DATA_DIR, 'articles')
const PROCESSED_JSON_PATH = join(DATA_DIR, 'processed.json')
const PROCESSED_JSON_KEY = 'processed.json'
const LINKS_JSON_PATH = join(DATA_DIR, 'links.json')
const LINKS_JSON_KEY = 'links.json'

const SKIP_NAMES = new Set([
  '.DS_Store',
  'Thumbs.db',
  'desktop.ini',
])

/** 按扩展名返回上传用的 MIME 类型，避免 .md 等被误判为 image/png */
function getMimeType(key) {
  const ext = extname(key).toLowerCase()
  const map = {
    '.md': 'text/markdown; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.txt': 'text/plain; charset=utf-8',
  }
  return map[ext] || undefined
}

function getAllFiles(dir, base = '') {
  const list = []
  const names = readdirSync(dir)
  for (const name of names) {
    if (SKIP_NAMES.has(name)) continue
    const full = join(dir, name)
    const rel = base ? join(base, name) : name
    const stat = statSync(full)
    if (stat.isDirectory()) {
      list.push(...getAllFiles(full, rel))
    } else if (stat.isFile()) {
      list.push({ fullPath: full, key: rel })
    }
  }
  return list
}

/** 创建七牛上传上下文，所有上传均使用 scope bucket:key 覆盖策略 */
function getQiniuContext() {
  const accessKey = process.env.QINIU_ACCESS_KEY
  const secretKey = process.env.QINIU_SECRET_KEY
  const bucket = process.env.QINIU_BUCKET || 'fed-data'
  const regionId = process.env.QINIU_REGION
  const prefix = (process.env.QINIU_PREFIX || 'data/').replace(/\/?$/, '/')

  if (!accessKey || !secretKey || !bucket) {
    throw new Error('缺少环境变量：请设置 QINIU_ACCESS_KEY, QINIU_SECRET_KEY, QINIU_BUCKET')
  }

  const require = createRequire(import.meta.url)
  const qiniu = require('qiniu')
  const mac = new qiniu.auth.digest.Mac(accessKey, secretKey)
  /** 按对象 key 生成允许覆盖的上传凭证（scope = bucket:key） */
  const getOverwriteToken = (objectKey) => {
    const putPolicy = new qiniu.rs.PutPolicy({ scope: `${bucket}:${objectKey}` })
    return putPolicy.uploadToken(mac)
  }
  const config = new qiniu.conf.Config()
  if (regionId) {
    config.regionsProvider = qiniu.httpc.Region.fromRegionId(regionId)
  }
  const formUploader = new qiniu.form_up.FormUploader(config)
  const putExtra = new qiniu.form_up.PutExtra()
  const bucketManager = new qiniu.rs.BucketManager(mac, config)
  return { formUploader, putExtra, bucketManager, getOverwriteToken, bucket, prefix }
}

/** 上传文件列表到七牛，返回统计（每个文件使用覆盖凭证） */
async function uploadFileList(files, ctx) {
  const { formUploader, putExtra, bucketManager, getOverwriteToken, bucket, prefix } = ctx
  let ok = 0
  let skip = 0
  let fail = 0
  for (const { fullPath, key } of files) {
    const objectKey = prefix + key.replace(/\\/g, '/')
    try {
      const localMD5 = getFileMD5(fullPath)
      let statResp
      try {
        statResp = await bucketManager.stat(bucket, objectKey)
      } catch {
        statResp = null
      }
      if (statResp?.resp?.statusCode === 200 && statResp?.data?.md5) {
        const remoteMD5 = String(statResp.data.md5).trim()
        if (remoteMD5 === localMD5) {
          skip++
          continue
        }
      }
      putExtra.mimeType = getMimeType(key)
      const uploadToken = getOverwriteToken(objectKey)
      const { data, resp } = await formUploader.putFile(
        uploadToken,
        objectKey,
        fullPath,
        putExtra
      )
      if (resp.statusCode === 200) {
        ok++
      } else {
        fail++
        console.error(`  [fail] ${objectKey} status=${resp.statusCode}`, data)
      }
    } catch (err) {
      fail++
      console.error(`  [err] ${objectKey}`, err.message)
    }
  }
  return { ok, skip, fail }
}

/**
 * 仅上传 data/processed.json 到七牛（key: data/processed.json）。
 * 可在 runUpload 末尾或 /article-to-md/once 单篇处理完成后调用。
 * @returns {{ ok: number, skip: number, fail: number }}
 */
export async function uploadProcessedJson() {
  if (!pathExistsSync(PROCESSED_JSON_PATH) || !statSync(PROCESSED_JSON_PATH).isFile()) {
    return { ok: 0, skip: 0, fail: 0 }
  }
  const ctx = getQiniuContext()
  return uploadFileList([{ fullPath: PROCESSED_JSON_PATH, key: PROCESSED_JSON_KEY }], ctx)
}

/**
 * 仅上传 data/links.json 到七牛（key: data/links.json）。
 * @returns {{ ok: number, skip: number, fail: number }}
 */
export async function uploadLinksJson() {
  if (!pathExistsSync(LINKS_JSON_PATH) || !statSync(LINKS_JSON_PATH).isFile()) {
    return { ok: 0, skip: 0, fail: 0 }
  }
  const ctx = getQiniuContext()
  return uploadFileList([{ fullPath: LINKS_JSON_PATH, key: LINKS_JSON_KEY }], ctx)
}

/**
 * 仅上传指定文章目录 data/articles/:md5 下的所有文件（供接口单篇上传后调用）。
 * @param {string} md5 - 文章目录名（即 data/articles 下的子目录名）
 * @returns {{ ok: number, skip: number, fail: number }}
 */
export async function uploadArticleFolder(md5) {
  if (!md5) {
    return { ok: 0, skip: 0, fail: 0 }
  }
  const articleDir = join(ARTICLES_DIR, md5)
  if (!pathExistsSync(articleDir) || !statSync(articleDir).isDirectory()) {
    return { ok: 0, skip: 0, fail: 0 }
  }
  const files = getAllFiles(articleDir, `articles/${md5}`)
  if (files.length === 0) {
    return { ok: 0, skip: 0, fail: 0 }
  }
  const ctx = getQiniuContext()
  return uploadFileList(files, ctx)
}

/**
 * 执行上传：将 data/ 下文件上传到七牛，成功后可选删除 data/articles。
 * @returns {{ ok: number, skip: number, fail: number }}
 */
export async function runUpload() {
  if (!pathExistsSync(DATA_DIR)) {
    throw new Error('data 目录不存在: ' + DATA_DIR)
  }
  const ctx = getQiniuContext()
  const files = getAllFiles(DATA_DIR)
  console.log(`共 ${files.length} 个文章目录待上传`)

  let ok = 0
  let skip = 0
  let fail = 0
  const mainResult = await uploadFileList(files, ctx)
  ok += mainResult.ok
  skip += mainResult.skip
  fail += mainResult.fail
  const pjResult = await uploadProcessedJson()
  ok += pjResult.ok
  skip += pjResult.skip
  fail += pjResult.fail
  console.log(`\n完成：成功 ${ok}，跳过(已存在且 md5 一致) ${skip}，失败 ${fail}`)

  if (fail === 0 && pathExistsSync(ARTICLES_DIR)) {
    await fs.remove(join(ARTICLES_DIR))
    console.log('已清理 data/articles 目录')
  }

  return { ok, skip, fail }
}

// 直接运行（pnpm run upload）时执行上传并退出
const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]
if (isMain) {
  runUpload()
    .then(({ fail }) => process.exit(fail > 0 ? 1 : 0))
    .catch((err) => {
      console.error(err.message || err)
      process.exit(1)
    })
}
