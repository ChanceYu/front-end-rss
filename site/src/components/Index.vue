<template>
  <div class="container">
    <div class="fixed-box">
      <a class="action-github" href="https://github.com/ChanceYu/front-end-rss"><img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGYAAABmCAMAAAAOARRQAAAA4VBMVEUbFRUaFxcwMDAaFRX///8iHh79/f0dGBhUUFDT0tK4t7cwKyuysbHNy8syLS34+PhoZWUrJiYfGhrw8PDu7e3Z2Nivrq6npaVxbm5jYGDe3d3DwsKamJh7eHhtampXU1NCPj76+vr39vbg39/b29vR0NDBv7+Cf39aVlZNSUklICDy8vLq6enk5OTi4eHa2dnHxsa1s7NfW1s0Ly/o6OjV1NS8u7utq6ukoqKem5uSj491cnJdWVlXVFRRTU1IREQ+OTk4NDQuKionIiL09PS2tLSVkpKPjY2Kh4eHhISpp6evBPJsAAAAA3RSTlPmhwVTsZLPAAADoklEQVRo3u3aaVMaMRzHcWx+e7EHN+U+CoigghTv+6hV+/5fUOsITeIsm38WatuZ/T5TGT4SkrAEUp+2UuwPl9r6lNpiH9BWKsU+IJqyfgmTMCyshEmYv8t0WuczZ1LMZIoT5/G80mFs48y4Ut7Du4pe5WGjzE75C0LLeJcbY7IOIiq1rE0w7SkU1S7XZlwPhNLz9ZhqAaS+Zddg8g2QOzXiMuM6NPJz8RjXgVb9eRzGrUGz/bk+M3agXT+ny+TriJFvaDINxOqzHlPl/+Cw4ZuIyBw0hgdY1tJhXL4qv77++HKIFe09B4wxm6/TOw3G41vw22gbQw5nMli2+/L2Z2sXy47pTBu/G7BF9ydmzxtedQLjFxp02sNyzZwFbBEfNVTJzFTYFPlv5Vkk/+IEv5tYRCYLXpmROgWvQmQcaYaSOgOvZpGYHQjVaUwaQlUSU4bQIY3pQ+iYwozlq4tbihJArHtPYCoQ244xaGgSGHnMcjTmoSeNGoGRrvouGLEshHYtJdOBUM9i1I4gNFIyLQg9M3JN6clRMucQuqEztxA6UzIz8ApMo8PV8zMVvdOUdBgfvJ6SmSh2GtLSKSqZInhpHeYEvK6SychDTO8RQnkVI+5ovg6zDSFLxeyDt6/DTKUpqmIG4Jl5MiIPQ03FyI/dpis3EPKVzAmEvtOZZwillUwDQg6dOYDQqZLJQuyOqrhd6fVDybgQ86jMZ/mVXcmwGsRGNKVjShfWTM2cQmxgUBTjQB4DAtOC1DZh7VhpaF9y5L5AKj1WPpYypMyAwLDPkNu/ilbsHuRmTMnw9Vw49peT9NGOQDwT77JJDPOXF/b3Z1hUerLzIaPVPi+FHElpvfEovL4drPKXn8yRJ83uUXraRVgXRMYq8R0tC55vSbeqI7SeQWTY9WK4X+QJcROxJHmXjMbw+zZtxoz+yn10gJA8RmdyRf5sBst7a7B3PYUou64Gw1rCqYDRPDJhlr7Pw28k14x1mHKwmLm5sC1nh3yYory6izpcvMb76pYuYzhvhyPXGkz/Icax3dul1Jfh6n0Gcnt3cQ4hA2dxNfQ0mueN251AwUzvYh6ppiH2NZqpP8Q9ILbOIpm2NMesNY67K8WIw4srYVU21zu8z/3gzOp147lrfxRhLze17Cpmov4oglC+4kQN2tGFwZQMrVG5i4IbssGaM5tt8kMvt30f8sS1X9fSf/pJYcIkTMIkTMJsivlXvqCW+qAv9X3QVxR/AveXsgHzlAQ9AAAAAElFTkSuQmCC" /></a>
      <div class="action-top" @click="toTop"><van-icon name="arrow-up" /></div>
    </div>

    <van-popup v-model="showCate" position="left" class="search-modal">
      <van-cell-group class="tag-group">
        <div slot="title" class="title-box"><van-icon name="hot-o" />热门搜索</div>
        <van-tag
          v-for="(item, index) in hotwords"
          :key="index"
          @click="handlerCate(item)"
        >
        {{item}}
        </van-tag>
      </van-cell-group>
      <van-cell-group>
        <div slot="title" class="title-box"><van-icon name="underway-o" />发布时间</div>
        <van-cell
          v-for="(item, index) in ranges"
          :key="index"
          :title="item.title"
          is-link
          @click="handlerCate(item)"
        />
      </van-cell-group>
      <van-cell-group title="文章来源">
        <div slot="title" class="title-box"><van-icon name="records" />文章来源</div>
        <van-cell
          v-for="(item, index) in rss"
          :key="index"
          :title="item.title"
          is-link
          @click="handlerCate(item)"
        />
      </van-cell-group>
      <van-cell-group title="文章分类">
        <div slot="title" class="title-box"><van-icon name="bar-chart-o" />文章分类</div>
        <van-cell
          v-for="(item, index) in tags"
          :key="index"
          :title="item.tag"
          is-link
          @click="handlerCate(item)"
        />
      </van-cell-group>
    </van-popup>

    <van-search
      v-model="searchValue"
      placeholder="搜索前端技术文章"
      show-action
      @search="onSearch"
      @clear="onClear"
      class="search-box"
    >
      <div slot="label" class="action-cate" @click="showCate = true"><van-icon name="bars" /><span class="lbl">筛选</span></div>
      <div slot="action" class="action-btn" @click="onSearch">搜索</div>
    </van-search>

     <div
      class="result-box"
      v-infinite-scroll="loadMore"
      infinite-scroll-disabled="isBusy"
      infinite-scroll-distance="100"
    >

      <template v-if="!isLoad">
        <van-skeleton  v-for="(item, index) in skeletons" :key="index"  avatar avatar-size="20" title title-width="100%" :row="1" />
      </template>

       <div class="empty" v-if="isLoad && !results.length">
         <van-icon name="info-o" />
         <div class="title">没有搜索到文章，换个关键词试试<br />或者<span class="cate" @click="showCate = true">手动筛选</span></div>
       </div>

        <a
          v-for="(item, index) in results"
          :key="index"
          :href="item.link"
          target="_blank"
        >
          <van-cell is-link>
            <div slot="icon" class="item-order">{{index+1}}、</div>
            <div slot="label">{{item.date}}<span class="item-from">{{item.rssTitle}}</span> </div>
            <div slot="title" class="item-title" v-html="item.sotitle || item.title"></div>
          </van-cell>
        </a>

        <van-divider v-if="results.length && isBusy">没有更多了~</van-divider>

     </div>

  </div>
