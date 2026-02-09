/**
 * 对 data/links.json 去重，满足其一即去重（保留旧的、去除新的）：
 * 1. 标题相同且时间相邻（七天内）
 * 2. 标题相同且标题字符长度 > 30
 * 用法：node server/dedupe-links.js
 */
const fs = require('fs-extra')
const moment = require('moment')

const utils = require('./utils')
const { LINKS_PATH } = utils.PATH

function run() {
  const links = fs.readJsonSync(LINKS_PATH)

  const flat = []
  links.forEach((rss, rssIndex) => {
    (rss.items || []).forEach((item, itemIndex) => {
      flat.push({
        rssIndex,
        itemIndex,
        title: item.title,
        link: item.link,
        date: item.date || ''
      })
    })
  })

  const byTitle = Object.create(null)
  flat.forEach((entry) => {
    const t = entry.title
    if (!byTitle[t]) byTitle[t] = []
    byTitle[t].push(entry)
  })

  const toRemove = new Set()
  const key = (rssIndex, itemIndex) => `${rssIndex}:${itemIndex}`

  Object.keys(byTitle).forEach((title) => {
    const list = byTitle[title]
    if (list.length <= 1) return
    list.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))
    let lastKept = list[0]
    for (let i = 1; i < list.length; i++) {
      const cur = list[i]
      const daysDiff = moment(cur.date).diff(moment(lastKept.date), 'days', true)
      const withinSevenDays = daysDiff <= 7
      const longTitle = title.length > 30
      if (withinSevenDays || longTitle) {
        toRemove.add(key(cur.rssIndex, cur.itemIndex))
      } else {
        lastKept = cur
      }
    }
  })

  const removedLog = []
  const result = links.map((rss, rssIndex) => ({
    title: rss.title,
    items: (rss.items || []).filter((item, itemIndex) => {
      const remove = toRemove.has(key(rssIndex, itemIndex))
      if (remove) {
        removedLog.push({
          rssTitle: rss.title,
          title: item.title,
          date: item.date || '',
          link: item.link
        })
      }
      return !remove
    })
  }))

  if (removedLog.length) {
    utils.log('删除的数据：')
    removedLog.forEach((entry, i) => {
      utils.log(`  ${i + 1}. [${entry.rssTitle}] ${entry.date} ${entry.title}`)
      utils.log(`     ${entry.link}`)
    })
  }

  fs.outputJsonSync(LINKS_PATH, result)
  utils.logSuccess(`去重完成：移除 ${removedLog.length} 条，保留 ${flat.length - removedLog.length} 条`)
}

run()
