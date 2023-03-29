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
} = utils.PATH

/**
 * 渲染 README.md 文件
 */
async function handleREADME(newData, linksJson) {
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
  })

  fs.writeFileSync(README_PATH, content, 'utf-8')
}

/**
 * 渲染 TAGS.md 文件
 */
function handleTags(newData, linksJson) {
  const currentDate = utils.getNowDate()
  let tags = fs.readJsonSync(TAGS_PATH)

  tags.forEach((tag, i) => {
    tags[i].items = []

    linksJson.forEach((o) => {
      o.items.forEach((item) => {
        if (!item.rssTitle && (new RegExp(tag.keywords, 'gi')).test(item.title)) {
          item.rssTitle = o.title
          tags[i].items.push(item)
        }
      })
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
      items: tags[i].items
    })

    fs.writeFileSync(path.join(RESP_PATH, 'details/tags/', filename), detailContent, 'utf-8')

  })

  let content = fs.readFileSync(TAGS_TEMPLATE_PATH)
  let compiled = _.template(content.toString())

  content = compiled({
    currentDate,
    formatTitle: utils.formatTitle,
    tags
  })

  fs.writeFileSync(TAGS_MD_PATH, content, 'utf-8')
}

/**
 * 生成每个详情页面
 */
function handleDetails(newData, linksJson) {
  const currentDate = utils.getNowDate()
  let content = fs.readFileSync(DETAILS_TEMPLATE_PATH).toString()
  let compiled = _.template(content)

  linksJson.forEach((source) => {
    if (source.title in newData.rss) {
      source.currentDate = currentDate
      source.formatTitle = utils.formatTitle

      content = compiled(source)

      let filename = source.title.replace(/[\\\/]/g, '')
      filename += '.md'

      fs.writeFileSync(path.join(RESP_PATH, 'details', filename), content, 'utf-8')
    }
  })
}

module.exports = async function (newData, linksJson) {
  await handleREADME(newData, linksJson)
  handleTags(newData, linksJson)
  handleDetails(newData, linksJson)
}
