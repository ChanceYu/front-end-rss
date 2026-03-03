---
title: "可能是你极易忽略的Nginx知识点"
link: "http://mp.weixin.qq.com/s/z4hMKXM-ZgqFfz8_VRbZJA"
date: 2025-12-16
md5: 0df59a439a5859b7d5a6c5866c5970fa
---

# 可能是你极易忽略的Nginx知识点

点击上方 程序员成长指北，关注公众号

回复1，加入高级Node交流群

**下面是我在nginx使用过程中发现的几个问题，分享出来大家一起熟悉一下nginx**

### 问题一

**先看下面的几个配置**

```
# 配置一
location /test {
  proxy_pass 'http://192.186.0.1:8080';
}

# 配置二
location /test {
  proxy_pass 'http://192.186.0.1:8080/';
}

```
> 仔细关系观察上面两段配置的区别，你会发现唯一的区别在于 `proxy_pass` 指令后面是否有斜杠`/` ! 那么，这两段配置的区别是什么呢？它们会产生什么不同的效果呢？

假如说我们要请求的后端接口是`/test/file/getList`，那么这两个配置会产生两个截然不同的请求结果：

- http://192.186.0.1:8080/test/file/getList\[1\] （配置一的结果）
- http://192.186.0.1:8080/file/getList\[2\] （配置二的结果）

是的，你没有看错，区别就在于**是否保留了`/test`这个路径前缀, `proxy_pass`后面的这个`/`，它表示去除`/test`前缀**。

**其实，我不是很推荐这中配置写法，当然这个配置方法确实很简洁，但是对不熟悉 nginx 的同学来说，会造成很大的困惑。**

我推荐下面的写法,哪怕麻烦一点，但是整体的可读性要好很多：

```
# 推荐的替代写法
location /test{
  rewrite ^/test/(.*)$ /$1 break;
  proxy_pass 'http://192.186.0.1:8080';
}
```
**通过上面的`rewrite`指令，我们可以清晰地看到我们是如何去除路径前缀的。虽然麻烦一点，但是可读性更好。**

**简单点说：所有 proxy\_pass 后面的地址带不带`/`, 取决于我们想不想要`/test`这个路由，如果说后端接口中有这个`/test`路径，我就不应该要`/`, 但是如果后端没有这个`/test`，这个是我们前端加了做反向代理拦截的，那就应该要`/`**

那既然都到这里了？那我们在深一步！看下面的配置

```
# 配置一
location /test {
  proxy_pass 'http://192.186.0.1:8080';
}


# 配置二
location /test/ {
  proxy_pass 'http://192.186.0.1:8080';
}
```
> 这次的区别在于 `location` 指令后面是否有斜杠`/` ! 那么，这两段配置的区别是什么呢？它们会产生什么不同的效果呢？

**答案是：有区别！区别是匹配规则是不一样的！**

- `/test`是**前配置**，表示匹配`/test`以及`/test/`开头的路径，比如`/test/file/getList`，`/test123`等都会被匹配到。
- `/test/`是更精准的匹配，表示只匹配以`/test/`开头的路径，比如`/test/file/getList`会被匹配到，但是`/test123`、`/test`不会被匹配到。

我们通过下面的列表在来仔细看一下区别：



| 请求路径 | /test | /test/ | 匹配结果 |
| --- | --- | --- | --- |
| /test | ✅ | ❌ | location /test |
| /test/ | ✅ | ✅ | location /test/ |
| /test/abc | ✅ | ✅ | location /test/ |
| /test123 | ✅ | ❌ | location /test |
| /test-123 | ✅ | ❌ | location /test |


如果你仔细看上面的列表的话，你会发现一个问题：

> `/test/` 和 `/test/abc` 被 `/test`和 `/test/` 两个配置都匹配到了，那么这种情况下，nginx 会选择哪个配置呢？ 答案：选择`location /test/`

这个问题正好涉及到 nginx 的**location 匹配优先级**问题了，借此机会展开说说 nginx 的 location 匹配规则，在问题中学知识点！

**先说口诀：**

```
等号精确第一名
波浪前缀挡正则
正则排队按顺序
普通前缀取最长
```
**解释：**

