const fs = require('fs-extra')
const path = require('path')
const _ = require('underscore')

const utils = require('./utils')

const {
  RESP_PATH,
  TAGS_PATH,
  README_PATH,
  README_TEMPLATE_PATH,
  TAGS_MD_PATH,
  TAGS_TEMPLATE_PATH,
  DETAILS_TEMPLATE_PATH,
  ARTICLES_PROCESSED_PATH,
  LINKS_PATH,
} = utils.PATH

/**
 * 渲染 README.md 文件
 */
async function handleREADME(newData, linksJson, processedMap) {
  let content = fs.readFileSync(README_TEMPLATE_PATH)

  let compiled = _.template(content.toString())
  const currentDate = utils.getNowDate()
  const homePage = await utils.getHomePage()

  content = compiled({
    homePage,
    feedUrl: `${homePage}/atom.xml`,
    newData,
    linksJson,
    currentDate,
    formatTitle: utils.formatTitle,
    processedMap,
  })

  fs.writeFileSync(README_PATH, content, 'utf-8')
}

/**
 * 渲染 TAGS.md 文件
 */
function handleTags(newData, linksJson, processedMap) {
  const currentDate = utils.getNowDate()
  let tags = fs.readJsonSync(TAGS_PATH)

  tags.forEach((tag, i) => {
    tags[i].items = []

    linksJson.forEach((o) => {
      o.items.forEach((item) => {
        if ((new RegExp(tag.keywords, 'gi')).test(item.title)) {
          item.rssTitle = o.title
          tags[i].items.push(item)
        }
      })
    })

    tags[i].items = tags[i].items.sort((a, b) => {
      return a.date < b.date ? 1 : -1
    })

    // details/tags/file.md
    let detailTpl = fs.readFileSync(DETAILS_TEMPLATE_PATH).toString()
    let detailCompiled = _.template(detailTpl)
    const filename = tag.filename + '.md'

    const detailContent = detailCompiled({
      currentDate,
      formatTitle: utils.formatTitle,
      title: tags[i].tag,
      keywords: tags[i].keywords,
      items: tags[i].items,
      processedMap,
    })

    fs.writeFileSync(path.join(RESP_PATH, 'details/tags/', filename), detailContent, 'utf-8')

  })

  let content = fs.readFileSync(TAGS_TEMPLATE_PATH)
  let compiled = _.template(content.toString())

  content = compiled({
    currentDate,
    formatTitle: utils.formatTitle,
    tags,
    processedMap,
  })

  fs.writeFileSync(TAGS_MD_PATH, content, 'utf-8')
}

/**
 * 生成每个详情页面
 * @param {boolean} [regenerateAll] - 为 true 时写入全部 RSS 源（脚本直接运行 writemd.js）；否则仅在有 newData 更新时写入对应源
 */
function handleDetails(newData, linksJson, processedMap, regenerateAll) {
  const currentDate = utils.getNowDate()
  let content = fs.readFileSync(DETAILS_TEMPLATE_PATH).toString()
  let compiled = _.template(content)

  linksJson.forEach((source) => {
    if (regenerateAll || source.title in newData.rss) {
      source.currentDate = currentDate
      source.formatTitle = utils.formatTitle
      source.processedMap = processedMap

      content = compiled(source)

      let filename = source.title.replace(/[\\\/]/g, '')
      filename += '.md'

      fs.writeFileSync(path.join(RESP_PATH, 'details', filename), content, 'utf-8')
    }
  })
}

const run = async function (newData = {
  length: 0,
  titles: [],
  rss: {},
  links: {},
  articles: []
}, linksJson, regenerateAll = false) {
  const processedMap = fs.pathExistsSync(ARTICLES_PROCESSED_PATH)
    ? fs.readJsonSync(ARTICLES_PROCESSED_PATH)
    : {}
  await handleREADME(newData, linksJson, processedMap)
  handleTags(newData, linksJson, processedMap)
  handleDetails(newData, linksJson, processedMap, regenerateAll)
}

const isRunAsScript = process.argv[1] && path.basename(process.argv[1]) === 'writemd.js'
if (isRunAsScript) {
  const linksJson = fs.pathExistsSync(LINKS_PATH) ? fs.readJsonSync(LINKS_PATH) : []
  const newData = { length: 0, titles: [], rss: {}, links: {}, articles: [] }
  run(newData, linksJson, true)
    .then(() => process.exit(0))
    .catch((e) => { console.error(e); process.exit(1) })
}

module.exports = run
