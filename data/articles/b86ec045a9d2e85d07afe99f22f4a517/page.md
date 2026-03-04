---
title: "How the Seattle Times is using pnpm"
link: "https://nodeweekly.com/issues/604"
date: 2025-12-09
md5: b86ec045a9d2e85d07afe99f22f4a517
---

# How the Seattle Times is using pnpm

> 🗓️ A quick notice that **Node Weekly will be moving to Thursdays in January 2026,** as part of a schedule reshuffle for most of [our newsletters](https://cooperpress.com/publications/). We still have one more week before the Christmas break, though, so we'll be back next Tuesday with our 2025 roundup!  
> \_\_  
> _Your editor, Peter Cooper_

[![](./images/dc00550c79f2dd4b340c4d66692dfb03.jpeg)](https://pnpm.io/blog/2025/12/05/newsroom-npm-supply-chain-security)  
- [How We're Protecting Our Newsroom from npm Supply Chain Attacks](https://pnpm.io/blog/2025/12/05/newsroom-npm-supply-chain-security "pnpm.io") — A software engineer at the _Seattle Times_ explains how the paper has been trialing [pnpm](https://pnpm.io/) as an alternative to `npm` specifically because of its client-side security controls. This isn’t a formal case study but breaks down the technical details well and could give your own team food for thought. **_\--- Ryan Sobol_**
  
- ⚠️  [Node.js December 15, 2025 Security Releases](https://nodejs.org/en/blog/vulnerability/december-2025-security-releases "nodejs.org") — New releases of Node’s v25.x, 24.x, 22.x, and 20.x release lines are expected next Monday, or shortly thereafter, to address five security vulnerabilities (three with ‘high’ severity). We’ll share an update in next Tuesday’s issue. **_\--- The Node.js Project_**
  
- [Level Up Redis Visibility in Node.js](https://dashboard.memetria.com/nodeweekly/ "dashboard.memetria.com") — See inside Valkey and OSS Redis. Memetria K/V adds key-level visibility, memory analytics, and performance insights built for Node.js developers — so you can detect large keys and optimize latency before users notice. **_\--- Memetria sponsor_**
  
- [No More Tokens: Locking Down `npm` Publishing Workflows](https://www.zachleat.com/web/npm-security/ "www.zachleat.com") — Following the recent spate of high-profile npm security incidents, Zach, author of [11ty](https://www.11ty.dev/), decided to carry out a full audit of his npm security footprint and shares some tips any package publisher can adopt. **_\--- Zach Leatherman_**
  
- [Progress on TypeScript 7](https://devblogs.microsoft.com/typescript/progress-on-typescript-7-december-2025/ "devblogs.microsoft.com") — v6.0 is going to be TypeScript’s [last JavaScript-based release](https://socket.dev/blog/typescript-6-0-will-be-the-last-javascript-based-major-release) and will act as a stepping stone to [the native Go port](https://devblogs.microsoft.com/typescript/typescript-native-port/) that will be the eventual v7.0 which is already shaping up to be some 10x faster. **_\--- Daniel Rosenwasser (Microsoft)_**
  
- [How We Made `@platformatic/kafka` 223% Faster](https://blog.platformatic.dev/how-we-made-platformatickafka-223-faster-and-what-we-learned-along-the-way "blog.platformatic.dev") — Platformatic’s [Kafka client](https://github.com/platformatic/kafka) was created last year as the existing options at the time had various compatibility and performance issues, but Platformatic wanted _even more_ performance.. Here’s how they did the benchmarking and identified, then solved, some bottlenecks. **_\--- Paolo Insogna (Platformatic)_**
  

- 📄 [Replacing `glob-all` with `fs.promises.glob` in Node](https://www.sitelint.com/blog/replacing-glob-all-with-fs-promises-glob-in-node-js) **_\--- SiteLint_**
- 📄 [The Nuances of JavaScript Typing Using JSDoc](https://thathtml.blog/2025/12/nuances-of-typing-with-jsdoc/) **_\--- Jared White_**
- 📄 [How to Use GitHub Copilot Spaces to Debug Issues Faster](https://github.blog/ai-and-ml/github-copilot/how-to-use-github-copilot-spaces-to-debug-issues-faster/) **_\--- Andrea Griffiths (GitHub)_**

## 🛠 Code & Tools

  
- [ts-exec: Execute TypeScript on Node using SWC](https://github.com/poppinss/ts-exec "github.com") — From the creator of [Adonis](https://adonisjs.com/) comes another way to run TypeScript on Node. While Node 22.18+ supports [type stripping](https://nodejs.org/en/learn/typescript/run-natively), `ts-exec` supports JSX and decorators and [has some benefits over `ts-node` and `tsx`.](https://github.com/poppinss/ts-exec?tab=readme-ov-file#-why-ts-exec-exists) **_\--- Harminder Virk_**
  
- [BoldSign eSignature API & SDK — Built for Developers, Easy to Integrate](https://boldsign.com/esignature-api/?utm_source=cooperpress&utm_medium=cpc&utm_campaign=nodeweekly_classified "boldsign.com") — ✍️ Ship secure e-signatures in your app in minutes with the BoldSign SDK & API. Get your free API key and start testing today. **_\--- BoldSign sponsor_**
  
- [iceberg-js: A JavaScript Client for Apache Iceberg](https://supabase.com/blog/introducing-iceberg-js "supabase.com") — A minimal, vendor-agnostic JavaScript client for the Apache Iceberg REST Catalog API. **_\--- Katerina Skroumpelou (Supabase)_**
  
- [Remend: Automatic Recovery of Broken Streaming Markdown](https://vercel.com/changelog/new-npm-package-for-automatic-recovery-of-broken-streaming-markdown "vercel.com") — Bring intelligent incomplete Markdown handling to your app, particularly useful if working with LLMs, say. It’s extracted from Vercel’s [Streamdown](https://github.com/vercel/streamdown) library, a drop-in replacement for `react-markdown`, designed for AI-powered streaming. **_\--- Hayden Bleasel (Vercel)_**
- **GitHub Actions'** [setup-node 6.1](https://github.com/actions/setup-node/releases/tag/v6.1.0) – A minor bump for the action that installs Node within a GitHub Actions run.
- 🤖 [OpenAI Node 6.10](https://github.com/openai/openai-node) – The official Node library for OpenAI's API adds support for `gpt-5.1-codex-max` and compaction.
- [jsdom 27.3](https://github.com/jsdom/jsdom) – Pure JS implementation of WHATWG DOM and HTML standards.
- 📸 [exiftool-vendored.js 34.0](https://github.com/photostructure/exiftool-vendored.js/releases/tag/34.0.0) – Use ExifTool to get metadata from photos.
- [Mongoose 9.0.1](https://github.com/Automattic/mongoose/releases/tag/9.0.1) – Popular MongoDB object modeling library.
- [hot-shots 11.4](https://github.com/bdeitte/hot-shots) – Node.js client for statsd, DogStatsD, and Telegraf.
- [pnpm 10.25](https://pnpm.io/blog/releases/10.25) – The alternative, efficient package manager.
- [Prisma 7.1](https://github.com/prisma/prisma/releases/tag/7.1.0) – Popular ORM for Node.js and TypeScript.
- [Prettier 3.7](https://prettier.io/blog/2025/11/27/3.7.0) – The opinionated code formatter.
- [Drizzle ORM 0.45](https://github.com/drizzle-team/drizzle-orm/releases/tag/0.45.0)

## 📢  Elsewhere in the ecosystem

A roundup of some other interesting stories in the broader landscape:

- Anthropic, best known for its Claude LLMs, [has acquired the company behind the _Bun_ JavaScript runtime.](https://bun.com/blog/bun-joins-anthropic) Bun will remain open source.
- In other Bun news, [Bun v1.3.4 was released](https://bun.sh/blog/bun-v1.3.4) with support for `URLPattern`, fake/controllable timers in its test runner, and `console.log` now supports the `%j` specifier like Node does.
- 🎧 Microsoft has launched [a VS Code Insiders podcast](https://code.visualstudio.com/blogs/2025/12/03/introducing-vs-code-insiders-podcast) to allow the VS Code team to go _"beyond the release notes"_ and talk about VS Code's features and adjacent ecosystem.
- Gleb Bahmutov has been publishing [a daily _Cypress vs Playwright_ advent calendar](https://cypresstips.substack.com/) this month.
- [Oxlint introduces type-aware linting](https://oxc.rs/blog/2025-12-08-type-aware-alpha) in alpha form.
- 🎂 [JavaScript was first announced in this press release 30 years ago.](https://web.archive.org/web/20070916144913/http://wp.netscape.com/newsref/pr/newsrelease67.html)