</template>

<script>
import dayjs from 'dayjs'

const getPlatform = () => /Android|iPhone/i.test(navigator.userAgent)
const isMobile = getPlatform()

window.addEventListener('resize', () => {
  if (isMobile !== getPlatform()) {
    location.reload()
  }
})

const sortArray = (arr) => {
  return arr.sort((a, b) => {
    return a.date < b.date ? 1 : -1
  })
}

const hotwords = ['React', 'Vue', 'JavaScript', 'Webpack', 'TypeScript', 'Node', 'CSS', 'Canvas', 'Flutter', 'ES6', '小程序', '浏览器']

const TODAY = dayjs().format('YYYY-MM-DD')
const ranges = [{
  title: '今天',
  dates: TODAY
}, {
  title: '最近两天',
  dates: [dayjs().subtract(2, 'days').format('YYYY-MM-DD'), TODAY]
}, {
  title: '最近一周',
  dates: [dayjs().subtract(7, 'days').format('YYYY-MM-DD'), TODAY]
}, {
  title: '最近一月',
  dates: [dayjs().subtract(31, 'days').format('YYYY-MM-DD'), TODAY]
}]

let results = []
let datesMap = {}
let rssMap = {}
let tagsMap = {}

export default {
  name: 'Index',
  data () {
    return {
      searchValue: '',
      showCate: false,
      hotwords,
      ranges,
      rss: [],
      tags: [],
      pageNo: 1,
      pageSize: 20,
      isBusy: true,
      allList: [],
      results: [],
      isLoad: false,
      skeletons: [1, 2, 3, 4, 5, 6, 7, 8]
    }
  },
  methods: {
    toTop () {
      window.scrollTo(0, 0)
    },
    async initLoadData () {
      const links = await import('../../../data/links.json')
      const rss = await import('../../../data/rss.json')
      const tags = await import('../../../data/tags.json')

      links.forEach((rssItem) => {
        const articles = rssItem.items.map((item) => {
          item.rss = rssItem.rss
          item.rssTitle = rssItem.title
          item.rssLink = rssItem.link

          let isInTag = false

          tags.forEach((tagItem) => {
            if (tagItem.keywords && (new RegExp(tagItem.keywords, 'gi')).test(item.title)) {
              isInTag = true
              tagsMap[tagItem.tag] = tagsMap[tagItem.tag] || []
              tagsMap[tagItem.tag].push(item)
              tagsMap[tagItem.tag] = sortArray(tagsMap[tagItem.tag])
            }
          })

          if (!isInTag) {
            tagsMap['其它'] = tagsMap['其它'] || []
            tagsMap['其它'].push(item)
            tagsMap['其它'] = sortArray(tagsMap['其它'])
          }

          ranges.forEach((rangeItem) => {
            const dates = rangeItem.dates

            if ((typeof dates === 'string' && item.date === dates) || (typeof dates !== 'string' && item.date >= dates[0] && item.date <= dates[1])) {
              datesMap[rangeItem.title] = datesMap[rangeItem.title] || []
              datesMap[rangeItem.title].push(item)
              datesMap[rangeItem.title] = sortArray(datesMap[rangeItem.title])
            }
          })

          return item
        })

        rssMap[rssItem.title] = sortArray(articles)

        results = results.concat(articles)
      })

      results = sortArray(results)

      this.rss = rss
      this.tags = tags
      this.isLoad = true
    },
    loadMore () {
      const allLen = this.allList.length
      const resultsLen = this.results.length

      this.isBusy = allLen < this.pageSize || (resultsLen && this.results[resultsLen - 1].link === this.allList[allLen - 1].link)
      this.results = this.allList.slice(0, this.pageNo * this.pageSize)
      this.pageNo += 1
    },
    handlerCate (item) {
      let label = ''
      if (item.dates) {
        label = '[时间] ' + item.title
      } else if (item.tag) {
        label = '[分类] ' + item.tag
      } else if (item.rss) {
        label = '[来源] ' + item.title
      }

      if (typeof item === 'string') {
        this.searchValue = item
      } else {
        this.searchValue = label
      }

      this.handlerSearch()
      this.showCate = false
    },
    handlerSearch () {
      const value = this.searchValue
      const matches = value.match(/^\[(时间|来源|分类)\]\s(.+)/)
      const matchValue = matches && matches[2]

      if (value) {
        let arr = []

        if (matches && datesMap[matchValue]) {
          arr = datesMap[matchValue]
        } else if (matches && rssMap[matchValue]) {
          arr = rssMap[matchValue]
        } else if (matches && tagsMap[matchValue]) {
          arr = tagsMap[matchValue]
        } else {
          results.forEach((item) => {
            // eslint-disable-next-line
            const reg = new RegExp('(' + value.replace(/([?\[\]])/g, '\\$1') + ')', 'gi')
            if (reg.test(item.title)) {
              arr.push({
                ...item,
                sotitle: item.title.replace(reg, `<span class="red">$1</span>`)
              })
            }
          })
        }

        this.allList = [...arr]
      } else {
        this.allList = [...results]
      }

      if ((this.$route.query.q || '') !== value) {
        this.$router.replace({
          path: '/',
          query: value ? {
            q: value
          } : {}
        })
      }

      window.scrollTo(0, 0)

      this.pageNo = 1
      this.results = []
      this.loadMore()
    },
    onSearch () {
      this.handlerSearch()
    },
    onClear () {
      this.handlerSearch()
    }
  },
  mounted () {
    const { q } = this.$route.query

    this.searchValue = q || ''
    this.initLoadData().then(() => this.handlerSearch())
  }
}
</script>

