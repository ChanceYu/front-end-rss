---
title: "Hono tops developer satisfaction, but Express still leads"
link: "https://nodeweekly.com/issues/610"
date: 2026-02-05
md5: afbf582d974800a80368a662a4ce1ffe
---

# Hono tops developer satisfaction, but Express still leads

#​610 — February 5, 2026

[Read on the Web](https://nodeweekly.com/link/180250/web)

[![](./images/17d3a5548bb5b75116f1d7de9d993178.jpeg)](https://nodeweekly.com/link/180252/web)  
- [The State of JavaScript 2025: Backend Frameworks](https://nodeweekly.com/link/180252/web "2025.stateofjs.com") — The results of the popular annual JavaScript survey are out, and we’re focusing on the most relevant bit to Node.js: _backend frameworks_. [Express](https://nodeweekly.com/link/180300/web) still leads the way, but [NestJS](https://nodeweekly.com/link/180253/web) continues to grow rapidly. Meanwhile, [Hono](https://nodeweekly.com/link/180254/web) comes top in developer satisfaction. **_\--- Devographics_**
  
- [Node.js 25.6.0 (Current) Released](https://nodeweekly.com/link/180255/web "nodejs.org") — `async_hooks` can now [opt out of `Promise` tracking](https://nodeweekly.com/link/180256/web) to cut instrumentation overhead in production. The built-in test runner supports per-run env injection (see the [`env` option here](https://nodeweekly.com/link/180257/web)), [TextEncoder](https://nodeweekly.com/link/180258/web) gets [some SIMD-backed speedups](https://nodeweekly.com/link/180259/web), and the URL parser updates to Unicode 17. **_\--- Antoine du Hamel_**
  
- [Stop AI Agents from Generating Outdated Clerk Code](https://nodeweekly.com/link/180251/web "go.clerk.com") — Cursor, Copilot, and Claude Code are trained on old Clerk patterns. Clerk Skills is a one-command way to give your agent up-to-date knowledge to build auth flows, sync users to databases, set up organizations, and more. One command, and it knows how to build auth the right way. **_\--- Clerk sponsor_**

**IN BRIEF:**

- Check out [a sneak preview of the new design for Node's official docs.](https://nodeweekly.com/link/180260/web) You're encouraged to [file issues](https://nodeweekly.com/link/180261/web) if you encounter any problems.
- 😂 npm's current 64-character limit on package names didn't stop someone from grandfathering in a 214-character monster back in 2012. It's too long to share here without breaking the email, so [here you go.](https://nodeweekly.com/link/180262/web)
- 🔒 [vm2](https://nodeweekly.com/link/180263/web) is a sandbox for running untrusted code within the same process as your app. [A critical vulnerability was announced](https://nodeweekly.com/link/180264/web) which warrants an immediate upgrade to [v3.10.4](https://nodeweekly.com/link/180265/web).
- Vercel has added [zero-config deployment support for Koa apps.](https://nodeweekly.com/link/180266/web)

  
- [How to Migrate from Chalk to Node's `styleText`](https://nodeweekly.com/link/180267/web "nodejs.org") — [Chalk](https://nodeweekly.com/link/180268/web) is great for terminal styling, but Node's built-in `styleText` handles most of the same tasks with no dependency required. There's even a codemod to migrate automatically. **_\--- Richie McColl_**
  
- [Explicit Resource Management in JavaScript](https://nodeweekly.com/link/180269/web "allthingssmitty.com") — You can use `using` for deterministic cleanup, calling `Symbol.dispose`/`asyncDispose` at scope exit without `try`/`finally`. A small fix for leaks and forgotten teardowns in streams, observers, locks, and similar APIs. **_\--- Matt Smith_**
  
- [Why JSBin Went Down for 3 Days (and How It Was Fixed)](https://nodeweekly.com/link/180270/web "remysharp.com") — [JSBin](https://nodeweekly.com/link/180271/web), the long-running collaborative JavaScript pastebin, went offline for roughly three days in January after a huge traffic spike overwhelmed its tiny single-CPU server. Node.js wasn’t the root cause, but running an ancient Node 7(!) runtime amplified the failure. Remy tells the full story. **_\--- Remy Sharp_**
  
- [How to Tinker with Node.js Core on ARM64 Windows](https://nodeweekly.com/link/180272/web "joyeecheung.github.io") — Building Node on ARM64 Windows? The toolchain setup has some gotchas. Luckily, Joyee walks us past them. **_\--- Joyee Cheung_**
  
- [Skip the Second Database for Analytics](https://nodeweekly.com/link/180273/web "www.tigerdata.com") — Analytics on live data, no second database. TimescaleDB extends Postgres so you scale without splitting. [Try free](https://nodeweekly.com/link/180273/web). **_\--- Tiger Data sponsor_**
  

- 📄 [Changes to Environment Variable Access in Cypress v15.10.0+](https://nodeweekly.com/link/180274/web) **_\--- Jenna Beckett (Cypress)_**
- 📄 [Measuring SVG Rendering Time with Node.js](https://nodeweekly.com/link/180275/web) **_\--- Stoyan Stefanov_**

## 🛠 Code & Tools

  
- 🕒 [Croner 10.0: Cron-Style Triggers and Evaluation](https://nodeweekly.com/link/180276/web "croner.56k.guru") — Trigger functions on any cron schedule using [cron syntax.](https://nodeweekly.com/link/180277/web) It can also evaluate cron expressions to give you a list of upcoming times. [v10.0](https://nodeweekly.com/link/180278/web) brings full OCPS (Open Cron Pattern Specification) 1.4 compliance and even more scheduling options. **_\--- Hexagon_**
  
- 🔐 [OTPAuth: One-Time Password (HOTP/TOTP) Library](https://nodeweekly.com/link/180279/web "github.com") — When you log in to a site with 2FA and you’re asked for six digits from your authentication app, that’s a Time-based One-Time Password (or TOTP). This library for Node, Deno, Bun _and_ the browser lets you work with both TOTPs and HOTPs (HMAC-based OTPs). **_\--- Héctor Molinero Fernández_**
  
- [log-update 7.1: Log by Overwriting Previous Output in the Terminal](https://nodeweekly.com/link/180280/web "github.com") — Imagine a `console.log` that overwrites its output on the same line. Think progress updates, animations, etc. v7.1 gains synchronized output rendering. **_\--- Sindre Sorhus_**

> 💡 Sindre has also just updated his ['ora' terminal spinner library.](https://nodeweekly.com/link/180281/web)

  
- 💡 [Nanoclaw: A Personal Claude Assistant That Runs in macOS Containers](https://nodeweekly.com/link/180282/web "github.com") — [OpenClaw](https://nodeweekly.com/link/180283/web) (_née_ Clawdbot) is incredible, yet slightly scary. If you want something lighter and safer to hack on, Nanoclaw is simpler and uses macOS Tahoe's native container support to stay sandboxed. **_\--- Gavriel C_**
  
- 🎥 [simple-ffmpegjs: A Helper for Complex FFmpeg Operations](https://nodeweekly.com/link/180284/web "github.com") — A helper library to simplify programmatic video composition, transitions, and audio mixing without complex raw FFmpeg commands. Think crossfade transitions, text overlays with animations, and audio track mixing, etc. **_\--- Brayden Blackwell_**

> 💡 Prefer something lower level? [node-av](https://nodeweekly.com/link/180285/web) offers Node bindings to FFmpeg's C APIs.

- 🎮 [node-hid v3.3.0](https://nodeweekly.com/link/180286/web) – Access USB HID devices (except keyboard/mouse).
- [MongoDB Node.js Driver v7.1.0](https://nodeweekly.com/link/180287/web) – Official driver for MongoDB in Node.
- [pg-boss 12.9.0](https://nodeweekly.com/link/180288/web) – Postgres-powered background job processing.
- [jsdom 28.0](https://nodeweekly.com/link/180289/web) – Pure JS implementation of various web standards.
- [WebDAV v5.9.0](https://nodeweekly.com/link/180290/web) – WebDAV client library.

📰 Classifieds

🔮 Debug smarter: See how [Sentry’s AI-agent Seer](https://nodeweekly.com/link/180291/web) analyzes Node errors & logs to pinpoint root causes and propose fixes.

---

🎉 [Hear from the minds shaping the web!](https://nodeweekly.com/link/180292/web) Thousands of devs, food trucks & Amsterdam vibes. Don’t miss [JSNation](https://nodeweekly.com/link/180292/web) — 10% off with `JSWEEKLY`.

## 📢  Elsewhere in the ecosystem

A roundup of some other interesting stories in the broader landscape:

- The Deno team has [made _Deno Deploy_ generally available.](https://nodeweekly.com/link/180293/web) Despite the name, you can use it to smoothly run Node projects in the cloud, as well as Deno ones. They've also introduced [Deno Sandbox](https://nodeweekly.com/link/180294/web) as a way to programmatically manage microVMs for executing code securely.
- 📱 Someone claims to have compiled Node 18 to run on the iPhone to run Claude Code natively on device. There's nothing but a [Hacker News post](https://nodeweekly.com/link/180295/web) and a [▶️ YouTube Short](https://nodeweekly.com/link/180296/web) so far.
- If your `node_modules` folder is just too much for your existing servers to handle, [Amazon EC2 has new C8id, M8id, and R8id instances](https://nodeweekly.com/link/180297/web) with up to 22.8 TB local NVMe storage attached.. 😅
- A _Daily WTF_ post showing off [a way you _shouldn't_ parse numbers in JS.](https://nodeweekly.com/link/180298/web)
- 🤖 An exploration of how some [recent Node and React security vulnerabilities were found using AI.](https://nodeweekly.com/link/180299/web)