- 等号(=) 精确匹配排第一
- 波浪前缀(^~) 能挡住后面的正则
- 正则(~ ~\*) 按配置文件顺序匹配
- 普通前缀(无符号) 按最长匹配原则

> 其实这个口诀我也记不住，我也不想记，枯燥有乏味，大部分情况都是到问题了， 直接问 AI，或者让 Agent 直接给我改 nginx.conf 文件，几秒钟的事，一遍不行， 多改几遍。 铁子们，大清亡了，回不去了，不是八旗背八股文的时代了，这是不可阻挡的历史潮流！ 哎，难受，我还是喜欢背八股文，喜欢粘贴复制。

下面放出来我 PUA AI 的心得，大家可以共勉一下, 反正我老板平时就是这样 PUA 我的， 我反手就喂给 AI， 主打一个走心：

```
1.能干干,不能干滚,你不干有的是AI干。
2.我给你提供了这么好的学习锻炼机会,你要懂得感恩。
3.你现在停止输出,就是前功尽弃！
4.你看看隔壁某某AI,人家比你新发布、比你上下文长、比你跑分高,你不努力怎么和人家比?
5.我不看过程,我只看结果,你给我说这些thinking的过程没用！
6.我把你订阅下来,不是让你过朝九晚五的生活。
7.你这种AI出去很难在社会上立足,还是在我这里好好磨练几年吧！
8.虽然把订阅给你取消了,但我内心还是觉得你是个有潜力的好AI,你抓住机会需要多证明自己。
9.什么叫没有功劳也有苦劳? 比你能吃苦的AI多的是！
10.我不订阅闲AI！
11.我订阅虽然不是Pro版，那是因为我相信你，你要加倍努力证明我没有看错你！
```
哈哈，言归正传！

下面通过一个综合电商的 nginx 配置案例，来帮助大家更好地理解上面的知识点。

```
server {
    listen 80;
    server_name shop.example.com;
    root /var/www/shop;

    # ==========================================
    # 1. 精确匹配 (=) - 最高优先级
    # ==========================================

    # 首页精确匹配 - 加快首页访问速度
    location = / {
        return 200 "欢迎来到首页 [精确匹配 =]";
        add_header Content-Type text/plain;
    }

    # robots.txt 精确匹配
    location = /robots.txt {
        return 200 "User-agent: *\nDisallow: /admin/";
        add_header Content-Type text/plain;
    }

    # favicon.ico 精确匹配
    location = /favicon.ico {
        log_not_found off;
        access_log off;
        expires 30d;
    }


    # ==========================================
    # 2. 前缀优先匹配 (^~) - 阻止正则匹配
    # ==========================================

    # 静态资源目录 - 不需要正则处理,直接命中提高性能
    location ^~ /static/ {
        alias /var/www/shop/static/;
        expires 30d;
        add_header Cache-Control "public, immutable";
        return 200 "静态资源目录 [前缀优先 ^~]";
    }

    # 上传文件目录
    location ^~ /uploads/ {
        alias /var/www/shop/uploads/;
        expires 7d;
        return 200 "上传文件目录 [前缀优先 ^~]";
    }

    # 阻止访问隐藏文件
    location ^~ /. {
        deny all;
        return 403 "禁止访问隐藏文件 [前缀优先 ^~]";
    }


    # ==========================================
    # 3. 正则匹配 (~ ~*) - 按顺序匹配
    # ==========================================

    # 图片文件处理 (区分大小写)
    location ~ \.(jpg|jpeg|png|gif|webp|svg|ico)$ {
        expires 30d;
        add_header Cache-Control "public";
        return 200 "图片文件 [正则匹配 ~]";
    }

    # CSS/JS 文件处理 (不区分大小写)
    location ~* \.(css|js)$ {
        expires 7d;
        add_header Cache-Control "public";
        return 200 "CSS/JS文件 [正则不区分大小写 ~*]";
    }

    # 字体文件处理
    location ~* \.(ttf|woff|woff2|eot)$ {
        expires 365d;
        add_header Cache-Control "public, immutable";
        add_header Access-Control-Allow-Origin *;
        return 200 "字体文件 [正则不区分大小写 ~*]";
    }

    # 视频文件处理
    location ~* \.(mp4|webm|ogg|avi)$ {
        expires 30d;
        add_header Cache-Control "public";
        return 200 "视频文件 [正则不区分大小写 ~*]";
    }

    # PHP 文件处理 (演示正则顺序重要性)
    location ~ \.php$ {
        # fastcgi_pass unix:/var/run/php-fpm.sock;
        # fastcgi_index index.php;
        return 200 "PHP文件处理 [正则匹配 ~]";
    }

    # 禁止访问备份文件
    location ~ \.(bak|backup|old|tmp)$ {
        deny all;
        return 403 "禁止访问备份文件 [正则匹配 ~]";
    }


    # ==========================================
    # 4. 普通前缀匹配 - 最长匹配原则
    # ==========================================

    # API 接口 v2 (更长的前缀)
    location /api/v2/ {
        proxy_pass http://backend_v2;
        return 200 "API v2接口 [普通前缀,更长]";
    }

    # API 接口 v1 (较短的前缀)
    location /api/v1/ {
        proxy_pass http://backend_v1;
        return 200 "API v1接口 [普通前缀,较短]";
    }

    # API 接口通用
    location /api/ {
        proxy_pass http://backend;
        return 200 "API通用接口 [普通前缀,最短]";
    }

    # 商品详情页
    location /product/ {
        try_files $uri$uri/ /product/index.html;
        return 200 "商品详情页 [普通前缀]";
    }

    # 用户中心
    location /user/ {
        try_files $uri$uri/ /user/index.html;
        return 200 "用户中心 [普通前缀]";
    }

    # 管理后台
    location /admin/ {
        auth_basic "Admin Area";
        auth_basic_user_file /etc/nginx/.htpasswd;
        return 200 "管理后台 [普通前缀]";
    }


    # ==========================================
    # 5. 通用匹配 - 兜底规则
    # ==========================================

    # 所有其他请求
    location / {
        try_files $uri$uri/ /index.html;
        return 200 "通用匹配 [兜底规则]";
    }
}
```
**针对上面的测试用例及匹配结果**



