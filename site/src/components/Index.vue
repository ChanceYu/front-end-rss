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
      placeholder="请输入搜索关键词"
      show-action
      @search="onSearch"
      @clear="onClear"
      class="search-box"
      :class="{ active: !!searchCate }"
    >
      <div slot="label" class="action-cate" @click="showCate = true"><van-icon name="bars" /><span class="lbl">筛选</span></div>
      <div slot="action" class="action-btn" @click="onSearch">搜索</div>
    </van-search>

     <div class="result-box">

       <div class="empty" v-if="!results.length">
         <van-icon name="info-o" />
         <div class="title">没有搜索到文章，换个关键词试试<br />或者<span class="cate" @click="showCate = true">手动筛选</span></div>
       </div>

        <a
          v-for="(item, index) in results"
          :key="index"
          :href="item.link"
          target="_blank"
        >
          <van-cell
              :label="item.date + '          ' + item.rssTitle"
              is-link
            >
              <div slot="icon" class="order">{{index+1}}、</div>
              <div slot="title" v-html="item.sotitle || item.title"></div>
          </van-cell>
        </a>

     </div>

  </div>
</template>

<script>
import dayjs from 'dayjs'
import links from '../../../data/links.json'
import rss from '../../../data/rss.json'
import tags from '../../../data/tags.json'

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
let hotsMap = {}
let datesMap = {}
let rssMap = {}
let tagsMap = {}

links.forEach((rssItem) => {
  const articles = rssItem.items.map((item) => {
    item.rss = rssItem.rss
    item.rssTitle = rssItem.title
    item.rssLink = rssItem.link

    hotwords.forEach((worrd) => {
      if ((new RegExp(worrd, 'gi')).test(item.title)) {
        hotsMap[worrd] = hotsMap[worrd] || []
        hotsMap[worrd].push(item)
        hotsMap[worrd] = sortArray(hotsMap[worrd])
      }
    })

    tags.forEach((tagItem) => {
      if ((new RegExp(tagItem.keywords, 'gi')).test(item.title)) {
        tagsMap[tagItem.tag] = tagsMap[tagItem.tag] || []
        tagsMap[tagItem.tag].push(item)
        tagsMap[tagItem.tag] = sortArray(tagsMap[tagItem.tag])
      }
    })

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

export default {
  name: 'Index',
  data () {
    return {
      searchValue: '',
      searchCate: '',
      showCate: false,
      loading: true,
      hotwords,
      ranges,
      rss,
      tags,
      results: []
    }
  },
  methods: {
    toTop () {
      window.scrollTo(0, 0)
    },
    handlerCate (item) {
      let label = ''
      let list = []
      if (item.dates) {
        label = '[时间] ' + item.title
        list = datesMap[item.title] || []
      } else if (item.tag) {
        label = '[分类] ' + item.tag
        list = tagsMap[item.tag]
      } else if (item.rss) {
        label = '[来源] ' + item.title
        list = rssMap[item.title]
      }

      if (typeof item === 'string') {
        this.searchValue = item
        this.searchCate = ''
        this.handlerSearch()
      } else {
        if (this.$route.query.q) {
          this.$router.replace({
            path: '/'
          })
        }

        this.searchValue = label
        this.searchCate = label
        this.results = [...list]
        window.scrollTo(0, 0)
      }

      this.showCate = false
    },
    handlerSearch (init) {
      if (this.searchValue) {
        let arr = []
        results.forEach((item) => {
          const reg = new RegExp(`(${this.searchValue})`, 'gi')
          if (reg.test(item.title)) {
            arr.push({
              ...item,
              sotitle: item.title.replace(reg, `<span class="red">$1</span>`)
            })
          }
        })

        this.results = [...arr]
      } else {
        this.results = [...results]
      }

      if (this.$route.query.q !== this.searchValue) {
        this.$router.replace({
          path: '/',
          query: this.searchValue ? {
            q: this.searchValue
          } : {}
        })
      }

      window.scrollTo(0, 0)
    },
    onSearch () {
      this.handlerSearch()
    },
    onClear () {
      this.searchCate = ''
      this.handlerSearch()
    }
  },
  mounted () {
    const { q } = this.$route.query

    this.searchValue = q
    this.handlerSearch(true)
  }
}
</script>

<style lang="scss">
.container{
  width: 70%;
  margin: 0 auto;
}
.fixed-box{
  position: fixed;
  bottom: 100px;
  right: 100px;
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
      background: #f5f5f5;
    }
    .van-icon{
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
    &:hover{
      background: #666;
    }
  }
  .van-cell-group__title{
    font-size: 14px;
    font-weight: bold;
    color: #333;
    background: #f5f5f5;
  }
  .van-cell{
    font-size: 14px;
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
  .empty{
    text-align: center;
    padding: 30px 0;
    .van-icon{
      font-size: 40px;
    }
    .title{
      display: block;
      margin-top: 10px;
      line-height: 30px;
    }
    .cate{
      cursor: pointer;
      color: #f44336;
      text-decoration: underline;
    }
  }
  .order{
    color: #999;
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
}
.search-box{
  position: fixed;
  width: 70%;
  z-index: 9;
  margin: 0 auto;
  padding: 10px 0;

  &.active{
    input{
      color: #f44336;
    }
  }

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
    color: #666;
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
    &:active,
    &:hover{
      background: #eee;
    }
  }
  .action-cate{
    cursor: pointer;
    position: relative;
    top: 4px;
    padding: 0 6px;
    .van-icon{
      vertical-align: middle;
      margin-right: 2px;
      font-size: 20px;
    }
    .lbl{
      vertical-align: middle;
      position: relative;
      top: 1px;
    }
  }
  .action-btn{
    cursor: pointer;
  }
}

@media screen and (max-width: 800px) {
  .container{
    width: 100%;
    margin: 0 auto;
  }
  .fixed-box{
    bottom: 20px;
    right: 10px;
  }
  .search-modal{
    width: 70%;
  }
  .search-box{
    width: 100%;
    padding: 10px;
    .van-cell{
      padding: 6px 0;
    }
    input{
      font-size: 14px;
    }
    .action-cate{
      top: 0;
    }
  }
  .result-box{
    padding-top: 60px;
    .van-cell{
      font-size: 16px;
    }
    .van-cell__label{
      font-size: 12px;
    }
  }
}
</style>
