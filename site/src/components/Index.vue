<template>
  <div class="page-wrap">
    <!-- PC：左右两列居中贴在一起，左侧 sticky -->
    <div class="layout-center">
    <!-- 左侧筛选：PC 常驻左列，移动端为抽屉，复用同一 DOM -->
    <aside class="sidebar search-modal" :class="{ 'sidebar-open': showCate }">
      <van-cell-group class="tag-group filter-tag-group" :class="{ 'filter-row-sticky': true }">
        <div class="filter-row">
          <div class="filter-cell" @click="changeSkill($event)">
            <van-switch v-model="matchSkill" size="14" />
            <span class="lbl">只展示技术相关<span class="desc">仅根据标题匹配</span></span>
          </div>
        </div>
      </van-cell-group>
      <van-cell-group class="tag-group">
        <div slot="title" class="title-box"><van-icon name="hot-o" />热词搜索</div>
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
    </aside>

    <!-- 移动端抽屉遮罩 -->
    <div v-show="showCate" class="sidebar-overlay" @click="showCate = false" aria-hidden="true"></div>

    <!-- 右侧主内容 -->
    <div class="main">
      <div class="container">
        <div class="fixed-box">
          <a class="action-feed" href="/atom.xml" title="Feed 订阅"></a>
          <a class="action-github" href="https://github.com/ChanceYu/front-end-rss" title="GitHub"></a>
          <div class="action-top" @click="toTop" title="返回顶部"><van-icon name="arrow-up" /></div>
        </div>

    <van-search
      v-model="searchValue"
          placeholder="搜索文章..."
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
            <div v-for="(item, index) in skeletons" :key="index" class="skeleton-item">
              <van-skeleton title title-width="92%" :row="1" :row-width="['55%']" />
            </div>
      </template>

       <div class="empty" v-if="isLoad && !results.length">
         <van-icon name="info-o" />
         <div class="title">没有搜索到文章<br /><span class="cate" @click="showCate = true">手动筛选</span></div>
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
          <van-divider v-if="results.length && isBusy && !isSearching">没有更多了~</van-divider>
     </div>
      </div>
    </div>
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

const today = dayjs().valueOf()
const ranges = [{
  title: '最近三天',
  dates: [dayjs().subtract(3, 'days').startOf('day').valueOf(), today]
}, {
  title: '最近一周',
  dates: [dayjs().subtract(7, 'days').startOf('day').valueOf(), today]
}, {
  title: '最近一月',
  dates: [dayjs().subtract(31, 'days').startOf('day').valueOf(), today]
}]

const rss = window.RSS_DATA
const tags = window.TAGS_DATA
const hotwords = window.HOTWORDS_DATA
const PAGE_SIZE = window.PAGE_SIZE || 200
const PAGE_COUNT = window.PAGE_COUNT || 1

let results = []

