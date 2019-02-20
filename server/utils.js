const fs = require('fs')
const path = require('path')
const moment = require('moment')

const RESP_ROOT = '../';
const RESP_PATH              = path.join(RESP_ROOT)
const RSS_PATH               = path.join(RESP_ROOT + '/data/rss.json')
const LINKS_PATH             = path.join(RESP_ROOT + '/data/links.json')
const TAGS_PATH              = path.join(RESP_ROOT + '/data/tags.json')
const README_PATH            = path.join(RESP_ROOT + '/README.md')
const README_TEMPLATE_PATH   = path.join(RESP_ROOT + '/templates/README.md')
const TAGS_MD_PATH           = path.join(RESP_ROOT + '/TAGS.md')
const TAGS_TEMPLATE_PATH     = path.join(RESP_ROOT + '/templates/TAGS.md')
const TIMELINE_MD_PATH       = path.join(RESP_ROOT + '/TIMELINE.md')
const TIMELINE_TEMPLATE_PATH = path.join(RESP_ROOT + '/templates/TIMELINE.md')
const DETAILS_TEMPLATE_PATH = path.join(RESP_ROOT + '/templates/DETAILS.md')

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
    TIMELINE_MD_PATH,
    TIMELINE_TEMPLATE_PATH,
    DETAILS_TEMPLATE_PATH,
  },

  /**
   * 格式化标题
   */
  formatTitle: function(title, isRsshub){
    // https://rsshub.app
    if(isRsshub){
      let matches = title.match(/“(.*)”/)
    
      if(matches && matches[1]){
        title = matches[1]
      }
    }
    return title.replace('<![CDATA[', '').replace(']]>', '').replace(/[\[\]\(\)]/g, '').replace(/\s+/g, '-')
  },

  /**
   * 格式化时间
   */
  getNowDate: function(){
    return moment().format('YYYY-MM-DD HH:mm:ss')
  },

  /**
   * 获取 links.json 数据
   */
  getLinksJson: function(){
    return JSON.parse(fs.readFileSync(LINKS_PATH).toString())
  }
}