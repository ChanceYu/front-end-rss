> 提示：只是根据标题文案简单匹配类别


## 文章分类
<% _.each(obj.tags, function(e){ %>
- [<%= e.tag %>](#<%= e.tag %>) <% }) %>

## 文章链接
<% _.each(obj.tags, function(e){ %>
<details open>
<summary id="<%= e.tag %>">
  <%= e.tag %>
</summary>

<% _.each(e.items, function(item){ %>
- [【<%= item.rssTitle %>】<%= item.title %>](<%= item.link %>)<% }) %>

</details>
<% }) %>