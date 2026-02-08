const data = require('./data')
const createFiles = require('./createFiles')

// 生成所有静态文件并获取配置信息
const config = createFiles()

module.exports = {
  // 保留：用于筛选菜单显示
  RSS_DATA: JSON.stringify(data.RSS_DATA),
  TAGS_DATA: JSON.stringify(data.TAGS_DATA),
  HOTWORDS_DATA: JSON.stringify(data.HOTWORDS_DATA),

  // 新增：分页配置常量
  TOTAL_COUNT: config.totalCount,
  PAGE_SIZE: config.pageSize,
  PAGE_COUNT: config.pageCount
}
