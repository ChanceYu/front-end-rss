---
title: "天才用户取用户名为 null，害我熬夜查到两点…"
link: "http://mp.weixin.qq.com/s?__biz=MzAxODE2MjM1MA==&mid=2651623595&idx=1&sn=06464a6e12ab4fd3d5284db3ac99987a&chksm=8022476ab755ce7cc8b8053f37afc39e5b9c11fe426128cb584d154c4f1aa418160b272eb0c4#rd"
date: 2026-01-04
md5: 67d01dc85a9935d20fca4c81e8a9c8af
---

# 天才用户取用户名为 null，害我熬夜查到两点…

> 转自：算法爱好者

你以为的 null 不是真的 null，但 bug 是真的 bug！

![图片](./images/7fdb0f8232c9952ad1e7897a981774f0.png)

  

刷到一篇搞笑的帖子：

![图片](./images/0463cb1e52978d42e3675d5502ac1443.jpeg)

![图片](./images/5e6fac3142230e1e6ae4530553ab43b9.png)

  

用户取用户名为 "null"！

`` 是的，你没看错，不是 Java 里的`null` ``，不是 SQL 里的`NULL`，而是一个货真价实的字符串 "null"！这玩意儿乍一看人畜无害，但只要你代码里稍不注意，它就能让你怀疑人生。

01程序员眼中的 "null" 

想象一下，你在代码里写：

```
if (username == null) {
    throw new IllegalArgumentException("用户名不能为空！");
}
```
然后用户提交：

```
{
    "username": "null",
    "password": "123456"
}
```
结果？ 你的代码屁都没放，用户成功注册！

为啥？因为`"null"`是个**合法的字符串**，不是`null`！你的代码根本不会拦截它，数据库里就多了一个幽灵用户，名字就叫 "null"。

更搞笑的是，日志里打印：

```
当前用户：null
```
你以为是系统异常？不，人家就叫这个名！

02用户名 "null" 会带来哪些问题？

你以为只是个名字？天真！它能让你体验全方位崩溃：

- 用户体验炸裂

登录后显示：“欢迎您，null！”

用户：？？？我是谁？我在哪？

- **日志排查地狱**  

日志里全是 `null`，你根本分不清是**真·空值**还是**假·字符串**，只能疯狂 debug。

- 数据库污染

导出 Excel、权限管理、用户去重时，突然冒出一个 "null"，你以为是脏数据，结果人家是正经注册的。

- **安全风险**  

有些系统会把 `"null"` 当成特殊标识符，可能导致 XSS 或信息泄露。

- **自动化脚本翻车**  

很多脚本会跳过 `null` 值，结果 "null" 用户被漏掉，导致业务逻辑出错。

03遇到这种问题怎么办？

别慌，老司机教你几招：

**1）严格校验用户名**  

别只检查 `null`，还要拦截 `"null"`、`"undefined"`、空格等毒瘤字符串：

```
private static final Set<String> ILLEGAL_USERNAMES = Set.of(
    "null", "undefined", " ", "\t", "\n", "admin", "root"
);

public void validateUsername(String username) {
    if (username == null || ILLEGAL_USERNAMES.contains(username.trim().toLowerCase())) {
        throw new IllegalArgumentException("用户名非法！");
    }
}
```
**2）**前端也要拦截

别全甩锅给后端，前端表单校验加个规则：

```
if (["null", "undefined", ""].includes(username.trim())) {
    alert("用户名不能是 null 或 undefined！");
    return;
}
```
**3）数据库****约束**  

加个 `CHECK` 约束，禁止存入非法用户名：

```
ALTER TABLE users ADD CONSTRAINT chk_username 
CHECK (username NOT IN ('null', 'undefined', ' '));
```
**4）**日志区分真假 null

打印日志时加个标记：

```
logger.info("用户名为: {}", username == null ? "[NULL]" : username);
```
`04终极建议`

`` 用户可能只是手滑，或者系统自动填充了个`"null"` ``，但最终熬夜 debug 的是你。所以：

- 入口拦截：注册、导入、API 调用，全都要校验！
- 统一规范：用户名只能包含字母、数字，长度限制，避免奇葩值。
- 防御性编程：永远假设用户会输入最离谱的数据！

`**所有被 "null" 坑过的程序员**`

`` 你们不是一个人！下次再看到`"null"` ``，记得先喝杯咖啡，今晚可能又要熬了…

\- EOF -

推荐阅读  点击标题可跳转

1、[前端一行代码生成数千页PDF，dompdf.js新增分页功能](https://mp.weixin.qq.com/s?__biz=MzAxODE2MjM1MA==&mid=2651623589&idx=2&sn=706fd8a7f0f83ea53281dded230e1241&scene=21#wechat_redirect)

2、[一种新HTML页面转换成 PDF 技术方案](https://mp.weixin.qq.com/s?__biz=MzAxODE2MjM1MA==&mid=2651623578&idx=1&sn=c1dd9dc525b0b71e1239ee0d10a5bf9b&scene=21#wechat_redirect)

3、[如何用Claude Code 生成顶级UI](https://mp.weixin.qq.com/s?__biz=MzAxODE2MjM1MA==&mid=2651623557&idx=2&sn=229c58547357a584f48d2f10651688ec&scene=21#wechat_redirect)