export default {
  name: 'Index',
  data () {
    return {
      searchValue: '',
      showCate: false,
      matchSkill: !!localStorage.getItem('matchSkill'),
      hotwords,
      ranges,
      rss: rss || [],
      tags: tags || [],
      pageNo: 1,
      pageSize: 20,
      isBusy: true,
      allList: [],
      results: [],
      isLoad: false,
      isSearching: false,
      skeletons: [1, 2, 3, 4, 5, 6, 7, 8],
      // 索引与全量数据
      textIndex: null,
      sourceIndex: null,
      categoryIndex: null,
      articlesData: null
    }
  },
  watch: {
    matchSkill () {
      if (this.searchValue) {
        // 有搜索词时重新搜索
        this.handlerSearch(false)
      } else {
        // 无搜索词时重新过滤
        this.filterBySkill()
      }
    }
  },
  methods: {
    toTop () {
      window.scrollTo(0, 0)
    },

    // 从 articlesData 取第 pageNum 页的文章对象（用于列表与后台追加）
    getPageArticles (pageNum) {
      if (!this.articlesData || pageNum < 0) return []
      const start = pageNum * PAGE_SIZE
      if (start >= this.articlesData.length) return []
      const end = Math.min(start + PAGE_SIZE, this.articlesData.length)
      return this.articlesData.slice(start, end).map((row, i) => ({
        title: row[0],
        rssTitle: row[1],
        link: row[2],
        date: row[3],
        id: start + i
      }))
    },

    // 初始化：先拉取 articles.json 与索引，再渲染第一页
    async initLoad () {
      await this.preloadIndexes()
      const firstPageData = this.getPageArticles(0)
      this.allList = firstPageData
      results = [...firstPageData]
      this.filterBySkill()
      this.isLoad = true
      this.backgroundLoadPages()
    },

    // 后台按页追加到 results（静默加载，不重置分页）
    async backgroundLoadPages () {
      for (let i = 1; i < PAGE_COUNT; i++) {
        await new Promise(resolve => setTimeout(resolve, 300))
        const pageData = this.getPageArticles(i)
        if (pageData.length > 0) {
          results = [...results, ...pageData]
          if (!this.isSearching && !this.searchValue) {
            this.updateAllListSilently()
          }
        }
      }
    },

    // 静默更新 allList，不重置分页状态
    updateAllListSilently () {
      if (!this.matchSkill) {
        this.allList = [...results]
      } else {
        this.allList = results.filter(item => {
          return tags.some(tag => {
            if (tag.skill && tag.keywords) {
              return new RegExp(tag.keywords, 'gi').test(item.title)
            }
            return false
          })
        })
      }
      // 不重置 pageNo 和 this.results，让无限滚动自然加载更多
    },

    // 预加载索引与全量文章二维数组 [[title, rssTitle, link, date], ...]
    async preloadIndexes () {
      try {
        const [sourceIdx, categoryIdx, textIdx, articlesRows] = await Promise.all([
          fetch('/data/source-index.json', { cache: 'no-store' }).then(r => r.json()).catch(() => null),
          fetch('/data/category-index.json', { cache: 'no-store' }).then(r => r.json()).catch(() => null),
          fetch('/data/text-index.json', { cache: 'no-store' }).then(r => r.json()).catch(() => null),
          fetch('/data/articles.json', { cache: 'no-store' }).then(r => r.json()).catch(() => null)
        ])
        this.sourceIndex = sourceIdx
        this.categoryIndex = categoryIdx
        this.textIndex = textIdx
        this.articlesData = Array.isArray(articlesRows) ? articlesRows : null
      } catch (e) {
        console.error('Failed to preload indexes:', e)
      }
    },

    // 根据文章在 articles 数组中的下标转为 { title, rssTitle, link, date, id }
    indexToArticle (i) {
      if (!this.articlesData || !this.articlesData[i]) return null
      const [title, rssTitle, link, date] = this.articlesData[i]
      return { title, rssTitle, link, date, id: i }
    },

    // 根据技能筛选过滤数据
    filterBySkill () {
      if (!this.matchSkill) {
        this.allList = [...results]
      } else {
        // 只展示技术相关文章
        this.allList = results.filter(item => {
          return tags.some(tag => {
            if (tag.skill && tag.keywords) {
              return new RegExp(tag.keywords, 'gi').test(item.title)
            }
            return false
          })
        })
      }
      // 重置分页并加载更多
      this.pageNo = 1
      this.results = []
      this.loadMore()
    },

    loadMore () {
      const allLen = this.allList.length
      const resultsLen = this.results.length
      const reachedEnd = resultsLen > 0 && allLen > 0 && this.results[resultsLen - 1].link === this.allList[allLen - 1].link

      if (allLen === 0) {
        this.isBusy = true
        return
      }
      if (reachedEnd) {
        this.isBusy = true
        return
      }
      this.results = this.allList.slice(0, this.pageNo * this.pageSize)
      this.pageNo += 1
      this.isBusy = this.pageNo * this.pageSize >= allLen && (this.results[this.results.length - 1].link === this.allList[allLen - 1].link)
    },

    async handlerCate (item) {
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

      if (item.tag && item.filename === 'other') {
        this.matchSkill = false
        localStorage.removeItem('matchSkill')
      }

      this.showCate = false
      await this.handlerSearch()
      await this.$nextTick()
      this.focusInput()
    },

    async handlerSearch (reset = true) {
      const value = this.searchValue
      const matches = value.match(/^\[(时间|来源|分类)\]\s(.+)/)
      const matchType = matches && matches[1]
      const matchValue = matches && matches[2]

      this.isSearching = !!value

      if (value) {
        let arr = []

        if (matchType === '时间') {
          arr = await this.searchByTime(matchValue)
        } else if (matchType === '来源') {
          arr = await this.searchBySource(matchValue)
        } else if (matchType === '分类') {
          arr = await this.searchByCategory(matchValue)
        } else {
          // 文本搜索（优先用索引，立即展示）
          arr = await this.searchByText(value)
        }

        if (this.matchSkill && arr.length) {
          arr = arr.filter(item => tags.some(tag => tag.skill && tag.keywords && new RegExp(tag.keywords, 'gi').test(item.title)))
        }
        this.allList = [...arr]
      } else {
        this.isSearching = false
        // 无搜索词时，重新应用技能过滤
        if (!this.matchSkill) {
          this.allList = [...results]
        } else {
          this.allList = results.filter(item => {
            return tags.some(tag => {
              if (tag.skill && tag.keywords) {
                return new RegExp(tag.keywords, 'gi').test(item.title)
              }
              return false
            })
          })
        }
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
      }

      this.pageNo = 1
      this.results = []
      this.loadMore()
    },

    // 按时间搜索（按时间戳比较，范围开始为当天 00:00:00，结束为今天 23:59:59.999）
    async searchByTime (rangeName) {
      const rangeItem = ranges.find(r => r.title === rangeName)
      if (!rangeItem) return []

      const [startDate, endDate] = rangeItem.dates

      if (startDate == null) return []
      const rangeStartTs = startDate
      const rangeEndTs = endDate
      console.log(rangeName)
      console.log(ranges)
      console.log(startDate)
      console.log(endDate)
      console.log(results.filter(item => {
        const itemTs = dayjs(item.date).valueOf()
        return itemTs >= rangeStartTs && itemTs <= rangeEndTs
      }))
      return results.filter(item => {
        const itemTs = dayjs(item.date).valueOf()
        return itemTs >= rangeStartTs && itemTs <= rangeEndTs
      })
    },

    // 按来源搜索（索引中为 index 数组，需从 articlesData 解析为文章对象）
    async searchBySource (sourceName) {
      if (this.sourceIndex && this.sourceIndex[sourceName] && this.articlesData) {
        const indices = this.sourceIndex[sourceName]
        return indices.map(i => this.indexToArticle(i)).filter(Boolean)
      }
      return results.filter(item => item.rssTitle === sourceName)
    },

    // 按分类搜索（索引中为 index 数组，需从 articlesData 解析为文章对象）
    async searchByCategory (categoryName) {
      if (this.categoryIndex && this.categoryIndex[categoryName] && this.articlesData) {
        const indices = this.categoryIndex[categoryName]
        return indices.map(i => this.indexToArticle(i)).filter(Boolean)
      }
      const tagItem = tags.find(t => t.tag === categoryName)
      if (!tagItem || !tagItem.keywords) {
        return categoryName === '其它'
          ? results.filter(item => !tags.some(t => t.keywords && new RegExp(t.keywords, 'gi').test(item.title)))
          : []
      }
      const regex = new RegExp(tagItem.keywords, 'gi')
      return results.filter(item => regex.test(item.title))
    },

    // 文本搜索：优先 text-index 整词；无则用索引分词取并集；再无则在全量 articlesData 上按关键词匹配，避免只搜首屏导致无结果
    async searchByText (keyword) {
      const key = keyword.toLowerCase().trim()
      const addHighlight = (item, val) => {
        let reg = null
        try {
          // eslint-disable-next-line
          reg = new RegExp('(' + String(val).replace(/([?[\]])/g, '\\$1') + ')', 'gi')
        } catch (e) { return item }
        return reg && reg.test(item.title)
          ? { ...item, sotitle: item.title.replace(reg, '<span class="red">$1</span>') }
          : item
      }

      if (this.textIndex && key && Array.isArray(this.textIndex[key]) && this.articlesData) {
        const indices = this.textIndex[key]
        if (indices.length === 0) return []
        const articles = indices
          .map(i => this.indexToArticle(i))
          .filter(Boolean)
        articles.sort((a, b) => (a.date < b.date ? 1 : -1))
        if (this.matchSkill) {
          const skillFilter = (item) => tags.some(tag => tag.skill && tag.keywords && new RegExp(tag.keywords, 'gi').test(item.title))
          return articles.filter(skillFilter).map(item => addHighlight(item, keyword))
        }
        return articles.map(item => addHighlight(item, keyword))
      }

      if (this.articlesData && this.articlesData.length) {
        let reg = null
        try {
          reg = new RegExp('(' + keyword.replace(/([?[\]])/g, '\\$1') + ')', 'gi')
        } catch (e) {}
        const arr = []
        this.articlesData.forEach((row, i) => {
          const title = row[0]
          if (!title) return
          if (reg && reg.test(title)) {
            const item = this.indexToArticle(i)
            if (item) arr.push({ ...item, sotitle: title.replace(reg, '<span class="red">$1</span>') })
          }
        })
        arr.sort((a, b) => (a.date < b.date ? 1 : -1))
        if (this.matchSkill && arr.length) {
          const skillFilter = (item) => tags.some(tag => tag.skill && tag.keywords && new RegExp(tag.keywords, 'gi').test(item.title))
          return arr.filter(skillFilter).map(item => addHighlight(item, keyword))
        }
        return arr.map(item => addHighlight(item, keyword))
      }

      const arr = []
      const searchData = this.matchSkill ? this.allList : results
      let reg = null
      try {
        reg = new RegExp('(' + keyword.replace(/([?[\]])/g, '\\$1') + ')', 'gi')
      } catch (e) {}
      const matchSplit = (item, val) => {
        const exist = item.title.split(val)
        if (exist.length > 1) {
          arr.push({ ...item, sotitle: exist.join(`<span class="red">${val}</span>`) })
          return true
        }
        return false
      }
      searchData.forEach((item) => {
        if (reg && reg.test(item.title)) {
          arr.push({ ...item, sotitle: item.title.replace(reg, '<span class="red">$1</span>') })
        } else if (matchSplit(item, keyword)) {
        } else if (matchSplit(item, keyword.toLowerCase())) {
        } else if (matchSplit(item, keyword.toUpperCase())) {
        }
      })
      return arr
    },
    focusInput () {
      const searchInput = document.querySelector('.search-box input')
      if (searchInput) {
        searchInput.focus()
      }
    },
    async onSearch () {
      await this.handlerSearch()
      await this.$nextTick()
      this.focusInput()
    },
    onClear () {
      this.handlerSearch()
    },
    changeSkill (e) {
      if (e && e.target && e.target.closest && e.target.closest('.van-switch')) return
      window.scrollTo(0, 0)
      this.matchSkill = !this.matchSkill
      if (this.matchSkill) {
        localStorage.setItem('matchSkill', 'true')
      } else {
        localStorage.removeItem('matchSkill')
      }
    }
  },
  async mounted () {
    const { q } = this.$route.query

    this.searchValue = q || ''

    // 先加载数据和索引，再执行带 q 的搜索，避免索引未就绪时搜索结果为空
    await this.initLoad()

    if (this.searchValue) {
      await this.handlerSearch()
    }
  }
}
</script>

