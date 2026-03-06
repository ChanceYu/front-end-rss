/**
 * 将 site/dist 目录上传到七牛云存储。
 * 使用：在 site 目录执行 node build/upload.js 或 pnpm run upload（需在 package.json 添加脚本）
 *
 * 环境变量（可与 article-to-md 共用 .env，或在此指定）：
 *   QINIU_ACCESS_KEY  七牛 AK
 *   QINIU_SECRET_KEY  七牛 SK
 *   QINIU_BUCKET      空间名（可与 data 同 bucket，用 prefix 区分）
 *
 * 可选：
 *   QINIU_PREFIX      dist 在 bucket 下的前缀，默认 ""（即根目录），可设为 "site/" 等
 *   QINIU_REGION      区域 ID，如 z0（华东）
 *
 * 会优先加载项目根下 article-to-md/.env，若不存在则使用 process.env。
 */

const path = require('path')
const fs = require('fs')
const crypto = require('crypto')

const SITE_DIR = path.join(__dirname, '..')
const DIST_DIR = path.join(SITE_DIR, 'dist')

// 优先加载 article-to-md 的 .env
try {
  require('dotenv').config({ path: path.join(SITE_DIR, '..', 'article-to-md', '.env') })
} catch (e) {}

const SKIP_NAMES = new Set([
  '.DS_Store',
  'Thumbs.db',
  'desktop.ini',
])

function getFileMD5(filePath) {
  const buf = fs.readFileSync(filePath)
  return crypto.createHash('md5').update(buf).digest('hex')
}

function getMimeType(key) {
  const ext = path.extname(key).toLowerCase()
  const map = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.txt': 'text/plain; charset=utf-8',
    '.ico': 'image/x-icon',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.xml': 'application/xml',
    '.map': 'application/json',
  }
  return map[ext]
}

function getAllFiles(dir, base = '') {
  const list = []
  const names = fs.readdirSync(dir)
  for (const name of names) {
    if (SKIP_NAMES.has(name)) continue
    const full = path.join(dir, name)
    const rel = base ? path.join(base, name) : name
    const stat = fs.statSync(full)
    if (stat.isDirectory()) {
      list.push(...getAllFiles(full, rel))
    } else if (stat.isFile()) {
      list.push({ fullPath: full, key: rel })
    }
  }
  return list
}

function getQiniuContext() {
  const accessKey = process.env.QINIU_ACCESS_KEY
  const secretKey = process.env.QINIU_SECRET_KEY
  const bucket = process.env.QINIU_BUCKET || 'fed-data'
  const regionId = process.env.QINIU_REGION
  const prefix = (process.env.QINIU_PREFIX || '').replace(/\/?$/, '')
  const prefixWithSlash = prefix ? prefix + '/' : ''

  if (!accessKey || !secretKey || !bucket) {
    throw new Error('缺少环境变量：请设置 QINIU_ACCESS_KEY, QINIU_SECRET_KEY, QINIU_BUCKET')
  }

  const qiniu = require('qiniu')
  const mac = new qiniu.auth.digest.Mac(accessKey, secretKey)
  const getOverwriteToken = (objectKey) => {
    const putPolicy = new qiniu.rs.PutPolicy({ scope: bucket + ':' + objectKey })
    return putPolicy.uploadToken(mac)
  }
  const config = new qiniu.conf.Config()
  if (regionId) {
    config.regionsProvider = qiniu.httpc.Region.fromRegionId(regionId)
  }
  const formUploader = new qiniu.form_up.FormUploader(config)
  const putExtra = new qiniu.form_up.PutExtra()
  const bucketManager = new qiniu.rs.BucketManager(mac, config)
  return { formUploader, putExtra, bucketManager, getOverwriteToken, bucket, prefix: prefixWithSlash }
}

async function uploadFileList(files, ctx) {
  const { formUploader, putExtra, bucketManager, getOverwriteToken, bucket, prefix } = ctx
  let ok = 0
  let skip = 0
  let fail = 0
  for (let i = 0; i < files.length; i++) {
    const { fullPath, key } = files[i]
    const objectKey = (prefix + key).replace(/\\/g, '/').replace(/^\/+/, '')
    try {
      const localMD5 = getFileMD5(fullPath)
      let statResp = null
      try {
        statResp = await bucketManager.stat(bucket, objectKey)
      } catch (e) {}
      if (statResp && statResp.resp && statResp.resp.statusCode === 200 && statResp.data && statResp.data.md5) {
        const remoteMD5 = String(statResp.data.md5).trim()
        if (remoteMD5 === localMD5) {
          skip++
          continue
        }
      }
      putExtra.mimeType = getMimeType(key)
      const uploadToken = getOverwriteToken(objectKey)
      const result = await formUploader.putFile(uploadToken, objectKey, fullPath, putExtra)
      if (result.resp && result.resp.statusCode === 200) {
        ok++
      } else {
        fail++
        console.error('  [fail]', objectKey, result.resp ? result.resp.statusCode : '', result.data)
      }
    } catch (err) {
      fail++
      console.error('  [err]', objectKey, err.message)
    }
  }
  return { ok, skip, fail }
}

async function runUpload() {
  if (!fs.existsSync(DIST_DIR)) {
    throw new Error('dist 目录不存在: ' + DIST_DIR + '，请先执行 pnpm run build')
  }
  const ctx = getQiniuContext()
  const files = getAllFiles(DIST_DIR)
  console.log('dist 下共 %d 个文件待上传', files.length)

  const { ok, skip, fail } = await uploadFileList(files, ctx)
  console.log('\n完成：成功 %d，跳过(已存在且 md5 一致) %d，失败 %d', ok, skip, fail)
  return { ok, skip, fail }
}

if (require.main === module) {
  runUpload()
    .then(({ fail }) => process.exit(fail > 0 ? 1 : 0))
    .catch((err) => {
      console.error(err.message || err)
      process.exit(1)
    })
}
