---
title: "Next.js 16 微前端新玩法：Multi-Zone 本地搭建全流程"
link: "http://mp.weixin.qq.com/s?__biz=MzUxNzk1MjQ0Ng==&mid=2247529327&idx=1&sn=04f4fe12dc7c5234c8dbdfe35dcc4b72&chksm=f99275becee5fca8737b4cb839fdf5de22fb5cfc146e86d067f32cdc7b6bf8857180da84ea1d#rd"
date: 2026-03-03
md5: 5b4722723b8501a60760d4d3fc3aa107
---

# Next.js 16 微前端新玩法：Multi-Zone 本地搭建全流程

```js_darkmode__1
点击上方 程序员成长指北，关注公众号
回复1，加入高级Node交流群
```
## Next.js Multi-Zones

在 **Next.js 16** 发布之后，由于迁移到自研编译器 Turbopack，他们移除了基于 Module Federation 的微前端支持。

要在 **Next.js 16+** 上构建微前端应用，根据 Vercel 文档，在 Vercel 生态之外不引入额外包的前提下，有两种方式可以实现。两种方式都可以借助 **Next.js 16+** 内置的 **「Multi-Zone」** 概念来完成。

你可以先看官网关于 **「Multi-Zone」** 如何运作的文章，以便更好理解其架构。本文主要是如何实现**Multi-Zone搭建。**

## 一、两种方式

### Multi-Zones（Next.js 原生方式）

这是 Next.js 的内置方案：把应用拆成多个独立的 Next.js 应用，在同一域名下由不同路径分别提供服务。例如，可以用一个应用服务 `/e-comm/*`，另一个服务 `/products/*`，再有一个主应用处理其余路径。每个 zone 可以独立开发、独立部署，但对用户呈现为一个整体应用。

- 两个完全独立的 Next.js 应用
- 各自独立部署到不同源或子域名
- 通过普通 `<a>` 标签进行导航连接
- 配置简单，无需特殊设置
- 所有 multi-zone 应用需配置到同一域名下

### Vercel Microfrontends（Vercel 托管方案）

Vercel 也提供托管的微前端平台，允许你把应用拆成可独立部署的单元，如需还可以使用不同技术栈。其中通过官方包对 Next.js 提供内置支持。

- 使用 `@vercel/microfrontends` 包
- 需要 `microfrontends.json` 配置文件
- 配置较复杂，由 Vercel 管理路由
- 支持独立部署，但由 Vercel 做编排
- 免费版限制为 1 个微前端组、2 个应用

---

## 二、应用代码库（Zones）

应用代码的存放与维护有两种方式：

**Monorepo（可选）** — 若希望在多 zone 间共享代码、单仓管理、一起部署，可把两个 Next.js 应用放在同一 monorepo。

**独立仓库（同样可行）** — 若更倾向独立开发流程、不同团队管理不同 zone、按不同节奏部署，可把每个应用放在完全独立的仓库。Zone 间可通过 NPM 包（公开或私有）共享代码。

**要点：** Multi-Zones 不关心你的仓库结构，只关心如何把同一域名下的不同路径路由到不同已部署的 Next.js 应用。真正的 Multi-Zones 体验（同域名、不同路径）会在部署到 Vercel 或类似环境时完整呈现；下文先说明如何在本地搭建并调试。

---

## 三、创建应用

本实验以电商为主应用、商品为另一个应用为例，电商应用会跳转到商品应用。

### 3.1 创建两个 Next.js 应用

```
# 应用 1 - "next-main"
npx create-next-app@latest next-main --yes

# 应用 2 - "next-products"
npx create-next-app@latest next-products --yes
```
在各自 `package.json` 的 `scripts` 里给 `dev` 加上端口号：

```
// next-main
"dev": "next dev -p 3000",

// next-products
"dev": "next dev -p 3001",
```
### 3.2 电商应用（next-main）页面

主应用 `page.tsx`（next-main）替换为：

```
export default function Home() {
  return (
    <div className='flex min-h-screen items-center justify-center bg-zinc-50 font-sans'>
      <main className='text-center px-4'>
        <h1 className='text-5xl font-bold mb-4 text-zinc-900'>欢迎来到 xxx 产品商城</h1>
        <p className='text-xl text-zinc-600 mb-8 max-w-2xl mx-auto'>
         发现我们精选的优质商品。浏览商品目录，找到您真正需要的产品。
        </p>
        <a
          href='/products'
          className='inline-block bg-zinc-900 text-white px-8 py-3 rounded-lg font-semibold hover:bg-zinc-800 transition-colors'
        >
          查看商品
        </a>
      </main>
    </div>
  );
}
```
### 3.3 商品应用（next-products）页面

商品应用 `page.tsx`（next-products）替换为：