<style>
/* 整页：PC 左右两列居中，移动端单列 + 抽屉 */
.page-wrap {
    min-height: 100vh;
    width: 100%;
}

/* PC：左右两列在页面中间，中间留出与 fixed-box 一致的间距 */
.layout-center {
    display: flex;
    gap: .75rem;
    max-width: calc(260px + .75rem + 720px);
    width: 100%;
    margin: 0 auto;
    min-height: 100vh
}

/* 左侧筛选：PC 为 fixed 左列、白底、高度 100vh、内部局部滚动 */
.sidebar.search-modal {
    flex-shrink: 0;
    width: 260px;
    height: 100vh;
    max-height: 100vh;
    overflow-y: auto;
    position: fixed;
    left: max(0px, calc((100vw - 260px - 720px - .75rem) / 2));
    top: 0;
    padding-top: env(safe-area-inset-top, 0);
    box-sizing: border-box;
    z-index: 8;
    scrollbar-width: thin;
    scrollbar-color: #cbd5e1 transparent;
}

.sidebar.search-modal::-webkit-scrollbar {
    width: 6px;
}

.sidebar.search-modal::-webkit-scrollbar-track {
    background: transparent;
}

.sidebar.search-modal::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 3px;
}

.sidebar.search-modal::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
}

.sidebar-overlay {
    display: none
}

