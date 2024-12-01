const fs = require('fs-extra')
const path = require('path')
const url = require('url')
const moment = require('moment-timezone')
const chalk = require('chalk')
const pathToRegexp = require('path-to-regexp')
const queryString = require('query-string')
const { Octokit } = require('@octokit/core')

require('dotenv').config({ multiline: true })

const RESP_PATH              = path.join(__dirname, '../')
const RSS_PATH               = path.join(RESP_PATH + '/data/rss.json')
const LINKS_PATH             = path.join(RESP_PATH + '/data/links.json')
const TAGS_PATH              = path.join(RESP_PATH + '/data/tags.json')
const FEED_PATH              = path.join(RESP_PATH + '/data/atom.xml')
const README_PATH            = path.join(RESP_PATH + '/README.md')
const README_TEMPLATE_PATH   = path.join(RESP_PATH + '/templates/README.md')
const TAGS_MD_PATH           = path.join(RESP_PATH + '/TAGS.md')
const TAGS_TEMPLATE_PATH     = path.join(RESP_PATH + '/templates/TAGS.md')
const DETAILS_TEMPLATE_PATH  = path.join(RESP_PATH + '/templates/DETAILS.md')

const tags = fs.readJsonSync(TAGS_PATH)

/**
 * workflow 运行模式
 */
const WORKFLOW = !!process.env.WORKFLOW

console.log('WORKFLOW:', WORKFLOW)

module.exports = {
  WORKFLOW,
  /**
   * 文件路径
   */
  PATH: {
    RESP_PATH,
    RSS_PATH,
    LINKS_PATH,
    TAGS_PATH,
    FEED_PATH,
    README_PATH,
    README_TEMPLATE_PATH,
    TAGS_MD_PATH,
    TAGS_TEMPLATE_PATH,
    DETAILS_TEMPLATE_PATH,
  },

  getLogPrefix() {
    return this.getNowDate() + ' - '
  },

  log(msg) {
    console.log(this.getLogPrefix() + msg)
  },

  logInfo(msg) {
    this.log(chalk.blue(msg))
  },

  logWarn(msg) {
    this.log(chalk.yellow(msg))
  },

  logSuccess(msg) {
    this.log(chalk.green(msg))
  },

  /**
   * 格式化标题
   */
  formatTitle(title) {
    const reg = /<|>|&/g
    const tag = {
      '<': '&lt;',
      '>': '&gt;',
      '&': '&amp;'
    }
    return title
    .replace('<![CDATA[', '')
    .replace(']]>', '')
    .replace(/[\[\]\(\)]/g, '')
    .replace(/\s+/g, '-')
    .replace(reg, (match) => tag[match])
  },

  /**
   * 格式化当前时间
   */
  getNowDate(format) {
    return moment().tz('Asia/Shanghai').format(format || 'YYYY-MM-DD HH:mm:ss')
  },

  /**
   * 格式化时间
   */
  formatDate(time, format) {
    return moment(time).tz('Asia/Shanghai').format(format)
  },

  /**
   * 判断链接是否存在
   * @param link 
   * @param compare 
   */
  isSameLink(link, compare) {
    link = link.replace(/&amp/g, '&')
    compare = compare.replace(/&amp/g, '&')

    const oLink = queryString.parseUrl(link)
    const oCompare = queryString.parseUrl(compare)
    const reWx = /mp\.weixin\.qq\.com/

    if (reWx.test(oLink.url) && reWx.test(oCompare.url)) {
      if (oLink.query.sn && oCompare.query.sn) {
        return oLink.query.sn === oCompare.query.sn && oLink.query.mid === oCompare.query.mid
      }
      const match = pathToRegexp.match('/s/:sid')
      const lUrl = new url.URL(oLink.url)
      const cUrl = new url.URL(oCompare.url)
      const sid1 = match(lUrl.pathname)?.params?.sid
      const sid2 = match(cUrl.pathname)?.params?.sid
      
      if (sid1 && sid2) {
        return sid1 === sid2
      }
    }
    return link === compare
  },
  async getHomePage() {
    try {
      const octokit = new Octokit({
        auth: process.env.GITHUB_TOKEN
      })
      const res = await octokit.request('GET /repos/ChanceYu/front-end-rss', {
        owner: 'ChanceYu',
        repo: 'front-end-rss'
      })
      if (res && res.data && res.data.homepage) {
        return res.data.homepage
      }
    } catch (e) {
    }
    return 'https://fed.chanceyu.com'
  },
  // 筛选出技能类别
  filterBySkill(items) {
    return items.filter((item) => {
      return !!tags.find((tag) => {
        return tag.skill && tag.keywords && (new RegExp(tag.keywords, 'gi')).test(item.title)
      })
    })
  }
}
