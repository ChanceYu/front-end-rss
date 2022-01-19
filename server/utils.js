const path = require('path')
const moment = require('moment')
const chalk = require('chalk')
const queryString = require('query-string')

const RESP_ROOT = '../'
const RESP_PATH              = path.join(RESP_ROOT)
const RSS_PATH               = path.join(RESP_ROOT + '/data/rss.json')
const LINKS_PATH             = path.join(RESP_ROOT + '/data/links.json')
const TAGS_PATH              = path.join(RESP_ROOT + '/data/tags.json')
const README_PATH            = path.join(RESP_ROOT + '/README.md')
const README_TEMPLATE_PATH   = path.join(RESP_ROOT + '/templates/README.md')
const TAGS_MD_PATH           = path.join(RESP_ROOT + '/TAGS.md')
const TAGS_TEMPLATE_PATH     = path.join(RESP_ROOT + '/templates/TAGS.md')
const DETAILS_TEMPLATE_PATH  = path.join(RESP_ROOT + '/templates/DETAILS.md')

module.exports = {
  /**
   * 文件路径
   */
  PATH: {
    RESP_PATH,
    RSS_PATH,
    LINKS_PATH,
    TAGS_PATH,
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
    return title.replace('<![CDATA[', '').replace(']]>', '').replace(/[\[\]\(\)]/g, '').replace(/\s+/g, '-')
  },

  /**
   * 格式化时间
   */
  getNowDate() {
    return moment().format('YYYY-MM-DD HH:mm:ss')
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
      return oLink.query.sn === oCompare.query.sn && oLink.query.mid === oCompare.query.mid
    } else {
      return link === compare
    }
  }
}