const fs = require('fs-extra')
const path = require('path')
const zlib = require('zlib')
const dayjs = require('dayjs')

const data = require('./data')

/** 使用 @node-rs/jieba 分词，失败则用正则回退 */
function loadJieba() {
  try {
    const { Jieba } = require('@node-rs/jieba')
    const { dict } = require('@node-rs/jieba/dict')
    const jieba = Jieba.withDict(dict)
    return (text) => (jieba.cut(text, false) || []).filter(Boolean)
  } catch (e) {
    console.warn('@node-rs/jieba not available, using regex fallback:', e.message)
    return null
  }
}

const { RSS_DATA, TAGS_DATA, LINKS_DATA, HOTWORDS_DATA } = data

// 配置常量：所有 JSON 输出到 dist/data
const PAGE_SIZE = 200
const DIST_PATH = path.join(__dirname, '../dist')
const DATA_DIR = path.join(DIST_PATH, 'data')

/**
 * 对文章列表按日期排序，返回完整对象数组（含 id = 下标）
 */
function prepareArticles() {
  const articles = LINKS_DATA.reduce((prev, curr) => {
    return [
      ...prev,
      ...curr.items.map((post) => ({
        rssTitle: curr.title,
        ...post
      }))
    ]
  }, []).sort((a, b) => {
    return a.date < b.date ? 1 : -1
  })

  return articles.map((item, index) => ({
    ...item,
    id: index
  }))
}

/**
 * 将所有文章按最新顺序保存为纯二维数组
 * 格式: [[title, rssTitle, link, date], ...]，下标即文章 index
 */
function generateArticlesJson(articles) {
  const rows = articles.map((a) => [a.title, a.rssTitle, a.link, a.date])
  fs.ensureDirSync(DATA_DIR)
  const filePath = path.join(DATA_DIR, 'articles.json')
  fs.outputJsonSync(filePath, rows)
  console.log(`Generated data/articles.json with ${rows.length} rows`)
}

/**
 * 生成文本搜索倒排索引（只保存文章在 articles 数组中的下标）
 * 分词使用 @node-rs/jieba，不可用时用正则回退，结构: { keyword: [index1, index2, ...] }
 */
function generateTextIndex(articles) {
  fs.ensureDirSync(DATA_DIR)

  const cut = loadJieba()
  const segmentTitle = (title) => {
    if (cut) return cut(title)
    const words = title.match(/[\u4e00-\u9fa5]+|[a-zA-Z0-9]+/g) || []
    return words
  }

  const textIndex = Object.create(null)

  const tagKeywords = new Set()
  TAGS_DATA.forEach(tag => {
    if (tag.keywords) {
      tag.keywords.replace(/(\?)|([：])|(\)?\\b\(?)?/g, '').split('|').forEach(kw => {
        const k = kw.toLowerCase().trim()
        if (k) tagKeywords.add(k)
      })
    }
  })

  ;(HOTWORDS_DATA || []).forEach(word => {
    const k = String(word).toLowerCase().trim()
    if (k) tagKeywords.add(k)
  })

  // 只索引纯中文/字母/数字，至少 3 字符，排除 emoji、特殊符号、纯数字
  const indexableWord = /^[\u4e00-\u9fa5a-zA-Z0-9]{3,}$/
  const pureDigits = /^\d+$/
  const addToIndex = (keyword, idx) => {
    if (!keyword) return
    const key = keyword.toLowerCase().trim()
    if (!key || !indexableWord.test(key) || pureDigits.test(key)) return
    if (!textIndex[key]) textIndex[key] = []
    if (!textIndex[key].includes(idx)) textIndex[key].push(idx)
  }

  articles.forEach((article, idx) => {
    const title = article.title

    tagKeywords.forEach(keyword => {
      if (keyword && title.toLowerCase().includes(keyword)) {
        addToIndex(keyword, idx)
      }
    })

    const words = segmentTitle(title)
    words.forEach(word => addToIndex(word, idx))
  })

  const filePath = path.join(DATA_DIR, 'text-index.json')
  fs.outputJsonSync(filePath, textIndex)
  console.log(`Generated data/text-index.json with ${Object.keys(textIndex).length} keywords`)
}

/**
 * 生成来源索引（只保存文章在 articles 数组中的下标）
 * 结构: { sourceName: [index1, index2, ...] }，同一来源内按日期新到旧
 */
function generateSourceIndex(articles) {
  fs.ensureDirSync(DATA_DIR)

  const sourceIndex = Object.create(null)

  articles.forEach((article, idx) => {
    const source = article.rssTitle
    if (!sourceIndex[source]) sourceIndex[source] = []
    sourceIndex[source].push(idx)
  })

  const filePath = path.join(DATA_DIR, 'source-index.json')
  fs.outputJsonSync(filePath, sourceIndex)
  console.log(`Generated data/source-index.json with ${Object.keys(sourceIndex).length} sources`)
}

/**
 * 生成分类索引（只保存文章在 articles 数组中的下标）
 * 结构: { categoryName: [index1, index2, ...] }，同一分类内按日期新到旧
 */
function generateCategoryIndex(articles) {
  fs.ensureDirSync(DATA_DIR)

  const categoryIndex = Object.create(null)

  articles.forEach((article, idx) => {
    let matched = false

    TAGS_DATA.forEach(tag => {
      if (tag.keywords) {
        const regex = new RegExp(tag.keywords, 'gi')
        if (regex.test(article.title)) {
          if (!categoryIndex[tag.tag]) categoryIndex[tag.tag] = []
          categoryIndex[tag.tag].push(idx)
          matched = true
        }
      }
    })

    if (!matched) {
      if (!categoryIndex['其它']) categoryIndex['其它'] = []
      categoryIndex['其它'].push(idx)
    }
  })

  const filePath = path.join(DATA_DIR, 'category-index.json')
  fs.outputJsonSync(filePath, categoryIndex)
  console.log(`Generated data/category-index.json with ${Object.keys(categoryIndex).length} categories`)
}

/**
 * 生成旧版 data.json 用于兼容
 */
function generateLegacyDataFile() {
  fs.ensureDirSync(DATA_DIR)
  const filePath = path.join(DATA_DIR, 'data.json')

  fs.outputJsonSync(filePath, {
    updateTime: dayjs().format('YYYY-MM-DD HH:mm'),
    rss: RSS_DATA,
    tags: TAGS_DATA,
    links: LINKS_DATA,
  })

  compress(filePath, 'gz')
  compress(filePath, 'br')
}

/**
 * 压缩文件
 */
function compress(filePath, ext) {
  const dest = ext === 'gz' ? zlib.createGzip() : zlib.createBrotliCompress()
  const rs = fs.createReadStream(filePath)
  const ws = fs.createWriteStream(`${filePath}.${ext}`)
  rs.pipe(dest).pipe(ws)
}

/**
 * 主函数：生成所有静态文件
 */
function createFiles() {
  console.log('Starting file generation...')
  
  // 准备文章数据（按日期最新排序）
  const articles = prepareArticles()
  console.log(`Total articles: ${articles.length}`)

  // 全量文章二维数组 [[title, rssTitle, link, date], ...]，下标即 index
  generateArticlesJson(articles)

  // 索引文件只保存文章 index
  generateTextIndex(articles)
  generateSourceIndex(articles)
  generateCategoryIndex(articles)

  // 生成旧版兼容文件
  generateLegacyDataFile()

  console.log('File generation completed!')

  const pageCount = Math.ceil(articles.length / PAGE_SIZE)
  return {
    totalCount: articles.length,
    pageSize: PAGE_SIZE,
    pageCount
  }
}

module.exports = createFiles
