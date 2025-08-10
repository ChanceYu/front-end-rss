<template>
  <div class="container">
    <div class="fixed-box">
      <a class="action-feed" href="/atom.xml" title="Feed 订阅"></a>
      <a class="action-github" href="https://github.com/ChanceYu/front-end-rss" title="GitHub"></a>
      <div class="action-top" @click="toTop" title="返回顶部"><van-icon name="arrow-up" /></div>
    </div>

    <van-popup v-model="showCate" position="left" class="search-modal">
      <van-cell-group class="tag-group">
        <div class="filter-row">
          <div class="filter-cell">
            <van-switch v-model="matchSkill" size="14" />
            <div class="lbl" @click="changeSkill">
              只展示技术相关<span class="desc">仅根据标题内容匹配</span>
            </div>
          </div>
        </div>
      </van-cell-group>
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

const rss = window.RSS_DATA
const tags = window.TAGS_DATA
const files = window.LIST_FILES

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
      // 默认只展示技能相关文章
      matchSkill: !!localStorage.getItem('matchSkill'),
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
  watch: {
    matchSkill () {
      this.initLoadData()
      this.handlerSearch()
    }
  },
  methods: {
    toTop () {
      window.scrollTo(0, 0)
    },
    initLoadData (clear = true, list = window.LIST_DATA) {
      if (clear) {
        results = []
        datesMap = {}
        rssMap = {}
        tagsMap = {}
      }

      let rssArticle = {}

      const articles = list.reduce((prev, item) => {
        let isInTag = false
        let isFilter = !this.matchSkill

        rssArticle[item.rssTitle] = rssArticle[item.rssTitle] || []
        rssArticle[item.rssTitle].push(item)

        tags.forEach((tagItem) => {
          const isMatchSkill = this.matchSkill ? tagItem.skill : true
          if (tagItem.keywords && (new RegExp(tagItem.keywords, 'gi')).test(item.title)) {
            isInTag = true
            if (isMatchSkill) {
              isFilter = true
              tagsMap[tagItem.tag] = tagsMap[tagItem.tag] || []
              tagsMap[tagItem.tag].push(item)
              tagsMap[tagItem.tag] = sortArray(tagsMap[tagItem.tag])
            }
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

        if (isFilter) {
          return [
            ...prev,
            item
          ]
        }

        return prev
      }, [])

      Object.keys(rssArticle).forEach((rssTitle) => {
        rssMap[rssTitle] = sortArray([...(rssMap[rssTitle] || []), ...rssArticle[rssTitle]])
      })

      results = results.concat(articles)

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
    handlerSearch (reset = true) {
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

      if (reset) {
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
      }
    },
    onSearch () {
      this.handlerSearch()
    },
    onClear () {
      this.handlerSearch()
    },
    changeSkill () {
      this.matchSkill = !this.matchSkill
      if (this.matchSkill) {
        localStorage.setItem('matchSkill', 'true')
      } else {
        localStorage.removeItem('matchSkill')
      }
    },
    async preloadList () {
      if (!files.length) return
      const tasks = await Promise.all(
        files.splice(0, 2).map((name) => fetch(name, { cache: 'no-store' }).then((response) => response.json()))
      )

      const items = tasks.reduce((prev, curr) => [...prev, ...curr], [])

      window.LIST_DATA = window.LIST_DATA.concat(items)
      this.initLoadData(false, items)
      this.handlerSearch(false)

      setTimeout(() => {
        this.preloadList()
      }, 200)
    }
  },
  mounted () {
    const { q } = this.$route.query

    this.searchValue = q || ''
    this.initLoadData()
    this.handlerSearch()

    setTimeout(() => {
      this.preloadList()
    }, 1000)
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

.fixed-box .action-feed,.fixed-box .action-github,.fixed-box .action-top {
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

.fixed-box .action-feed:hover,.fixed-box .action-github:hover,.fixed-box .action-top:hover {
    background-color: #f5f5f5
}

.fixed-box .action-feed {
    background-repeat: no-repeat;
    background-position: 50%;
    background-image: url("data:image/x-icon;base64,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6/8ecev/KHfl/2qa6v9you//cqLv/3Ki7/9you//cqLv/3Ol8P9you//cqLv/3Ki7/9you//cqLv/3Ol8P9you//cqLv/3Ki7/9you//Nnjl/xtl6f8da+r/G2Xp/x1r6v8bZen/HWvq/xtl6f8bZen/JGjn/x1r6v8bZen/G2Xp/x9t8P+KtfP//v7+0QAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgbPBoG2Xp/xdn5/8da+r/G2Xp/xtl6f8da+r/HWvq/x1r6v8bZen/HWvq/x1r6v8da+r/HWvq/x1r6v81c9T/09vq//z79//29vb/9vb2//b29v/29vb/9vb2//b29v/29vb/9vb2//b29v/8+/f/q8Pk/x5q3f8ecev/HnHr/x5x6/8hdez/HnHr/x1r6v8ecev/HnHr/x5x6/8ecev/RYjo//b29v/8+/f//Pv3//z79//8+/f//Pv3//z79//8+/f//Pv3//z79//+/v7//Pv3//z79//8+/f//Pv3//z79//8+/f/5enz/yh35f8ecev/IXXs/x5x6/8ecev/HnHr/x5x6/8ecev/HnHr/x1r6v8ecev/Nnjl/+rt8//+/v7//Pv3//7+/v/8+/f//Pv3//z79//8+/f//v7+//7+/v/8+/f//Pv3//z79//8+/f//Pv3//z79//8+/f/V5Tm/xtl6f8da+r/HWvq/x1r6v8da+r/HWvq/x1r6v8bZen/HWvq/xtl6f8bZen/G2Xp/x1r6v88eur/4+37/////2gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAda+rcHWvq/x1r6v8da+r/HWvq/x1r6v8da+r/HWvq/x1r6v8ecev/HWvq/x1r6v8da+r/HWvq/x5x6/8bZen/ZpjY/+vr6//29vb/9vb2//b29v/29vb/9vb2//b29v/29vb/9vb2//z79//c4u3/RorX/x1r6v8ecev/HnHr/x5x6/8hdez/HnHr/yF17P8ecev/HnHr/yh35f8Vaer/aprq//z79//29vb/9vb2//z79//29vb/9vb2//j39v/49/b/9vb2//j39v/29vb/+Pf2//b29v/29vb//Pv3//b29v/8+/f/tsno/yh35f8ecev/IXXs/x5x6/8ecev/HnHr/x5x6/8ecev/HnHr/yF17P8ecev/Nnjl/+Xp8//49/b/9vb2//b29v/29vb/9vb2//b29v/29vb/7fD1//j39v/29vb//Pv3//b29v/29vb/9vb2//j39v/q7fP/U4nX/xtl6f8da+r/HWvq/x1r6v8da+r/HWvq/x1r6v8da+r/HWvq/x1r6v8da+r/HWvq/xtl6f8fbfD/i7ry//7+/twAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACBu8GYda+r/HWvq/x1r6v8kaOf/HnHr/x1r6v8da+r/HWvq/x1r6v8da+r/HWvq/x5x6/8da+r/HWvq/x5x6/8da+r/Hmrd/3Ob1f/i5u///Pv3//z79//49/b/+Pf2//b29v/29vb//Pv3/9Pb6v9Ugs3/HnHr/x5x6/8ecev/IXXs/yN87v8hdez/IXXs/x5x6/8hdez/IXXs/x5x6/8ecev/n8Ht//z79//29vb/9vb2//b29v/29vb/9vb2//b29v/49/b/9vb2//b29v/49/b/9vb2//b29v/29vb/9vb2//z79//8+/f/lrfn/x5x6/8ecev/IXXs/x5x6/8hdez/IXXs/yF17P8od+X/IXXs/yF17P8ca+T/RYjo/+rt8//49/b/9vb2//b29v/29vb/+Pf2//b29v/29vb/9vb2//b29v/29vb/9vb2//b29v/29vb/9vb2//T6/v/i5u//Nnjl/x1r6v8da+r/HWvq/x5x6/8ecev/HWvq/x5x6/8da+r/HWvq/x1r6v8kaOf/HnHr/x1r6v8da+r/PHrq/+v1/v////9mAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB1r6tEda+r/HWvq/x1r6v8da+r/HWvq/x1r6v8da+r/JGjn/x1r6v8gbvD/HnHr/x5x6/8ecev/IG7w/x5x6/8hdez/HnHr/x5q3f9JfM7/pbvd/9vb2//t8PX/7fD1/+vr6//T2+r/hqnY/zVz1P8ca+T/HnHr/yF17P8hdez/HnHr/x5x6/8hdez/IXXs/yF17P8hdez/Hnzt/x5x6/8od+X/1OT1//z79//t8PX/9vb2//b29v/29vb/9vb2//b29v/29vb/9vb2//b29v/29vb/9vb2//b29v/29vb/9vb2//b29v/8+/f/faXc/x5x6/8ecev/IXXs/yF17P8ecev/IXXs/yF17P8hdez/Hnzt/x5x6/8ecev/RYjo/+3w9f/49/b/9vb2//b29v/29vb/9vb2//b29v/29vb/+Pf2//b29v/29vb/9vb2//b29v/29vb/9vb2//j39v/T2+r/LG3l/x5x6/8ecev/HnHr/x1r6v8ecev/HWvq/x1r6v8da+r/HWvq/x1r6v8da+r/HWvq/x1r6v8da+r/IG7w/6C+8//+/v7RAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIW/vTiRo5/8da+r/JGjn/x5x6/8ecev/HnHr/x5x6/8ecev/HnHr/x5x6/8ecev/IG7w/x5x6/8ecev/HnHr/x5x6/8hdPL/IXXs/yF08v8da+r/Hmrd/zVz1P9Ugs3/VILN/0l8zv81c9T/Hmrd/x5x6/8hdez/IXXs/yF17P8hdez/IXXs/yF17P8hdez/IXXs/yF17P8jfO7/HnHr/x5x6/9qmur/9vb2//b29v/29vb/9vb2//b29v/29vb/9vb2//b29v/29vb/9vb2//b29v/29vb/9vb2//j39v/29vb/9vb2//b29v/t8PX/VYnn/x5x6/8efO3/IXXs/yF17P8hdez/IXXs/yN87v8hdez/HnHr/x587f8ecev/V5Tm/+3w9f/49/b/9vb2//b29v/29vb/9vb2//b29v/29vb/9vb2//b29v/29vb/9vb2//b29v/29vb/9vb2//z79//Az+j/KHfl/x5x6/8ecev/HWvq/yF17P8da+r/IXXs/x5x6/8ecev/JGjn/x5x6/8da+r/HWvq/x1r6v8da+r/IXTy/0WI6P/t+f//////TgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIG7xsB5x6/8da+r/HnHr/x5x6/8da+r/IG7w/x1r6v8ecev/HnHr/x5x6/8hdPL/HWvq/x5x6/8hdez/IG7w/yF17P8ecev/JGjn/x5x6/8hdez/HnHr/x5x6/8ecev/HnHr/x5x6/8ecev/Hnzt/x5x6/8hdez/HnHr/yN87v8hdez/IXXs/yF17P8hdez/IXXs/yF17P8hdez/I3zu/yN87v/Az+j//Pv3//b29v/8+/f/9vb2//b29v/49/b/9vb2//b29v/29vb/+Pf2//b29v/29vb/9vb2//b29v/29vb/9vb2//j39v/c4u3/M4Pc/x587f8ecev/Hnzt/yF17P8jfO7/IXXs/yF17P8hdez/Hnzt/x5x6/8ecev/aJHn//b29v/49/b/9vb2//j39v/29vb/+Pf2//b29v/29vb/9vb2//b29v/29vb/9vb2//b29v/29vb/9vb2//z79/+rw+T/HWvq/x5x6/8ecev/HnHr/x1r6v8hdPL/HWvq/yRo5/8ecev/HnHr/x1r6v8ecev/HnHr/yBu8P8kaOf/HnHr/yF08v+41fj//v7+sAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAggPcgHWvq/x1r6v8kaOf/HWvq/x5x6/8ecev/IXTy/yF17P8ecev/HnHr/x5x6/8ecev/JGjn/yF17P8ecev/IXXs/yF17P8hdez/IXXs/yF17P8hdez/IXXs/yF17P8hdez/I3zu/x587f8ecev/KHfl/x587f8hdez/IXXs/yF17P8jfO7/IXXs/x5x6/8efO3/KHfl/x5x6/8jfO7/HnHr/2ek7P/29vb/9vb2//b29v/29vb/9vb2//b29v/29vb/9vb2//b29v/29vb/9vb2//b29v/29vb/9vb2//b29v/29vb/9vb2//z79/+rw+T/Hnzt/x587f8jfO7/I3zu/yN87v8jfO7/Hnzt/x587f8hdez/KHfl/yN87v8ecev/e6bn//z79//29vb/9vb2//b29v/29vb/9vb2//b29v/29vb/9vb2//b29v/29vb/9vb2//b29v/29vb/+Pf2//z79/+KquL/HGvk/yF17P8hdPL/IXXs/yF17P8hdez/IXTy/yRo5/8ecev/IXTy/x5x6/8kaOf/HnHr/x5x6/8ecev/IG7w/yBu8P9npPL//v7+/////yAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAhc/B6IG7w/yF17P8hdez/HnHr/x5x6/8ecev/IXXs/yRo5/8ecev/IXXs/yF17P8hdez/IXXs/yF17P8hdez/IXXs/yF17P8hdez/HnHr/yF17P8hdez/IXXs/yF17P8jfO7/HnHr/x5x6/8jfO7/I3zu/yF17P8jfO7/I3zu/x587f8hdez/Hnzt/yN87v8jfO7/I3zu/yN87v8efO3/OIbp/9Tk9f/8+/f/+Pf2//b29v/0+v7/9vb2//T6/v/49/b/9vb2//j39v/29vb/+Pf2//j39v/49/b/8vX7//z79//29vb/+Pf2//z79/99pdz/HnHr/yF17P8jfO7/I3zu/yN87v8jfO7/I3zu/yN87v8jfO7/I3zu/x587f8ecev/lrfn//z79//49/b/9vb2//j39v/0+v7/9vb2//j39v/49/b/+Pf2//j39v/0+v7/9vb2//j39v/29vb/+Pf2//z79/9qmur/HnHr/yF17P8ecev/IXXs/x5x6/8hdez/IXXs/x5x6/8ecev/IXXs/x5x6/8ecev/HnHr/x5x6/8kaOf/IG7w/x5x6/84hun/4+37//39/XoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAhdPHPIXXs/yF17P8ecev/HnHr/x5x6/8ecev/IXXs/x5x6/8hdez/IXXs/yF17P8hdez/IXXs/yF17P8hdez/IXXs/yF17P8hdez/I3zu/x5x6/8jfO7/I3zu/x5x6/8ecev/I3zu/x587f8jfO7/I3zu/yN87v8hdez/I3zu/yN87v8jfO7/Hnzt/yN87v8jfO7/I3zu/yN87v8jfO7/qMHn//7+/v/29vb/+Pf2//j39v/49/b/+Pf2//b29v/49/b/+Pf2//b29v/0+v7/+Pf2//b29v/49/b/+Pf2//L1+//49/b//Pv3/+Xp8/9FiOj/Hnzt/yN87v8jfO7/I3zu/yN87v8jfO7/I3zu/yN87v8jfO7/I3zu/x587f8efO3/qcjz//z79//8+/f/9Pr+//j39v/49/b/9vb2//j39v/29vb/+Pf2//j39v/49/b/9vb2//j39v/49/b//Pv3/+3w9f9Mkdz/HnHr/yF17P8hdez/IXXs/yF17P8hdez/IXXs/yF17P8hdez/IXXs/yF17P8hdez/IXXs/yF17P8ecev/HnHr/yF08v8hdPL/qcjz//7+/s8AAAAAAAAAAAAAAAAAAAAAAAAAACJ97i0da+r/IXXs/yF17P8hdez/HnHr/yF17P8hdez/IXXs/yF17P8hdez/IXXs/yF17P8hdez/IXXs/yF17P8jfO7/IXXs/yN87v8hdez/I3zu/yN87v8jfO7/Hnzt/yN87v8jfO7/I3zu/yF17P8jfO7/I3zu/yN87v8jfO7/Hnzt/yN87v8jfO7/I3zu/yN87v8efO3/Hnzt/x587f+Ltuz//Pv3//j39v/49/b/+Pf2//j39v/49/b/9vb2//T6/v/29vb/+Pf2//j39v/49/b/+Pf2//T6/v/y9fv/+Pf2//z79//29vb//Pv3/7bJ6P8od+X/I3vy/yWC7/8jfO7/JYLv/yN87v8jfO7/I3zu/yN87v8efO3/I3zu/x587f8rg+H/zuD0//z79//29vb/9vb2//j39v/49/b/+Pf2//j39v/0+v7/9vb2//b29v/49/b/+Pf2//j39v/0+v7/9vb2/+Lm7/82eOX/Hnzt/yN87v8hdez/IXXs/yF17P8hdez/IXXs/yF17P8hdez/HnHr/yF17P8hdez/KHfl/x5x6/8ecev/IXXs/x5x6/8hdez/Z6Ty//7+/v////8tAAAAAAAAAAAAAAAAAAAAACR78Hohdez/IXXs/yF17P8hdez/IXXs/yF17P8hdez/IXXs/yF17P8hdez/IXXs/yF17P8hdez/I3zu/yF17P8hdez/I3zu/yF17P8jfO7/I3zu/yN87v8jfO7/I3zu/yN87v8jfO7/I3zu/x587f8jfO7/I3zu/yN87v8jfO7/I3zu/yN87v8jfO7/JYLv/yN87v8jfO7/IXXs/4qt8P/49/b/+Pf2//j39v/49/b/8vX7//j39v/49/b/+Pf2//T6/v/29vb//Pv3//b29v/49/b/9vb2//b29v/49/b/8vX7//j39v/49/b/+Pf2/2yd1v8efO3/JYLv/yWC7/8lgu//JYLv/yN87v8lgu//JYLv/yN87v8lgu//I3zu/yN87v9FiOj/7fD1//j39v/49/b/9vb2//7+/v/29vb/9vb2//b29v/29vb/9vb2//b29v/29vb/+Pf2//j39v/29vb//Pv3/8PT6v8od+X/Hnzt/yN87v8hdez/IXXs/yN87v8hdez/IXXs/yF17P8hdez/IXXs/yF17P8hdez/IXXs/yF17P8hdez/IXXs/yF17P8hdPL/OIbp/+Pz///9/f16AAAAAAAAAAAAAAAAAAAAACN68sIhdez/IXXs/yF17P8hdez/KHfl/yF17P8hdez/I3zu/yN87v8od+X/I3zu/yN87v8jfO7/IXXs/yN87v8jfO7/I3zu/yN87v8jfO7/I3zu/yN87v8jfO7/I3zu/yN87v8jfO7/I3zu/x587f8lgu//JYLv/x587f8lgu//Hnzt/yWC7/8jfO7/JYLv/x587f8ohvH/i7ry//j39v/49/b/+Pf2//j39v/49/b/9Pr+//j39v/49/b/9vb2//j39v/29vb/9vb2//T6/v/29vb/+Pf2//j39v/49/b/+Pf2//j39v/8+/f/ztjs/yyD3v8efO3/JYLv/yWC7/8lgu//JYLv/yWC7/8jfO7/JYLv/yWC7/8jfO7/JoTw/x587f9npOz/+Pf2//T6/v/49/b/9vb2//b29v/29vb/9vb2//b29v/+/v7/+Pf2//j39v/0+v7/+Pf2//b29v/49/b//Pv3/5a35/8ecev/Hnzt/yF17P8jfO7/IXXs/yN87v8hdez/I3zu/yN87v8jfO7/IXXs/yN87v8hdez/IXXs/yF17P8hdez/IXXs/yF17P8hdPL/I3vy/7jV+P/+/v7CAAAAAAAAAAAAAAAAIojuDyF08v8hdez/IXXs/yF17P8hdez/I3zu/yN78v8hdez/IXXs/yN87v8je/L/I3zu/yN87v8jfO7/I3zu/yN87v8jfO7/I3zu/yN87v8jfO7/I3zu/yN87v8jfO7/I3zu/yWC7/8jfO7/K4Ph/x587f8lgu//I3zu/yWC7/8efO3/JYLv/yWC7/8efO3/JYLv/0iW7v+pyPP//Pv3//j39v/49/b/+Pf2//j39v/49/b/+Pf2//L1+//49/b/+Pf2//b29v/49/b/+Pf2//j39v/49/b/9vb2//j39v/29vb/+Pf2//j39v/8+/f/faXc/yN87v8lgu//JYLv/yWC7/8efO3/JYLv/yWC7/8lgu//JYLv/yWC7/8lgu//JYLv/x587f+fwe3//Pv3//b29v/49/b/+Pf2//b29v/29vb/9vb2//b29v/29vb/+Pf2//j39v/29vb/9vb2//T6/v/29vb//Pv3/2qa6v8efO3/I3zu/yN87v8jfO7/I3zu/yN87v8jfO7/I3zu/yF17P8jfO7/I3zu/yF17P8hdez/I3zu/yN87v8hdez/IXXs/yF17P8hdez/I3vy/3e29P/+/v7/////DwAAAAAAAAAAJHzyTiF17P8hdez/IXXs/yN87v8hdez/IXXs/yF17P8jfO7/I3zu/yF17P8hdez/I3zu/yN87v8jfO7/I3zu/yN87v8jfO7/I3zu/yN87v8jfO7/JYLv/yN87v8jfO7/JYLv/yN87v8lgu//I3zu/yN87v8lgu//JYLv/yN87v8lgu//JYLv/x587f8qhOz/c6Xw/9nm+f/8+/f/+Pf2//T6/v/49/b/+Pf2//T6/v/49/b//Pv3//j39v/49/b//Pv3//b29v/0+v7/+Pf2//j39v/49/b/9Pr+//j39v/29vb/9Pr+//z79//T3Oz/M4Pc/yWC7/8lgu//Jonx/yWC7/8lgu//JYLv/yWC7/8lgu//JYLv/yWC7/8lgu//JYLv/yqE7P/N3fP//Pv3//j39v/49/b/9Pr+//j39v/29vb//v7+//b29v/29vb/9Pr+//b29v/8+/f//Pv3//b29v/8+/f/5enz/0aK1/8efO3/IXXs/yN87v8jfO7/IXXs/yN87v8jfO7/I3zu/yN87v8jfO7/I3zu/yF17P8jfO7/IXXs/yN87v8hdez/IXXs/yF17P8hdez/I3vy/1aa8f/+/v7/////TgAAAAAAAAAAI3vyiSN87v8hdez/I3zu/yN87v8jfO7/I3zu/yF17P8jfO7/I3zu/yN87v8jfO7/I3zu/yN87v8jfO7/I3zu/yWC7/8jfO7/I3zu/yN87v8jfO7/I3zu/yWC7/8jfO7/JYLv/yWC7/8jfO7/JYLv/yWC7/8lgu//Hnzt/x587f8lgu//RYjo/3e29P/O4PT/9vb2//z79//0+v7/+Pf2//j39v/0+v7/+Pf2//j39v/0+v7/+Pf2//T6/v/+/v7/+Pf2//j39v/0+v7/+Pf2//7+/v/29vb/9Pr+//j39v/29vb//v7+//z79/99pdz/I3zu/yaE8P8lgu//JYLv/yaE8P8mhPD/JYLv/yWC7/8lgu//JoTw/yaE8P8mhPD/JYLv/1aa8f/t8PX//Pv3//z79//29vb/9vb2//T6/v/29vb//v7+//b29v/+/v7/9vb2//b29v/0+v7/9vb2//z79//8+/f/ytbq/yh35f8jfO7/I3zu/yN87v8lgu//I3zu/yN87v8jfO7/I3zu/yN87v8jfO7/I3zu/yN87v8jfO7/I3zu/yF17P8od+X/IXXs/yF08v8hdez/I3zu/zWO8v/j7fv//f39iQAAAAAAAAAAI3vzvyN87v8jfO7/I3zu/yN87v8jfO7/I3zu/yN87v8jfO7/I3zu/yN87v8jfO7/I3zu/yWC7/8jfO7/I3zu/yN87v8lgu//JYLv/yWC7/8mhPD/JoTw/yN87v8mhPD/JYLv/yWC7/8lgu//JYLv/yWC7/8+mfT/Z6Ty/4u68v+41fj/5On0//z79//8+/f//Pv3//z79//29vb/+Pf2//j39v/49/b//Pv3//j39v/49/b/+Pf2//j39v/49/b/+Pf2//z79//29vb//Pv3//j39v/29vb/+Pf2//j39v/49/b//Pv3/8rW6v8zg9z/JYLv/yiG8f8ohvH/Jonx/yaE8P8mhPD/KoTs/yaJ8f8qhOz/JYLv/yaE8P8mhPD/Hnzt/4u27P/8+/f/9vb2//j39v/49/b//Pv3//j39v/8+/f/+Pf2//b29v/29vb//v7+//b29v/49/b/+Pf2//T6/v/+/v7/iqri/yN87v8mhPD/I3zu/yaE8P8jfO7/JoTw/yN87v8jfO7/I3zu/yN87v8jfO7/I3zu/yN87v8jfO7/I3zu/yN78v8jfO7/I3vy/yN78v8jfO7/I3zu/yN78v/K4vr/////vwAAAAAAAAAAI3vx8iN87v8jfO7/I3zu/yN87v8jfO7/I3zu/yN87v8jfO7/I3zu/yN78v8qhOz/I3vy/yWC7/8je/L/JoTw/yaE8P8lgu//I3zu/yaE8P8jfO7/JoTw/yWC7/8lgu//JYLv/yqE7P8lgu//JYLv/yaE8P+80vP//Pv3//z79//8+/f/9vb2//j39v/49/b/9Pr+//j39v/29vb//Pv3//j39v/49/b/+Pf2//T6/v/49/b/+Pf2//j39v/49/b/9Pr+//b29v/+/v7/9vb2//j39v/49/b//v7+//j39v/8+/f/9vb2/1mW2v8efO3/Jonx/yaE8P8mifH/Jonx/yaJ8f8mifH/JoTw/yaJ8f8mhPD/Jonx/yaJ8f8mifH/J4jn/83d8//+/v7//Pv3//T6/v/29vb/+Pf2//j39v/y9fv//v7+//b29v/+/v7/9vb2//j39v/49/b//Pv3//T6/v/t8PX/WZba/yN78v8mhPD/JoTw/yN87v8mhPD/JoTw/yN87v8mhPD/I3zu/yqE7P8jfO7/I3vy/yN87v8jfO7/JoTw/yN87v8jfO7/I3zu/yN87v8jfO7/I3zu/yN78v+Xyvj//v7+8gAAAAAig/ElI3vy/yF17P8je/L/I3vy/yN87v8jfO7/I3vy/yN87v8lgu//I3zu/yN87v8mhPD/I3zu/yWC7/8jfO7/KoTs/yN87v8mhPD/JoTw/yaE8P8jfO7/JoTw/yaE8P8mhPD/JoTw/yaE8P8lgu//JoTw/yaJ8f/T3Oz//Pv3//j39v/0+v7//Pv3//j39v/0+v7//Pv3//j39v/29vb//Pv3//j39v/0+v7/+Pf2//j39v/49/b/9Pr+//j39v/49/b/+Pf2//j39v/49/b/9vb2//j39v/0+v7/9vb2//j39v/+/v7/mrXd/yuD4f8mifH/KIbx/yiG8f8mifH/KIbx/yaJ8f8niOf/Jonx/yaJ8f8mhPD/KIbx/yeI5/8lgu//XaDs//b29v/0+v7/9vb2//b29v/8+/f//Pv3//L1+//29vb/9vb2//b29v/29vb//Pv3//j39v/0+v7/9vb2//z79//T3Oz/LIPe/yaJ8f8mhPD/I3zu/yaE8P8mhPD/I3zu/yaE8P8jfO7/JYLv/yN78v8lgu//I3zu/yWC7/8jfO7/I3zu/yN78v8jfO7/I3zu/yN87v8jfO7/I3zu/yN78v93tvT//v7+/////yUnhvJOI3vy/yN87v8jfO7/I3zu/yWC7/8je/L/I3vy/zZ45f8jfO7/JYLv/yN87v8lgu//I3zu/yaE8P8lgu//JoTw/yN87v8mhPD/JoTw/yaE8P8mhPD/JoTw/yWC7/8mhPD/JoTw/yaE8P8mhPD/KIbx/yaE8P/N3fP//v7+//j39v/49/b/+Pf2//j39v/8+/f/+Pf2//T6/v/29vb/9vb2//z79//49/b/+Pf2//j39v/49/b/+Pf2//j39v/0+v7/9vb2//b29v/8+/f/+Pf2//T6/v/49/b/+Pf2//7+/v/K1ur/M4Pc/yaJ8f8mifH/Jonx/yaJ8f8ohvH/Kozx/yqM8f8ohvH/KIbx/yaJ8f8mifH/Jonx/yaJ8f8mifH/ssnz//7+/v/y9fv//v7+//b29v/49/b/9vb2//z79//0+v7/+Pf2//j39v/0+v7//Pv3//j39v/49/b//Pv3//z79/+VtN3/Hnzt/yaE8P8mhPD/JoTw/yaE8P8mhPD/JoTw/yWC7/8lgu//JoTw/yWC7/8jfO7/KoTs/yN87v8jfO7/I3zu/yN87v8lgu//I3zu/yN78v8jfO7/I3vy/yaE8P9Yp/X//v7+/////04mhe9zI3zu/yaE8P8jfO7/I3vy/yWC7/8je/L/JYLv/yaE8P8lgu//JYLv/yaE8P8jfO7/JoTw/yWC7/8lgu//JoTw/yaE8P8mhPD/JoTw/yaE8P8lgu//JoTw/yqE7P8mhPD/JoTw/yaE8P8mhPD/JoTw/yqE7P/N3fP/+Pf2//T6/v/8+/f/9Pr+//7+/v/0+v7//Pv3//7+/v/29vb//v7+//T6/v/+/v7/+Pf2//j39v/0+v7/+Pf2//7+/v/49/b/9vb2//7+/v/0+v7/+Pf2//z79//49/b//Pv3/+Xp8/9Mkdz/JYLv/yaJ8f8mifH/Kozx/yqM8f8mifH/Jonx/yqM8f8mifH/KIbx/yqM8f8pjev/Jonx/yaJ8f9Ilu7/7fD1//z79//49/b/9vb2//7+/v/49/b//v7+//b29v/+/v7//Pv3//j39v/49/b/9Pr+//T6/v/49/b/+Pf2//b29v9XlOb/JYLv/yqE7P8mhPD/JoTw/yaE8P8mhPD/JoTw/yaE8P8lgu//JYLv/yN87v8mhPD/JoTw/yN78v8jfO7/JYLv/yWC7/8lgu//I3zu/yWC7/8jfO7/JYLv/yN78v9Ilu7/6/X+/////3Mmg++UI3zu/yWC7/8mhPD/JYLv/yaE8P8mhPD/JYLv/yaE8P8mhPD/JYLv/yiG8f8lgu//JoTw/yaE8P8mhPD/JoTw/yaJ8f8mhPD/JoTw/yiG8f8mifH/Jonx/yaJ8f8mifH/KIbx/yqM8f8qjPH/KIbx/yiG8f/S3/j//Pv3//z79//49/b/+Pf2//j39v/49/b/9vb2//b29v/49/b//Pv3//j39v/49/b/+Pf2//z79//+/v7/+Pf2//j39v/0+v7//Pv3//j39v/29vb//v7+//j39v/+/v7/+Pf2/3Ob1f8niOf/Kozx/yqM8f8qjPH/Kozx/yqM8f8qjPH/Kozx/yaJ8f8qjPH/Kozx/yqM8f8qjPH/Kozx/yaJ8f+pyPP//v7+//T6/v/8+/f/9Pr+//j39v/29vb//v7+//7+/v/49/b/+Pf2//j39v/49/b//v7+//j39v/0+v7//v7+/8PT6v8rg+H/Jonx/yWC7/8mifH/KIbx/yaE8P8mhPD/JoTw/yaE8P8lgu//JYLv/yaE8P8mhPD/JoTw/yqE7P8mhPD/JoTw/yaE8P8lgu//JoTw/yN87v8jfO7/JYLv/yaE8P81jvL/2u38//39/ZQmhPGwJYLv/yWC7/8mhPD/I3zu/yaE8P8jfO7/JoTw/yWC7/8mhPD/JoTw/yaE8P8lgu//JoTw/yqE7P8mhPD/JoTw/yeI5/8mifH/KIbx/yaJ8f8mhPD/KIbx/yiG8f8ohvH/KIbx/yqM8f8ohvH/Kozx/yqM8f/T3Oz//v7+//z79//49/b/+Pf2//7+/v/49/b//v7+//b29v/0+v7/9Pr+//j39v/49/b//v7+//T6/v/49/b/9Pr+//z79//8+/f/+Pf2//7+/v/29vb/9vb2//j39v/0+v7/hqnY/yN87v8qjPH/Kozx/yqM8f8qku3/Kozx/yqM8f8qku3/Kozx/yqM8f8qku3/Kozx/yqM8f8qku3/Jonx/0Wb9f/t8PX//Pv3//z79//29vb/+Pf2//j39v/0+v7/9vb2//b29v/49/b/+Pf2//j39v/+/v7/+Pf2//j39v/8+/f//Pv3/32l3P8lgu//Jonx/yaJ8f8niOf/JoTw/yaJ8f8ohvH/KIbx/yiG8f8ohvH/KIbx/yaE8P8mhPD/JoTw/yiG8f8lgu//JoTw/yWC7/8mhPD/I3zu/yaE8P8qhOz/JoTw/yN78v8qjPH/zOv///7+/rAmhfDIJYLv/yN78v8mhPD/JoTw/yaE8P8lgu//JoTw/yaE8P8ohvH/JoTw/yaE8P8ohvH/Jonx/yaJ8f8mifH/Jonx/yiG8f8ohvH/KIbx/yaJ8f8mifH/Jonx/yeI5/8qjPH/Kozx/yqM8f8qjPH/KIbx/yiG8f/N3fP//v7+//b29v/0+v7/+Pf2//T6/v/49/b//Pv3//z79//49/b//Pv3//j39v/8+/f/+Pf2//z79//0+v7/+Pf2//j39v/8+/f/9Pr+//z79//0+v7//v7+//z79/+Qr9r/LIPe/yqM8f8qjPH/Kozx/y2T8/8qjPH/Kozx/y2T8/8qjPH/LZPz/yqS7f8qjPH/LJT3/yqS7f8mifH/KY3r/6nI8//+/v7//v7+//b29v/29vb//Pv3//j39v/49/b/+Pf2//T6/v/8+/f//Pv3//T6/v/+/v7/+Pf2//j39v/8+/f/3eXy/z2O3v8mifH/Kozx/yaE8P8mifH/KIbx/yiG8f8ohvH/KIbx/yiG8f8ohvH/KIbx/yaJ8f8mhPD/JoTw/yaE8P8ohvH/JoTw/yaE8P8mhPD/KoTs/yWC7/8lgu//JoTw/yN78v8vj/n/ut36//7+/sgmhPDcJoTw/yaE8P8mhPD/JYLv/yiG8f8ohvH/JoTw/yiG8f8mifH/Jonx/yaE8P8ohvH/J4jn/yiG8f8ohvH/KIbx/yqM8f8mifH/KIbx/yqM8f8qjPH/Kozx/yqM8f8qjPH/Kozx/yqM8f8qjPH/Kozx/yqM8f/N3fP//v7+//j39v/8+/f//Pv3//j39v/49/b//v7+//T6/v/0+v7//Pv3//7+/v/0+v7/+Pf2//j39v/0+v7//Pv3//T6/v/8+/f//Pv3//b29v/8+/f/9vb2/5Cv2v8rg+H/Kozx/y2T8/8tk/P/KpLt/y2T8/8qjPH/LZPz/yqM8f8qku3/Kozx/yqM8f8qjPH/Kozx/yqS7f8qku3/Z6Ts/+v1/v/8+/f/9vb2//z79//+/v7/+Pf2//T6/v/+/v7/+Pf2//z79//49/b/9Pr+//j39v/49/b//v7+//T6/v/8+/f/lrfn/yWC7/8qjPH/KIbx/yiG8f8qjPH/Kozx/yaJ8f8mifH/KIbx/yqM8f8ohvH/KIbx/yeI5/8ohvH/KIbx/yiG8f8mhPD/KIbx/yaJ8f8mhPD/KIbx/yaE8P8je/L/JoTw/yaE8P8vj/n/st7+//7+/twmhPDrJoTw/yaE8P8mhPD/JoTw/yiG8f8ohvH/KIbx/yiG8f8ohvH/Kozx/yiG8f8ohvH/KIbx/yiG8f8qjPH/Kozx/yaJ8f8qjPH/Jonx/yqM8f8qjPH/Kozx/yqM8f8qjPH/Kozx/yqM8f8qjPH/KpLt/y2T8//N3fP//Pv3//z79//0+v7//v7+//j39v/49/b/+Pf2//j39v/49/b//Pv3//j39v/0+v7//v7+//j39v/+/v7/+Pf2//j39v/49/b//Pv3//7+/v/t8PX/eKPY/yuD4f8qku3/LZPz/y2T8/8qjPH/LZPz/yqM8f8tk/P/KpLt/y2T8/8qjPH/LZPz/y2T8/8tk/P/LZPz/yqM8f8tk/P/x9r1//7+/v/8+/f//Pv3//T6/v/29vb//v7+//b29v/+/v7//Pv3//T6/v/49/b//v7+//j39v/8+/f/+Pf2//z79//t8PX/TJHc/yiG8f8qjPH/Kozx/yqM8f8qjPH/Kozx/yqM8f8mifH/Kozx/yiG8f8qjPH/KIbx/yqM8f8ohvH/KIbx/yiG8f8ohvH/KIbx/yiG8f8ohvH/JoTw/yiG8f8mhPD/JoTw/yaE8P8vj/n/p9T6//7+/usmhPD2JoTw/yaE8P8ohvH/KIbx/yiG8f8ohvH/KIbx/yiG8f8ohvH/KIbx/yiG8f8qjPH/Kozx/yqM8f8ohvH/Kozx/yqM8f8qjPH/Kozx/yqM8f8qjPH/Kozx/yqM8f8tk/P/Kozx/yqM8f8tk/P/LZPz/y2T8//N3fP//v7+//7+/v/+/v7/+Pf2//j39v/+/v7/+Pf2//7+/v/8+/f/9Pr+//j39v/8+/f/+Pf2//7+/v/49/b//v7+//7+/v/49/b//v7+/+Lm7/9mmNj/K4Ph/yqM8f8tk/P/Kozx/y2T8/8tk/P/LZPz/y2T8/8qku3/LZPz/y2T8/8qku3/LZPz/y2T8/8qjPH/Kozx/yyU9/+LuvL//Pv3//T6/v/8+/f//v7+//b29v/+/v7/9vb2//7+/v/29vb/+Pf2//7+/v/49/b/+Pf2//7+/v/0+v7//v7+//7+/v+ivej/KoTs/y2T8/8qjPH/LZPz/yqM8f8qjPH/Kozx/yqM8f8qjPH/Kozx/yqM8f8ohvH/Kozx/yqM8f8ohvH/Kozx/yaJ8f8ohvH/KIbx/yiG8f8ohvH/KIbx/yiG8f8ohvH/JoTw/yaE8P8vj/n/m9X+//7+/vYmifH9KIbx/yiG8f8ohvH/KIbx/yqM8f8ohvH/KIbx/yqM8f8ohvH/Kozx/yqM8f8qjPH/Kozx/yqM8f8qjPH/Kozx/yiG8f8qjPH/Kozx/yqM8f8qjPH/LZPz/yqM8f8tk/P/LZPz/yqM8f8tk/P/Kozx/yqM8f/O4PT//Pv3//z79//8+/f//v7+//b29v/+/v7//v7+//b29v/+/v7/9vb2//T6/v/8+/f/9Pr+//j39v/+/v7/+Pf2//z79//+/v7/vMzl/0aK1/8niOf/LZPz/y2T8/8qku3/LZPz/y2T8/8tk/P/KpLt/y2T8/8tk/P/LZPz/y2T8/8tk/P/LZPz/y2T8/8tk/P/Kozx/1in9f/t8PX//Pv3//T6/v/+/v7/+Pf2//z79//0+v7//v7+//j39v/49/b/9vb2//7+/v/29vb//v7+//j39v/+/v7//v7+/+3w9f9Mkdz/Kozx/yqM8f8tk/P/Kozx/yqM8f8tk/P/Kozx/yqM8f8qjPH/Kozx/yiG8f8qjPH/Kozx/yqM8f8qjPH/KIbx/yqM8f8ohvH/Kozx/yiG8f8ohvH/Kozx/yiG8f8ohvH/KIbx/yiG8f8vj/n/l8r4//7+/v0mifH/KIbx/yiG8f8qjPH/KIbx/yiG8f8qjPH/Kozx/yqM8f8qjPH/Kozx/yqM8f8qjPH/Kozx/yqM8f8qjPH/LZPz/y2T8/8qku3/LZPz/y2T8/8qjPH/LZPz/yqM8f8tk/P/KpLt/y2T8/8tk/P/LZPz/y2T8//O4PT//v7+//z79//49/b/+Pf2//7+/v/29vb/9vb2//7+/v/29vb//v7+//z79//8+/f//v7+//z79//8+/f//v7+/+Xp8/+AnNb/M4Pc/ymN6/8qku3/Lpn0/y6Z9P8tk/P/LZPz/y6Z9P8wlvT/MJb0/zCW9P8wlvT/LZPz/y2T8/8tk/P/LZPz/y2T8/8slPf/Ppn0/87g9P/+/v7/+Pf2//z79//49/b/+Pf2//7+/v/+/v7/+Pf2//z79//8+/f//v7+//b29v/+/v7/9vb2//z79//49/b//v7+/6vD5P8niOf/LZPz/y2T8/8qjPH/LZPz/yqM8f8qjPH/LZPz/y2T8/8qjPH/LZPz/yqM8f8qjPH/LZPz/yqM8f8qjPH/Kozx/yqM8f8qjPH/Kozx/yqM8f8qjPH/KIbx/yiG8f8ohvH/KIbx/yiG8f8zlPr/jMz8//7+/v8qjPH9Kozx/yiG8f8qjPH/Kozx/yqM8f8qjPH/Kozx/yqM8f8tk/P/Kozx/y+P+f8qjPH/Kozx/y2T8/8tk/P/Kozx/yqM8f8tk/P/LZPz/y2T8/8tk/P/NY7y/y2T8/8qku3/LZPz/zCW9P8tk/P/LZPz/y2T8//T3Oz//v7+//z79//0+v7//Pv3//b29v/+/v7//v7+//z79//+/v7/9vb2//z79//8+/f//v7+//7+/v/29vb/pbvd/0aK1/8niOf/Lpn0/y2T8/8umfT/LZPz/y2T8/8tk/P/Lpn0/y2T8/8umfT/KpLt/yqS7f8wlvT/Lpn0/y2T8/8qku3/Lpn0/y2T8/8tk/P/p9T6//7+/v/49/b//v7+//T6/v/49/b//v7+//j39v/49/b//v7+//T6/v/+/v7//Pv3//7+/v/0+v7//Pv3//T6/v/8+/f/6u3z/0yR3P8qjPH/LZPz/y2T8/81jvL/Kozx/y2T8/8qku3/LZPz/yqM8f8tk/P/LZPz/yqM8f8tk/P/Kozx/yqM8f8qjPH/LZPz/y2T8/8ohvH/Kozx/yqM8f8qjPH/Kozx/yqM8f8qjPH/KIbx/yqM8f8zlPr/jMz8//7+/v0vj/n2KIbx/yqM8f8qjPH/Kozx/yqM8f8qjPH/Kozx/yqM8f8qjPH/Kozx/yqM8f8qjPH/LZPz/yqM8f8tk/P/Kozx/y2T8/8qjPH/Kozx/y2T8/8tk/P/Kozx/y2T8/8tk/P/KpLt/y6Z9P8tk/P/Kozx/y2T8//U5PX//v7+//z79//+/v7/9Pr+//7+/v/8+/f//v7+//L1+//y9fv//v7+//z79//+/v7/7fD1/6vD5P9ck9P/M4Pc/y2T8/8umfT/MJb0/zCW9P8umfT/LZPz/y6Z9P8umfT/Lpn0/yqS7f8tk/P/Lpn0/y6Z9P8umfT/Lpn0/y6Z9P8umfT/Lpn0/yqS7f+fwe3//v7+//z79//+/v7/+Pf2//7+/v/+/v7/+Pf2//7+/v/0+v7/+Pf2//z79//0+v7/+Pf2//T6/v/+/v7//Pv3//7+/v/+/v7/lbTd/yeI5/8tk/P/LZPz/yqS7f8tk/P/LZPz/y2T8/8tk/P/LZPz/yqM8f8tk/P/LZPz/y2T8/8ohvH/Kozx/yqM8f8tk/P/Kozx/yqM8f8vj/n/Kozx/yqM8f8qjPH/Kozx/yqM8f8qjPH/Kozx/yqM8f8zlPr/jMz8//7+/vYqjPHrKozx/yqM8f8qjPH/Kozx/yiG8f8tk/P/Kozx/y2T8/8tk/P/Kozx/y2T8/8qjPH/Kozx/y2T8/8qjPH/LZPz/y2T8/8tk/P/LZPz/y2T8/8tk/P/NY7y/y2T8/8tk/P/KpLt/y2T8/8umfT/LZPz/y2T8//O4PT//v7+//7+/v/8+/f//Pv3//z79//8+/f//Pv3//z79//+/v7//Pv3/+Xp8/+lu93/XJPT/yyD3v8qku3/Lpn0/zCW9P8wlvT/MJb0/y6Z9P8umfT/Lpn0/zCW9P8wlvT/Mpz1/y6Z9P8umfT/Lpn0/zCW9P8wlvT/MJb0/y6Z9P8umfT/LZPz/3e29P/y9fv//v7+//7+/v/49/b//Pv3//T6/v/+/v7//v7+//j39v/+/v7//v7+//j39v/+/v7//v7+//T6/v/8+/f/9Pr+//7+/v/c4u3/PY7e/y2T8/8umfT/LZPz/y2T8/8tk/P/LZPz/y2T8/8tk/P/LZPz/y2T8/8tk/P/LZPz/y2T8/8tk/P/LZPz/yqM8f8tk/P/LZPz/yqM8f8qjPH/LZPz/yqM8f8qjPH/NY7y/yqM8f8qjPH/Kozx/yqM8f8zlPr/m9X+//7+/usslPfcLZPz/yqM8f8qjPH/LZPz/y2T8/8qjPH/Kozx/y2T8/8qjPH/LZPz/y2T8/8tk/P/LZPz/y2T8/8tk/P/LZPz/y2T8/8tk/P/LZPz/y2T8/8tk/P/LZPz/y2T8/8tk/P/LZPz/y2T8/8tk/P/MJb0/zCW9P/U5PX//Pv3//7+/v/+/v7//v7+//7+/v/+/v7//v7+/+rt8/+8zOX/faXc/0aK1/8sg97/KpLt/zKc9f8ynPX/Lpn0/zKc9f8wlvT/Lpn0/y6Z9P8umfT/Lpn0/y6Z9P8umfT/Lpn0/zKc9f8umfT/Lpn0/zKc9f8umfT/Lpn0/y6Z9P8tk/P/arj3/+3w9f/+/v7//Pv3//z79//+/v7/+Pf2//7+/v/49/b/9Pr+//j39v/49/b//v7+//7+/v/49/b//v7+//z79//8+/f//v7+//z79/94o9j/Kozx/y6Z9P8tk/P/Lpn0/zWO8v8tk/P/LZPz/zCW9P8tk/P/LZPz/y2T8/8tk/P/LZPz/y2T8/8qjPH/LZPz/y2T8/8tk/P/Kozx/y2T8/8qjPH/Kozx/y2T8/8qjPH/Kozx/yqM8f8tk/P/Kozx/yqM8f85nvv/p9T6//7+/twvj/nIKozx/yqM8f8qjPH/Kozx/yqM8f8tk/P/LZPz/y2T8/8tk/P/LZPz/y+P+f8qjPH/LZPz/y2T8/8tk/P/LZPz/y2T8/8tk/P/LZPz/y2T8/8tk/P/LZPz/zCW9P8tk/P/MJb0/zCW9P8wlvT/MJb0/y6Z9P/N3fP//v7+//z79//29vb/6+vr/8rW6v+lu93/c5vV/0aK1/8zg9z/J4jn/y6Z9P8umfT/Lpn0/zKc9f8ynPX/Mpz1/zCW9P8ynPX/MJb0/zKc9f8ynPX/Lpn0/zKc9f8ynPX/Mpz1/yqS7f8umfT/Mpz1/zKc9f8ynPX/Lpn0/y6Z9P9quPf/7fD1//7+/v/+/v7/9vb2//7+/v/+/v7/+Pf2//7+/v/49/b//v7+//7+/v/49/b//v7+//j39v/+/v7//v7+//j39v/8+/f//v7+/7bJ6P8niOf/MJb0/y6Z9P8tk/P/LZPz/zCW9P8wlvT/Lpn0/y2T8/8wlvT/MJb0/y6Z9P8tk/P/LZPz/y2T8/8tk/P/LZPz/y2T8/8tk/P/Kozx/y2T8/8tk/P/Kozx/y2T8/8qjPH/LZPz/yqM8f8qjPH/Kozx/y+P+f80nfv/q93///7+/sguj/mwKozx/y2T8/8tk/P/LZPz/y2T8/8qjPH/L4/5/y2T8/8tk/P/LZPz/y2T8/8tk/P/LZPz/y+P+f8tk/P/MJb0/y2T8/8wlvT/MJb0/zCW9P8umfT/Lpn0/zCW9P8umfT/MJb0/zCW9P8umfT/Lpn0/y2T8/9ck9P/gJzW/2yd1v9ck9P/RorX/zOD3P8sg97/KY3r/zKc9f8ynPX/Mpz1/zKc9f8ynPX/Lpn0/y6Z9P8wlvT/Mpz1/zKc9f8ynPX/Mpz1/zKc9f83mOb/Mpz1/zKc9f8ynPX/Mpz1/zai9v8ynPX/Mpz1/zKc9f83mOb/Lpn0/3e29P/r9f7//Pv3//j39v/+/v7//v7+//T6/v/8+/f//v7+//T6/v/8+/f//Pv3//j39v/+/v7/9Pr+//j39v/+/v7/+Pf2//7+/v/+/v7/4ubv/0yR3P8tk/P/Lpn0/y6Z9P8umfT/Lpn0/zKc9f8wlvT/KpLt/y6Z9P8wlvT/MJb0/zWO8v8tk/P/LZPz/y2T8/81jvL/L4/5/y2T8/8tk/P/L4/5/y2T8/8tk/P/LZPz/y2T8/8vj/n/Kozx/y2T8/8tk/P/L4/5/y2T8/85nvv/st7+//7+/rA0lPqULZPz/y2T8/8tk/P/LZPz/y+P+f8tk/P/LZPz/y2T8/8tk/P/L4/5/zCW9P8tk/P/LZPz/zKc9f8tk/P/MJb0/zCW9P8wlvT/Lpn0/zCW9P8wlvT/MJb0/y6Z9P8umfT/Lpn0/y6Z9P8wlvT/MJb0/zKc9f8qku3/KpLt/yqS7f8tk/P/Mpz1/zKc9f8ynPX/Mpz1/y6Z9P8ynPX/Mpz1/zKc9f8ynPX/Mpz1/zKc9f8ynPX/Mpz1/zKc9f8ynPX/Mpz1/zKc9f8ynPX/Mpz1/zKc9f8ynPX/Mpz1/zKc9f8ynPX/Mpz1/zKc9f8ynPX/gsP3//L1+//+/v7//Pv3//7+/v/49/b/+Pf2//7+/v/49/b/+Pf2//z79//0+v7/+Pf2//7+/v/y9fv//Pv3//7+/v/49/b/9Pr+//7+/v/8+/f/faXc/yqS7f8ynPX/Mpz1/zKc9f8umfT/Lpn0/yqS7f8umfT/Lpn0/zCW9P8tk/P/Mpz1/y2T8/8wlvT/M5T6/y2T8/8wlvT/MJb0/y6Z9P8tk/P/LZPz/y2T8/8vj/n/LZPz/y2T8/8tk/P/LZPz/y2T8/8tk/P/Kozx/zWO8v80nfv/w+b+//39/ZQzlftzKozx/y+P+f8tk/P/LZPz/y2T8/8tk/P/LZPz/y2T8/8tk/P/Mpz1/zCW9P8tk/P/LZPz/zCW9P8wlvT/MJb0/y6Z9P8ynPX/Lpn0/y6Z9P8wlvT/Mpz1/zKc9f8ynPX/Mpz1/zKc9f86o+3/Lpn0/zKc9f8ynPX/Mpz1/zKc9f8ynPX/Mpz1/zKc9f8ynPX/Mpz1/zKc9f8ynPX/Mpz1/zKc9f8ynPX/Mpz1/zai9v8ynPX/Mpz1/zKc9f82ovb/NqL2/zKc9f8ynPX/NqL2/zKc9f82ovb/Mpz1/zKc9f8wlvT/Mpz1/zai9v+Xyvj/+Pf2//7+/v/8+/f//v7+//j39v/+/v7//v7+//7+/v/+/v7//v7+//7+/v/+/v7//v7+//7+/v/+/v7//v7+//7+/v/+/v7/+Pf2//7+/v+rw+T/KY3r/zKc9f8ynPX/Mpz1/y6Z9P8umfT/Mpz1/zKc9f8ynPX/Mpz1/zKc9f8ynPX/Mpz1/y6Z9P8ynPX/Lpn0/y6Z9P8umfT/MJb0/y2T8/8umfT/Lpn0/y2T8/8wlvT/LZPz/y2T8/8tk/P/LZPz/y2T8/8tk/P/LZPz/zCW9P9IqPj/1Oz9/////3M0nfxOLZPz/y2T8/8tk/P/LZPz/y2T8/8tk/P/LZPz/y2T8/8tk/P/Lpn0/y2T8/8ynPX/MJb0/zCW9P8wlvT/NJ37/y6Z9P8wlvT/MJb0/zCW9P8ynPX/Mpz1/zKc9f8umfT/Mpz1/zKc9f8ynPX/Mpz1/zKc9f8ynPX/Mpz1/zKc9f8ynPX/Mpz1/zKc9f82ovb/OqPt/zKc9f8ynPX/NqL2/zKc9f82ovb/Mpz1/zKc9f8ynPX/Mpz1/zKc9f8ynPX/OqPt/zKc9f8ynPX/Mpz1/zKc9f8ynPX/Mpz1/zai9v8ynPX/S6v2/7rd+v/+/v7//v7+//7+/v/+/v7//Pv3//7+/v/49/b//v7+//7+/v/+/v7//v7+//j39v/+/v7/9vb2//7+/v/+/v7/8vX7//z79//+/v7//v7+/9Pc7P9Cktr/Mpz1/zKc9f8ynPX/Mpz1/zKc9f8ynPX/Mpz1/y6Z9P8umfT/Lpn0/y6Z9P8tk/P/Mpz1/zCW9P8ynPX/Lpn0/zKc9f8tk/P/Mpz1/y2T8/8ynPX/MJb0/y2T8/8umfT/LZPz/y2T8/8tk/P/LZPz/y+P+f8tk/P/LZPz/zme+/9LtP3/6/X+/////043pfglLZPz/y2T8/8tk/P/Lpn0/zCW9P8wlvT/L4/5/zCW9P8tk/P/Mpz1/zOU+v8ynPX/MJb0/y6Z9P8umfT/Lpn0/zKc9f8ynPX/Mpz1/zCW9P8wlvT/Mpz1/zKc9f8ynPX/MJb0/zKc9f8ynPX/Mpz1/zKc9f82ovb/Mpz1/zKc9f82ovb/Mpz1/zKc9f8ynPX/NqL2/zKc9f82ovb/Mpz1/zai9v8ynPX/OqPt/zKc9f8ynPX/NqL2/zai9v82ovb/NqL2/zai9v82ovb/NqL2/zai9v82ovb/Mpz1/zqj7f9quPf/2u38//z79//+/v7//v7+//z79//+/v7/9Pr+//7+/v/+/v7//Pv3//T6/v/49/b/+Pf2//7+/v/+/v7//v7+//7+/v/8+/f//v7+//7+/v/+/v7/7fD1/1mW2v8umfT/Mpz1/zKc9f8ynPX/Mpz1/zKc9f8ynPX/Mpz1/zKc9f8ynPX/Mpz1/zKc9f8ynPX/Mpz1/zKc9f8ynPX/Mpz1/zCW9P8ynPX/LZPz/zKc9f8wlvT/MJb0/zKc9f8wlvT/LZPz/y6Z9P8zlPr/LZPz/zKc9f8slPf/LZPz/zme+/9as/r/7fn//////yUAAAAALZLy8i2T8/8zlPr/LZPz/y2T8/8ynPX/Lpn0/y6Z9P8ynPX/MJb0/zCW9P8zlPr/Lpn0/zKc9f8ynPX/Lpn0/zKc9f8ynPX/Mpz1/zKc9f8ynPX/Mpz1/zKc9f8ynPX/Mpz1/zai9v8ynPX/Mpz1/zKc9f82ovb/Mpz1/zKc9f8ynPX/Mpz1/zKc9f82ovb/NqL2/zKc9f8ynPX/NqL2/zai9v86o+3/NqL2/zai9v82ovb/NqL2/zai9v82ovb/NqL2/zai9v82ovb/NqL2/zai9v8ynPX/PKjv/5fK+P/t8PX//v7+//j39v/+/v7//v7+//7+/v/8+/f//Pv3//7+/v/49/b//v7+//j39v/+/v7//v7+//7+/v/+/v7/9vb2//7+/v/+/v7//v7+//7+/v/49/b/hqnY/yqS7f8ynPX/NqL2/zKc9f82ovb/Mpz1/zKc9f8ynPX/Mpz1/zai9v8ynPX/Mpz1/zKc9f8ynPX/Mpz1/zKc9f8ynPX/Lpn0/zKc9f8ynPX/Mpz1/zKc9f8ynPX/LZPz/zKc9f8tk/P/Lpn0/y6Z9P8tk/P/MJb0/y2T8/8umfT/LZPz/0io+P9rxP7//v7+8gAAAAAAAAAAL5r0vy6Z9P8umfT/Lpn0/zKc9f8wlvT/MJb0/y6Z9P8wlvT/Mpz1/zKc9f8ynPX/Mpz1/zKc9f8ynPX/Mpz1/zKc9f8ynPX/MJb0/zai9v8ynPX/NqL2/zKc9f82ovb/Mpz1/zKc9f82ovb/NqL2/zKc9f82ovb/Mpz1/zai9v82ovb/NqL2/zai9v82ovb/NqL2/zai9v82ovb/NqL2/zai9v8ynPX/NqL2/zKc9f82ovb/NqL2/zai9v82ovb/NqL2/zai9v82ovb/Mpz1/zai9v93tvT/1OT1//7+/v/+/v7//v7+//T6/v/8+/f/9vb2//7+/v/+/v7//v7+//z79//+/v7//v7+//7+/v/8+/f/9Pr+//7+/v/49/b//v7+//7+/v/8+/f//v7+//7+/v+VtN3/KpLt/zai9v82ovb/Mpz1/zai9v8ynPX/NqL2/zai9v82ovb/NqL2/zKc9f8ynPX/NqL2/zKc9f8ynPX/Mpz1/zKc9f8wlvT/Mpz1/zKc9f8ynPX/M5T6/zKc9f8ynPX/Lpn0/y6Z9P8ynPX/Mpz1/y2T8/8ynPX/Mpz1/y2T8/8tk/P/NJ37/zqm+f+MzPz/////vwAAAAAAAAAANJz7iS6Z9P8umfT/NJ37/y2T8/8ynPX/NJ37/y6Z9P8ynPX/Mpz1/zKc9f8ynPX/Mpz1/zKc9f82ovb/Mpz1/zKc9f82ovb/Mpz1/zKc9f8ynPX/NqL2/zKc9f82ovb/NqL2/zKc9f8ynPX/NqL2/zai9v82ovb/NqL2/zai9v82ovb/NqL2/zai9v82ovb/NqL2/zai9v82ovb/NqL2/zai9v82ovb/NqL2/zem+P82ovb/NqL2/zai9v82ovb/NqL2/zKc9f88qO//arj3/7rd+v/0+v7//v7+//7+/v/+/v7//v7+//7+/v/+/v7//v7+//7+/v/8+/f//v7+//T6/v/+/v7//v7+//7+/v/8+/f//v7+//7+/v/49/b//v7+//7+/v/+/v7//v7+/6W73f83mOb/NqL2/zai9v82ovb/NqL2/zSd+/82ovb/Mpz1/zai9v82ovb/NqL2/zai9v82ovb/Mpz1/zai9v82ovb/NqL2/zKc9f80nfv/Mpz1/zKc9f8ynPX/Mpz1/zKc9f8ynPX/Mpz1/zSd+/8ynPX/MJb0/zKc9f8ynPX/Lpn0/y6Z9P8tk/P/OZ77/zqm+f+y3v7//f39iQAAAAAAAAAAO6f4Ti6Z9P8umfT/Lpn0/zSd+/8ynPX/Mpz1/zKc9f8ynPX/Mpz1/zKc9f8ynPX/Mpz1/zai9v8ynPX/Mpz1/zKc9f82ovb/NqL2/zai9v82ovb/Mpz1/zai9v82ovb/NqL2/zqj7f82ovb/NqL2/zai9v82ovb/NqL2/zai9v82ovb/NqL2/zai9v85pvf/NqL2/zai9v82ovb/NqL2/zmm9/85pvf/NqL2/zai9v82ovb/NqL2/zyo7/82ovb/NqL2/2q49/+63fr/7fn///z79//+/v7//v7+//7+/v/+/v7/+Pf2//7+/v/+/v7//v7+//7+/v/0+v7//v7+//7+/v/+/v7//v7+//T6/v/+/v7//v7+//7+/v/+/v7/9Pr+//z79//+/v7/wM/o/z2O3v8ynPX/NqL2/zai9v82ovb/NqL2/zai9v82ovb/NqL2/zai9v82ovb/Mpz1/zai9v82ovb/NqL2/zKc9f8ynPX/NqL2/zKc9f82ovb/NqL2/zKc9f82ovb/Mpz1/zKc9f8ynPX/Mpz1/zKc9f8ynPX/NJ37/zKc9f8ynPX/Lpn0/zSd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9v85pvf/NqL2/zai9v82ovb/NqL2/zai9v82ovb/NqL2/zai9v82ovb/NqL2/zKc9f8ynPX/NqL2/zKc9f80nfv/NJ37/zai9v9IqPj/Qa76/9Tx//////8tAAAAAAAAAAAAAAAAAAAAAAAAAAA0nPrPNJ37/zai9v8ynPX/NqL2/zai9v82ovb/NqL2/zai9v85pvf/NqL2/zai9v82ovb/NqL2/zmm9/82ovb/NqL2/zai9v85pvf/Oab3/zmm9/85pvf/Oab3/zem+P83pvj/N6b4/zyo7//H2vX/9Pr+//b29v/0+v7//v7+//7+/v/+/v7//v7+//z79//+/v7//v7+//z79//+/v7//v7+//7+/v/8+/f//v7+//7+/v/+/v7//v7+//7+/v/+/v7/9Pr+//7+/v/+/v7//Pv3//7+/v/+/v7//Pv3//7+/v/+/v7//v7+//7+/v/8+/f//v7+//7+/v/8+/f//v7+//7+/v/+/v7//Pv3/5W03f89jt7/N6b4/zuq9/85pvf/O6r3/zuq9/85pvf/O6r3/zmm9/85pvf/Oab3/zmm9/85pvf/Oab3/zmm9/85pvf/Oab3/zmm9/85pvf/Oab3/zem+P85pvf/NqL2/zai9v85pvf/NqL2/zai9v87qvf/NqL2/zai9v82ovb/NqL2/zem+P82ovb/NqL2/zai9v80nfv/Mpz1/zqm+f9IqPj/W7z9//T6/s8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABBrfl6NqL2/zKc9f83pvj/NJ37/zai9v82ovb/OZ77/zem+P82ovb/NqL2/zmm9/86pvn/NqL2/zmm9/85pvf/O6r3/zai9v85pvf/Oab3/zuq9/85pvf/N6b4/zuq9/83pvj/O6r3/zuq9//Z5vn//v7+//7+/v/+/v7//v7+//7+/v/+/v7//v7+//7+/v/+/v7//v7+//7+/v/+/v7//v7+//7+/v/+/v7//v7+//7+/v/+/v7//Pv3//7+/v/+/v7//v7+//7+/v/+/v7//v7+//7+/v/+/v7//v7+//7+/v/+/v7//v7+//7+/v/+/v7//v7+//7+/v/+/v7//v7+//7+/v/y9fv/hqnY/zeY5v83rf//O6r3/zuq9/87qvf/O6r3/zuq9/86pvn/O6r3/zuq9/87qvf/O6r3/zuq9/87qvf/O6r3/zmm9/87qvf/Oab3/zem+P87qvf/Oab3/zmm9/87qvf/NqL2/zmm9/85pvf/Oqb5/zai9v82ovb/NqL2/zai9v82ovb/NqL2/zme+/80nfv/Mpz1/zai9v82ovb/NqL2/0io+P88sf3/ktT///39/XoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQt/8gNqL2/zai9v82ovb/NqL2/zai9v82ovb/NqL2/zqm+f82ovb/N6b4/zmm9/85pvf/Oab3/zmm9/85pvf/Oab3/zuq9/85pvf/Oab3/zuq9/87qvf/N6b4/zuq9/83pvj/O6r3/zuq9//Z5vn//v7+//7+/v/+/v7//v7+//7+/v/+/v7//v7+//7+/v/+/v7//v7+//7+/v/+/v7//v7+//7+/v/+/v7//v7+//7+/v/+/v7//v7+//7+/v/+/v7//v7+//7+/v/+/v7//v7+//7+/v/+/v7//v7+//7+/v/+/v7//v7+//7+/v/+/v7//v7+//7+/v/+/v7//v7+/93l8v9mmNj/N5jm/z2s+f87qvf/RKv2/zuq9/87qvf/O6r3/zuq9/87qvf/O6r3/zuq9/87qvf/O6r3/zuq9/87qvf/O6r3/zmm9/87qvf/O6r3/zqm+f87qvf/Oab3/zmm9/85pvf/O6r3/zuq9/82ovb/O6r3/zqm+f85pvf/NqL2/zqm+f82ovb/NqL2/zem+P83pvj/NqL2/zai9v82ovb/Oqb5/0io+P89rPn/xen//////yAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOqf5sDai9v82ovb/N6b4/zem+P85pvf/Oab3/zai9v85pvf/Oab3/zmm9/85pvf/Oab3/zmm9/85pvf/O6r3/zuq9/85pvf/O6r3/zmm9/85pvf/O6r3/zuq9/87qvf/O6r3/z+w9v/U5PX//v7+//7+/v/+/v7//v7+//7+/v/+/v7//v7+//7+/v/+/v7//v7+//7+/v/+/v7//v7+//7+/v/+/v7//v7+//7+/v/+/v7//v7+//7+/v/+/v7//v7+//7+/v/+/v7//v7+//7+/v/+/v7//v7+//7+/v/+/v7//v7+//7+/v/+/v7//v7+//7+/v/+/v7/vMzl/0yR3P86o+3/O6r3/z2s+f89rPn/O6r3/zuq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//+AAAAAAAAP////+AD////+AAAAAAAAA/////gA////+AAAAAAAAAD////4AP///+AAAAAAAAAAP///+AD////AAAAAAAAAAB////gA////AAAAAAAAAAAH///4AP///gAAAAAAAAAAA///+AD///wAAAAAAAAAAAH///gA///wAAAAAAAAAAAAf//4AP//4AAAAAAAAAAAAD//+AD//8AAAAAAAAAAAAAf//gA//+AAAAAAAAAAAAAD//4AP//AAAAAAAAAAAAAAf/+AD//gAAAAAAAAAAAAAD//gA//wAAAAAAAAAAAAAAf/4AP/4AAAAAAAAAAAAAAD/+AD/+AAAAAAAAAAAAAAA//gA//AAAAAAAAAAAAAAAH/4AP/gAAAAAAAAAAAAAAA/+AD/wAAAAAAAAAAAAAAAH/gA/8AAAAAAAAAAAAAAAB/4AP+AAAAAAAAAAAAAAAAP+AD/AAAAAAAAAAAAAAAAB/gA/wAAAAAAAAAAAAAAAAf4AP4AAAAAAAAAAAAAAAAD+AD+AAAAAAAAAAAAAAAAA/gA/AAAAAAAAAAAAAAAAAH4APwAAAAAAAAAAAAAAAAB+AD4AAAAAAAAAAAAAAAAAPgA+AAAAAAAAAAAAAAAAAD4APAAAAAAAAAAAAAAAAAAeADwAAAAAAAAAAAAAAAAAHgA4AAAAAAAAAAAAAAAAAA4AOAAAAAAAAAAAAAAAAAAOADgAAAAAAAAAAAAAAAAADgAwAAAAAAAAAAAAAAAAAAYAMAAAAAAAAAAAAAAAAAAGADAAAAAAAAAAAAAAAAAABgAgAAAAAAAAAAAAAAAAAAIAIAAAAAAAAAAAAAAAAAACACAAAAAAAAAAAAAAAAAAAgAgAAAAAAAAAAAAAAAAAAIAIAAAAAAAAAAAAAAAAAACAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAAAAAAAAAAAAAAAAAAgAgAAAAAAAAAAAAAAAAAAIAIAAAAAAAAAAAAAAAAAACACAAAAAAAAAAAAAAAAAAAgAgAAAAAAAAAAAAAAAAAAIAMAAAAAAAAAAAAAAAAAAGADAAAAAAAAAAAAAAAAAABgAwAAAAAAAAAAAAAAAAAAYAOAAAAAAAAAAAAAAAAAAOADgAAAAAAAAAAAAAAAAADgA4AAAAAAAAAAAAAAAAAA4APAAAAAAAAAAAAAAAAAAeADwAAAAAAAAAAAAAAAAAHgA+AAAAAAAAAAAAAAAAAD4APgAAAAAAAAAAAAAAAAA+AD8AAAAAAAAAAAAAAAAAfgA/AAAAAAAAAAAAAAAAAH4AP4AAAAAAAAAAAAAAAAD+AD+AAAAAAAAAAAAAAAAA/gA/wAAAAAAAAAAAAAAAAf4AP8AAAAAAAAAAAAAAAAH+AD/gAAAAAAAAAAAAAAAD/gA/8AAAAAAAAAAAAAAAB/4AP/AAAAAAAAAAAAAAAAf+AD/4AAAAAAAAAAAAAAAP/gA//AAAAAAAAAAAAAAAH/4AP/4AAAAAAAAAAAAAAD/+AD/+AAAAAAAAAAAAAAA//gA//wAAAAAAAAAAAAAAf/4AP/+AAAAAAAAAAAAAAP/+AD//wAAAAAAAAAAAAAH//gA//+AAAAAAAAAAAAAD//4AP//wAAAAAAAAAAAAB//+AD//+AAAAAAAAAAAAA///gA///wAAAAAAAAAAAAf//4AP///AAAAAAAAAAAAf//+AD///4AAAAAAAAAAAP///gA////AAAAAAAAAAAH///4AP///8AAAAAAAAAAH///+AD////gAAAAAAAAAD////gA////+AAAAAAAAAD////4AP////4AAAAAAAAD////+AD/////gAAAAAAAD/////gA/////+AAAAAAAD/////4AP/////4AAAAAAD/////+AD//////wAAAAAH//////gA///////gAAAAP//////4AP///////wAAB///////+AA=");
    background-size: 70% auto
}

.fixed-box .action-github {
    background-repeat: no-repeat;
    background-position: 50%;
    background-image: url("data:image/png;base64,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");
    background-size: 70% auto
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

.filter-row {
  display: flex;
  align-items: center;
}

.filter-cell {
  font-size: 14px;
  background-color: rgba(255, 255, 255, 0.6);
  padding: 4px 16px;
  display: flex;
  align-items: center;
  text-align: left;
}

.filter-cell .lbl {
  cursor: pointer;
  margin-left: 12px;
}

.filter-cell .desc {
  font-size: 12px;
  color: #999;
  display: block;
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
