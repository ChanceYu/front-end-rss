const fs = require('fs')
const path = require('path')
const async = require('async')
const moment = require('moment')
const Parser = require('rss-parser')
const Git = require('simple-git')
const _ = require('underscore')

const respRoot = '../';

const RESP_PATH   = path.join(respRoot)
const RSS_PATH    = path.join(respRoot + '/data/rss.json')
const LINKS_PATH  = path.join(respRoot + '/data/links.json')
const README_PATH = path.join(respRoot + '/README.md')
const TEMPLATE_PATH = path.join(respRoot + '/template.md')

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
  console.log(getNowDate() + ' - 开始更新抓取');

  Git(RESP_PATH)
     .pull()
     .exec(handlerFeed);
}

/**
 * 提交修改到 git 仓库
 */
function handlerCommit(){
  Git(RESP_PATH)
     .add('./*')
     .commit('更新: ' + newData.titles.join('、'))
     .push(['-u', 'origin', 'master'], () => console.log('完成抓取和上传！'));
}

/**
 * 格式化标题
 */
function formatTitle(title, isRsshub){
  // https://rsshub.app
  if(isRsshub){
    let matches = title.match(/“(.*)”/)
  
    if(matches && matches[1]){
      title = matches[1]
    }
  }
  return title.replace('<![CDATA[', '').replace(']]>', '').replace(/[\[\]\(\)]/g, '').replace(/\s+/g, '-')
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
          console.log(getNowDate() + ' - 失败 RSS: ' + rss);
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

        feed.title = formatTitle(feed.title, /^https:\/\/rsshub\.app/.test(rss))

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
      handlerREADME()
    }else{
      console.log(getNowDate() + ' - 无需更新');
    }
  })
}

/**
 * 渲染 README.md 文件
 */
function handlerREADME(){
  let content = fs.readFileSync(TEMPLATE_PATH);

  let compiled = _.template(content.toString());

  content = compiled({
    currentDate: getNowDate(),
    linksJson,
    newData,
    formatTitle,
  });

  fs.writeFileSync(README_PATH, content, 'utf-8');

  console.log(getNowDate() + ' - 完成抓取，即将上传');
  
  handlerCommit()
}

/**
 * 格式化时间
 */
function getNowDate(){
  return moment().format('YYYY-MM-DD HH:mm:ss')
}

module.exports = handlerUpdate