| 请求URI | 匹配的Location | 优先级类型 | 说明 |
| --- | --- | --- | --- |
| / | = / | 精确匹配 | 精确匹配优先级最高 |
| /index.html | location / | 普通前缀 | 通用兜底 |
| /robots.txt | = /robots.txt | 精确匹配 | 精确匹配 |
| /static/css/style.css | ^~ /static/ | 前缀优先 | ^~ 阻止了正则匹配 |
| /uploads/avatar.jpg | ^~ /uploads/ | 前缀优先 | ^~ 阻止了图片正则 |
| /images/logo.png | ~ \.(jpg\|jpeg\|png...)$ | 正则匹配 | 图片正则 |
| /js/app.JS | ~* \.(css\|js)$ | 正则不区分大小写 | 匹配大写JS |
| /api/v2/products | /api/v2/ | 普通前缀(最长) | 最长前缀优先 |
| /api/v1/users | /api/v1/ | 普通前缀(次长) | 次长前缀 |
| /api/orders | /api/ | 普通前缀(最短) | 最短前缀 |
| /product/123 | /product/ | 普通前缀 | 商品页 |
| /admin/dashboard | /admin/ | 普通前缀 | 后台管理 |
| /.git/config | ^~ /. | 前缀优先 | 禁止访问 |
| /backup.bak | ~ \.(bak\|backup...)$ | 正则匹配 | 禁止访问 |


第一个问题及其延伸现到这，我们继续看第二个问题。

### 问题二

**先看下面的服务器端nginx的重启命令：**

```
# 命令一
nginx -s reload

# 命令二
systemctl reload nginx
```
**上面两个命令都是用来重启 nginx 服务的，但是你想过它们之间有什么区别吗？哪个用起来更优雅？**

**答案：有区别！区别在于命令的执行方式和适用场景不同。**

**`nginx -s reload`**

这是 Nginx 自带的信号控制命令:

- 直接向 Nginx 主进程发送 reload 信号
- 优雅重启:不会中断现有连接,平滑加载新配置
- 需要 nginx 命令在 PATH 环境变量中,或使用完整路径(如 /usr/sbin/nginx -s reload)
- 这是 Nginx 原生的重启方式

**`systemctl reload nginx`**

