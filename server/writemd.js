const fs = require('fs')
const path = require('path')
const moment = require('moment')
const _ = require('underscore')
const cloneDeep = require('clone-deep')

const utils = require('./utils')

const {
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
} = utils.PATH

/**
 * 渲染 README.md 文件
 */
function handlerREADME(newData){
  newData = newData || {
    length: 0,
    titles: [],
    rss: {},
    links: {}
  }

  let content = fs.readFileSync(README_TEMPLATE_PATH);

  let compiled = _.template(content.toString());

  content = compiled({
    newData,
    currentDate: utils.getNowDate(),
    linksJson: utils.getLinksJson(),
    formatTitle: utils.formatTitle,
  });

  fs.writeFileSync(README_PATH, content, 'utf-8');
}

/**
 * 渲染 TAGS.md 文件
 */
function handlerTags(){
  let tags = require(TAGS_PATH);
  let data = utils.getLinksJson();

  tags.forEach((tag, i) => {
    tags[i].items = [];
    
    data.forEach((o) => {
      o.items.forEach((item) => {
        if(!item.rssTitle && (new RegExp(tag.keywords, 'gi')).test(item.title)){
          item.rssTitle = o.title;
          tags[i].items.push(item);
        }
      });
    });

    // details/tags/file.md
    let detailTpl = fs.readFileSync(DETAILS_TEMPLATE_PATH).toString();
    let detailCompiled = _.template(detailTpl);
    const filename = tag.filename + '.md'

    const detailContent = detailCompiled({
      currentDate: utils.getNowDate(),
      formatTitle: utils.formatTitle,
      title: tags[i].tag,
      keywords: tags[i].keywords,
      items: tags[i].items
    });

    fs.writeFileSync(path.join(RESP_PATH, 'details/tags/', filename), detailContent, 'utf-8');
    
  });

  let content = fs.readFileSync(TAGS_TEMPLATE_PATH);
  let compiled = _.template(content.toString());

  content = compiled({
    currentDate: utils.getNowDate(),
    formatTitle: utils.formatTitle,
    tags
  });

  fs.writeFileSync(TAGS_MD_PATH, content, 'utf-8');
}

function handlerTimeline(){
  let dataObj = {}
  let dataYears = []
  let allLinks = utils.getLinksJson()
  
  allLinks.forEach((rss) => {
    rss.items.forEach((item) => {
      let year = item.date.substr(0, 4)
      let date = item.date.substr(0, 7)

      if(dataYears.indexOf(year) === -1){
        dataYears.push(year)
      }

      item.rssTitle = rss.title;
      dataObj[date] = dataObj[date] || []
      dataObj[date].push(item)
    })
  })

  let content = fs.readFileSync(TIMELINE_TEMPLATE_PATH);

  let compiled = _.template(content.toString());

  content = compiled({
    currentDate: utils.getNowDate(),
    dataObj,
    formatTitle: utils.formatTitle,
    dataYears,
    dataKeys: Object.keys(dataObj).sort().reverse()
  });

  fs.writeFileSync(TIMELINE_MD_PATH, content, 'utf-8');
}

/**
 * 生成每个详情页面
 */
function handlerDetails(newData){
  newData = newData || {
    length: 0,
    titles: [],
    rss: {},
    links: {}
  }
  let allLinks = utils.getLinksJson()
  let content = fs.readFileSync(DETAILS_TEMPLATE_PATH).toString();
  let compiled = _.template(content);

  allLinks.forEach((source) => {
    if (source.rss in newData.rss){
      source.currentDate = utils.getNowDate()
      source.formatTitle = utils.formatTitle
  
      content = compiled(source);
  
      let filename = source.title.replace(/[\\\/]/g, '')
      filename += '.md'
  
      fs.writeFileSync(path.join(RESP_PATH, 'details', filename), content, 'utf-8');
    }
  })
}

module.exports = function(newData){
  handlerREADME(newData)
  handlerTags()
  handlerTimeline()
  handlerDetails(newData)
}
