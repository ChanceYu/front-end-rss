<template>
  <van-popup
    :value="visible"
    :position="isMobile ? 'bottom' : 'right'"
    :duration="0.15"
    :style="isMobile
      ? { width: '100%', height: '90%' }
      : { width: '85%', maxWidth: '800px', height: '100%' }"
    @input="$emit('update:visible', $event)"
  >
    <div class="md-viewer">
      <div class="md-viewer__header">
        <div class="md-viewer__close" @click="$emit('update:visible', false)">
          <van-icon name="cross" />
        </div>
        <a :href="articleLink" target="_blank" class="md-viewer__link" v-if="articleLink">
          <van-icon name="link-o" />打开原文
        </a>
        <a
          v-if="toMarkdown && articleHash"
          :href="`/data/articles/${articleHash}/page.md`"
          target="_blank"
          class="md-viewer__link md-viewer__link--md"
        >
          <van-icon name="description" />打开 Markdown
        </a>
        <div
          v-if="toMarkdown"
          class="md-viewer__convert-btn"
          @click="onConvert"
        >
          <van-icon v-if="converting" name="replay" class="md-viewer__converting" />
          <van-icon v-else name="exchange" />
          <span>重新转换</span>
        </div>
      </div>

      <div class="md-viewer__body" ref="body">
        <div v-if="loading" class="md-viewer__loading">
          <van-loading size="24px" color="#1a89fa">加载中...</van-loading>
        </div>
        <div v-else-if="error" class="md-viewer__error">
          <van-icon name="warning-o" />
          <span>加载失败</span>
        </div>
        <div v-else class="md-viewer__content markdown-body" v-html="renderedHtml"></div>
      </div>

      <div class="md-viewer__top" @click="scrollToTop" title="返回顶部">
        <van-icon name="arrow-up" />
      </div>
    </div>
  </van-popup>
</template>

<script>
import { marked } from 'marked'
import { markedHighlight } from 'marked-highlight'
import hljs from 'highlight.js'
import 'github-markdown-css/github-markdown-light.css'
import 'highlight.js/styles/github.css'

marked.use(markedHighlight({
  emptyLangClass: 'hljs',
  langPrefix: 'hljs language-',
  highlight (code, lang) {
    const language = lang && hljs.getLanguage(lang) ? lang : null
    return language
      ? hljs.highlight(code, { language, ignoreIllegals: true }).value
      : hljs.highlightAuto(code).value
  }
}))

marked.setOptions({
  breaks: true,
  gfm: true
})

