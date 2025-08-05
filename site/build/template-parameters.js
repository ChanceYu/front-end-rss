const data = require('./data')
const fs = require('fs-extra')
const path = require('path')

const links = data.LINKS_DATA.reduce((prev, curr) => {
  return [
    ...prev,
    ...curr.items.map((post) => ({
      rssTitle: curr.title,
      ...post
    }))
  ]
}, []).sort((a, b) => {
  return a.date < b.date ? 1 : -1
})

const initSize = 50

const LIST_DATA = links.slice(0, initSize)

const LIST_FILES = []

const len = links.length - initSize
const pageSize = 1000
const pageCount = Math.ceil(len / pageSize)

for (let i = 0; i < pageCount; i++) {
  const start = i * pageSize + initSize
  const end = start + pageSize
  const name = `/list/page-${i}.json`
  fs.outputJsonSync(path.join(__dirname, `../dist${name}`), links.slice(start, end));
  LIST_FILES.push(name)
}

module.exports = {
  RSS_DATA: JSON.stringify(data.RSS_DATA),
  TAGS_DATA: JSON.stringify(data.TAGS_DATA),
  LIST_DATA: JSON.stringify(LIST_DATA),
  LIST_FILES: JSON.stringify(LIST_FILES)
}
