# article-to-md

将 `data/links.json` 中的文章 URL 抓取并转换为 Markdown 文件。

## 技术栈

| 依赖 | 用途 |
|------|------|
| [playwright](https://playwright.dev) | 无头浏览器抓取页面 |
| [turndown](https://github.com/mixmark-io/turndown) | HTML → Markdown 转换 |
| [dayjs](https://day.js.org) | 日期处理与格式化 |

## 快速开始

```bash
# 安装依赖（含 Playwright 浏览器）
pnpm install
pnpm exec playwright install chromium

# 处理所有未处理的文章（按日期从新到旧）
pnpm start

# 只处理最新的 10 篇
pnpm start --limit=10

# 强制重新处理（忽略 processed.json）
pnpm start --force

# 非 headless 模式（可视化调试）
pnpm start --headless=false
```

## 输出结构

```
article-to-md/
├── output/          # 生成的 Markdown 文件，以 md5(url) 命名
│   └── <md5>.md
└── processed.json   # 已处理记录：{ "<url>": "<md5>" }
```

每个 Markdown 文件包含 YAML front-matter：

```yaml
---
title: "文章标题"
link: "https://..."
date: 2026-01-01
md5: <md5(url)>
---
```

## 域名规则

在 `src/rules/` 目录下为各网站定制抓取规则

### 新增域名规则

新建 `src/rules/<name>.js`，导出一个规则对象：

```js
/** @type {import('./index.js').SiteRule} */
export default {
  // 正文容器的 CSS 选择器
  contentSelector: '.article-body',

  // 抓取前需要移除的元素选择器
  excludeSelectors: ['.ad', '.sidebar', 'footer'],

  // Playwright waitUntil 选项（默认 'networkidle'）
  waitUntil: 'networkidle',

  // 可选：页面加载后的自定义操作（如关闭弹窗）
  async preProcess(page) {
    await page.click('.cookie-dismiss').catch(() => {})
  },

  // 可选：自定义 Turndown 转换规则
  turndownRules(td) {
    td.addRule('customImage', { /* ... */ })
  },
}
```

然后在 `src/rules/index.js` 的 `RULES` 对象中注册：

```js
import myRule from './mysite.js'

const RULES = {
  // ...
  'mysite.com': myRule,
}
```

## API

```js
import { processArticle } from './src/processor.js'

const result = await processArticle(
  { title: '文章标题', link: 'https://...', date: '2026-01-01' },
  { force: false, headless: true },
)
// result: { success, md5, outputPath } | { skipped, md5 } | { error, md5 }
```