.main {
    flex: 1;
    min-width: 0;
    display: flex;
    justify-content: center;
    margin-left: calc(260px + .75rem)
}

.container {
    width: 100%;
    margin: 0 auto;
    max-width: 720px;
    box-sizing: border-box;
    padding: 0 .125rem
}

.fixed-box {
    position: fixed;
    bottom: 6rem;
    right: 1rem;
    z-index: 9;
    display: flex;
    flex-direction: column;
    gap: .5rem
}

.fixed-box .action-feed,.fixed-box .action-github,.fixed-box .action-top {
    width: 2.25rem;
    height: 2.25rem;
    line-height: 2.25rem;
    display: block;
    cursor: pointer;
    border-radius: 8px;
    overflow: hidden;
    position: relative;
    left: 0;
    background-color: #ffffff;
    box-shadow: 0 2px 8px rgba(0,0,0,.1);
    transition: all 0.2s
}

.fixed-box .action-feed:hover,.fixed-box .action-github:hover,.fixed-box .action-top:hover {
    background-color: #f1f5f9;
    box-shadow: 0 4px 12px rgba(0,0,0,.12);
    transform: translateY(-2px)
}

.fixed-box .action-feed {
    background-repeat: no-repeat;
    background-position: 50%;
    background-image: url(~@/assets/icon-feed.svg);
    background-size: 70% auto
}

