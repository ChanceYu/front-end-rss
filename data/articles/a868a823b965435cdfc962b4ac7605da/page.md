---
title: "Building JavaScript tools in a single HTML file"
link: "https://javascriptweekly.com/issues/765"
date: 2025-12-12
md5: a868a823b965435cdfc962b4ac7605da
---

# Building JavaScript tools in a single HTML file

[![](./images/8292f576c3d7417c6d3730597aa042e0.jpeg)](https://simonwillison.net/2025/Dec/10/html-tools/)  
- [Useful Patterns for Building HTML Tools](https://simonwillison.net/2025/Dec/10/html-tools/ "simonwillison.net") — In many situations, you don’t need a full-on framework to build useful tools; just HTML, JavaScript and CSS in a single file will do the job fine. Simon’s become a bit of an expert by rolling out [many such tools](https://tools.simonwillison.net/) using LLMs, and shares his process and practices here. More please! **_\--- Simon Willison_**
  
- [Why Are the Top AI Companies Choosing SpreadJS?](https://developer.mescius.com/spreadjs?utm_source=CooperPress&utm_medium=JavaScript-Weekly&utm_campaign=SPJS-JS-Weekly-Primary-Sponsor-December-2025 "developer.mescius.com") — Because SpreadJS brings a familiar Excel-like UI to JavaScript web apps. Trusted by leading AI innovators and organizations, it empowers devs to build finance, analytics, and more apps with Excel I/O, 500+ calc functions, charts, & more. [View demos!](https://developer.mescius.com/spreadjs?utm_source=CooperPress&utm_medium=JavaScript-Weekly&utm_campaign=SPJS-JS-Weekly-Primary-Sponsor-December-2025) **_\--- SpreadJS From MESCIUS sponsor_**
  
- [Deno 2.6 Released](https://deno.com/blog/v2.6 "deno.com") — The popular alternative runtime introduces a new `npx`\-like tool called `dx` to run binaries from npm and JSR packages, adds a `deno audit` tool for identifying vulnerabilities in dependencies, adds more granular control over runtime permissions, implements [source phase imports](https://github.com/tc39/proposal-source-phase-imports), and more. **_\--- Iwańczuk and Jiang (Deno)_**

**IN BRIEF:**

- ⚠️ [Two more vulnerabilities relating to React Server Components](https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components) surfaced yesterday, separate to last week's [React2Shell](https://react2shell.com/) incident.
- 🔒 [GitHub shares an update on its npm token policies.](https://github.blog/changelog/2025-12-09-npm-classic-tokens-revoked-session-based-auth-and-cli-token-management-now-available/) All npm classic tokens have been revoked this week, and there's now a new process for getting a two hour session token or a granular access token instead.
- 🕒 [Chrome 144 Beta](https://developer.chrome.com/blog/chrome-144-beta?hl=en) has been released with support for the [Temporal API](https://tc39.es/proposal-temporal/) for working with dates and times.
- Microsoft has unveiled [a preview of its _JavaScript/TypeScript Modernizer_ for VS Code](https://developer.microsoft.com/blog/jsts-modernizer-preview) – it's a tool that analyzes a project and suggests an upgrade plan for both syntax and dependencies.
- [Oxlint introduces type-aware linting](https://oxc.rs/blog/2025-12-08-type-aware-alpha) in alpha form.

**RELEASES:**

- [Node.js v24.12.0 (LTS)](https://nodejs.org/en/blog/release/v24.12.0) – The first LTS release of Node.js with type stripping marked as stable.
- [@platformatic/python-node v2.0](https://blog.platformatic.dev/streaming-and-websocket-support-now-available-in-platformaticpython-node) – Run Python ASGI apps in Node.js processes. Now supporting HTTP response streaming and bidirectional WebSockets.
- [Bun v1.3.4](https://bun.sh/blog/bun-v1.3.4) – Now with support for `URLPattern`, fake/controllable timers in its test runner, and `console.log` now supports the `%j` specifier like Node.
- [React v19.2.3](https://github.com/facebook/react/releases/tag/v19.2.3), [v19.1.4](https://github.com/facebook/react/releases/tag/v19.1.4), and [v19.0.3](https://github.com/facebook/react/releases/tag/v19.0.3)

## 📖  Articles and Videos

  
- [How the _Seattle Times_ is Protecting Itself from npm Supply Chain Attacks](https://pnpm.io/blog/2025/12/05/newsroom-npm-supply-chain-security "pnpm.io") — Technical details on how the _Seattle Times_ has been adopting [pnpm](https://pnpm.io/) as an alternative to `npm` for its enhanced client-side security controls. **_\--- Ryan Sobol_**
  
- [A Proposal for Making Complex Web Apps Faster](https://blogs.windows.com/msedgedev/2025/12/09/making-complex-web-apps-faster/ "blogs.windows.com") — From Microsoft comes an early-stage look at a [proposal](https://github.com/WICG/delayed-message-timing/blob/main/README.md) for a new _Delayed Message Timing API_ to help deal with the slowdowns that multiple parallel contexts (_iframes, threads, multiple windows, etc_) can introduce. Feedback is being sought. **_\--- Joone Hur & Patrick Brosset (Microsoft)_**
  
- [Behind CERN’s Data Engine: Faster Writes, Instant Insights](https://www.tigerdata.com/blog/how-cern-powers-ground-breaking-physics-with-timescaledb "www.tigerdata.com") — CERN’s massive time-series workloads run faster with TimescaleDB, improving ingestion, compression, and real-time analytics. **_\--- Tiger Data sponsor_**
  
- [Building a Tiny 2D Physics Engine in JavaScript](https://xem.github.io/articles/2D-physics.html "xem.github.io") — A lovely, and rather old-school style post about building a simple physics engine from scratch in JavaScript then golfing it down to just 2KB of source as seen [on its homepage](https://xem.github.io/2Dphysics/) (where there's a demo too). **_\--- Maxime Euzière_**
  

- 📄 [Non-Blocking Cross-Browser Image Rendering on the Canvas](https://calendar.perfplanet.com/2025/non-blocking-image-canvas/) – A good way to improve UX responsiveness with more complex use cases. **_\--- Alexander Myshov_**
- 📄 [_Prelude of the Chambered_ Reborn: Rewriting a Classic in TypeScript](https://angelo-lima.fr/en/prelude-of-the-chambered-reborn-typescript-web-port/) – Porting a Java game that Minecraft’s creator worked on during a _Ludum Dare_ contest. **_\--- Angelo Lima_**
- 📄 [Angular Tips](https://ngtips.com/) – A documentation site covering numerous best practices for building large Angular apps. **_\--- Martin Boué_**

## 🛠 Code & Tools

[![](./images/d8e4f8f5e5ee37b542c10775bf0a3ea0.jpeg)](https://remix.run/blog/oss-remix-store)  
- [Open Sourcing the _Remix_ Store](https://remix.run/blog/oss-remix-store "remix.run") — [The Remix Store](https://shop.remix.run/) is a swag store for the [Remix](https://remix.run/) project and its codebase provides a powerful example of how Remix’s own core team builds apps with Remix and [Hydrogen](https://hydrogen.shopify.dev/). **_\--- Brooks Lybrand and the Remix Team_**

> 💡 You don't need to be a Remix user to benefit from this code, either. For example, [here's the code](https://github.com/remix-run/remix-store/blob/96c15c44d2a99250133e89ca92ea016959dab5c7/app/components/matrix-text.tsx) to the store's neat ['glitchy' 404 page](https://shop.remix.run/blah) which you could adapt to use elsewhere.

  
- 🕒 [`<relative-time>` 5.0: Format Timestamps as a Natural Language Relative Time](https://github.com/github/relative-time-element "github.com") — Supply this web component with a standard formatted date and time and it’ll render _“2 days ago”_, say. GitHub uses this itself on all repo and code views. **_\--- GitHub_**
  
- [Still Writing Tests Manually?](https://www.meticulous.ai?utm_source=jsweekly&utm_medium=newsletter&utm_campaign=q4) — See why modern engineering teams like Dropbox, Notion and Lattice rely on Meticulous to run E2E UI tests. **_\--- Meticulous AI sponsor_**
  
- [ts-exec: Execute TypeScript on Node using SWC](https://github.com/poppinss/ts-exec "github.com") — From the creator of [Adonis](https://adonisjs.com/) comes another way to run TypeScript on Node. While Node 22.18+ supports [type stripping](https://nodejs.org/en/learn/typescript/run-natively), `ts-exec` supports JSX and decorators and [has some benefits over `ts-node` and `tsx`.](https://github.com/poppinss/ts-exec?tab=readme-ov-file#-why-ts-exec-exists) **_\--- Harminder Virk_**
  
- [Toastflow: A Toast Notifications Library for Vue 3](https://toastflow.adrianjanocko.sk/ "toastflow.adrianjanocko.sk") — A really nifty web-based playground for playing around with toast notifications. I wish more projects had things like this. Toastflow is technically framework agnostic, but the only renderer so far is for Vue 3. [GitHub repo.](https://github.com/adrianjanocko/toastflow) **_\--- Adrián Janočko_**
  
- [Devalue: Get the Job Done When `JSON.stringify` Can't](https://github.com/sveltejs/devalue "github.com") — A library from the Svelte project that’s like `JSON.stringify` but that can tackle more things like cyclical and repeated references, regexes, `Map` and `Set`, and even custom types. You can [try it out here.](https://svelte.dev/playground/138d70def7a748ce9eda736ef1c71239) **_\--- Svelte_**
  
- [iceberg-js: A JavaScript Client for Apache Iceberg](https://supabase.com/blog/introducing-iceberg-js "supabase.com") — A minimal, vendor-agnostic JavaScript client for the Apache Iceberg REST Catalog API that works in most runtimes and environments. **_\--- Katerina Skroumpelou (Supabase)_**
- [Inertia 2.3](https://inertiajs.com/) – Build single-page React, Vue and Svelte apps using classic server-side routing and controllers (ideally for integrating with server-side frameworks like Django, Rails, Laravel, etc.)
- [OpenPGP.js 6.3](https://github.com/openpgpjs/openpgpjs/releases/tag/v6.3.0) – OpenPGP implementation for JavaScript.
- 🗓️ [React Datepicker 9.0](https://reactdatepicker.com/) – Long–standing React date picker component.
- 🎸 [SVGuitar 2.5](https://github.com/omnibrain/svguitar) – Render guitar chord charts in SVG form.
- [pnpm 10.25](https://github.com/pnpm/pnpm/releases/tag/v10.25.0) – Fast, space efficient package manager.
- [js-tokens 10.0](https://github.com/lydell/js-tokens) – Tiny JavaScript source tokenizer.

> **📰 CLASSIFIEDS**
> 
> [Trigger.dev](https://fandf.co/494618y) handles queues, retries, and long-running tasks so you can build production-ready agents and TypeScript workflows reliably at scale.
> 
> ---
> 
> $5 PostgreSQL now available. Stop overpaying for idle instances with the [new developer tier from Aiven.](https://aiven.io/developer-tier?utm_source=freeman-forrest&utm_medium=newsletter&utm_campaign=aiven-december&utm_term=jsweekly&utm_content=developertier)

## 📢  Elsewhere in the ecosystem

Some other interesting tidbits in the broader landscape:

[![](./images/f94e77b71420f69b3324bcdf3a80e2b1.jpeg)](https://www.youtube.com/watch?v=IP6EZXzXBzY)

- 📺 Earlier this year, Dimitri Mitropoulos wowed us by [running Doom inside TypeScript's type system](https://socket.dev/blog/typescript-types-running-doom) – now he's back [▶️ showing off TypeSlayer](https://www.youtube.com/watch?v=IP6EZXzXBzY), a tool for diagnosing and fixing TypeScript performance problems with some fantastic 3D visualizations. It looks great, but isn't public _yet_.
- Get up to speed with the latest developments in the world of CSS this year with the Chrome team's [CSS Wrapped 2025.](https://chrome.dev/css-wrapped-2025/)
- GitHub shares some updates on [work it's done on its GitHub Actions platform](https://github.blog/news-insights/product-news/lets-talk-about-github-actions/) and some new features coming in 2026.
- 🗳️ Rick Viscomi of the Google Chrome team has put out a call for you to [vote for the web features you want to see](https://web.dev/blog/upvote-features) in the future. This is a separate effort from the recent Interop 2025 voting process and votes will accumulate over the long term.
- 🤖 [OpenAI released its GPT 5.2 model](https://openai.com/index/introducing-gpt-5-2/) yesterday.
