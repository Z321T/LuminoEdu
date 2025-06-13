<!-- filepath: d:\git\LuminoEdu\frontend\frontend\src\components\layout\Sidebar.vue -->
<template>
  <aside class="sidebar">
    <div class="logo">LuminoEdu</div>
    <ul class="menu">
      <li
        v-for="item in menuItems"
        :key="item.path"
        class="menu-item"
        :class="{ active: isActive(item.path) }"
        @click="navigateTo(item.path)"
      >
        <i class="icon">{{ item.icon }}</i>
        <span>{{ item.label }}</span>
      </li>
    </ul>
  </aside>
</template>

<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'

interface MenuItem {
  path: string
  icon: string
  label: string
}

const props = withDefaults(
  defineProps<{
    menuItems: MenuItem[]
  }>(),
  {
    menuItems: () => [
      { path: '/home_teacher', icon: '🏠', label: '首页' },
      { path: '/exercise_generate', icon: '📝', label: '习题生成' },
      { path: '/exercise_history', icon: '📚', label: '历史记录' },
      { path: '/student_management', icon: '👥', label: '学生管理' },
      { path: '/settings', icon: '⚙️', label: '设置' },
    ],
  }
)

const router = useRouter()
const route = useRoute()

const navigateTo = (path: string) => {
  router.push(path)
}

const isActive = (path: string) => {
  return route.path === path
}
</script>

<style scoped>
.sidebar {
  width: 240px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  position: fixed;
  height: 100vh;
  z-index: 1000;
}

.logo {
  padding: 20px;
  font-size: 24px;
  font-weight: bold;
  text-align: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.menu {
  list-style: none;
  padding: 20px 0;
  margin: 0;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  border-left: 3px solid transparent;
}

.menu-item:hover,
.menu-item.active {
  background: rgba(255, 255, 255, 0.1);
  border-left-color: #fff;
}

.menu-item .icon {
  margin-right: 12px;
  font-size: 18px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }

  .sidebar.mobile-open {
    transform: translateX(0);
  }
}
</style>