.fixed-box .action-github {
    background-repeat: no-repeat;
    background-position: 50%;
    background-image: url(~@/assets/icon-github.svg);
    background-size: 70% auto
}

.fixed-box .action-top {
    color: #171717;
    display: flex;
    align-items: center;
    justify-content: center
}

.fixed-box .action-top .van-icon {
    font-weight: 700
}

.search-modal {
    background: #fff;
}

.search-modal .title-box {
    display: flex;
    align-items: center;
    min-height: 2.25rem;
    padding: 0 .75rem 0 1rem;
    margin: 0;
    font-size: .8125rem;
    font-weight: 600;
    color: #1f2937;
    background: #f3f4f6;
    line-height: 1;
}

.search-modal .title-box .van-icon {
    font-size: 1rem;
    margin-right: .5rem;
    color: #64748b;
    flex-shrink: 0;
    display: flex;
    align-items: center
}

.search-modal .tag-group {
    padding: .5rem 0 .5rem 1rem
}

.search-modal .filter-tag-group {
    padding: .1rem .5rem .1rem 1rem;
}

.search-modal .van-tag {
    background: #fff;
    color: #374151;
    margin: .25rem .25rem .25rem 0;
    cursor: pointer;
    padding: .3rem .6rem;
    font-size: .8125rem;
    border: 0.0625rem solid #f3f4f6;
    border-radius: 6px;
    transition: all 0.2s
}

.search-modal .van-tag:hover {
    background: #f8fafc;
    border-color: #f8fafc;
    color: #1a89fa;
    transform: translateY(-1px)
}

.search-modal .van-cell-group__title {
    padding: 0;
    background: transparent
}

.search-modal .van-cell {
    font-size: .8125rem;
    color: #1f2937;
    text-align: left;
    cursor: pointer;
    background: transparent;
    transition: background 0.2s;
    padding: 0.5rem 1rem;
}

.search-modal .van-cell:active,.search-modal .van-cell:hover {
    background: #f8fafc;
    color: #1a89fa;
}

.search-modal .van-cell:not(:last-child):after {
    border-bottom-color: #f1f5f9
}

.search-modal .van-cell__label {
    font-size: .75rem;
    color: #94a3b8;
    word-break: break-all
}

.filter-row {
  display: flex;
  align-items: center
}

.sidebar .van-cell-group.filter-row-sticky {
  position: sticky;
  top: 0;
  z-index: 2;
  box-shadow: 0 1px 3px rgba(0,0,0,.06);
}

