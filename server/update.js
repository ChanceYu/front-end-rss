const fs = require('fs')
const path = require('path')
const async = require('async')
const moment = require('moment')
const Parser = require('rss-parser')
const Git = require('simple-git')
const _ = require('underscore')
const cloneDeep = require('clone-deep')

const utils = require('./utils')
const writemd = require('./writemd')

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
} = utils.PATH

let rssJson = []
let linksJson = []

// 本次更新的 rss 和链接数据
let newData = {
  length: 0,
  titles: [],
  rss: {},
  links: {}
}

/**
 * 更新 git 仓库
 */
function handlerUpdate(){
  console.log(utils.getNowDate() + ' - 开始更新抓取');

  Git(RESP_PATH)
     .pull()
     .exec(handlerFeed);
}

/**
 * 提交修改到 git 仓库
 */
function handlerCommit(){
  console.log(utils.getNowDate() + ' - 完成抓取，即将上传');

  Git(RESP_PATH)
     .add('./*')
     .commit('更新: ' + newData.titles.join('、'))
     .push(['-u', 'origin', 'master'], () => console.log('完成抓取和上传！'));
}

/**
 * 处理订阅源
 */
function handlerFeed(){
  rssJson = require(RSS_PATH)
  linksJson = require(LINKS_PATH)

  newData = {
    length: 0,
    titles: [],
    rss: {},
    links: {}
  }

  let parallels = []

  rssJson.forEach((item, index) => {
    let rss = item
    let jsonItem = linksJson[index] || {}

    parallels.push(function(cb){
      let parser = new Parser({
        headers: {
          'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1'
        },
      });

      // 超时处理
      let finished = false;
      let timer = setTimeout(() => {
        if(!finished){
          finished = true
          cb(null, jsonItem);
        }
      }, 20000);

      parser.parseURL(rss, function(err, feed) {
        if(finished) return;
        finished = true;
        clearTimeout(timer);

        let _items = jsonItem.items || []
        let len = _items.length
        let items = []
        
        if(!feed){
          console.log(utils.getNowDate() + ' - 失败 RSS: ' + rss);
          feed = {};
          feed.title = jsonItem.title
          feed.link = jsonItem.link
          feed.items = []
        }

        feed.items.forEach(el => {
          let exist = false

          for(let i = 0; i < len; i++){
            if(_items[i].link === el.link){
              exist = true
              break;
            }
          }

          if(!exist){
            let date = moment().format('YYYY-MM-DD')

            try{
              date = moment(el.isoDate).format('YYYY-MM-DD')
            }catch(e){
            }

            let itemObject = {
              title: el.title,
              link: el.link,
              date: date
            }
            
            items.push(itemObject)

            newData.rss[rss] = true
            newData.links[el.link] = true
          }
        });

        feed.title = utils.formatTitle(feed.title, /^https:\/\/rsshub\.app/.test(rss))

        if(items.length){
          newData.titles.push(feed.title)
        }

        newData.length += items.length

        jsonItem.rss = rss
        jsonItem.title = feed.title
        jsonItem.link = feed.link
        jsonItem.items = items.concat(_items)

        linksJson[index] = jsonItem
        cb(null, jsonItem);
      })
    })
  })

  async.parallel(parallels, (err, result) => {
    if(newData.length){
      fs.writeFileSync(LINKS_PATH, JSON.stringify(result, null, 2), 'utf-8')
      writemd(newData)
      handlerCommit()
    }else{
      console.log(utils.getNowDate() + ' - 无需更新');
    }
  })
}

module.exports = handlerUpdate
