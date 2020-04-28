const RSS_DATA = require('../../data/rss.json')
const TAGS_DATA = require('../../data/tags.json')
const LINKS_DATA = require('../../data/links.json')

module.exports = {
  RSS_DATA: JSON.stringify(RSS_DATA),
  TAGS_DATA: JSON.stringify(TAGS_DATA),
  LINKS_DATA: JSON.stringify(LINKS_DATA)
}