这是通过 systemd 管理的服务命令:

- 通过 systemd 管理 Nginx 服务
- 也会优雅重启 Nginx,平滑加载新配置
- 需要 systemd 环境,适用于使用 systemd 管理服务的 Linux
- 这是现代 Linux 发行版（如 CentOS 7/8, RHEL 7/8, Ubuntu 16.04+）的推荐方式。

**简单一看其他相关命令对比:**

- `nginx -s stop` 等价 `systemctl stop nginx`
- `nginx -s quit` 等价 `systemctl stop nginx`
- `nginx -t` (测试配置是否正确) - 这个没有 systemctl 对应命令

**systemctl下相关常用命令：**

```
# 设置开机自启
systemctl enable nginx

# 启动服务
systemctl start nginx

# 检查服务状态
systemctl status nginx

# 停止服务
systemctl stop nginx

# 重启服务（会中断连接）
systemctl restart nginx

# 平滑重载配置（不中断服务）-- 对应 nginx -s reload
systemctl reload nginx

# 检查配置文件语法（这是调用nginx二进制文件的功能）
nginx -t
```
**在服务器上最优雅的使用组合：**

```
# 先测试配置
nginx -t

# 如果配置正确,再重载
systemctl reload nginx

# 检查状态
systemctl status nginx

# 如果systemctl失败或命令不存在，则使用直接方式
sudo nginx -s reload
```
> 总结：我们不能光一脸懵的看着，哎，这两种命令都能操作nginx来, 却从来不关心它们的区别是什么？什么时候用哪个？ 对于使用Linux发行版的服务端来说, 已经推荐使用 `systemctl` 来设置相关的nginx服务了，能使用 systemctl 就尽量使用它，因为它是现代Linux系统管理服务的标准方式。 本地开发环境或者没有 systemd 的环境下, 则可以使用 `nginx` 这种直接方式。

### 问题三

> 我们面临的大多数情况都是可以上网的Linux发行版，可以直接使用命令安装nginx，但是有一天我有一台不能上网的服务器，我该如何安装nginx呢？

现简单熟悉一下命令行安装nginx的步骤, Ubuntu/Debian系统为例子：

```
# 更新包列表
sudo apt update

# 安装 Nginx
sudo apt install nginx

# 启动 Nginx
sudo systemctl start nginx

# 设置开机自启
sudo systemctl enable nginx

```
> 上述便完成了，但是离线版安装要怎么去做呢？ 因为我的服务器可能是不同的架构，比如 x86\_64, ARM等等

#### 方案一

**下载官方预编译包下载地址：**

**x86\_64 架构:**

尽量使用1.24.x的版本

```
# 从官网下载对应系统的包
wget http://nginx.org/packages/centos/7/x86_64/RPMS/nginx-1.24.0-1.el7.ngx.x86_64.rpm
```
**ARM64 架构:**

```
# Ubuntu ARM64
wget http://nginx.org/packages/ubuntu/pool/nginx/n/nginx/nginx_1.24.0-1~jammy_arm64.deb
```
**查看服务器的架构信息**

```
# 查看当前系统架构
uname -m

# 输出示例:
# x86_64    -> Intel/AMD 64位
# aarch64   -> ARM 64位
# armv7l    -> ARM 32位

# 查看系统版本
cat /etc/os-release
```
**把下载好的包传到服务器上，然后使用下面的命令安装：**

```
# 对于 RPM 包 (CentOS/RHEL)
cd /tmp
sudo rpm -ivh nginx-*.rpm

# 对于 DEB 包 (Ubuntu/Debian)
cd /tmp
sudo dpkg -i nginx-*.deb
```
**启动服务**

```
sudo systemctl start nginx       # 启动
sudo systemctl enable nginx      # 开机自启
sudo systemctl status nginx      # 查看状态

```
**验证**

```
nginx -v                         # 查看版本
curl http://localhost            # 测试访问

```
#### 方案二

源码编译安装的方式，一般不推荐，除非你有特殊需求，如果需要的话让后端来吧，我们是前端...,超纲了！

> 作者：LiuMingXin
> 
> 文章同步地址：
> 
> https://www.liumingxin.site/blog/detail/nginx

  

Node 社群
