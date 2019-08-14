:alarm_clock: 更新时间: <%= obj.currentDate %>。[来源分类](../README.md)、[标签分类](../TAGS.md)、[时间分类](../TIMELINE.md)

## <%= obj.title %>

<% if(obj.keywords){ %>
> 关键字：`<%= obj.keywords.replace(/(\?)|([：])/g, '').split('|').join('`、`') %>`
<% } %>

<% _.each(obj.items, function(item){ var itemTitle = obj.formatTitle(item.title); %>
- [<%= item.date %>-<%= itemTitle %>](<%= item.link %>) <% }) %>