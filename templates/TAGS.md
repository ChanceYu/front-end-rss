> 提示：只是根据文章标题简单匹配分类

:alarm_clock: 更新时间: <%= obj.currentDate %>。[文章来源](/README.md)

## 文章分类
<% _.each(obj.tags, function(e){ %>
- [<%= e.tag %>](#<%= e.tag.toLowerCase() %>) <% }) %>

## 文章链接
<% _.each(obj.tags, function(e){ %>
<details open>
<summary id="<%= e.tag.toLowerCase() %>">
 <%= e.tag %>
</summary>
<p></p>

<% if(e.keywords){ %>
> 关键字：`<%= e.keywords.replace(/(\?)|([：])/g, '').split('|').join('`、`') %>`
<% } %>

<% _.each(e.items.slice(0,20), function(item){ var itemTitle = obj.formatTitle(item.title); %>
- [【<%= item.rssTitle %>】<%= itemTitle %>](<%= item.link %>)<% }) %>
- [......【查看更多】......](/details/tags/<%= e.filename %>.md)

<div align="right"><a href="#文章分类">⬆ &nbsp;返回顶部</a></div>
</details>
<% }) %>
