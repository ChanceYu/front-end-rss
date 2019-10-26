<template>
  <div class="container">
    <div class="action-top" @click="toTop"><van-icon name="arrow-up" /></div>

    <van-popup v-model="showCate" position="left" class="search-modal">
      <van-cell-group title="文章来源">
        <van-cell
          v-for="(item, index) in rss"
          :key="index"
          :title="item.title"
          is-link
          @click="handlerCate(item)"
        />
      </van-cell-group>
      <van-cell-group title="文章分类">
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
      @clear="onClear"
      class="search-box"
      :class="{ active: !!searchCate }"
    >
      <div slot="label" class="action-cate" @click="showCate = true"><van-icon name="bars" /></div>
      <div slot="action" class="action-btn" @click="onSearch">搜索</div>
    </van-search>

     <div class="result-box">

       <div class="empty" v-if="!results.length">
         <van-icon name="info-o" />
         <div class="title">没有搜索到文章，换个关键词试试<br />或者选择<span class="cate" @click="showCate = true">来源分类</span></div>
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
import links from '../../../data/links.json'
import rss from '../../../data/rss.json'
import tags from '../../../data/tags.json'

const sortArray = (arr) => {
  return arr.sort((a, b) => {
    return a.date < b.date ? 1 : -1
  })
}

let results = []
let rssMap = {}
let tagsMap = {}

links.forEach((rssItem) => {
  const articles = rssItem.items.map((item) => {
    item.rss = rssItem.rss
    item.rssTitle = rssItem.title
    item.rssLink = rssItem.link

    tags.forEach((tagItem) => {
      if ((new RegExp(tagItem.keywords, 'gi')).test(item.title)) {
        tagsMap[tagItem.tag] = tagsMap[tagItem.tag] || []
        tagsMap[tagItem.tag].push(item)
        tagsMap[tagItem.tag] = sortArray(tagsMap[tagItem.tag])
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
      searchValue: 'react',
      searchCate: '',
      showCate: false,
      loading: true,
      rss,
      tags,
      results: []
    }
  },
  watch: {
    searchValue () {
      this.handlerSearch()
    }
  },
  methods: {
    toTop () {
      window.scrollTo(0, 0)
    },
    handlerCate (item) {
      let label = ''
      let list = []
      if (item.tag) {
        label = '分类:' + item.tag
        list = tagsMap[item.tag]
      } else {
        label = '来源:' + item.title
        list = rssMap[item.title]
      }
      this.searchValue = label
      this.searchCate = {
        label,
        list
      }
      this.showCate = false
    },
    handlerSearch (trigger) {
      const handler = () => {
        if (this.searchCate) {
          if (this.searchValue === this.searchCate.label) {
            this.results = this.searchCate.list
          } else {
            this.searchCate = ''
            handler()
          }

          return
        }
        if (this.searchValue) {
          let arr = []
          results.forEach((item) => {
            const reg = new RegExp(this.searchValue, 'gi')
            if (reg.test(item.title)) {
              arr.push({
                ...item,
                sotitle: item.title.replace(reg, `<span class="red">${this.searchValue}</span>`)
              })
            }
          })

          this.results = [...arr]
        } else {
          this.results = [...results]
        }
      }

      if (trigger) {
        handler()
      } else {
        clearTimeout(this.timer)
        this.timer = setTimeout(handler, 100)
      }

      window.scrollTo(0, 0)
    },
    onSearch (value) {
    },
    onClear () {
      this.searchCate = ''
      this.results = [...results]
    }
  },
  mounted () {
    this.handlerSearch(true)
  }
}
</script>

<style lang="scss">
.container{
  width: 70%;
  margin: 0 auto;
}
.action-top{
  position: fixed;
  bottom: 100px;
  right: 100px;
  background: #eee;
  width: 40px;
  height: 40px;
  line-height: 40px;
  cursor: pointer;
  z-index: 9;
  .van-icon{
    vertical-align: middle;
  }
}
.search-modal{
  width: 24%;
  height: 100%;
  .van-cell-group__title{
    font-size: 14px;
    font-weight: bold;
    color: #333;
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
      color: #f44336;
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
  .action-top{
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
