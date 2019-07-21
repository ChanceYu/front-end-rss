:alarm_clock: 更新时间: <%= obj.currentDate %>。[来源分类](./README.md)、[标签分类](./TAGS.md)

## 时间分类

<table>
<% _.each(obj.dataYears, function(year){  %>
<tr>
<th colspan="12"><%= year %>年</th>
</tr>
<tr><% _.each((new Array(12)), function(e, idx){ idx++; idx = idx < 10 ? ('0' + idx) : idx; var date = year + '-' + idx; %>
<td><% if(obj.dataKeys.indexOf(date) > -1) { %><a href="#<%= date %>"><%= idx %>月</a><% } else { %><%= idx %>月<% } %></td><% }) %>
</tr>
<% }) %>
</table>

## 文章链接
<% _.each(obj.dataKeys, function(e){ %>
<details open>
<summary id="<%= e %>">
 <%= e %>
</summary>

<% _.each(obj.dataObj[e], function(item){ var itemTitle = obj.formatTitle(item.title); %>
- [【<%= item.rssTitle %>】<%= item.date %>-<%= itemTitle %>](<%= item.link %>) <% }) %>

<div align="right"><a href="#时间分类">⬆返回顶部</a></div>
</details>
<% }) %>
