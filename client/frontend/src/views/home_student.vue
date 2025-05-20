<template>
  <el-container class="chatgpt-layout">
    <!-- 可折叠侧边栏 -->
    <el-aside
      :width="collapsed ? '60px' : '220px'"
      class="sidebar"
    >
      <div class="sidebar-header">
        <el-button
          @click="toggleSidebar"
          text
          icon
        >
          <el-icon>
            <Menu />
          </el-icon>
        </el-button>
        <span
          v-if="!collapsed"
          class="sidebar-title"
        >AI 控制台</span>
      </div>
      <el-menu
        :default-active="activeMenu"
        class="el-menu-vertical"
        :collapse="collapsed"
        background-color="#2d2d2d"
        text-color="#fff"
        active-text-color="#10a37f"
        router
      >
        <el-menu-item index="/home">
          <el-icon>
            <ChatDotRound />
          </el-icon>
          <span>对话首页</span>
        </el-menu-item>
        <el-menu-item index="/history">
          <el-icon>
            <Clock />
          </el-icon>
          <span>历史记录</span>
        </el-menu-item>
        <el-menu-item index="/settings">
          <el-icon>
            <Setting />
          </el-icon>
          <span>设置</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <!-- 内容主体 -->
    <el-container>
      <el-header class="header">
        <div class="user-info">
          <el-avatar icon="UserFilled" />
          <span class="username">{{ username }}</span>
          <el-button
            size="small"
            type="text"
            @click="logout"
            class="logout-btn"
          >退出</el-button>
        </div>
      </el-header>
      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>


<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Menu, ChatDotRound, Clock, Setting, UserFilled } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()

const collapsed = ref(false)
const username = ref('GPT用户')
const activeMenu = ref(route.path)

watch(
  () => route.path,
  (val) => {
    activeMenu.value = val
  }
)

const toggleSidebar = () => {
  collapsed.value = !collapsed.value
}

const logout = () => {
  localStorage.removeItem('Authentication')
  router.push('/login')
}
</script>

<style scoped>
/* 页面淡入动画 */
@keyframes fadeInUp {
  0% {
    opacity: 0;
    transform: translateY(12px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.main-content {
  animation: fadeInUp 0.5s ease;
  transition: padding 0.3s ease;
}

/* 侧边栏折叠动画 */
.sidebar {
  transition: width 0.3s ease;
}

/* 自定义按钮波纹动画 */
.el-button {
  position: relative;
  overflow: hidden;
}

.el-button::after {
  content: '';
  position: absolute;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  transform: scale(0);
  animation: ripple 0.6s linear;
  pointer-events: none;
}

@keyframes ripple {
  to {
    transform: scale(4);
    opacity: 0;
  }
}

.el-button:active::after {
  top: 50%;
  left: 50%;
  width: 100px;
  height: 100px;
  margin-top: -50px;
  margin-left: -50px;
}

.chatgpt-layout {
  height: 100vh;
  background-color: #f5f7fa;
  color: #333;
}

.sidebar {
  background-color: #ffffff;
  border-right: 1px solid #e0e0e0;
  transition: width 0.3s ease;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  padding-top: 10px;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.03);
}

.sidebar-header {
  display: flex;
  align-items: center;
  padding: 0 16px;
  height: 50px;
  font-weight: bold;
  color: #333;
  justify-content: start;
  border-bottom: 1px solid #f0f0f0;
}

.sidebar-title {
  margin-left: 10px;
  font-size: 16px;
  color: #409eff;
}

.el-menu-vertical {
  border-right: none;
  background-color: transparent;
}

.el-menu-vertical .el-menu-item {
  border-radius: 6px;
  margin: 4px 8px;
}

.el-menu-vertical .el-menu-item.is-active {
  background-color: #e6f7ff;
  color: #409eff;
}

.header {
  height: 56px;
  background-color: #ffffff;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 0 24px;
  border-bottom: 1px solid #e0e0e0;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #333;
}

.username {
  font-weight: 500;
}

.logout-btn {
  color: #f56c6c;
  font-weight: 500;
}

.main-content {
  background-color: #f9fafc;
  padding: 24px;
  overflow-y: auto;
  height: calc(100vh - 56px);
  color: #333;
  font-size: 15px;
}
</style>