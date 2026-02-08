<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
html, body {
  margin: 0;
  padding: 0;
  background: #f8f9fa;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  /* 使用 clip 避免横向滚动，且不把 body 变成滚动容器（hidden 会使 overflow-y 变为 auto，导致无限滚动失效） */
  overflow-x: clip;
  max-width: 100vw;
}
#app {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  color: #333;
  min-height: 100vh;
  max-width: 100%;
}
</style>
