---
title: "大多数开发者都错误地使用了Prettier"
link: "http://mp.weixin.qq.com/s?__biz=MzUxNzk1MjQ0Ng==&mid=2247528534&idx=1&sn=e3d953a3f8db95e42cc3405894d82fdc&chksm=f9927687cee5ff910c5a5ef336dbd6feccb616695122b52bfa1010a0f3a3465750befdbd066a#rd"
date: 2025-12-12
md5: a7725e3b4bec5f2afb36ec502ec86145
---

# 大多数开发者都错误地使用了Prettier

点击上方 程序员成长指北，关注公众号

回复1，加入高级Node交流群

## 引言

Prettier 就像现代 Web 开发里的咖啡机：人人都在用，但真正了解它如何运作的人却很少。

大多数开发者安装完它、打开 “Format on Save”，然后就不再管了。

但有一个尴尬的事实：

如果你只是安装了 Prettier，却从未配置它，那你大概率是在“错误使用”它。

而且，这和“缩进用 Tab 还是 Space”无关；真正重要的是理解 Prettier 如何融入你的工作流，它如何与 ESLint 协作，以及它如何影响团队的代码一致性。

读完本文你将了解：

- 开发者最常犯的 Prettier 使用误区
- Prettier 的正确配置及集成方式
- 如何停止“与格式化工具对抗”，让它真正为你服务

---

## 1\. Prettier 实际在做什么（以及不做什么）

先澄清一个巨大的误解：

**Prettier 不会提高你的代码质量。**

它不会找 Bug，也不会优化逻辑。

它唯一做的，就是确保无论谁写的代码，都能保持一致的格式。

可以把它理解成代码的自动语法排版工具。 它不会改变你要表达的内容，只是让内容更易读。

### 示例

❌ 未使用 Prettier：

```code-snippet__js
function greet(name){console.log('hello '+ name)}
```
✅ 使用 Prettier：

```code-snippet__js
function greet(name) {
  console.log("hello " + name);
}
```
两段代码都能运行。

但后者更易读、易扫描、易维护，而这正是 Prettier 的意义。

---

## 2\. 开发者最常犯的错误：让 Prettier 和 ESLint“互殴”

如果你见过 “auto-fix → reformat → revert → reformat again” 的无限循环，那你已经掉进了工具冲突的地狱。

这通常发生在开发者同时启用 Prettier 和 ESLint 的格式化规则，导致两者互相争夺代码格式的控制权。

要解决这个问题，你必须让 **Prettier 负责格式化，ESLint 只负责规则校验**。

以下是让它们和平共处的方式 👇

### Step 1：安装 Prettier + ESLint 集成

```code-snippet__js
npm install --save-dev eslint-config-prettier eslint-plugin-prettier
```
### Step 2：更新 `.eslintrc`

```code-snippet__js
{
  "extends": ["eslint:recommended", "plugin:prettier/recommended"],
  "plugins": ["prettier"],
  "rules": {
    "prettier/prettier": "error"
  }
}
```
✅ 现在 ESLint 会使用 Prettier 的格式规则，并把精力集中在真正的问题上（未使用的变量、未定义的 import 等）。

再也不会发生 linter 和 formatter 的“拔河大战”。

---

## 3\. 第二大误区：依赖默认配置

很多开发者甚至没有创建 `.prettierrc` 文件。

这意味着他们在使用 Prettier 的**全局默认配置**，而这很可能与团队的编码风格不匹配。

在项目根目录创建 `.prettierrc`：

```code-snippet__js
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "printWidth": 100,
  "trailingComma": "es5",
  "arrowParens": "always"
}
```
现在你的格式是明确的、可控的、可预期的，团队成员打开项目也不会产生格式差异。

💡 **提示：一定要把 `.prettierrc` 提交到 Git。** 这是团队统一格式的基础。

---

## 4\. 第三大误区：不使用 `.prettierignore`

许多开发者不知道：

**Prettier 默认会格式化所有文件**。

包括构建产物、JSON 配置、自动生成文件，这些会显著拖慢格式化速度。

创建 `.prettierignore`：

```code-snippet__js
node_modules
dist
build
coverage
package-lock.json
.next
```
这样 Prettier 就只会处理真正需要格式化的文件。

---

## 5\. 第四大误区：忽略 “Check Mode”

