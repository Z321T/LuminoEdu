<template>
  <div class="main-content">
    <transition
      name="fade-page"
      mode="out-in"
    >
      <RouterView></RouterView>
    </transition>

  </div>
</template>
  
  <script setup lang="ts" name="App">
import { RouterView, RouterLink } from 'vue-router'
</script>

<style scoped>
.main-content {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #f5f5f5; /* 背景颜色可自定义 */
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: auto; /* 根据需要调整溢出行为 */
}
</style>