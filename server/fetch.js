const queryString = require('query-string')
const Parser = require('rss-parser')
const moment = require('moment')

const utils = require('./utils')

const Fetch = async function(newData, linksJson, linksJsonIndex, jsonItem, rssItem, cb){
  let rssArray = rssItem.rss
  let done = false;

  if(typeof rssArray === 'string'){
    rssArray = [ rssArray ]
  }

  while(!done){
    await fetchOne(0);
  }

  function fetchOne(index, onResolve){
    return new Promise((resolve) => {
      onResolve = onResolve || resolve;
      
      let rss = rssArray[index];
      let callDone = function(){
        onResolve();
        done = true;
        cb(null, jsonItem);
      }

      if(!rss) return callDone();
      
      let parser = new Parser({
        headers: {
          'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1'
        },
      });
    
      // 超时处理
      let finished = false;
      let timer = setTimeout(() => {
        if(!finished){
          console.log(utils.getNowDate() + ' - 超时 RSS: ' + rss);
          finished = true
          fetchOne(index+1, onResolve);
        }
      }, 20000);
    
      console.log(utils.getNowDate() + ' - 开始 RSS: ' + rss);
      parser.parseURL(replaceRss(rss), function(err, feed) {
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

          // for taobaofed
          if(/https?:\/\/taobaofed\.org/.test(el.link)) {
            el.link = el.link.replace(/https?:\/\/taobaofed\.org/, 'https://fed.taobao.org');
          }

          // for www.ershicimi.com
          if(/ershicimi\.com/.test(feed.link) && /^\/p\//.test(el.link)) {
            el.link = 'https://www.ershicimi.com' + el.link;
          }
    
          for(let i = 0; i < len; i++){
            if(isSameLink(_items[i].link, el.link)){
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

            done = true;
          }
        });
    
        feed.title = rssItem.title
    
        if(items.length){
          newData.titles.push(feed.title)
        }
    
        newData.length += items.length
    
        jsonItem.rss = rss
        jsonItem.title = feed.title
        jsonItem.link = feed.link
        jsonItem.items = items.concat(_items)
    
        linksJson[linksJsonIndex] = jsonItem
        
        if(done){
          console.log(utils.getNowDate() + ' - 完成 RSS: ' + rss);
          callDone();
        }else{
          fetchOne(index+1, onResolve);
        }
      })
    })
  }
}

function isSameLink(link, compare){
  link = link.replace(/&amp;/g, '&');
  compare = compare.replace(/&amp;/g, '&');

  const oLink = queryString.parseUrl(link);
  const oCompare = queryString.parseUrl(compare);
  const reWx = /mp\.weixin/;

  if(reWx.test(oLink.url) && reWx.test(oCompare.url)){
    return (oLink.query.sn === oCompare.query.sn)
        && (oLink.query.mid === oCompare.query.mid)
  }else{
    return link === compare
  }
}


// 加快速度，使用本地的 RSSHub
let useLocalRSSHub = process.argv.indexOf('LOCAL_RSSHub') > -1 || process.argv.indexOf('--LOCAL_RSSHub') > -1
function replaceRss(rss){
  if(!useLocalRSSHub) return rss

  if(/rsshub\.app/.test(rss)){
    console.log('https://rsshub.app ==> http://127.0.0.1:1200')
  }
  
  return rss.replace('https://rsshub.app', 'http://127.0.0.1:1200')
}

module.exports = Fetch;