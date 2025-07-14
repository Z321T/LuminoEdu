<template>
  <div id="app">
    <router-view v-slot="{ Component }">
      <transition
        name="fade-page"
        mode="out-in"
      >
        <component :is="Component" />
      </transition>
    </router-view>
    <AIChatWidget />
  </div>
</template>
  
<script setup lang="ts" name="App">
import { RouterView, RouterLink } from 'vue-router'
</script>

<style>
/* 全局重置样式 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html,
body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow-x: hidden;
}

#app {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
}
</style>

<style scoped>
.main-content {
  width: 100%;
  height: 100vh;
  background-color: #f5f5f5;
  margin: 0;
  padding: 0;
  position: relative;
}

/* 页面切换动画 */
.fade-page-enter-active,
.fade-page-leave-active {
  transition: opacity 0.3s ease;
}

.fade-page-enter-from,
.fade-page-leave-to {
  opacity: 0;
}
</style>