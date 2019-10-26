// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import '@vant/touch-emulator'
import { Search, Icon, Popup, Cell, CellGroup } from 'vant'
import App from './App'
import router from './router'

Vue.config.productionTip = false

Vue.use(Search).use(Icon).use(Popup).use(Cell).use(CellGroup)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