<style lang="scss">
.container{
  width: 50%;
  margin: 0 auto;
}
.fixed-box{
  position: fixed;
  bottom: 100px;
  right: 25%;
  z-index: 9;
  .action-github,
  .action-top{
    width: 40px;
    height: 40px;
    line-height: 40px;
    display: block;
    cursor: pointer;
    margin-top: 12px;
    border-radius: 2px;
    overflow: hidden;
    position: relative;
    left: 50px;
  }
  .action-github{
    img{
      width: 100%;
      height: auto;
    }
  }
  .action-top{
    background: #eee;
    &:hover{
      color: #fff;
      background: #1a1515;
    }
    .van-icon{
      font-weight: bold;
      vertical-align: middle;
    }
  }
}
.search-modal{
  width: 24%;
  height: 100%;
  .title-box{
    .van-icon{
      font-size: 18px;
      vertical-align: middle;
      margin-right: 6px;
      position: relative;
      top: -2px;
    }
  }
  .tag-group{
    padding: 6px 0;
  }
  .van-tag{
    background: #bbb;
    margin: 4px;
    cursor: pointer;
    padding: 4px 8px;
    font-size: 14px;
    &:hover{
      background: #666;
    }
  }
  .van-cell-group__title{
    font-size: 15px;
    color: #333;
    background: #f5f5f5;
  }
  .van-cell{
    font-size: 13px;
    color: #262626;
    text-align: left;
    cursor: pointer;
    &:hover,
    &:active{
      background: #f7f8fa;
    }
  }
  .van-cell:not(:last-child)::after{
    border-bottom-color: #f7f8fa;
  }
  .van-cell__label{
    font-size: 12px;
    color: #999;
    word-break: break-all;
  }
}
.result-box{
  padding-top: 70px;
  .van-skeleton{
    padding: 0 44px 0 20px;
    margin-bottom: 30px;
    .van-skeleton__avatar{
      margin-top: 6px;
      margin-right: 10px;
      border-radius: 0;
    }
    .van-skeleton__row{
      width: 40%!important;
    }
  }
  .empty{
    text-align: center;
    padding: 50px 0;
    .van-icon{
      color: #666;
      font-size: 40px;
    }
    .title{
      display: block;
      margin-top: 10px;
      line-height: 30px;
      color: #666;
      font-size: 14px;
      font-weight: normal;
    }
    .cate{
      cursor: pointer;
      color: #333;
      text-decoration: underline;
    }
  }
  .item-order{
    color: #999;
  }
  .item-title{
    margin-bottom: 6px;
  }
  .item-from{
    display: inline-block;
    margin-left: 12px;
  }
  .red{
    color: #f44336;
  }
  .van-cell{
    font-size: 18px;
    color: #262626;
    text-align: left;
    cursor: pointer;
    &:hover,
    &:active{
      background: #f7f8fa;
    }
  }
  .van-cell:not(:last-child)::after{
    border-bottom-color: #f7f8fa;
  }
  .van-cell__label{
    font-size: 14px;
    color: #999;
    word-break: break-all;
  }
  .van-divider{
    margin: 20px;
  }
}
.search-box{
  position: fixed;
  width: 50%;
  z-index: 9;
  margin: 0 auto;
  padding: 10px 0;

  .van-cell{
    padding: 10px 0;
    .van-icon{
      font-size: 20px;
    }
    .van-icon-clear{
      cursor: pointer;
      margin-right: 6px;
    }
  }
  input{
    font-size: 16px;
    color: #999;
  }
  .van-search__action{
    &:active{
      background: none;
    }
  }
  .van-search__content{
    padding: 0;
  }
  .van-field__left-icon{
    margin-left: 4px;
  }
  .van-search__label{
    background: #f5f5f5;
    display: flex;
    align-items: center;
    &:active,
    &:hover{
      background: #eee;
    }
  }
  .action-cate{
    cursor: pointer;
    padding: 0 6px;
    .van-icon{
      vertical-align: middle;
      margin-right: 2px;
      font-size: 20px;
      position: relative;
      top: -1px;
    }
    .lbl{
      vertical-align: middle;
    }
  }
  .action-btn{
    cursor: pointer;
  }
}

@media screen and (max-width: 1200px) {
  .container,
  .search-box{
    width: 70%;
  }
  .fixed-box{
    right: 15%;
  }
}

@media screen and (max-width: 800px) {
  .container{
    width: 100%;
    margin: 0 auto;
  }
  .fixed-box{
    bottom: 50px;
    right: 10px;
    .action-github,
    .action-top{
      left: 0;
    }
    .action-top{
      &:hover{
        color: inherit;
        background: #eee;
      }
    }
  }
  .search-modal{
    width: 70%;
  }
  .search-box{
    width: 100%;
    padding: 10px;
    .van-cell{
      padding: 10px 0;
    }
    input{
      font-size: 14px;
    }
  }
  .result-box{
    .van-skeleton{
      padding-right: 54px;
      .van-skeleton__row{
        width: 60%!important;
      }
    }
    .van-cell{
      font-size: 16px;
    }
    .van-cell__label{
      font-size: 12px;
    }
  }
}
</style>
