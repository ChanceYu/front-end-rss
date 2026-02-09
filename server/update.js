const fs = require('fs-extra')
const Async = require('async')
const moment = require('moment')
const simpleGit = require('simple-git')

const utils = require('./utils')
const writemd = require('./writemd')
const createFeed = require('./feed')
const fetch = require('./fetch')

const {
  RESP_PATH,
  RSS_PATH,
  LINKS_PATH,
} = utils.PATH

const git = simpleGit(RESP_PATH)

let rssJson = null
let linksJson = null
let newData = null

/**
 * 更新 git 仓库
 */
async function handleUpdate() {
  if (!utils.WORKFLOW) {
    utils.log('开始更新抓取')
    await git.pull()
  }
  handleFeed()
}

/**
 * 提交修改到 git 仓库
 */
function handleCommit() {
  git.add('./*')
    .commit('更新: ' + newData.titles.join('、'))
    .push(['-u', 'origin', 'master'], () => utils.logSuccess('完成抓取和上传！'))
}

/** 文章日期是否在最近 7 天内（仅传 dateStr 时） */
function isDateInLast7Days(dateStr) {
  if (!dateStr) return false
  const d = moment(dateStr, 'YYYY-MM-DD', true)
  if (!d.isValid()) return false
  const daysAgo = moment().subtract(7, 'days').startOf('day')
  return !d.isBefore(daysAgo)
}

/** 一次遍历判断 curr 是否应视为重复：同标题且（已有条目标题在七天内 或 当前标题长度>30） */
function isDuplicateOfExisting(curr, allExistingItems) {
  return allExistingItems.some((el) =>
    el.title === curr.title &&
    (isDateInLast7Days(el.date) || curr.title.length > 30)
  )
}

/**
 * 处理订阅源
 */
function handleFeed() {
  rssJson = fs.readJsonSync(RSS_PATH)
  const linksExist = fs.readJsonSync(LINKS_PATH)
  linksJson = []
  newData = {
    length: 0,
    titles: [],
    rss: {},
    links: {}
  }

  const allExistingItems = (linksExist || []).flatMap((el) => el.items || [])

  const tasks = rssJson.map((rssItem, rssIndex) => ((callback) => {
    ((async () => {
      const feed = await fetch(rssItem)
      const items = linksExist.find((el) => el.title === rssItem.title)?.items || []
      const newItems = (feed?.items || []).reduce((prev, curr) => {
        const exist = items.find((el) => utils.isSameLink(el.link, curr.link))
        if (exist) {
          return prev
        }
        if (isDuplicateOfExisting(curr, allExistingItems)) {
          return prev
        }
        let date = utils.getNowDate('YYYY-MM-DD')
        try {
          date = utils.formatDate(curr.isoDate, 'YYYY-MM-DD')
        } catch (e) {}

        newData.rss[rssItem.title] = true
        newData.links[curr.link] = true

        return [...prev, {
          title: curr.title,
          link: curr.link,
          date
        }]
      }, [])

      let allItems = items
      if (newItems.length) {
        utils.logSuccess('更新 RSS: ' + rssItem.title)
        newData.titles.push(rssItem.title)
        newData.length += newItems.length
        allItems = newItems.concat(items).sort(function (a, b) {
          return a.date < b.date ? 1 : -1
        })
      }
      linksJson[rssIndex] = {
        title: rssItem.title,
        items: allItems
      }
      callback(null)
    })())
  }))

  Async.parallelLimit(tasks, 5, async () => {
    await writemd(newData, linksJson)
    if (newData.length) {
      fs.outputJsonSync(LINKS_PATH, linksJson)
      await writemd(newData, linksJson)
      await createFeed(linksJson)
      utils.log('完成抓取，即将上传')
      if (!utils.WORKFLOW) {
        handleCommit()
      }
    } else {
      utils.logSuccess('无需更新')
    }
    rssJson = null
    linksJson = null
    newData = null
    if (utils.WORKFLOW) {
      process.exit(0)
    }
  })
}

module.exports = handleUpdate
