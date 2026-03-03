---
title: "'Twas the Node before Christmas..."
link: "https://nodeweekly.com/issues/605"
date: 2025-12-16
md5: ee6e35aa8afab5d8c35b76c6ccebe313
---

# 'Twas the Node before Christmas...

#​605 — December 16, 2025

[Read on the Web](https://nodeweekly.com/issues/605)

🗓️ Today we're taking a look back over some of the big stories and links that got you clicking this year. Also, **Node Weekly will be moving to Thursdays in January 2026,** as part of a reshuffle for many of [our newsletters](https://cooperpress.com/publications/).  
\_\_  
_Your editor, Peter Cooper_

![](./images/d28247fe540f97fcaa0cc9153473b3dd.jpeg)

This is our final issue of the year, with a focus on looking back at what happened with Node in 2025, as well as the most popular items readers enjoyed. First, though, we do have a few items of news:

[Node.js v24.12.0 (LTS) Released](https://nodejs.org/en/blog/release/v24.12.0 "nodejs.org") — Node’s implementation of type-stripping in order to be able to [run TypeScript natively](https://nodejs.org/en/learn/typescript/run-natively) reaches a conclusion of sorts with the support being marked as stable for the first time in the active LTS release.

Michaël Zasso

💡 [Deno 2.6](https://deno.com/blog/v2.6) was also released with a new `npx`\-like tool called `dx` to run binaries from npm and JSR packages, a `deno audit` tool for identifying vulnerabilities in dependencies, and yet more Node.js compatibility enhancements.

[![](./images/2ed7d39b619eb262f4cbeff46292165e.png)](https://www.tigerdata.com/blog/how-cern-powers-ground-breaking-physics-with-timescaledb)

[CERN Upgrades Its Data Stack: Here’s the Database Behind It](https://www.tigerdata.com/blog/how-cern-powers-ground-breaking-physics-with-timescaledb "www.tigerdata.com") — The NextGen Archiver at CERN depends on high-performance ingestion and fast analytics. Discover why TimescaleDB beat pure PostgreSQL and legacy systems with superior throughput, 7–10x compression, and dramatically faster queries.

Tiger Data sponsor

**SECURITY RELEASES:** The expected December 15 Node.js releases [have been bumped back to this Thursday, December 18.](https://nodejs.org/en/blog/vulnerability/december-2025-security-releases) New versions of the 25.x, 24.x, 22.x, and 20.x release lines are expected to fix a handful of security vulnerabilities.

**MONGOOSE:** Valeri Karpov gives us an update [on what's new in Mongoose 9.0](https://thecodebarbarian.com/mongoose-9-async-stack-traces-cleaner-middleware-stricter-typescript.html), the MongoDB object modeling library for Node.

⚙️ [pnpm 10.26](https://pnpm.io/blog/releases/10.26) has landed with stricter security defaults for git-hosted dependencies, `allowBuilds` for granular script permissions, and a new setting to block exotic transitive dependencies.

🏆 The Top Items of 2025

The top items of the year based upon the aggregated number of clicks by readers, whether in email, on the Web, or through our RSS feed:

1. [15 Recent Node Features that Replace Popular npm Packages](https://nodesource.com/blog/nodejs-features-replacing-npm-packages "nodesource.com") — Clearly trimming dependencies is on many people's minds as the most popular item of 2025 was about ditching unnecessary packages for built-in Node alternatives.

Lizz Parody

2. [A Modern Guide to Reading and Writing Files in Node](https://nodejsdesignpatterns.com/blog/reading-writing-files-nodejs/ "nodejsdesignpatterns.com") — A valuable, comprehensive guide to various methods for working with files, something that doesn't often get blogged about.

Luciano Mammino

[Extract Text from PDFs Using REST APIs](https://developer-api.foxit.com/developer-blogs/api-guides-tutorials/pdf-services-api/how-to-extract-text-from-pdfs-using-foxits-rest-apis/?utm_source=cooperpress&utm_medium=Display&utm_campaign=12-16-25 "developer-api.foxit.com") — Pull text from PDFs for search, AI, or automation workflows — full Python example included.

Foxit Software sponsor

3. [Modern Node.js Patterns for 2025](https://kashw1n.com/blog/nodejs-2025/ "kashw1n.com") — Halfway through the year, Ashwin reminded us of various features the modern Node environment provides us, including ES modules, built-in Web APIs, the test runner, watch mode, the permission model, import maps, and more.

Ashwin

4. [Node.js Testing Best Practices](https://github.com/goldbergyoni/nodejs-testing-best-practices#readme "github.com") — A detailed guide to modern testing in Node from a group of developers who know all about it.

Goldberg, Salomon, and Gluskin

5. [How V8 Made `JSON.stringify` More Than Twice as Fast](https://v8.dev/blog/json-stringify "v8.dev") — The V8 team shows off how they made `JSON.stringify` over twice as fast, at least in V8 13.8 or higher (currently only true of Node v25 which ships with V8 14.1).

Patrick Thier (V8)

6\. ⚙️ [Node Modules Inspector](https://node-modules.dev/ "node-modules.dev") — A tool that runs pnpm _inside your browser_, “installs” a package, then analyzes its dependencies.

Anthony Fu

7. [Subverting Control with Weak References](https://jlongster.com/weak-refs "jlongster.com") — Node supports `WeakMap` and [`WeakRef`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakRef) for working with weak references and James is a big fan of the extra abstractions they unlock.

James Long

8. [The Many, Many, Many JavaScript Runtimes of the Last Decade](https://buttondown.com/whatever_jamie/archive/the-many-many-many-javascript-runtimes-of-the-last-decade/ "buttondown.com") — A fantastic, well-researched look at the myriad of JavaScript runtimes and engines both past and present, from mainstream picks like Node and Bun, to cloud platforms and more obscure ‘honorable mentions’. A perfect way to round out your knowledge of JavaScript’s runtime story.

Whatever, Jamie

🗓️  Node.js in 2025: Month by Month

**JANUARY –** We start and end the year in the same place, with the ability of [Node being able to run TypeScript](https://www.totaltypescript.com/typescript-is-coming-to-node-23) being new early in the year, and now ending the year with [Node.js v24.12.0 (LTS)](https://nodejs.org/en/blog/release/v24.12.0) making it stable in an LTS release. We also got a [major update on progress with Express.js.](https://expressjs.com/2025/01/09/rewind-2024-triumphs-and-2025-vision.html) [NodeBB v4.0](https://community.nodebb.org/topic/18545/nodebb-v4.0.0-federate-good-times-come-on) was released too.

**FEBRUARY –** [TypeScript 5.8](https://devblogs.microsoft.com/typescript/announcing-typescript-5-8/) was a big release for Node developers in particular, with support for `require()` of ES modules with `--module nodenext` and an `--erasableSyntaxOnly` option for generating code that Node 22.6+'s type-stripping features could deal with.

**MARCH –** The Node.js project got [its own official community space on Discord.](https://nodejs.org/en/blog/announcements/official-discord-launch-announcement) It now has almost 22,000 members. The Node.js TSC also [voted to stop distributing Corepack](https://socket.dev/blog/node-js-tsc-votes-to-stop-distributing-corepack) by default. [Express 5.1](https://expressjs.com/2025/03/31/v5-1-latest-release.html) was released.

**APRIL –** [Koa 3.0](https://koajs.com/) was released, and Microsoft [warned us about Node's increasing role](https://www.microsoft.com/en-us/security/blog/2025/04/15/threat-actors-misuse-node-js-to-deliver-malware-and-other-malicious-payloads/) in malware. [A major Node.js collaboration summit](https://nodejs.org/en/blog/events/collab-summit-2025-paris) also took place in Paris.

**MAY –** [Node.js v24.0](https://nodejs.org/en/blog/release/v24.0.0) was released. The [Glitch platform announced](https://blog.glitch.com/post/changes-are-coming-to-glitch/) it was shutting down. Platformatic began [bringing PHP and Node together.](https://blog.platformatic.dev/seamlessly-blend-php-with-nodejs)

**JUNE –** I think everyone took an early summer break as it was very quiet!

**JULY –** [A discussion, still ongoing,](https://github.com/nodejs/Release/issues/1113) began about shifting Node to annual major releases and shortening the LTS timeframe.

**AUGUST –** [TypeScript 5.9](https://devblogs.microsoft.com/typescript/announcing-typescript-5-9/) was released.

**SEPTEMBER –** A messy autumn for npm package security began with [a variety of packages being compromised in a phishing attack.](https://socket.dev/blog/npm-author-qix-compromised-in-major-supply-chain-attack) In response, [pnpm added support](https://pnpm.io/blog/releases/10.16) for delayed dependency updates. Cloudflare Workers [introduced support for Node.js HTTP servers](https://blog.cloudflare.com/bringing-node-js-http-servers-to-cloudflare-workers/) and [improved Node compatibility](https://blog.cloudflare.com/nodejs-workers-2025/) generally. macOS Tahoe users found [Electron apps were very laggy](https://github.com/electron/electron/issues/48311) due to a change in a private API.

**OCTOBER –** [Node.js v25.0](https://nodejs.org/en/blog/release/v25.0.0) was released and [Node.js 24 became the active LTS release.](https://nodesource.com/blog/nodejs-24-becomes-lts)

**NOVEMBER –** [Type stripping went 'stable'](https://nodejs.org/en/blog/release/v25.2.1) in Node v25.2 and Marco Ippolito shared [his personal story of how type stripping was shipped.](https://satanacchio.hashnode.dev/the-summer-i-shipped-type-stripping) The now-named Shai Halud supply chain attack [reared its ugly head in a 'version 2' form.](https://about.gitlab.com/blog/gitlab-discovers-widespread-npm-supply-chain-attack/)

**DECEMBER –** Where we are now: it's been a relatively quiet month so far!

📰 Classifieds

✍️ Add e-signatures to your Node.js app in minutes with the BoldSign Node.js SDK—powered by our [e-signature API. Get your free API key today](https://boldsign.com/esignature-api/?utm_source=cooperpress&utm_medium=cpc&utm_campaign=nodeweekly_classified).

---

[The Road to Next](https://www.road-to-next.com/?utm_source=node_weekly&utm_medium=referral&utm_campaign=next_course) is a course by Robin Wieruch for learning full-stack web development with Next.js 15 and React 19. The perfect match for JavaScript developers ready to go beyond the frontend.

🎁 _P.S._ We hope you have a great holiday season and **we'll be back on Thursday, January 8.**
