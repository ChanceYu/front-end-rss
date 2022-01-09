const fs = require('fs-extra')
const async = require('async')
const moment = require('moment')
const Git = require('simple-git')

const utils = require('./utils')
const writemd = require('./writemd')
const fetch = require('./fetch')

const {
  RESP_PATH,
  RSS_PATH,
  LINKS_PATH,
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
  utils.log('开始更新抓取')
  
  Git(RESP_PATH)
     .pull()
     .exec(handlerFeed)
}

/**
 * 提交修改到 git 仓库
 */
function handlerCommit(){
  utils.log('完成抓取，即将上传')

  Git(RESP_PATH)
     .add('./*')
     .commit('更新: ' + newData.titles.join('、'))
     .push(['-u', 'origin', 'master'], () => utils.logSuccess('完成抓取和上传！'))
}

/**
 * 处理订阅源
 */
function handlerFeed(){
  rssJson = fs.readJsonSync(RSS_PATH)
  linksJson = fs.readJsonSync(LINKS_PATH)

  newData = {
    length: 0,
    titles: [],
    rss: {},
    links: {}
  }

  const tasks = rssJson.map((rssItem, rssIndex) => ((callback) => {
    fetch(rssItem, (feed) => {
      if (feed) {
        const items = linksJson[rssIndex].items || []
        const newItems = feed.items.reduce((prev, curr) => {
          const exist = items.find((el) => utils.isSameLink(el.link, curr.link))
          if (exist) {
            return prev
          } else {
            let date = moment().format('YYYY-MM-DD')
    
            try{
              date = moment(curr.isoDate).format('YYYY-MM-DD')
            }catch(e){
            }

            newData.rss[rssItem.title] = true
            newData.links[curr.link] = true

            return [...prev, {
              title: curr.title,
              link: curr.link,
              date
            }]
          }
        }, [])
    
        if(newItems.length){
          utils.logSuccess('更新 RSS: ' + rssItem.title)
          newData.titles.push(rssItem.title)
          newData.length += newItems.length
          rssItem.items = newItems.concat(items).sort(function (a, b){
            return a.date < b.date ? 1 : -1
          })
          linksJson[rssIndex] = {
            title: rssItem.title,
            items: rssItem.items
          }
        }
      }
      callback(null)
    })
  }))

  async.series(tasks, () => {
    if(newData.length){
      fs.outputJsonSync(LINKS_PATH, linksJson, { spaces: 2 })
      writemd(newData, linksJson)
      handlerCommit()
    }else{
      utils.logSuccess('无需更新')
    }
  })
}

module.exports = handlerUpdate
