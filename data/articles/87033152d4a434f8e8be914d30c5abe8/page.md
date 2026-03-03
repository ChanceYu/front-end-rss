---
title: "Algorithms visualized and demonstrated in JavaScript"
link: "https://javascriptweekly.com/issues/763"
date: 2025-11-28
md5: 87033152d4a434f8e8be914d30c5abe8
---

# Algorithms visualized and demonstrated in JavaScript

#​763 — November 28, 2025

[Read on the Web](https://javascriptweekly.com/issues/763)

[![](./images/7de40a8353e61dcd4d5fecaf4aa9444a.jpeg)](https://github.com/trekhleb/javascript-algorithms)  
- [Over 150 Algorithms and Data Structures Demonstrated in JS](https://github.com/trekhleb/javascript-algorithms "github.com") — Examples of many common algorithms (e.g. bit manipulation, Pascal’s triangle, Hamming distance) and data structures (e.g. linked lists, tries, graphs) with explanations. Available in eighteen other written languages too. **_\--- Oleksii Trekhleb et al._**
  
- [TypeScript: From First Steps to Professional](https://frontendmasters.com/courses/typescript-first-steps/?utm_source=email&utm_medium=javascriptweekly&utm_content=typescript "frontendmasters.com") — Learn TypeScript step-by-step with Anjana Vakil, and gain confidence writing code you can trust! Add strong types, reuse interfaces, and apply type safety throughout your app with hands-on projects converting JavaScript to TypeScript. **_\--- Frontend Masters sponsor_**
  
- ⚠️ [The Shai-Hulud 2.0 npm Worm: Analysis, and What You Need to Know](https://securitylabs.datadoghq.com/articles/shai-hulud-2.0-npm-worm/ "securitylabs.datadoghq.com") — The next generation of [a ‘worm’ we’ve previously encountered](https://socket.dev/blog/ongoing-supply-chain-attack-targets-crowdstrike-npm-packages) is back infecting more packages, exfiltrating developers' credentials, then republishing yet more packages to spread further. This is a good writeup of how it works. **_\--- Tafani-Dereeper and Obregoso (Datadog)_**

**IN BRIEF:**

- [Tanner Linsley tells the tale](https://tanstack.com/blog/tanstack-2-years) of two years running [TanStack](https://tanstack.com/) (well known for TanStack Start, Query, and Form, among others) as an open source organization.
- The Piccalilli team has made the [Introduction to Asynchronous JavaScript](https://piccalil.li/javascript-for-everyone/lessons/48) chapter of their [JavaScript for Everyone](https://piccalil.li/javascript-for-everyone/lessons) course free to read online.
- There's [a variety of Black Friday deals](https://piccalil.li/links/black-friday-deals-2025/) offered by well-known members of the frontend community on courses and similar resources.
- Node.js 24 is now a supported runtime on _AWS Lambda_ (as `nodejs24.x`) and won't be deprecated until April 30, 2028.

**RELEASES:**

- [Prettier 3.7](https://prettier.io/blog/2025/11/27/3.7.0) – The popular opinionated code formatter.
- [pnpm 10.24](https://pnpm.io/blog/releases/10.24) – The fast, efficiency-focused package manager gets even faster with adaptive network concurrency.
- [Bun 1.3.3](https://bun.sh/blog/bun-v1.3.3) – The popular JS runtime adds `CompressionStream` and `DecompressionStream`, upgrades to SQLite 3.51.0, and other minor enhancements.
- [Playwright 1.57](https://github.com/microsoft/playwright/releases/tag/v1.57.0) – Microsoft's browser/Web automation library now has a 'speedboard' tab in its HTML reports to show you your tests sorted by slowness. It also switches from Chromium to [Chrome for Testing](https://developer.chrome.com/blog/chrome-for-testing/).
- [Valibot 1.2](https://valibot.dev/blog/valibot-v1.2-release-notes/), [Storybook 10.1](https://github.com/storybookjs/storybook/releases/tag/v10.1.0), [Next.js v16.0.5](https://github.com/vercel/next.js/releases/tag/v16.0.5), [Immer 11.0](https://github.com/immerjs/immer/releases/tag/v11.0.0)

## 📖  Articles and Videos

[![](./images/12aea7ca1c0487c424f2b6221d709bcf.jpeg)](https://infrequently.org/2025/11/performance-inequality-gap-2026/)  
- [The Performance Inequality Gap in 2026](https://infrequently.org/2025/11/performance-inequality-gap-2026/ "infrequently.org") — Esteemed browser and Web standards expert Alex Russell looks at the state of client-side Web performance, what sort of bandwidth you should be taking into account, what devices people are using, and warns against ever-growing JavaScript bundle sizes. A lot of data here. **_\--- Alex Russell_**
  
- [Why Use React? (On the Frontend)](https://adactio.com/journal/22265 "adactio.com") — Jeremy asks some big, potentially uncomfortable questions, but notes how React’s modern server-side powers are a real boon, while questioning React’s role on the frontend, where [Preact](https://preactjs.com/) might well suit you better. **_\--- Jeremy Keith_**
  
- [Breakpoints and `console.log` Is the Past, Time Travel Is the Future](https://wallabyjs.com/?utm_source=cooperpress&utm_medium=javascriptweekly&utm_content=javascriptweekly "wallabyjs.com") — 15x faster JavaScript debugging than with breakpoints and console.log, supports Vitest, Jest, Karma, Jasmine, and more. **_\--- Wallaby Team sponsor_**
  
- ▶  [What are 'Invokers': Interactivity _without_ JavaScript?](https://www.youtube.com/watch?v=1NRx7PVupbQ "www.youtube.com") — The [Invoker Commands API](https://developer.mozilla.org/en-US/docs/Web/API/Invoker_Commands_API) lets you assign behaviors to buttons. You _can_ use JavaScript to create custom commands, however. **_\--- Scott Tolinski_**
  
- [How Vercel Built Its First Mobile App with React Native](https://vercel.com/blog/how-we-built-the-v0-ios-app "vercel.com") — Vercel has built an iOS app for its [v0](https://v0.app/) AI-powered app development tool using React Native and Expo. This is a detailed look at how they tackled certain issues to make the UX smooth and responsive. **_\--- Fernando Rojo (Vercel)_**
  
- [Wrangling My Email with Claude Code](https://jlongster.com/wrangling-email-claude-code "jlongster.com") — James shows how you can use Claude’s [‘agent skills’](https://www.claude.com/blog/skills) to run a JavaScript app that fetches your email from Gmail for Claude Code to analyze. **_\--- James Long_**
  

- 📄 [How a Summer in Abruzzo Helped Bring Type Stripping to Node.js](https://satanacchio.hashnode.dev/the-summer-i-shipped-type-stripping) – It’s neat to get some background to the story. **_\--- Marco Ippolito_**
- 📄 [Taking Down Next.js Servers for 0.0001 Cents a Pop](https://www.harmonyintelligence.com/taking-down-next-js-servers) – A vulnerability that has been fixed, if you’re on Next.js 15.5.5 or 16+. **_\--- Alex Browne_**
- 📄 [Tinyglobby: A Success Story in Modernization and Performance](https://e18e.dev/blog/tinyglobby-migration.html) **_\--- Madeline Gurriarán_**
- 📄 [Managing Side Effects: A JavaScript Effect System in 30 Lines or Fewer](https://lackofimagination.org/2025/11/managing-side-effects-a-javascript-effect-system-in-30-lines-or-less/) **_\--- Aycan Gulez_**
- 📄 [How to Build Cinematic 3D Scroll Experiences with GSAP and Three.js](https://tympanus.net/codrops/2025/11/19/how-to-build-cinematic-3d-scroll-experiences-with-gsap/) **_\--- Joseph Santamaria_**
- 📄 [Migrating 6000 React Tests Using AI Agents and ASTs](https://eliocapella.com/blog/ai-library-migration-guide/) **_\--- Elio Capella Sánchez_**

## 🛠 Code & Tools

[![](./images/a250c99698d78555c4e2805c6beae6bb.jpeg)](https://fullcalendar.io/)  
- [FullCalendar: A Full Sized JavaScript Calendar Control](https://fullcalendar.io/ "fullcalendar.io") — Get a Google Calendar-style experience in your own apps. Has connectors for React, Vue and Angular, but can be used with plain JavaScript too. The base version is MIT licensed, but there’s a commercial version too with extra features. **_\--- Adam Shaw_**
  
- [Better Auth: A Comprehensive Authentication Framework for TypeScript](https://www.better-auth.com/ "www.better-auth.com") — A framework agnostic authentication and authorization framework that provides email and password-based auth, OAuth and social sign-in, account and session management, 2FA, and more. [v1.4](https://www.better-auth.com/blog/1-4) was just released with stateless/database-free session management support. **_\--- Better Auth_**
  
- [Tiger Data Taught AI to Write Real Postgres Code. Try it Today](https://www.tigerdata.com/blog/we-taught-ai-to-write-real-postgres-code-open-sourced-it "www.tigerdata.com") — pg-aiguide brings real DB expertise to Claude Code, or any other MCP-enabled tool. **_\--- Tiger Data sponsor_**
  
- [Heat.js 4.5: A Heat Map Visualization Library](https://www.william-troup.com/heat-js/ "www.william-troup.com") — Think the GitHub contributions heat map. No dependencies, small, responsive, and theme-able. There’s a [live demo](https://www.william-troup.com/heat-js/examples/buttons.html) or its [GitHub repo.](https://github.com/williamtroup/Heat.js) **_\--- William Troup_**
  
- [Ant Design 6.0: The React UI Design Language and UI Library](https://github.com/ant-design/ant-design/issues/55804 "github.com") — One of the bigger, more ‘corporate’ looking React component suites. v6 provides a smooth migration for v5 users and is focused on optimizations and React 19 compatibility. **_\--- Ant Design Team_**
- 🎨 [Chroma.js 3.2](https://gka.github.io/chroma.js/) – Color mixing, conversion and manipulation library.
- 🔎 [Node File Trace (NFT) 1.1](https://github.com/vercel/nft) – Vercel's tool for determining which files are necessary for an app to run.
- [Cedar 1.0](https://github.com/cedarjs/cedar/releases/tag/v1.0.0) – Full-stack React framework forked from the former RedwoodJS.
- [swc4j 2.0](https://github.com/caoccao/swc4j) – JVM-based JavaScript and TypeScript compilation and bundling.
- 📺 [React Lite YouTube Embed v3.2](https://github.com/ibrahimcesar/react-lite-youtube-embed) – A faster, cleaner YouTube embedding component. ([Demo.](https://ibrahimcesar.github.io/react-lite-youtube-embed/))
- [cron-schedule 6.0](https://github.com/P4sca1/cron-schedule) – Zero-dependency cron parser and scheduler.
- [Vuetify 3.11](https://github.com/vuetifyjs/vuetify/releases/tag/v3.11.0) – Vue component framework.
- [Fable 4.28.0](https://github.com/fable-compiler/Fable) – F# to JavaScript compiler.

📰 Classifieds

🦃 This Thanksgiving, skip writing tests. [Meticulous](https://www.meticulous.ai/?utm_source=jsweekly&utm_medium=newsletter&utm_campaign=q4) observes your app and auto-builds continuously evolving E2E UI tests while you feast. Book a call now.

---

🏎️ Depot's new [GitHub Actions Analytics:](https://fandf.co/4a4TzGu) see job durations, failure rates, CPU/memory usage, and performance trends across all your repos at a glance.

---

🎨 [Try Pintura image editor for free today](https://pqina.nl/pintura/), add a polished cropping, rotating, and annotation experience to your web app in minutes.

[![](./images/cda606dc75d74b3cec03a0fbbc0d5c94.jpeg)](https://tsdiagram.com/)  
- [TSDiagram: Diagrams as Code with TypeScript](https://tsdiagram.com/ "tsdiagram.com") — Draft diagrams quickly with TypeScript. Define your data models through top-level type aliases and interfaces and it automatically lays out the nodes in an efficient way. [GitHub repo.](https://github.com/3rd/tsdiagram) **_\--- Andrei Neculaesei_**

## 📢  Elsewhere in the ecosystem

Some other interesting tidbits in the broader landscape:

- If you've not yet played with CSS's "subgrid" feature (now [supported](https://caniuse.com/?search=subgrid) in all major browsers), Josh W Comeau has [a fantastic introduction to the new possibilities subgrids offer your layouts](https://www.joshwcomeau.com/css/subgrid/).
- ⚠️ GitHub reports secrets/tokens leaked in Git repos to the service providers so they can be revoked, but now it's [reporting secrets in unlisted GitHub Gist posts too](https://github.blog/changelog/2025-11-25-secrets-in-unlisted-github-gists-are-now-reported-to-secret-scanning-partners/) (so be careful when using it as a 'private' pastebin).
- [The RetroGameCoders IDE](https://ide.retrogamecoders.com/) is a JavaScript and WebAssembly-powered online IDE/playground for coding against retro machines, now including the C64, Apple II, MSX, Atari 800, and others.
- 🤖 Addy Osmani has written [a neat roundup of what's new in Gemini 3.0](https://addyosmani.com/blog/gemini-3/), the latest version of Google's leading LLMs. He touches on Nano Banana Pro image generation, Google's new _Antigravity_ dev tool, and how the updates benefit developers. Not keen to be left behind, however, Anthropic [released Claude Opus 4.5](https://www.anthropic.com/news/claude-opus-4-5) earlier this week.
- [The team behind the Zig language isn't happy with GitHub](https://ziglang.org/news/migrating-from-github-to-codeberg/) and so is migrating from GitHub to Codeberg.
