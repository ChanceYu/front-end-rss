---
title: "The JavaScript Bundler Grand Prix"
link: "https://javascriptweekly.com/issues/766"
date: 2025-12-19
md5: 81afd207157f238b8632a004792c0e6b
---

# The JavaScript Bundler Grand Prix

#​766 — December 19, 2025

[Read on the Web](https://javascriptweekly.com/issues/766)

🗓️ As it's the last issue of 2025, a reminder that **JavaScript Weekly moves to Tuesdays in January**. See you again on January 6, 2026!  
\_\_  
_Your editor, Peter Cooper_

It's the final issue of the year, so we're going to cover a few new items, then look back at the top links of 2025 (based on reader engagement) and recap what happened in the ecosystem month-by-month this year.

[![](./images/c5c73955a04330bb8ce3906e82154c37.jpeg)](https://redmonk.com/kholterhoff/2025/12/16/javascript-bundler-grand-prix/)

[The JavaScript Bundler Grand Prix](https://redmonk.com/kholterhoff/2025/12/16/javascript-bundler-grand-prix/ "redmonk.com") — Bundlers now sit at the heart of many JavaScript workflows and are sometimes even integrated into runtimes (e.g. [Bun’s](https://bun.com/docs/bundler)). This piece surveys the landscape and argues the speed wars are mostly over, with the real battle shifting to artifact size and the code that actually ships to users.

Kate Holterhoff

[![](./images/49774750b37292685b421c14bcf391da.jpeg)](https://frontendmasters.com/learn/ai/?utm_source=email&utm_medium=javascriptweekly&utm_content=learnai)

[Coding with AI: The Practical Path for JavaScript Devs](https://frontendmasters.com/learn/ai/?utm_source=email&utm_medium=javascriptweekly&utm_content=learnai "frontendmasters.com") — Go beyond demos and hype. Learn real AI-powered workflows with JavaScript, from prompt engineering and coding agents to MCP, ML, and production-ready apps.

Frontend Masters sponsor

['I Ported JustHTML from Python to JavaScript with LLMs in 4.5 Hours'](https://simonwillison.net/2025/Dec/15/porting-justhtml/ "simonwillison.net") — Prolific AI blogger Simon Willison shares the tale of porting a standards-compliant HTML5 parser (which passes all 9200+ [html5lib-tests](https://github.com/html5lib/html5lib-tests)) from Python to JavaScript using OpenAI’s Codex CLI and GPT 5.2. You can [play with the end result](https://simonw.github.io/justjshtml/playground.html) or [check out the code.](https://github.com/simonw/justjshtml)

Simon Willison

**IN BRIEF:**

- 🛠️ Dan Abramov [shows off his new 'RSC Explorer'](https://overreacted.io/introducing-rsc-explorer/), a tool for exploring how React Server Components work behind the scenes.
- Cloudflare Workers' _Wrangler_ tool now [supports automatic configuration for deploying apps](https://developers.cloudflare.com/changelog/2025-12-16-wrangler-autoconfig/) using numerous web frameworks to Workers, including Next.js, Astro, TanStack Start, SvelteKit, and Nuxt.
- [picknplace.js](https://jgthms.com/picknplace.js/) offers a fresh take on the idea of drag-and-drop.
- 🤖 OpenAI has [revealed its GPT 5.2 Codex model](https://openai.com/index/introducing-gpt-5-2-codex/) and we learn how two recent React vulnerabilities were discovered with its help.

**RELEASES:**

- [Tesseract.js 7.0](https://tesseract.projectnaptha.com/) – OCR library to extract text from images; now faster.
- [Base UI 1.0](https://base-ui.com/) – Elegant React component suite from a strong team.
- [Wasp 0.20](https://wasp.sh/blog/2025/12/17/wasp-xmas-launch) – Rails-like framework for React 19, Node & Prisma.
- [Graffle 7.4](https://github.com/graffle-js/graffle/releases/tag/7.4.0) – JavaScript GraphQL client that runs anywhere.
- [Next.js 16.1](https://nextjs.org/blog/next-16-1), [Bun 1.3.5](https://bun.com/blog/bun-v1.3.5), [MathJax 4.1](https://github.com/mathjax/MathJax-src/releases/tag/4.1.0), [Prisma 7.2](https://github.com/prisma/prisma/releases/tag/7.2.0)

🏆 The Top 10 Links of 2025

1. [A Perplexing JavaScript Parsing Puzzle](https://www.hillelwayne.com/post/javascript-puzzle/ "www.hillelwayne.com") — Hillel's deceptively simple puzzle – just 14 bytes of code – attracted by far the most attention this year. Despite working with JavaScript for most of its lifespan, I got it wrong!

Hillel Wayne

2. [Ecma International Approved ECMAScript 2025: What’s New?](https://2ality.com/2025/06/ecmascript-2025.html "2ality.com") — Each year, the Ecma General Assembly approves the latest ECMAScript language specification, and you can [read the ES2025 spec in full](https://tc39.es/ecma262/2025/). Better, though, is to enjoy Dr. Axel’s succinct explainer.

Dr. Axel Rauschmayer

[MACROSCOPE - Free AI Code Review for Open Source](https://links.macroscope.com/js-weekly "links.macroscope.com") — Free for non-commercial projects. Everyone else: use `OSSAI` for 50% off your first 2 months.

Macroscope sponsor

3. ['I Think the Ergonomics of Generators is Growing on Me'](https://macarthur.me/posts/generators/ "macarthur.me") — If you've never worked with [generator functions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function*), this remains a great look at what they are and where they _can_ be useful. Alex notes that _“their practicality hasn’t exactly caught on”_ (yet..)

Alex MacArthur

4. [How the Web is Using JavaScript](https://almanac.httparchive.org/en/2024/javascript "almanac.httparchive.org") — The JavaScript section of this year's HTTP Archive _Web Almanac_ report went into depth on how much JS we’re using (and _failing_ to use), the popularity of TypeScript, Web Worker usage, and.. yes, jQuery still dominates!

HTTP Archive

5. [Some Features Every JavaScript Developer Should Know in 2025](https://waspdev.com/articles/2025-04-06/features-that-every-js-developer-must-know-in-2025 "waspdev.com") — A quick list post breezing through some more modern areas of JavaScript including iterator helpers, `structuredClone()`, and set operations.

Suren Enfiajyan

**6.** [How to Keep `package.json` Under Control](https://blog.val.town/gardening-dependencies) – Covers 'dependency hygiene' and ways to keep things under control. Great tips and tool recommendations.

**7.** [A Brief History of JavaScript](https://deno.com/blog/history-of-javascript) – This epic timeline of JavaScript's history will remain a go-to resource for years.

**8.** [War Story: The Hardest Bug I Ever Debugged](https://www.clientserver.dev/p/war-story-the-hardest-bug-i-ever) – A former engineer on the Google Docs team told the tale of a bizarre error that afflicted Google Docs ten years ago.

**9.** [Things People Get Wrong About Electron](https://felixrieseberg.com/things-people-get-wrong-about-electron/) – One of Electron's maintainers defended the technical choices made by the project over the years.

**10.** [Move On to ESM-Only](https://antfu.me/posts/move-on-to-esm-only) – While you can maintain packages supporting both ESM and CommonJS, Anthony explained why it's finally time to go 'ESM only'.

🗓️  JavaScript in 2025: Month by Month

Let's step through the year and remember the biggest things that happened in JavaScript each month:

**JANUARY –** At the start of a very productive year for the alternative JS runtime, Bun took a big step forward with [Bun 1.2](https://bun.sh/blog/bun-v1.2). We also got a [big update on progress with Express.js.](https://expressjs.com/2025/01/09/rewind-2024-triumphs-and-2025-vision.html)

**FEBRUARY –** An epic [documentary about Angular](https://www.youtube.com/watch?v=cRC9DlH45lA) was released. The [Deno vs Oracle battle](https://deno.com/blog/deno-v-oracle2) over the JavaScript trademark rumbled on. [TypeScript 5.8](https://devblogs.microsoft.com/typescript/announcing-typescript-5-8/) was a big release for Node developers in particular. Meanwhile, [a developer implemented Doom](https://socket.dev/blog/typescript-types-running-doom) entirely in TypeScript's type system.

**MARCH –** [Babylon.js 8.0](https://blogs.windows.com/windowsdeveloper/2025/03/27/announcing-babylon-js-8-0/), the latest version of Microsoft's epic JavaScript 3D engine, was released, as was [Express 5.1](https://expressjs.com/2025/03/31/v5-1-latest-release.html).

**APRIL –** [Koa 3.0](https://koajs.com/) was released, [a major Node.js collaboration summit](https://nodejs.org/en/blog/events/collab-summit-2025-paris) took place in Paris, and [p5.js 2.0](https://p5js.org/) was released.

**MAY –** The Remix project had [a huge shakeup.](https://remix.run/blog/wake-up-remix) The [GSAP animation toolkit](https://gsap.com/blog/3-13/) was made freely available. The [Glitch platform announced](https://blog.glitch.com/post/changes-are-coming-to-glitch/) it was shutting down. The Deno team put together [an epic timeline of JavaScript's history](https://deno.com/blog/history-of-javascript) and Microsoft released its first preview of [its new natively-compiled Go port of TypeScript.](https://devblogs.microsoft.com/typescript/announcing-typescript-native-previews/)

**JUNE –** [Oxlint 1.0](https://voidzero.dev/posts/announcing-oxlint-1-stable) and [Vite 7.0](https://vite.dev/blog/announcing-vite7.html) were released. Dr. Axel unveiled [the ES2025 edition of his _Exploring JavaScript_ book.](https://exploringjs.com/js/) [Biome v2](https://biomejs.dev/blog/biome-v2/) became the first type-aware linter that didn't require `tsc`, and Ecma International [approved the ECMAScript 2025 spec.](https://2ality.com/2025/06/ecmascript-2025.html)

[When LLMs Hit Your Database, Schema Names Aren’t Enough](https://www.tigerdata.com/blog/the-database-new-user-llms-need-a-different-database "www.tigerdata.com") — See how adding semantic context to Postgres helps LLMs query data correctly, and boosts SQL accuracy by 27%.

Tiger Data sponsor

**JULY –** The [JS1024 code golfing contest](https://js1024.fun/) took place, [Deno 2.4](https://deno.com/blog/v2.4) was released, and [Vercel acquired NuxtLabs.](https://nuxtlabs.com/)

**AUGUST –** [TypeScript 5.9](https://devblogs.microsoft.com/typescript/announcing-typescript-5-9/) and [Apache Echarts 6](https://echarts.apache.org/handbook/en/basics/release-note/v6-feature/) were released. The jQuery team dropped [a release candidate of jQuery 4.0](https://blog.jquery.com/2025/08/11/jquery-4-0-0-release-candidate-1/) (we're still waiting for the final release, though).

**SEPTEMBER –** [Mediabunny](https://mediabunny.dev/) shook up the media processing scene. [Chrome turned 17](https://addyosmani.com/blog/chrome-17th/), and a messy few months for npm package security began with [a variety of packages being compromised in a phishing attack.](https://socket.dev/blog/npm-author-qix-compromised-in-major-supply-chain-attack) In response, [pnpm added support](https://pnpm.io/blog/releases/10.16) for delayed dependency updates. macOS Tahoe users found [Electron apps were laggy](https://github.com/electron/electron/issues/48311) due to a change in a private API. The Deno project [asked the community for $200k](https://deno.com/blog/javascript-tm-gofundme) to help with its JavaScript trademark case.

**OCTOBER –** [React Compiler v1.0](https://react.dev/blog/2025/10/07/react-compiler-1) was released, as well as [Node.js v25.0](https://nodejs.org/en/blog/release/v25.0.0), and [Node.js 24 became the active LTS release.](https://nodesource.com/blog/nodejs-24-becomes-lts) The React team [announced the React Foundation](https://react.dev/blog/2025/10/07/introducing-the-react-foundation) and moves to make React's ownership less attached to Meta. [Bun 1.3](https://bun.sh/blog/bun-v1.3) was released to much fanfare and Evan You [announced Vite+.](https://voidzero.dev/posts/announcing-vite-plus) GitHub announced [TypeScript had become the platform's #1 language.](https://github.blog/news-insights/octoverse/octoverse-a-new-developer-joins-github-every-second-as-ai-leads-typescript-to-1/)

**NOVEMBER –** The now-named Shai Hulud supply chain attack [reared its ugly head in a 'version 2' form.](https://about.gitlab.com/blog/gitlab-discovers-widespread-npm-supply-chain-attack/) The [JavaScript Engines Zoo](https://zoo.js.org/) launched to show us just how rich the JS runtime and engine ecosystem is. Google [unveiled Angular v21.](https://blog.angular.dev/announcing-angular-v21-57946c34f14b)

**DECEMBER –** [JavaScript turned 30 years old.](https://javascriptweekly.com/issues/764) Microsoft shared [an update on TypeScript 7.0](https://devblogs.microsoft.com/typescript/progress-on-typescript-7-december-2025/) and [Deno 2.6](https://deno.com/blog/v2.6) was released. [Node.js v24.12.0 (LTS)](https://nodejs.org/en/blog/release/v24.12.0) was also released, finally making type stripping stable in an LTS release.

📰 Classifieds

🎄 Give yourself the gift of time this Christmas. Let [Meticulous](https://www.meticulous.ai?utm_source=jsweekly&utm_medium=newsletter&utm_campaign=q4) observe your app and auto-build continuously evolving E2E UI tests while you celebrate. [Book a call now](https://www.meticulous.ai?utm_source=jsweekly&utm_medium=newsletter&utm_campaign=q4).

---

[Trigger.dev](https://fandf.co/4pZ41UF) handles queues, retries, and long-running tasks so you can build production-ready agents and TypeScript workflows reliably at scale.

🎄 This is the final issue of JavaScript Weekly for 2025 – thanks for reading, submitting links, and supporting us! **We're going to return on Tuesday, January 6, 2026.** See you then! And, if we're really lucky, we might catch up on our inbox packed with submissions by then too... ;-)