.filter-cell {
  font-size: .875rem;
  padding: .5rem 0;
  display: flex;
  align-items: center;
  text-align: left;
  cursor: pointer;
  gap: .75rem;
  flex: 1;
}

.filter-cell .lbl {
    flex: 1;
    min-width: 0
}

.filter-cell .desc {
    font-size: .75rem;
    color: #94a3b8;
    display: block
}

.result-box {
    padding: calc(4.25rem + env(safe-area-inset-top, 0)) 0 2rem;
    background: transparent;
    min-height: 80vh;
    box-sizing: border-box;
    position: relative
}

.result-box .van-loading {
    margin-top: 1rem;
    color: #64748b;
    display: flex;
    justify-content: center;
    align-items: center
}

.result-box .skeleton-item {
    margin-bottom: .5rem;
    background: #ffffff;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0,0,0,.06);
    overflow: hidden;
}

.result-box .skeleton-item .van-skeleton {
    padding: .75rem 1rem
}

.result-box .skeleton-item .van-skeleton__title {
    height: 1.25rem;
    margin-bottom: .25rem;
    border-radius: 4px
}

.result-box .skeleton-item .van-skeleton__row {
    height: 1rem;
    border-radius: 4px;
    margin-top: .5rem;
}

.result-box .empty {
    text-align: center;
    position: absolute;
    left: 0;
    right: 0;
    top: 30%
}

.result-box .empty .van-icon {
    color: #94a3b8;
    font-size: 2.5rem
}

.result-box .empty .title {
    display: block;
    margin-top: .75rem;
    line-height: 1.6;
    color: #64748b;
    font-size: .875rem;
    font-weight: 400
}

.result-box .empty .cate {
    cursor: pointer;
    color: #475569;
    text-decoration: underline;
    display: none;
}

.result-box .item-order {
    color: #94a3b8;
    font-size: .875rem
}

.result-box .item-title {
    margin-bottom: .25rem;
    font-weight: 500;
    color: #334155;
    word-break: break-word;
    overflow-wrap: break-word;
    line-height: 1.5
}

.result-box .item-from {
    display: inline-block;
    margin-left: .5rem;
    font-size: .8125rem;
    color: #94a3b8
}

.result-box .red {
    color: #dc2626
}

.result-box .van-cell {
    font-size: .9375rem;
    color: #334155;
    text-align: left;
    border-bottom: none;
    cursor: pointer;
    background: #ffffff;
    border-radius: 8px;
    margin-bottom: .5rem;
    box-shadow: 0 1px 3px rgba(0,0,0,.06);
    box-sizing: border-box;
    min-width: 0;
    overflow: hidden;
    transition: all 0.2s
}

.result-box .van-cell:active,.result-box .van-cell:hover {
    background: #f8fafc;
    box-shadow: 0 2px 6px rgba(0,0,0,.08);
    transform: translateY(-1px)
}

.result-box .van-cell:active .item-title,.result-box .van-cell:hover .item-title {
    color: #1a89fa;
}

.result-box .item-link:last-of-type .van-cell {
    border-bottom: none
}

.result-box .van-cell:not(:last-child):after {
    border-bottom: none
}

.result-box .van-cell__label {
    font-size: .8125rem;
    color: #94a3b8;
    word-break: break-all
}

.result-box .van-divider {
    margin: 1rem 0;
    color: #cbd5e1
}

.search-box {
    position: fixed;
    top: env(safe-area-inset-top, 0);
    left: max(.5rem, calc((100vw - 260px - 720px - .75rem) / 2 + 260px + .75rem + .125rem));
    width: calc(720px - .25rem);
    max-width: calc(100vw - 260px - .75rem - 1rem - .25rem);
    z-index: 9;
    padding: .5rem 0;
    background: #ffffff;
    border-top-left-radius: 0;
    border-top-right-radius: 0;
    border-bottom-left-radius: 8px;
    border-bottom-right-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,.08);
    box-sizing: border-box;
}

.search-box .van-cell {
    padding: .5rem 0
}

.search-box .van-cell .van-icon {
    font-size: 1rem
}

.search-box .van-cell .van-icon-clear {
    cursor: pointer;
    margin-right: .25rem
}

