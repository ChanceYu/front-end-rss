<div align="center"><img width="100" src="assets/rss.gif" /><h1>Front-End RSS</h1></div>

> 聪明在于学习，天才在于积累。所谓天才，实际上是依靠学习。—— 华罗庚

前端 RSS 自动抓取，根据 RSS 自动抓取 **最新前端技术** 文章链接。自动更新时间点为每天的 06:00、10:00、12:00、18:00、22:00。

:alarm_clock: 更新时间: <%= obj.currentDate %>，:rocket: 更新条数: +<%= obj.newData.length %>， ![](assets/dot.png) 表示有更新

[查看文章分类](./TAGS.md)

## 文章来源
<% _.each(obj.linksJson, function(e){ var rssTitle = obj.formatTitle(e.title); %>
- [<%= rssTitle %>](#<%= rssTitle %>)<% if (e.rss in obj.newData.rss){ %>![](assets/dot.png) <% } %>  <% }) %>

## 文章链接
<% _.each(obj.linksJson, function(e){ var rssTitle = obj.formatTitle(e.title); %>
<details open>
<summary id="<%= rssTitle %>">
  <%= rssTitle %>
</summary>

<% _.each(e.items, function(item){ var itemTitle = obj.formatTitle(item.title); %>
- [<%= item.date %>-<%= itemTitle %>](<%= item.link %>) <% if (e.rss in obj.newData.rss && item.link in obj.newData.links){ %>![](assets/new.png) <% } %> <% }) %>

</details>
<% }) %>