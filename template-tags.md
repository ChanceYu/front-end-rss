> 提示：只是根据标题文案简单匹配分类

:alarm_clock: 更新时间: <%= obj.currentDate %>，[查看文章来源](./README.md)

## 文章分类
<% _.each(obj.tags, function(e){ %>
- [<%= e.tag %>](#user-content-<%= e.tag %>) <% }) %>

## 文章链接
<% _.each(obj.tags, function(e){ %>
<details open>
<summary id="<%= e.tag %>" name="<%= e.tag %>">
 <%= e.tag %>
</summary>
<p></p>

<% if(e.keywords){ %>
> 关键字：`<%= e.keywords.split('|').join('`、`') %>`
<% } %>

<% _.each(e.items, function(item){ var itemTitle = obj.formatTitle(item.title); %>
- [【<%= item.rssTitle %>】<%= itemTitle %>](<%= item.link %>)<% }) %>
- [⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆返回顶部](#文章分类)
</details>
<% }) %>
