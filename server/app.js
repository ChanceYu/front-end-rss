const later = require('later')

const handleUpdate = require('./update')

// node app.js 设置自动更新
later.date.localTime()
later.setInterval(handleUpdate, {
  schedules: [
    { h: [6], m: [0] },
    { h: [8], m: [0] },
    { h: [10], m: [0] },
    { h: [12], m: [0] },
    { h: [15], m: [0] },
    { h: [18], m: [0] },
    { h: [21], m: [0] },
    { h: [23], m: [0] },
  ]
})
