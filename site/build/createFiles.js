const fs = require('fs-extra')
const path = require('path')
const zlib = require('zlib')
const dayjs = require('dayjs')

const data = require('./data')

const { RSS_DATA, TAGS_DATA, LINKS_DATA, HOTWORDS_DATA } = data

// 配置常量
const PAGE_SIZE = 200
const DIST_PATH = path.join(__dirname, '../dist')

/**
 * 对文章列表按日期排序并添加索引ID
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

  // 添加唯一ID用于索引
  return articles.map((item, index) => ({
    ...item,
    id: index
  }))
}

/**
 * 生成分页数据文件
 */
function generatePaginatedList(articles) {
  const listDir = path.join(DIST_PATH, 'list')
  fs.ensureDirSync(listDir)

  const pageCount = Math.ceil(articles.length / PAGE_SIZE)
  
  for (let i = 0; i < pageCount; i++) {
    const start = i * PAGE_SIZE
    const end = start + PAGE_SIZE
    const pageData = articles.slice(start, end)
    const filePath = path.join(listDir, `page-${i}.json`)
    fs.outputJsonSync(filePath, pageData)
  }

  console.log(`Generated ${pageCount} paginated list files`)
  return pageCount
}

/**
 * 生成文本搜索倒排索引
 * 结构: { keyword: [articleId1, articleId2, ...] }
 */
function generateTextIndex(articles) {
  const indexDir = path.join(DIST_PATH, 'index')
  fs.ensureDirSync(indexDir)

  // 使用 Object.create(null) 避免原型属性冲突
  const textIndex = Object.create(null)
  
  // 从标签中提取关键词
  const tagKeywords = new Set()
  TAGS_DATA.forEach(tag => {
    if (tag.keywords) {
      tag.keywords.split('|').forEach(kw => {
        const k = kw.toLowerCase().trim()
        if (k) tagKeywords.add(k)
      })
    }
  })

  // 热门搜索词（来自 data/hotwords.json）
  ;(HOTWORDS_DATA || []).forEach(word => {
    const k = String(word).toLowerCase().trim()
    if (k) tagKeywords.add(k)
  })

  articles.forEach((article, idx) => {
    const title = article.title.toLowerCase()
    
    // 对每个关键词检查是否匹配
    tagKeywords.forEach(keyword => {
      if (keyword && title.includes(keyword)) {
        if (!textIndex[keyword]) {
          textIndex[keyword] = []
        }
        if (!textIndex[keyword].includes(idx)) {
          textIndex[keyword].push(idx)
        }
      }
    })

    // 提取标题中的单词作为索引（中文按字符，英文按单词）
    const words = title.match(/[\u4e00-\u9fa5]+|[a-zA-Z0-9]+/g) || []
    words.forEach(word => {
      const lowerWord = word.toLowerCase()
      if (lowerWord.length >= 2) { // 至少2个字符
        if (!textIndex[lowerWord]) {
          textIndex[lowerWord] = []
        }
        if (!textIndex[lowerWord].includes(idx)) {
          textIndex[lowerWord].push(idx)
        }
      }
    })
  })

  const filePath = path.join(indexDir, 'text-index.json')
  fs.outputJsonSync(filePath, textIndex)
  console.log(`Generated text index with ${Object.keys(textIndex).length} keywords`)
}

/**
 * 生成来源索引
 * 结构: { sourceName: [article1, article2, ...] }
 */
function generateSourceIndex(articles) {
  const indexDir = path.join(DIST_PATH, 'index')
  fs.ensureDirSync(indexDir)

  const sourceIndex = Object.create(null)
  
  articles.forEach(article => {
    const source = article.rssTitle
    if (!sourceIndex[source]) {
      sourceIndex[source] = []
    }
    sourceIndex[source].push(article)
  })

  // 确保每个来源的文章按日期排序
  Object.keys(sourceIndex).forEach(source => {
    sourceIndex[source].sort((a, b) => a.date < b.date ? 1 : -1)
  })

  const filePath = path.join(indexDir, 'source-index.json')
  fs.outputJsonSync(filePath, sourceIndex)
  console.log(`Generated source index with ${Object.keys(sourceIndex).length} sources`)
}

/**
 * 生成分类索引
 * 结构: { categoryName: [article1, article2, ...] }
 */
function generateCategoryIndex(articles) {
  const indexDir = path.join(DIST_PATH, 'index')
  fs.ensureDirSync(indexDir)

  const categoryIndex = Object.create(null)
  
  articles.forEach(article => {
    let matched = false
    
    TAGS_DATA.forEach(tag => {
      if (tag.keywords) {
        const regex = new RegExp(tag.keywords, 'gi')
        if (regex.test(article.title)) {
          if (!categoryIndex[tag.tag]) {
            categoryIndex[tag.tag] = []
          }
          categoryIndex[tag.tag].push(article)
          matched = true
        }
      }
    })

    // 未匹配任何分类的归入"其它"
    if (!matched) {
      if (!categoryIndex['其它']) {
        categoryIndex['其它'] = []
      }
      categoryIndex['其它'].push(article)
    }
  })

  // 确保每个分类的文章按日期排序
  Object.keys(categoryIndex).forEach(cat => {
    categoryIndex[cat].sort((a, b) => a.date < b.date ? 1 : -1)
  })

  const filePath = path.join(indexDir, 'category-index.json')
  fs.outputJsonSync(filePath, categoryIndex)
  console.log(`Generated category index with ${Object.keys(categoryIndex).length} categories`)
}

/**
 * 生成时间范围索引
 * 结构: { rangeName: [article1, article2, ...] }
 */
function generateTimeIndex(articles) {
  const indexDir = path.join(DIST_PATH, 'index')
  fs.ensureDirSync(indexDir)

  const today = dayjs().format('YYYY-MM-DD')
  const oneWeekAgo = dayjs().subtract(7, 'days').format('YYYY-MM-DD')
  const oneMonthAgo = dayjs().subtract(31, 'days').format('YYYY-MM-DD')

  const timeIndex = {
    '最近一周': [],
    '最近一月': []
  }

  articles.forEach(article => {
    const date = article.date

    if (date >= oneWeekAgo && date <= today) {
      timeIndex['最近一周'].push(article)
    }
    if (date >= oneMonthAgo && date <= today) {
      timeIndex['最近一月'].push(article)
    }
  })

  const filePath = path.join(indexDir, 'time-index.json')
  fs.outputJsonSync(filePath, timeIndex)
  console.log(`Generated time index with counts: 最近一周(${timeIndex['最近一周'].length}), 最近一月(${timeIndex['最近一月'].length})`)
}

/**
 * 生成旧版 data.json 用于兼容
 */
function generateLegacyDataFile() {
  const filePath = path.join(DIST_PATH, 'data.json')
  
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
  
  // 准备文章数据
  const articles = prepareArticles()
  console.log(`Total articles: ${articles.length}`)

  // 生成分页列表
  const pageCount = generatePaginatedList(articles)

  // 生成各类索引
  generateTextIndex(articles)
  generateSourceIndex(articles)
  generateCategoryIndex(articles)
  generateTimeIndex(articles)

  // 生成旧版兼容文件
  generateLegacyDataFile()

  console.log('File generation completed!')

  // 返回配置信息供 template-parameters.js 使用
  return {
    totalCount: articles.length,
    pageSize: PAGE_SIZE,
    pageCount: pageCount
  }
}

module.exports = createFiles
