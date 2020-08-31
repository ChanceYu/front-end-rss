const data = require('./data')

const { RSS_DATA, TAGS_DATA, LINKS_DATA } = data

module.exports = {
  RSS_DATA: JSON.stringify(RSS_DATA),
  TAGS_DATA: JSON.stringify(TAGS_DATA),
  LINKS_DATA: JSON.stringify(LINKS_DATA)
}
