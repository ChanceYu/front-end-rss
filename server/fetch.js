const Parser = require('rss-parser')
const moment = require('moment')

const utils = require('./utils')

const Fetch = async function(newData, linksJson, jsonItem, rssItem, cb){
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
      let rss = rssArray[index];
      let callDone = function(){
        if(typeof onResolve === 'function'){
          onResolve();
        }else{
          resolve();
        }
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
          finished = true
          fetchOne(index+1);
        }
      }, 20000);
    
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
    
        linksJson[index] = jsonItem
        
        if(done){
          callDone();
        }else{
          fetchOne(index+1, resolve);
        }
      })
    })
  }
}


// 加快速度，使用本地的 RSSHub
let useLocalRSSHub = process.argv.indexOf('LOCAL_RSSHub') > -1 || process.argv.indexOf('--LOCAL_RSSHub') > -1
function replaceRss(rss){
  // if(!useLocalRSSHub) return rss

  if(/rsshub\.app/.test(rss)){
    console.log('https://rsshub.app ==> http://127.0.0.1:1200')
  }
  
  return rss.replace('https://rsshub.app', 'http://127.0.0.1:1200')
}

module.exports = Fetch;