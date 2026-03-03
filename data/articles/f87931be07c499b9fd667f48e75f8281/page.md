---
title: "Can we ever fix the web dependency mess?"
link: "https://javascriptweekly.com/issues/768"
date: 2026-01-13
md5: f87931be07c499b9fd667f48e75f8281
---

# Can we ever fix the web dependency mess?

#​768 — January 13, 2026

[Read on the Web](https://javascriptweekly.com/issues/768)

[![](./images/7d155c53937a419cd8bad0a51ebd0798.jpeg)](https://lea.verou.me/blog/2026/web-deps/)  
- [Web Dependencies are Broken; Can We Fix Them?](https://lea.verou.me/blog/2026/web-deps/ "lea.verou.me") — Lea, who has worked at the heart of Web Standards for years, delivers a compelling (and educational) call to action about a problem every JavaScript developer has encountered: why is managing dependencies and introducing them into code so unnecessarily messy and what could we do about it? **_\--- Lea Verou_**
  
- [Build Marketing Sites Like Apple](https://frontendmasters.com/courses/winning-websites/?utm_source=email&utm_medium=javascriptweekly&utm_content=winningwebsites "frontendmasters.com") — Learn how modern, high-impact marketing sites are built from someone doing it at the highest level. Matias Gonzales, Design Engineer at Vercel, teaches GSAP animation, scroll-driven storytelling, 3D with Three.js, and performance-first techniques used on award-winning sites. **_\--- Frontend Masters sponsor_**

**IN BRIEF:**

- 📺 [The full set of React Conf 2025 videos](https://conf.react.dev/) is now online, made up of 25 talks and 23 interviews, including [one with four members of the core team.](https://www.youtube.com/watch?v=NJUXAWTuaTo&list=PLNG_1j3cPCaZQCTcTinGsD-s8Wt9PIsYA&index=4)
- There's [a tiny update in the Deno-vs-Oracle JavaScript trademark dispute](https://bsky.app/profile/deno.land/post/3mbuirnjqxc22) with Oracle requesting, and Deno agreeing to, a 60-day extension. As it stands, the case is set to drag into 2027.
- 📘 [The Concise TypeScript Book](https://github.com/gibbok/typescript-book) is a short, focused TypeScript guide that's open and free to read.

**RELEASES:**

- [Node.js January 13 2026 Security Releases](https://nodejs.org/en/blog/vulnerability/december-2025-security-releases) – Long-awaited security releases of Node.js v20.x, 22.x, 24.x, and 25.x to resolve five different vulnerabilities.
- [Bun v1.3.6](https://bun.com/blog/bun-v1.3.6) – `Bun.Archive` can now work with tar archives, `Bun.JSONC` supports parsing commented JSON, plus there are many performance optimizations and tweaks.
- [pnpm 10.28](https://pnpm.io/blog/releases/10.28) – The efficient package manager adds a `beforePacking` hook to customize `package.json`'s contents at publish time.
- Angular 21.1 is expected this week. [v21.1 rc0 landed last week](https://github.com/angular/angular/releases/tag/v21.1.0-rc.0) teasing some of the updates.
- [Ember 6.9](https://blog.emberjs.com/ember-released-6-9/), [ESLint v10.0.0 RC0](https://eslint.org/blog/2026/01/eslint-v10.0.0-rc.0-released/), [Rspack 1.7](https://rspack.rs/blog/announcing-1-7)

## 📖  Articles and Videos

  
- [Date is _Out_, Temporal is _In_](https://piccalil.li/blog/date-is-out-and-temporal-is-in/ "piccalil.li") — The [Temporal API](https://tc39.es/proposal-temporal/docs/) has been promised as a future API tackling the weaknesses of JavaScript’s `Date` [for many years](https://maggiepint.com/2017/04/09/fixing-javascript-date-getting-started/) now, but finally that future is arriving. Mat leans on numerous examples to show off `Date`'s weaknesses and push Temporal’s strengths here. **_\--- Mat “Wilto” Marquis_**

> 💡 Temporal's [browser support](https://caniuse.com/temporal) still looks weak, but [Chrome 144](https://developer.chrome.com/blog/chrome-144-beta#the_temporal_api) – rolling out generally this week – brings full support. [Temporal Polyfill](https://github.com/js-temporal/temporal-polyfill) also offers a stop-gap while native support grows.

  
- [How Wrong Can a JavaScript Date Calculation Go?](https://philna.sh/blog/2026/01/11/javascript-date-calculation/ "philna.sh") — _“the story of an issue that I faced that will be much easier to handle once_ `Temporal` _is more widespread.”_ **_\--- Phil Nash_**
  
- [Add GitHub, Slack & Google Integrations Without Rebuilding OAuth](https://workos.com/docs/pipes?utm_source=cpjavascript&utm_medium=newsletter&utm_campaign=q12026&utm_content=no_rebuild "workos.com") — WorkOS Pipes handles OAuth flows, token refresh, and storage. Users connect via a widget, your app makes one API call. **_\--- WorkOS sponsor_**
  
- [Stop Turning Everything Into Arrays (and Do Less Work Instead)](https://allthingssmitty.com/2026/01/12/stop-turning-everything-into-arrays-and-do-less-work-instead/ "allthingssmitty.com") — A post showing off [_iterator helpers_](https://v8.dev/features/iterator-helpers), a broadly supported set of methods for working with `Iterator` objects as a more efficient way of processing data lazily in an iterative (rather than randomly accessed) fashion. **_\--- Matt Smith_**
  
- [How to 'Steal' Any React Component](https://fant.io/react/ "fant.io") — A look at how to reproduce a component from a production React app without the original source, using React’s internal data structures (via [Fiber](https://github.com/acdlite/react-fiber-architecture)) and LLMs to reconstruct things. **_\--- David Fant_**
  

- 📄 [JavaScript's `for`\-`of` Loops Are Actually Fast](https://waspdev.com/articles/2026-01-01/javascript-for-of-loops-are-actually-fast) **_\--- Suren Enfiajyan_**
- 📄 [Why ARM Has a 'JavaScript Instruction'](https://notnotp.com/notes/til-why-arm-has-a-js-instruction/) – `FJCVTZS`, specifically. **_\--- NotNotP_**
- 📄 [How I Write Custom Elements with lit-html](https://frontendmasters.com/blog/custom-elements-with-lit-html/) **_\--- Dave Samaniego_**
- 📄 [`document.currentScript` is More Useful Than I Thought](https://frontendmasters.com/blog/document-currentscript-is-more-useful-than-i-thought/) **_\--- Chris Coyier_**
- 📄 [What Happened (and What's Happening) to WebAssembly](https://emnudge.dev/blog/what-happened-to-webassembly/) **_\--- Emnudge_**

## 🛠 Code & Tools

[![](./images/be8bda871bd63eba736fc865073eab8c.jpeg)](https://facebook.github.io/memlab/)  
- [memlab 2.0: A Framework for Finding JavaScript Memory Leaks](https://facebook.github.io/memlab/ "facebook.github.io") — A testing and analysis framework for identifying memory leaks and optimization opportunities that spawned from [Facebook’s own approach](https://engineering.fb.com/2022/09/12/open-source/memlab/) to optimizing its main app. Write scenarios, and memlab compares heap snapshots, filters memory leaks, and aggregates the results. **_\--- Facebook Open Source_**
  
- [The Time-Series Database That Balances Simplicity and Performance](https://www.tigerdata.com/timescaledb?utm_source=cooperpress&utm_medium=referral&utm_campaign=javascript-weekly-newsletter "www.tigerdata.com") — Stay Postgres-native with automatic partitioning, 95% compression, and continuous aggregates at production scale. **_\--- Tiger Data (creators of TimescaleDB) sponsor_**
  
- [Fabric.js 7.1: A Powerful SVG Abstraction Library](https://github.com/fabricjs/fabric.js "github.com") — Provides an interactive object model on top of the HTML5 canvas to make it easier to work with multiple visual elements. Ideal for the browser but it works with Node too. **_\--- Fabric.js_**
  
- [Ohm: A Parsing Toolkit for JavaScript and TypeScript](https://ohmjs.org/ "ohmjs.org") — It’s been a few years since we covered this project and it’s come along a lot since. It’s a library for building PEG-based parsers you can use in interpreters, compilers, analysis tools, etc. and you can even [play with its grammar online.](https://ohmjs.org/editor/) **_\--- Warth, Dubroy, et al._**
  
- [Superdiff 3.2: Compares Two Arrays or Objects and Return a Diff](https://github.com/DoneDeal0/superdiff "github.com") — Got two similar objects or arrays and want to see the underlying differences? Superdiff's recent updates boost performance, add support for streamed input and using a worker for more efficient diffing in a separate thread. **_\--- antoine_**
- [JavaScriptKit 0.38](https://github.com/swiftwasm/JavaScriptKit) – Swift framework to interact with JavaScript via WebAssembly.
- 🎵 [alphaTab 1.8](https://alphatab.net/docs/releases/release1_8) – Music notation and guitar tab rendering library.
- [Neo.mjs v11.20](https://github.com/neomjs/neo/releases/tag/11.20.0) – Multi-threaded application engine for the Web.
- [Monio 0.70.0](https://github.com/getify/monio) – Kyle Simpson's IO monad implementation.
- [Ant Design 6.2](https://github.com/ant-design/ant-design/releases/tag/6.2.0) – UI design language and React UI library.
- [xstyled 4.1](https://github.com/styled-components/xstyled) – Utility-first CSS-in-JS framework for React.
- [Jint 4.5](https://github.com/sebastienros/jint) – JavaScript interpreter for .NET.

📰 Classifieds

⚡️Add lightning-fast barcode & QR scanning to your web app with [STRICH](https://strich.io/?ref=js-weekly), a lean JS library. Simple, predictable pricing. [Free trial and demo!](https://strich.io/?ref=js-weekly)

---

Only fools write manual tests – modern engineering teams like Notion, Dropbox and Lattice use [Meticulous](https://www.meticulous.ai/?utm_source=jsweekly&utm_medium=newsletter&utm_campaign=jan13th2026) to maintain E2E UI tests [covering every edge case](https://www.meticulous.ai/?utm_source=jsweekly&utm_medium=newsletter&utm_campaign=jan13th2026) of your web app.

---

🚀 Auth0 for AI Agents is the complete auth solution for building AI agents more securely. [Start building today](https://auth0.com/signup?onboard_app=auth_for_aa&ocid=701KZ000000cXXxYAM_aPA4z0000008OZeGAM?utm_source=cooperpress&utm_campaign=amer_namer_usa_all_ciam_dev_dg_plg_auth0_native_cooperpress_native_aud_jan_2026_placements_utm2&utm_medium=cpc&utm_id=aNKWR000002m8zp4AA).

## 📢  Elsewhere in the ecosystem

Some other interesting tidbits in the broader landscape:

- 🤖 [Even Linus Torvalds is 'vibe coding' now.](https://www.zdnet.com/article/linus-torvalds-vibe-coding-ai/) He's been using Google's Antigravity tool to [create some digital sound effects.](https://github.com/torvalds/AudioNoise)
- [GitHub is planning to implement 'staged publishing' for npm packages](https://socket.dev/blog/npm-to-implement-staged-publishing) in 2026 as a way to introduce a review step before releases go live.
- 🗓️ [The Astro team shares](https://astro.build/blog/year-in-review-2025/) a full 2025 year in review post. It's been a big year for the popular framework.
- Anil Dash shares [the story of how Markdown took over the world.](https://www.anildash.com/2026/01/09/how-markdown-took-over-the-world/)
- [The results of the _State of HTML 2025_ survey](https://2025.stateofhtml.com/en-US/) are now available.
- TIL that Deno, the JavaScript runtime, [is being distributed on Python's PyPI](https://github.com/denoland/deno/issues/31254) to make it easier for Python apps to call out to JavaScript as needed.
- In 2025, [Bun was the third largest contributor to JavaScriptCore](https://x.com/bunjavascript/status/2010933884196962724), the JavaScript engine powering both Safari and Bun.
