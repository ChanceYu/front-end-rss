---
title: "A new JavaScript engine from Fabrice Bellard"
link: "https://javascriptweekly.com/issues/767"
date: 2026-01-06
md5: 764c44de6fb1810fe5ebd871a2555203
---

# A new JavaScript engine from Fabrice Bellard

> 🎉 Happy New Year. **JavaScript Weekly is now landing in your inboxes on Tuesdays**, so here we are! Let's see what 2026 brings.  
> \_\_  
> _Your editor, Peter Cooper_

[![](./images/b76766103add0f752d5b9d8c8ac4456a.jpeg)](https://risingstars.js.org/2025/en)  
- [The 2025 JavaScript Rising Stars](https://risingstars.js.org/2025/en "risingstars.js.org") — At the start of each year, Michael rounds up the projects in the JavaScript ecosystem that gained the most popularity on GitHub in the prior year. After a two-year run of topping the chart, `shadcn/ui` has been pushed down to #3 by [n8n](https://n8n.io/) and [React Bits](https://reactbits.dev/). This is a fantastic roundup, now in its tenth(!) year, and features commentary from a few industry experts too. **_\--- Michael Rambeau et al._**
  
- [Make Flaky Tests a Last-Year Problem](https://www.meticulous.ai/?utm_source=jsweekly&utm_medium=newsletter&utm_campaign=jan6th2026 "www.meticulous.ai") — Meticulous creates and maintains a continuously evolving E2E UI test suite with zero developer effort. Built on Chromium with a deterministic engine, it’s the only testing tool that eliminates flakes. Relied on by Dropbox, Notion, and Lattice. **_\--- Meticulous Ai sponsor_**
  
- [MicroQuickJS: A New JavaScript Engine from Fabrice Bellard](https://github.com/bellard/mquickjs/blob/main/README.md "github.com") — [Fabrice](https://bellard.org/), one of the world’s most prolific developers well-known for creating FFmpeg, QEMU and [QuickJS](https://bellard.org/quickjs/), is back with a new JavaScript engine targeting embedded systems, and that can run with as little as 10KB of RAM. **_\--- Fabrice Bellard_**

> 💡 The [discussion about MicroQuickJS on Hacker News](https://news.ycombinator.com/item?id=46367224) was particularly rich. Redis's creator, Salvatore Sanfilippo, even noted that Redis would have used JavaScript as its scripting language instead of Lua if this had existed in 2010.

**IN BRIEF:**

- [pnpm](https://pnpm.io/)'s lead maintainer, Zoltan Kochan, presents [a look back at how 2025 was a transformative year for the project.](https://pnpm.io/blog/2025/12/29/pnpm-in-2025)
- If you missed [our final issue of 2025](https://javascriptweekly.com/issues/766), be sure to check it out. We did a month-by-month rundown of what happened in the JavaScript world and shared the top ten links of the year.
- [WebF](https://openwebf.com/en/blog/announcing-webf) is a new WHATWG-compliant web runtime for Flutter so you can build parts of Flutter apps using a more typical JS stack (React, Vue, etc.)

**RELEASES:**

- [pnpm 10.27](https://pnpm.io/blog/releases/10.27) – The alternative, efficient (and increasingly security-focused) package manager gets some tweaks, including a setting to ignore trust policy checks for packages published more than a specified time ago.
- [Ink 6.6](https://github.com/vadimdemedes/ink) – Use React to build CLI apps, as used by Claude Code, Gemini CLI, [and many others.](https://github.com/vadimdemedes/ink?tab=readme-ov-file#whos-using-ink)
- 🎨 [Color.js v0.6](https://github.com/color-js/color.js/releases/tag/v0.6.0) – The popular standards-compliant color conversion and manipulation library approaches its eventual 1.0 release.
- [Prisma 7.2](https://github.com/prisma/prisma/releases/tag/7.2.0), [Deno 2.6.4](https://github.com/denoland/deno/releases/tag/v2.6.4)

## 📖  Articles and Videos

  
- [How to Compile JavaScript to C with Static Hermes](https://devongovett.me/blog/static-hermes.html "devongovett.me") — The creator of [Parcel](https://parceljs.org/) is porting parts of the project to Rust, but this raises some challenges on interoperating with existing JavaScript plugins, especially without a runtime JS interpreter. What about compiling JavaScript to C libraries that can be called directly? It’s possible! **_\--- Devon Govett_**
  
- 🦖 [Build a Dinosaur Runner Game with Deno](https://deno.com/blog/build-a-game-with-deno-1 "deno.com") — An ongoing series of posts (part [two](https://deno.com/blog/build-a-game-with-deno-2) and [three](https://deno.com/blog/build-a-game-with-deno-3) are also available) on the official Deno blog where you get to recreate something akin to Chrome’s [Dinosaur Game](https://en.wikipedia.org/wiki/Dinosaur_Game) for yourself. **_\--- Jo Franchetti_**
  
- [How CERN Cut Storage by 95% and 40x’d Query Speed with TimescaleDB](https://www.tigerdata.com/events/webinar-how-cern-powers-ground-breaking-physics-with-timescaledb?utm_source=cooperpress&utm_medium=referral&utm_campaign=cern-webinar-jan-21-2026 "www.tigerdata.com") — Learn how CERN engineers modernized Large Hadron Collider time-series data for performance, scale, and cost efficiency. **_\--- Tiger Data (creators of TimescaleDB) sponsor_**
  
- [Fixing TypeScript Performance Problems: A Case Study](https://www.viget.com/articles/fixing-typescript-performance-problems "www.viget.com") — A big monorepo-based TypeScript project was suffering sluggish IntelliSense, long type-checking times, and slow builds, but Solomon’s team found some ways to significantly improve things. **_\--- Solomon Hawk_**
  
- [Why Object of Arrays (SoA Pattern) Beat Interleaved Arrays](https://www.royalbhati.com/posts/js-array-vs-typedarray "www.royalbhati.com") — A dive down a JavaScript performance rabbit hole. **_\--- Royal Bhati_**
  

- 📄 [Brendan Eich Warns Against “Rushed Web UX Over Native” as Windows 11 Leans Harder on WebView2 and Electron](https://www.windowslatest.com/2025/12/27/javascript-creator-warns-against-rushed-web-ux-over-native-as-windows-11-leans-harder-on-webview2-and-electron/) **_\--- Windows Latest_**
- 📄 [Implementing Streaming JSON in Just 200 Lines of JavaScript](https://krasimirtsonev.com/blog/article/streaming-json-in-just-200-lines-of-javascript) **_\--- Krasimir Tsonev_**
- 📄 [Signals vs Query-Based Compilers](https://marvinh.dev/blog/signals-vs-query-based-compilers/) **_\--- Marvin Hagemeister_**
- 📄 [The Nine Levels of JavaScript Dependency Hell](https://nesbitt.io/2026/01/05/the-nine-levels-of-javascript-dependency-hell.html) **_\--- Andrew Nesbitt_**
- 📄 [How to Create a Pixel-to-Voxel Video Drop Effect with Three.js and Rapier](https://tympanus.net/codrops/2026/01/05/how-to-create-a-pixel-to-voxel-video-drop-effect-with-three-js-and-rapier/) **_\--- Junichi Kasahara_**

## 🛠 Code & Tools

[![](./images/17922cb2d0c2cbf23cc75a010185a833.jpeg)](https://schedule-x.dev/)  
- [Schedule-X 3.6: A Material Design Calendar and Date Picker](https://schedule-x.dev/ "schedule-x.dev") — Available in the form of React/Preact, Vue, Svelte, Angular, or plain JS components. Open source but with a premium version with extra features. [GitHub repo.](https://github.com/schedule-x/schedule-x) **_\--- Tom Österlund_**
  
- 📄 [jsPDF 4.0: Client-Side JavaScript PDF Generation](https://github.com/parallax/jsPDF "github.com") — Create tickets, documents, certificates, etc. all on the fly. There’s [a live demo](https://raw.githack.com/MrRio/jsPDF/master/index.html), as well as [thorough documentation.](https://rawgit.com/MrRio/jsPDF/master/docs/index.html) **_\--- Parallax_**
  
- [SurveyJS: JavaScript Libraries for Custom Web Forms](https://surveyjs.io/?utm_source=jsweekly&utm_medium=email&utm_campaign=q1_2026 "surveyjs.io") — Keep full ownership of your data. Build JSON-driven forms in your app without SaaS limitations. **_\--- SurveyJS sponsor_**
  
- [Bruno 3.0: An Open-Source HTTP API Client App](https://www.usebruno.com/ "www.usebruno.com") — There are a lot of ‘API client’ tools with varying levels of features, but this is open source and entirely built in JavaScript. v3.0 features a complete overhaul of the UI, adds workspaces for grouping things together, and more. [GitHub repo.](https://github.com/usebruno/bruno) **_\--- Bruno Software Inc._**
- [JoltPhysics.js 1.0](https://github.com/jrouwe/JoltPhysics.js) – A popular C++ physics library can now be used from JavaScript thanks to Emscripten. Check out [numerous demos here.](https://jrouwe.github.io/JoltPhysics.js/)
- 🎶 [ChordSheetJS 13.0](https://github.com/martijnversluis/ChordSheetJS) – Library for parsing and formatting chords and chord sheets. ([Demo.](https://martijnversluis.github.io/ChordFiddle/))
- [Middy 7.0](https://middy.js.org/docs/upgrade/6-7/) – Node.js middleware engine for AWS Lambda. Now supports Durable Functions.
- [PlayCanvas glTF Viewer 5.8](https://github.com/playcanvas/model-viewer) – 3D model viewer supporting glTF 2.0 and PLY.
- [k6 1.5](https://github.com/grafana/k6/releases/tag/v1.5.0) – Modern Go + JavaScript-powered load testing tool. ([Homepage.](https://k6.io/open-source/))
- 📊 [Recharts 3.6](https://github.com/recharts/recharts/releases/tag/v3.6.0) – Popular D3-powered React charting library.
- [NATS.js 3.3](https://github.com/nats-io/nats.js) – JavaScript client for the NATS messaging system.

> **📰 CLASSIFIEDS**
> 
> 🔑 Let users create their own API keys with [Clerk](https://go.clerk.com/VwLr1Ac). Built-in UI components, scopes, expiration & revocation. [Now in public beta](https://go.clerk.com/VwLr1Ac).
> 
> ---
> 
> [Trigger.dev](https://fandf.co/4pZ41UF) handles queues, retries, and long-running tasks so you can build production-ready agents and TypeScript workflows reliably at scale.

## 📢  Elsewhere in the ecosystem

Some other interesting tidbits in the broader landscape:

[![](./images/a9026336fe2fb1fac30af293e62dbbfd.jpeg)](https://webkit.org/blog/17660/introducing-css-grid-lanes/)

- For years, Mozilla, Apple, and the CSS Working Group have been working to bring "masonry" layouts _(as above)_ natively to CSS. The concept is now [called _CSS Grid Lanes_ and here's how it works.](https://webkit.org/blog/17660/introducing-css-grid-lanes/) You can already try it out in Safari Technology Preview 234.
- Addy Osmani shares [21 valuable lessons from spending 14 years at Google.](https://addyosmani.com/blog/21-lessons/) Good general advice for remaining a competent and engaged engineer over time.
- Andy Pavlo has put together a neat review of [what happened in the world of databases in 2025.](https://www.cs.cmu.edu/~pavlo/blog/2026/01/2025-databases-retrospective.html) Simon Willison has [a similar review of LLMs in 2025.](https://simonwillison.net/2025/Dec/31/the-year-in-llms/)
- 🤖 Mattias Geniar explains how [AI has made web development fun again](https://ma.ttias.be/web-development-is-fun-again/) (for him, at least).
- _Ultimate Linux_ is a curious experiment to build [a minimal userspace for Linux entirely in JavaScript.](https://github.com/popovicu/ultimate-linux)
