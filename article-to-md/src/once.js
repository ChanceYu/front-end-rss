import { processArticle } from './processor.js'

export default async function once(article) {
  const result = await processArticle(article, { force: true, headless: true })
  return result
}

// Only run directly when this file is the entry point, not when imported by server.js
if (process.argv[1].endsWith('once.js')) {
  await once({
    title: '【第3659期】JavaScript 显式资源管理来了：用 using 告别手写 try/finally',
    link: 'http://mp.weixin.qq.com/s?__biz=MjM5MTA1MjAxMQ==&mid=2651278629&idx=1&sn=b51bc320fefe9c3d3d6f715b1d6626bf&chksm=bcbd70cf21bc4ea4594b976fdf87464337c1c959619a4d9171bfd48615c7bc7d590804d6a601&scene=0#rd',
    date: '2026-02-27',
  })
}