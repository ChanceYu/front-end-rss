---
title: "十条经过实战检验的 TypeScript monorepo 约定"
link: "http://mp.weixin.qq.com/s?__biz=MzUxNzk1MjQ0Ng==&mid=2247528946&idx=1&sn=2f015af3de78ea7ed6b651445eba100c&chksm=f9927723cee5fe356f24ef1f187966a6a9359bbb799691d2c894e4ec7fcf56a2d376eab233d5#rd"
date: 2026-01-16
md5: 3bf8a99eacdacd8d15843b788473e17f
---

# 十条经过实战检验的 TypeScript monorepo 约定

```js_darkmode__1
点击上方 程序员成长指北，关注公众号
回复1，加入高级Node交流群
```
十条经过实战检验的 TypeScript monorepo 约定 —— 覆盖命名、TS 配置、project references、构建、发布、测试与边界控制 —— 让代码库能够在时间中稳定扩展。

Monorepo 在最初总是让人感觉非常顺滑 —— 但六个月后就会变得一团糟。秘诀不在于炫技的工具链，而在于一小套朴素但持久的约定。下面这十条约定能够帮助团队持续交付，不再出现“谁又把什么弄坏了？”这种戏码。说实话，未来的你一定会感谢现在的你。

---

## 1）按业务域命名，而不是按技术层命名

使用业务语言（auth、billing、search），而不是技术层（utils、helpers）。这会促使更清晰的边界划分，也更容易确定归属。

```code-snippet__js
apps/
  web/
  worker/
packages/
  auth/
  billing/
  search/
  ui/
```
**为什么能长期有效：** 业务域可以经得住重构，而技术层不会。

---

## 2）统一使用 workspaces + workspace: 协议

选择一个工具（我偏好 pnpm，因为速度快且更严格），并用 `workspace:*` 来明确本地依赖，同时避免版本耦合。

```code-snippet__js
// package.json (root)
{
  "name": "@acme/monorepo",
  "private": true,
  "packageManager": "pnpm@9.0.0",
  "workspaces": ["apps/*", "packages/*"],
  "scripts": {
    "build": "pnpm -r build",
    "test": "pnpm -r test"
  }
}
// apps/web/package.json
{
  "name": "@acme/web",
  "dependencies": {
    "@acme/auth": "workspace:*",
    "@acme/ui": "workspace:*"
  }
}
```
**为什么能长期有效：** 不会意外发布半成品版本，也不会造成同级包之间的 semver 漂移。

---

## 3）使用一个严格的 tsconfig.base.json —— 然后所有子包继承它

把严格规则放在最顶层；只有在确有需求时才下放例外。

```code-snippet__js
// tsconfig.base.json at the repo root
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "lib": ["ES2022", "DOM"],
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "skipLibCheck": true,
    "declaration": true,
    "declarationMap": true,
    "verbatimModuleSyntax": true,
    "isolatedModules": true
  }
}
```
子包配置：

```code-snippet__js
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": { "outDir": "dist", "rootDir": "src", "composite": true },
  "include": ["src"]
}
```
**为什么能长期有效：** 统一的基础规则能够避免风格漂移和微妙的类型退化。

---

## 4）使用 TypeScript Project References + build mode

这决定了你的 monorepo 究竟是“任何改变都会触发全量构建”，还是“只构建变动部分”。

```code-snippet__js
// packages/ui/tsconfig.json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": { "composite": true, "outDir": "dist", "rootDir": "src" },
  "references": [{ "path": "../auth" }]
}
```
根目录脚本：

```code-snippet__js
tsc -b packages/*   # 以依赖图增量构建全部包
tsc -b -w           # watch 模式下使用 references
```
为什么能长期有效： 随着依赖图规模扩大，构建依然保持增量而不是变慢。

---

## 5）统一库构建工具：库用 tsup，开发用 tsx

不要同时操控多个 bundler。保持工具链简单直观。