Prettier 的隐藏宝藏是 `--check` 选项。

- `--write`：直接格式化文件
- `--check`：只检查文件是否已符合格式

```code-snippet__js
npx prettier --check .
```
非常适合用于 **CI/CD 或 Git 提交钩子**，可以防止未格式化的代码进入仓库。

配合 Husky + Lint-Staged：

```code-snippet__js
{
  "lint-staged": {
    "*.{js,ts,jsx,tsx,css,html,md}": "prettier --check"
  }
}
```
效果？

每次提交时，Prettier 会自动确保所有文件都符合格式规范。

---

## 6\. 第五大误区：未同步编辑器设置

如果你是 VS Code 用户，这点尤其重要。

即使安装了 Prettier，如果它不是默认 formatter，它也不会自动运行。

打开 VS Code 设置（JSON），添加：

```code-snippet__js
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "prettier.requireConfig": true
}
```
这样可以确保：

- 只有 Prettier 负责格式化
- 只有在有 `.prettierrc` 的项目中运行（避免误伤）
- 保存时自动格式化

---

## 7\. 第六大误区：忽略换行符（Line Endings）

这是跨 Windows 与 macOS 团队最隐蔽的“痛点”。

不同系统使用不同的换行符（CRLF vs LF），导致 Git 出现大量“幽灵 diff”。

在 `.prettierrc` 中添加：

```code-snippet__js
{
  "endOfLine": "lf"
}
```
在 `.gitattributes` 中设置：

```code-snippet__js
* text eol=lf
```
从此 Git 不再出现莫名其妙的文件修改。

---

## 8\. 第七大误区：没有自动化格式化

如果你还在手动运行 Prettier，那就是在浪费时间。

在 `package.json` 中加入：

```code-snippet__js
"scripts": {
  "format": "prettier --write .",
  "check-format": "prettier --check ."
}
```
现在你可以运行：

```code-snippet__js
npm run format
npm run check-format
```
配合 Husky 的 pre-commit hook，你甚至不需要思考格式化这件事。

---

## 9\. 第八大误区：把 Prettier 当成“普通工具”

Prettier 从来不是一个简单的小工具，它是一份团队契约。

它代表团队对代码风格的一致性达成了共识，避免无休止的讨论：

- “要不要加分号？”
- “这行要不要换行？”
- “大括号前要不要空格？”

当 Prettier 被纳入开发流程，它就成为整个代码库的唯一格式真相来源。

真正的价值不是更漂亮的代码，而是更快的 Code Review、更少争论、更高协作效率。

---

## 10\. 正确使用 Prettier 的方式（专业团队实践）

### Step-by-step

### 1\. 安装 Prettier

```code-snippet__js
npm install --save-dev prettier
```
### 2\. 创建 `.prettierrc`

```code-snippet__js
{
  "singleQuote": true,
  "semi": false,
  "trailingComma": "all"
}
```
### `3. 创建` `.prettierignore`

```code-snippet__js
node_modules
dist
build
```
### `4. 集成 ESLint`

```code-snippet__js
npm install --save-dev eslint-config-prettier eslint-plugin-prettier
```
### 5\. 配置 VS Code

```code-snippet__js
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true
}
```
### 6\. 为 Git Hooks 自动化

```code-snippet__js
npm install --save-dev husky lint-staged
```
### 7\. 在 package.json 中加入：

```code-snippet__js
{
  "lint-staged": {
    "*.{js,ts,jsx,tsx}": "prettier --check"
  }
}
```
### 至此，你已经构建了一个 **自动执行、无需人工干预、且被顶级工程团队广泛采用** 的格式化体系。

## 总结

Prettier 是最简单的前端工具之一，也是最容易被错误使用的工具之一。

如果你没有 `.prettierrc`、`.prettierignore` 和 CI 检查，那你就错过了它真正的价值：

- 彻底的格式一致性
- 自动化工作流
- 心智负担降低

当你正确使用 Prettier，它就不再只是“格式化工具”，而是开发文化的一部分。

所以问题是：

**你真的正确使用 Prettier 了吗？**

原文地址：https://codebyumar.medium.com/most-developers-use-prettier-wrong-are-you-one-of-them-05bb480e1e92

  

原文作者： CodeByUmar

Node 社群