export default {
  name: 'MarkdownViewer',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    articleHash: {
      type: String,
      default: ''
    },
    articleLink: {
      type: String,
      default: ''
    },
    refreshKey: {
      type: Number,
      default: 0
    }
  },
  data () {
    return {
      isMobile: window.innerWidth <= 800,
      toMarkdown: process.env.TO_MARKDOWN === 'true',
      loading: false,
      error: false,
      converting: false,
      renderedHtml: ''
    }
  },
  watch: {
    articleHash: {
      immediate: true,
      handler (hash) {
        if (hash) {
          this.fetchMarkdown(hash)
        } else {
          this.renderedHtml = ''
          this.error = false
        }
      }
    },
    refreshKey (val, old) {
      if (val !== old && this.articleHash) {
        this.fetchMarkdown(this.articleHash)
      }
    }
  },
  mounted () {
    this._onResize = () => { this.isMobile = window.innerWidth <= 800 }
    window.addEventListener('resize', this._onResize)
  },
  beforeDestroy () {
    window.removeEventListener('resize', this._onResize)
  },
  methods: {
    async onConvert () {
      if (this.converting) return
      this.converting = true
      try {
        await new Promise((resolve, reject) => {
          this.$emit('convert', { resolve, reject })
        })
        await this.fetchMarkdown(this.articleHash)
      } catch (e) {
        console.error('[MarkdownViewer] convert failed:', e)
      } finally {
        this.converting = false
      }
    },

    scrollToTop () {
      if (this.$refs.body) {
        this.$refs.body.scrollTop = 0
      }
    },

    async fetchMarkdown (hash) {
      this.loading = true
      this.error = false
      this.renderedHtml = ''
      try {
        const toMarkdown = process.env.TO_MARKDOWN === 'true'
        const res = await fetch(`/data/articles/${hash}/page.md`, {
          cache: toMarkdown ? 'no-store' : 'default'
        })
        if (!res.ok) throw new Error('not found')
        const raw = await res.text()
        // 去掉顶部 YAML front matter（--- ... ---）
        const stripped = raw.replace(/^---[\s\S]*?---\s*\n?/, '')
        // 将相对图片路径 ./images/xxx 转为绝对路径
        const base = `/data/articles/${hash}`
        const text = stripped.replace(/\(\.\/images\//g, `(${base}/images/`)
        this.renderedHtml = marked.parse(text)
      } catch (e) {
        this.error = true
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style>
.md-viewer {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #fff;
}

.md-viewer__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: .75rem 1rem;
  border-bottom: 1px solid #f1f5f9;
  position: sticky;
  top: 0;
  background: #fff;
  z-index: 1;
  gap: .5rem;
  flex-shrink: 0;
}

.md-viewer__link {
  display: flex;
  align-items: center;
  gap: .3rem;
  font-size: .8125rem;
  color: #64748b;
  text-decoration: none;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.md-viewer__link:hover {
  color: #1a89fa;
}

.md-viewer__link--md {
  color: #7c3aed;
}

.md-viewer__link--md:hover {
  color: #6d28d9;
}

.md-viewer__convert-btn {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: .3rem;
  font-size: .8125rem;
  color: #64748b;
  cursor: pointer;
  padding: .2rem .5rem;
  border-radius: 5px;
  transition: background 0.15s, color 0.15s;
  white-space: nowrap;
  flex-shrink: 0;
}

.md-viewer__convert-btn:hover {
  background: #f1f5f9;
  color: #1a89fa;
}

.md-viewer__converting {
  animation: md-spin .8s linear infinite;
}

@keyframes md-spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}

.md-viewer__link .van-icon {
  flex-shrink: 0;
}

.md-viewer__close {
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  cursor: pointer;
  color: #64748b;
  flex-shrink: 0;
  transition: background 0.15s;
}

.md-viewer__close:hover {
  background: #f1f5f9;
  color: #334155;
}

.md-viewer__body {
  flex: 1;
  overflow-y: auto;
  padding: 1.25rem 1.25rem 2rem;
  overscroll-behavior: contain;
}

.md-viewer__loading,
.md-viewer__error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: .75rem;
  padding: 3rem 1rem;
  color: #94a3b8;
  font-size: .875rem;
}

.md-viewer__error .van-icon {
  font-size: 2rem;
  color: #fca5a5;
}

.md-viewer__top {
  position: fixed;
  bottom: 3rem;
  right: 1rem;
  width: 2.25rem;
  height: 2.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 8px;
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(0,0,0,.1);
  color: #171717;
  transition: all 0.2s;
  z-index: 10;
}

.md-viewer__top:hover {
  background: #f1f5f9;
  box-shadow: 0 4px 12px rgba(0,0,0,.12);
  transform: translateY(-2px);
}

.md-viewer__top .van-icon {
  font-weight: 700;
}

/* ── 在 github-markdown-css 基础上的精细覆盖 ── */
.md-viewer__content.markdown-body {
  font-size: .9375rem;
  line-height: 1.8;
  color: #1e293b;
  box-sizing: border-box;
  max-width: 100%;
  word-break: break-word;
  overflow-wrap: break-word;
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Hiragino Sans GB',
    'Microsoft YaHei', 'Segoe UI', sans-serif;
}

/* 标题 */
.md-viewer__content.markdown-body h1,
.md-viewer__content.markdown-body h2,
.md-viewer__content.markdown-body h3,
.md-viewer__content.markdown-body h4,
.md-viewer__content.markdown-body h5,
.md-viewer__content.markdown-body h6 {
  font-weight: 650;
  line-height: 1.4;
  color: #0f172a;
  margin-top: 1.75em;
  margin-bottom: .6em;
  border-bottom: none;
}

.md-viewer__content.markdown-body h1 {
  font-size: 1.6rem;
  padding-bottom: .4em;
  border-bottom: 2px solid #e2e8f0;
  margin-top: .25em;
}

.md-viewer__content.markdown-body h2 {
  font-size: 1.3rem;
  padding-bottom: .3em;
  border-bottom: 1px solid #f1f5f9;
}

.md-viewer__content.markdown-body h3 { font-size: 1.1rem; }
.md-viewer__content.markdown-body h4 { font-size: 1rem; }

/* 段落 */
.md-viewer__content.markdown-body p {
  margin: .9em 0;
  color: #334155;
}

/* 链接 */
.md-viewer__content.markdown-body a {
  color: #1a89fa;
  text-decoration: none;
  border-bottom: 1px solid transparent;
  transition: border-color .15s;
}

.md-viewer__content.markdown-body a:hover {
  border-bottom-color: #1a89fa;
  text-decoration: none;
}

/* 行内代码 */
.md-viewer__content.markdown-body code:not(pre code) {
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  font-size: .85em;
  background: #f0f4ff;
  color: #4f46e5;
  padding: .15em .45em;
  border-radius: 4px;
  border: 1px solid #e0e7ff;
}

/* 代码块：由 highlight.js github 主题负责配色，这里只做布局 */
.md-viewer__content.markdown-body pre {
  border-radius: 8px;
  padding: 0;
  overflow-x: auto;
  margin: 1.25em 0;
  border: 1px solid #e2e8f0;
}

.md-viewer__content.markdown-body pre code.hljs {
  border-radius: 8px;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  font-size: .875rem;
  line-height: 1.7;
  padding: 1.1rem 1.25rem;
  border: none;
}

/* 引用块 */
.md-viewer__content.markdown-body blockquote {
  border-left: 3px solid #6366f1;
  background: #f8f7ff;
  margin: 1.25em 0;
  padding: .75em 1.1em;
  border-radius: 0 8px 8px 0;
  color: #475569;
}

.md-viewer__content.markdown-body blockquote > p {
  margin: 0;
  color: #475569;
}

/* 列表 */
.md-viewer__content.markdown-body ul,
.md-viewer__content.markdown-body ol {
  padding-left: 1.75em;
  margin: .75em 0;
  color: #334155;
}

.md-viewer__content.markdown-body ul {
  list-style-type: disc;
}

.md-viewer__content.markdown-body ul ul {
  list-style-type: circle;
}

.md-viewer__content.markdown-body ul ul ul {
  list-style-type: square;
}

.md-viewer__content.markdown-body ol {
  list-style-type: decimal;
}

.md-viewer__content.markdown-body ol ol {
  list-style-type: lower-alpha;
}

.md-viewer__content.markdown-body li {
  margin: .1em 0;
  line-height: 1.75;
  display: list-item;
}

.md-viewer__content.markdown-body li + li {
  margin-top: .1em;
}

.md-viewer__content.markdown-body li > ul,
.md-viewer__content.markdown-body li > ol {
  margin: .25em 0;
}

/* 图片 */
.md-viewer__content.markdown-body img {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  display: block;
  margin: 1.25em auto;
  box-shadow: 0 2px 12px rgba(0,0,0,.08);
  border: 1px solid #f1f5f9;
}

/* 分割线 */
.md-viewer__content.markdown-body hr {
  border: none;
  border-top: 1px solid #e2e8f0;
  margin: 2em 0;
}

/* 表格 */
.md-viewer__content.markdown-body table {
  width: 100% !important;
  display: table;
  border-collapse: separate;
  border-spacing: 0;
  font-size: .875rem;
  margin: 1.25em 0;
  border-radius: 6px;
  box-shadow: 0 0 0 1px #e2e8f0;
}

.md-viewer__content.markdown-body thead tr {
  background: #f0f4ff !important;
}

.markdown-body table th, .markdown-body table td {
  border: none;
}

.md-viewer__content.markdown-body th {
  font-weight: 600;
  color: #3b4a6b;
  padding: .5rem .75rem;
  text-align: left;
  border-right: 1px solid #dde3f0;
  border-bottom: 1px solid #dde3f0;
}

.md-viewer__content.markdown-body th:last-child {
  border-right: none;
}

.md-viewer__content.markdown-body thead tr:first-child th:first-child {
  border-top-left-radius: 6px;
}

.md-viewer__content.markdown-body thead tr:first-child th:last-child {
  border-top-right-radius: 6px;
}

.md-viewer__content.markdown-body td {
  padding: .45rem .75rem;
  color: #334155;
  border-right: 1px solid #eef0f4;
  border-bottom: 1px solid #eef0f4;
}

.md-viewer__content.markdown-body td:last-child {
  border-right: none;
}

.md-viewer__content.markdown-body tbody tr:last-child td {
  border-bottom: none;
}

.md-viewer__content.markdown-body tbody tr:last-child td:first-child {
  border-bottom-left-radius: 6px;
}

.md-viewer__content.markdown-body tbody tr:last-child td:last-child {
  border-bottom-right-radius: 6px;
}

.md-viewer__content.markdown-body tbody tr:hover td {
  background: #f7f9ff;
}
</style>