.search-box input {
    font-size: .9375rem;
    color: #334155
}

.search-box .van-search__action:active {
    background: none
}

.search-box .van-search__content {
    padding: 0;
    background: #f9fafb;
    border-radius: 8px;
    border: none
}

.search-box .van-field__left-icon {
    color: #64748b;
    margin-left: .5rem
}

.search-box .van-search__label {
    color: #475569;
    background: transparent;
    display: flex;
    align-items: center
}

.search-box .van-search__label:active,.search-box .van-search__label:hover {
    color: #334155
}

.search-box .action-cate {
    cursor: pointer;
    padding: 0 .5rem
}

.search-box .action-cate .van-icon {
    vertical-align: middle;
    margin-right: .25rem;
    font-size: 1.125rem
}

.search-box .action-cate .lbl {
    vertical-align: middle;
    font-size: .875rem
}

.search-box .action-btn {
    color: #475569;
    cursor: pointer;
    font-size: .875rem
}

/* PC：左侧筛选常驻，隐藏头部「筛选」按钮；搜索框补左内边距；fixed-box 贴右侧列表且间距与左右区域一致 */
@media screen and (min-width: 801px) {
    .sidebar-overlay {
        display: none !important
    }
    .action-cate {
        display: none
    }
    .search-box {
        padding-left: .5rem
    }
    .fixed-box {
        right: max(.5rem, calc((100vw - 260px - 720px - .75rem) / 2 - .5rem - 2.25rem))
    }
}

@media screen and (max-width: 1200px) and (min-width: 801px) {
    .sidebar.search-modal {
        width: 220px;
        left: max(0px, calc((100vw - 220px - 720px - .75rem) / 2))
    }
    .main {
        margin-left: calc(220px + .75rem)
    }
    .search-box {
        left: max(.5rem, calc((100vw - 220px - 720px - .75rem) / 2 + 220px + .75rem + .125rem));
        width: calc(720px - .25rem)
    }
}

@media screen and (max-width: 800px) {
    .page-wrap {
        display: block
    }

    .layout-center {
        display: block;
        max-width: none
    }

    .sidebar.search-modal {
        position: fixed;
        left: 0;
        top: 0;
        bottom: 0;
        width: 80%;
        max-width: 320px;
        min-height: 100vh;
        transform: translateX(-100%);
        transition: transform .25s ease;
        z-index: 11;
        box-sizing: border-box
    }

    .sidebar.sidebar-open {
        transform: translateX(0)
    }

    .sidebar-overlay {
        display: block;
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,.5);
        z-index: 10
    }

    .main {
        width: 100%;
        margin-left: 0
    }

    .container {
        width: 100%;
        max-width: 100%;
        margin: 0;
        padding: 0 .5rem;
        overflow-x: clip
    }

    .fixed-box {
        bottom: 3rem;
        right: .5rem
    }

    .fixed-box .action-feed,.fixed-box .action-github,.fixed-box .action-top {
        background-color: #fff
    }

    .fixed-box .action-top:hover {
        color: #171717;
        background: #f1f5f9
    }

    .search-box {
        position: fixed;
        top: env(safe-area-inset-top, 0);
        left: 0;
        right: 0;
        width: 100%;
        max-width: 100%;
        margin: 0;
        transform: none;
        padding: .5rem .5rem;
        border-radius: 0
    }

    .search-box .van-search__content,
    .search-box .van-cell,
    .search-box .van-field__body {
        min-width: 0
    }

    .search-box .van-cell {
        padding: .5rem 0
    }

    .search-box .van-field__left-icon {
      margin-left: 0;
    }

    .search-box input {
        font-size: .875rem;
        min-width: 0
    }

    .result-box {
        padding: calc(4rem + env(safe-area-inset-top, 0)) 0 1.5rem
    }

    .result-box .skeleton-item .van-skeleton {
        padding: .5rem .5rem
    }

    .result-box .van-cell {
        font-size: .875rem
    }

    .result-box .van-cell__label {
        font-size: .75rem;
        word-break: break-word;
        overflow-wrap: break-word
    }

    .result-box .empty .cate {
      display: block
    }
}
</style>