```code-snippet__js
// packages/auth/package.json
{
  "name": "@acme/auth",
  "type": "module",
  "main": "./dist/index.cjs",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsup src/index.ts --dts --format esm,cjs --clean"
  }
}
```
**为什么能长期有效：** 团队可能每年都会想换 bundler，但你不需要 —— tsup 和 tsx 足够快且可预期。

---

## 6）使用干净的 exports，不要允许 deep imports

只暴露你希望暴露的内容。应用层不应该通过 `packages/ui/src/button` 这种路径导入内部实现。

```code-snippet__js
// packages/ui/package.json
{
  "name": "@acme/ui",
  "type": "module",
  "sideEffects": false,
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs"
    }
  },
  "files": ["dist"]
}
```
**为什么能长期有效：** 包内部的重命名不会影响整个 monorepo。

---

## 7）使用 Changesets 发布；两条命令自动化 release

人类可读的变更说明现在写好；自动化 semver 稍后执行。

```code-snippet__js
// .changeset/config.json
{
  "changelog": "@changesets/cli/changelog",
  "commit": false,
  "linked": [],
  "access": "public",
  "baseBranch": "main"
}
// root package.json
{
  "scripts": {
    "changeset": "changeset",
    "version-packages": "changeset version",
    "release": "pnpm -r build && changeset publish"
  }
}
```
**为什么能长期有效：** 改动意图清晰，标记一致，不再有 “到底发布了啥？” 的疑问。

---

## 8）用 ESLint 强化边界，而不是靠团队默契

明确规定“谁可以 import 谁”。这样能减少争议。

```code-snippet__js
// .eslintrc.cjs (root)
module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "import"],
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  rules: {
    "import/no-restricted-paths": ["error", {
      "zones": [
        { "target": "./packages/auth", "from": "./packages/ui" },    // ui 不能 import auth
        { "target": "./packages/billing", "from": "./packages/auth"} // auth 不能 import billing
      ]
    }],
    "import/no-cycle": "error"
  }
}
```
**为什么能长期有效：** 边界设定存活在机器人和工具里，而不是口口相传的默契。

---

## 9）一个测试运行器，多项目共用：Vitest workspace

保持测试快速且一致。测试文件与代码邻近；从根目录一次性运行所有测试。

```code-snippet__js
// vitest.workspace.ts at the root
import { defineWorkspace } from 'vitest/config'


export default defineWorkspace([
  { test: { include: ['packages/auth/src/**/*.test.ts'] } },
  { test: { include: ['packages/ui/src/**/*.test.tsx'] } },
  { test: { include: ['apps/web/src/**/*.test.tsx'] } },
])
```
**为什么能长期有效：** 共用 reporters、快照与覆盖率，不需要为每个包定制配置。

---

## 10）集中管理环境变量类型：在 @acme/env 中用 Zod 校验

不要把 `process.env.FOO` 散落在代码各处。验证一次，到处复用。

```code-snippet__js
// packages/env/src/index.ts
import { z } from "zod"


const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]),
  DATABASE_URL: z.string().url(),
  PORT: z.coerce.number().int().default(3000)
})


export const env = schema.parse(process.env)
export type Env = z.infer<typeof schema>
```
在任意应用中使用：

```code-snippet__js
import { env } from "@acme/env"
app.listen(env.PORT)
```
为什么能长期有效： 环境配置不正确会尽早失败 —— 还带着类型提示，而不是凌晨两点崩在生产上。

---

## 一些微小但长期有效的习惯

- 库中优先使用 named exports，更易重构。
- 每个包保留 README.md，记录其作用与示例 import。
- 在 CODEOWNERS 中标注模块负责人，方便分流评审。
- 添加 prepack 脚本，确保发布前构建正确。

---

## 结语

Monorepo 并不会因为某个“大问题”而失败，而是因为无数个小问题不断累积。以上十条约定能减少团队、包和需求增加所带来的摩擦。如果你也有经历战火、价值连城的经验技巧，欢迎分享 —— 我一定会借鉴（当然也会注明出处）。

地址：

https://medium.com/@kaushalsinh73/10-typescript-monorepo-conventions-that-age-well-c1a6841226f5

原文作者： Neurobyte

Node 社群
