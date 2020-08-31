const fs = require('fs-extra')
const path = require('path')
const zlib = require('zlib')
const dayjs = require('dayjs')

const data = require('./data')

const { RSS_DATA, TAGS_DATA, LINKS_DATA } = data

const filePath = path.join(__dirname, '../dist/data.json')

function createFiles(){
  fs.outputJsonSync(filePath, {
    updateTime: dayjs().format('YYYY-MM-DD HH:mm'),
    rss: RSS_DATA,
    tags: TAGS_DATA,
    links: LINKS_DATA,
  });

  compress('gz')
  compress('br')
}

function compress(ext){
  const dest = ext === 'gz' ? zlib.createGzip() : zlib.createBrotliCompress();
  const rs = fs.createReadStream(filePath)
  const ws = fs.createWriteStream(`${filePath}.${ext}`)

  rs.pipe(dest).pipe(ws)
}

module.exports = createFiles
