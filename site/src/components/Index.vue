<template>
  <div class="container">
    <div class="fixed-box">
      <a class="action-github" href="https://github.com/ChanceYu/front-end-rss"></a>
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
          class="item-link"
        >
          <van-cell is-link>
            <div slot="icon" class="item-order">{{index+1}}、</div>
            <div slot="label">{{item.date}}<span class="item-from">{{item.rssTitle}}</span> </div>
            <div slot="title" class="item-title" v-html="item.sotitle || item.title"></div>
          </van-cell>
        </a>

        <van-loading v-if="results.length && !isBusy && isLoad">加载中...</van-loading>
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
      const rss = window.RSS_DATA
      const tags = window.TAGS_DATA
      const links = window.LINKS_DATA

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
            let reg = null
            try {
            // eslint-disable-next-line
              reg = new RegExp('(' + value.replace(/([?\[\]])/g, '\\$1') + ')', 'gi')
            } catch (e) {}

            const matchSplit = (val) => {
              const exist = item.title.split(val)

              if (exist.length > 1) {
                arr.push({
                  ...item,
                  sotitle: exist.join(`<span class="red">${val}</span>`)
                })
                return true
              }
            }

            if (reg && reg.test(item.title)) {
              arr.push({
                ...item,
                sotitle: item.title.replace(reg, `<span class="red">$1</span>`)
              })
            } else if (matchSplit(value)) {
            } else if (matchSplit(value.toLowerCase())) {
            } else if (matchSplit(value.toUpperCase())) {
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

<style>
.container {
    width: 50%;
    margin: 0 auto
}

.fixed-box {
    position: fixed;
    bottom: 6.25rem;
    right: 25%;
    z-index: 9
}

.fixed-box .action-github,.fixed-box .action-top {
    width: 2.5rem;
    height: 2.5rem;
    line-height: 2.5rem;
    display: block;
    cursor: pointer;
    margin-top: .75rem;
    border-radius: .125rem;
    overflow: hidden;
    position: relative;
    left: 3.125rem;
    background-color: #f8f8f8
}

.fixed-box .action-github:hover,.fixed-box .action-top:hover {
    background-color: #f5f5f5
}

.fixed-box .action-github {
    background-repeat: no-repeat;
    background-position: 50%;
    background-image: url("data:image/png;base64,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");
    background-size: 60% auto
}

.fixed-box .action-top {
    color: #171717
}

.fixed-box .action-top .van-icon {
    font-weight: 700;
    vertical-align: middle
}

.search-modal {
    width: 24%;
    height: 100%
}

.search-modal .title-box .van-icon {
    font-size: 1.125rem;
    vertical-align: middle;
    margin-right: .375rem;
    position: relative;
    top: -.125rem
}

.search-modal .tag-group {
    padding: .375rem 0
}

.search-modal .van-tag {
    background: #bbb;
    margin: .25rem;
    cursor: pointer;
    padding: .25rem .5rem;
    font-size: .8125rem
}

.search-modal .van-tag:hover {
    background: #666
}

.search-modal .van-cell-group__title {
    font-size: .9375rem;
    color: #007fff;
    background: #f5f5f5
}

.search-modal .van-cell {
    font-size: .8125rem;
    color: #262626;
    text-align: left;
    cursor: pointer
}

.search-modal .van-cell:active,.search-modal .van-cell:hover {
    background: #f7f8fa
}

.search-modal .van-cell:not(:last-child):after {
    border-bottom-color: #f7f8fa
}

.search-modal .van-cell__label {
    font-size: .75rem;
    color: #999;
    word-break: break-all
}

.result-box {
    padding: 4.375rem 0 .375rem;
    background: #fff;
    min-height: 100vh;
    box-sizing: border-box;
    position: relative
}

.result-box .van-loading {
    margin-top: 1.25rem
}

.result-box .van-skeleton {
    padding: .375rem 2.75rem .375rem 1.25rem;
    margin-bottom: .125rem
}

.result-box .van-skeleton .van-skeleton__avatar {
    margin-top: .375rem;
    margin-right: .625rem;
    border-radius: 0
}

.result-box .van-skeleton .van-skeleton__row {
    width: 40%!important
}

.result-box .empty {
    text-align: center;
    position: absolute;
    left: 0;
    right: 0;
    top: 30%
}

.result-box .empty .van-icon {
    color: #007fff;
    font-size: 3.125rem
}

.result-box .empty .title {
    display: block;
    margin-top: .625rem;
    line-height: 1.875rem;
    color: #999;
    font-size: .875rem;
    font-weight: 400
}

.result-box .empty .cate {
    cursor: pointer;
    color: #666;
    text-decoration: underline
}

.result-box .item-order {
    color: #999
}

.result-box .item-title {
    margin-bottom: .375rem
}

.result-box .item-from {
    display: inline-block;
    margin-left: .75rem
}

.result-box .red {
    color: #f44336
}

.result-box .van-cell {
    font-size: 1.125rem;
    color: #262626;
    text-align: left;
    border-bottom: 1px dashed #f4f5f5;
    cursor: pointer
}

.result-box .van-cell:active,.result-box .van-cell:hover {
    background: #f7f8fa;
    border-bottom: 1px solid #f7f8fa
}

.result-box .item-link:last-of-type .van-cell {
    border-bottom: none
}

.result-box .van-cell:not(:last-child):after {
    border-bottom-color: #f7f8fa
}

.result-box .van-cell__label {
    font-size: .875rem;
    color: #999;
    word-break: break-all
}

.result-box .van-divider {
    margin: 1.25rem
}

.search-box {
    position: fixed;
    width: 50%;
    z-index: 9;
    margin: 0 auto;
    padding: .625rem;
    box-shadow: 0 .125rem .625rem 0 #f0f0f0
}

.search-box .van-cell {
    padding: .625rem 0
}

.search-box .van-cell .van-icon {
    font-size: 1.25rem
}

.search-box .van-cell .van-icon-clear {
    cursor: pointer;
    margin-right: .375rem
}

.search-box input {
    font-size: 1rem;
    color: #999
}

.search-box .van-search__action:active {
    background: none
}

.search-box .van-search__content {
    padding: 0
}

.search-box .van-field__left-icon {
    color: #007fff;
    margin-left: .5rem
}

.search-box .van-search__label {
    color: #007fff;
    background: #fff;
    display: -webkit-box;
    display: -webkit-flex;
    display: flex;
    -webkit-box-align: center;
    -webkit-align-items: center;
    align-items: center
}

.search-box .van-search__label:active,.search-box .van-search__label:hover {
    color: #004dcd
}

.search-box .action-cate {
    cursor: pointer;
    padding: 0 .375rem
}

.search-box .action-cate .van-icon {
    vertical-align: middle;
    margin-right: .125rem;
    font-size: 1.25rem;
    position: relative;
    top: -.0625rem
}

.search-box .action-cate .lbl {
    vertical-align: middle
}

.search-box .action-btn {
    color: #007fff;
    cursor: pointer
}

@media screen and (max-width: 1200px) {
    .container,.search-box {
        width:70%
    }

    .fixed-box {
        right: 15%
    }
}

@media screen and (max-width: 800px) {
    .container {
        width:100%;
        margin: 0 auto
    }

    .fixed-box {
        bottom: 3.125rem;
        right: .625rem
    }

    .fixed-box .action-github,.fixed-box .action-top {
        left: 0;
        background-color: #f5f5f5
    }

    .fixed-box .action-top:hover {
        color: inherit;
        background: #f5f5f5
    }

    .search-modal {
        width: 70%
    }

    .search-box {
        width: 100%;
        padding: .625rem
    }

    .search-box .van-cell {
        padding: .625rem 0
    }

    .search-box input {
        font-size: .875rem
    }

    .result-box .van-skeleton {
        padding-right: 3.375rem
    }

    .result-box .van-skeleton .van-skeleton__row {
        width: 60%!important
    }

    .result-box .van-cell {
        font-size: 1rem
    }

    .result-box .van-cell__label {
        font-size: .75rem
    }
}
</style>
