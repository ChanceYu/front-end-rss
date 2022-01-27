:alarm_clock: 更新时间: <%= obj.currentDate %>。[文章来源](/README.md)、[文章分类](/TAGS.md)

## <%= obj.title %>

<% if(obj.keywords){ %>
> 关键字：`<%= obj.keywords.replace(/(\?)|([：])/g, '').split('|').join('`、`') %>`
<% } %>

<% _.each(obj.items, function(item){ var itemTitle = obj.formatTitle(item.title); %>
- [<%= item.date %>-<%= itemTitle %>](<%= item.link %>) <% }) %>