```
/* eslint-disable @next/next/no-html-link-for-pages */
import Image from'next/image';

interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  images: string[];
  category: string;
}

interface ProductsResponse {
  products: Product[];
  total: number;
  skip: number;
  limit: number;
}

asyncfunction getProducts(): Promise<Product[]> {
try {
    const res = await fetch('https://dummyjson.com/products', {
      cache: 'no-store',
    });
    if (!res.ok) thrownewError('Failed to fetch products');
    const data: ProductsResponse = await res.json();
    return data.products;
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

exportdefaultasyncfunction Home() {
const products = await getProducts();
return (
    <div className='flex items-center justify-center bg-white font-sans'>
      <div className='w-full px-4 py-8'>
        <a href='/' className='inline-block mb-4 text-black hover:text-zinc-600 transition-colors'>← 返回首页</a>
        <h1 className='text-3xl font-bold mb-8 text-center text-black'>商品列表</h1>
        {products.length === 0 ? (
          <p className='text-center text-black'>暂无商品</p>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {products.map((product) => (
              <div key={product.id} className='bg-white dark:bg-zinc-900 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow'>
                {product.images?.[0] && (
                  <div className='relative'>
                    <Image src={product.images[0]} alt={product.title} width={96} height={96} className='object-cover' unoptimized />
                  </div>
                )}
                <div className='p-4'>
                  <h2 className='text-xl font-semibold mb-2'>{product.title}</h2>
                  <p className='text-sm mb-3 line-clamp-2'>{product.description}</p>
                  <div className='flex items-center justify-between'>
                    <span className='text-lg font-bold'>${product.price}</span>
                    {product.category && <span className='text-xs px-2 py-1 rounded'>{product.category}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```
分别运行 `npm run dev` 后：

- **next-main**：http://localhost:3000
- **next-products**：http://localhost:3001

两个应用彼此完全独立，可分别开发、测试和部署。要在本地用「同一域名」同时访问两者，需要借助反向代理。

---

## 四、使用反向代理做本地测试

若希望在本地体验 Multi-Zones（两个应用出现在同一域名下），需要在代码之外搭反向代理。两种简单做法如下。

### 方式一：Nginx（本机）

新建 `nginx.conf`：

```
upstream ecomm {
    server localhost:3000;
}
upstream products {
    server localhost:3001;
}
server {
    listen 8080;
    server_name localhost;
    location / {
        proxy_pass http://ecomm;
    }
    location /products {
        proxy_pass http://products;
    }
}
```
浏览器访问 `http://localhost:8080`。若你希望商品应用对应路径为 `/admin`，可将 `location /products` 改为 `location /admin`。

### 方式二：Node.js 代理（无需 Nginx）

**前提：** 本机已安装 Node.js。

**步骤 1：** 在根目录（与两个 Next 应用同级）新建 `proxy` 文件夹，结构例如：

```
proxy/
next-main/
next-products/
```
**步骤 2：** 在 `proxy` 下执行：

```
npm init -y
npm i express http-proxy-middleware
```
在 `package.json` 的 `scripts` 中添加：`"start": "node proxy.js"`。

**步骤 3：** 创建 `proxy/proxy.js`：

```
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

// /products/* → next-products (3001)
app.use(
'/products',
  createProxyMiddleware({
    target: 'http://localhost:3001',
    changeOrigin: true,
    pathRewrite: { '^/products': '' },
  })
);

// 其余 → next-main (3000)
app.use(
'/',
  createProxyMiddleware({
    target: 'http://localhost:3000',
    changeOrigin: true,
  })
);

app.listen(8080, () => {
console.log('Proxy running on http://localhost:8080');
});
```
**步骤 4：** 定义各 Zone 并配置静态资源前缀。在各自 `next.config.js` 中添加 `assetPrefix`：

```
// next-main/next.config.js
const nextConfig = {
  assetPrefix: process.env.ASSET_PREFIX || '/',
};
export default nextConfig;
```
```
// next-products/next.config.js
const nextConfig = {
  assetPrefix: process.env.ASSET_PREFIX || '/products',
};
export default nextConfig;
```
**步骤 5：** 启动三个进程（两个 Next 应用 + 代理）：

```
# 终端 1
cd next-main && npm run dev

# 终端 2
cd next-products && npm run dev

# 终端 3
cd proxy && npm start
```
**步骤 6：** 浏览器打开 http://localhost:8080/ 与 http://localhost:8080/products，即可在同一基础 URL 下访问两个应用。

## 五、Zone 之间的导航

同一 zone 内跳转为**软导航**（无整页刷新）；**跨 zone** 跳转会**硬导航**（整页刷新）。

指向**不同 zone** 的链接请使用普通 `<a>`，不要用 Next.js `<Link>`，否则客户端导航在跨 zone 时无法正确工作：

```
// 同一 zone 内 — 用 Next.js Link
import Link from 'next/link';
<Link href="/products/product-1">Products 1</Link>

// 跨 zone — 用普通 a 标签
<a href="/products">Products</a>
```
---

## 六、小结

- **Next.js 16+** 可通过 **Multi-Zone** 将多个独立 Next 应用在同一域名下按路径组合，无需 Module Federation。
- 本地用反向代理（Nginx 或 Node.js）即可模拟「同域名、按路径分发」；部署到 Vercel 时由平台负责路由，两个应用会作为同一站点对外提供服务。
- 跨 zone 链接使用 `<a>`，同 zone 内使用 `<Link>`。
  
    
  
    

Node 社群
