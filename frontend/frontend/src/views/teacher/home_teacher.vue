<template>
  <div class="admin-layout">
    <!-- 侧边栏 -->
    <Sidebar :menu-items="teacherMenuItems" />

    <!-- 主体内容 -->
    <div class="main">
      <!-- 顶部导航栏 -->
      <PageHeader title="教师后台管理系统">
        <template #actions>
          <div class="header-user">
            <span>欢迎，张老师</span>
            <button
              class="logout-btn"
              @click="handleLogout"
            >退出登录</button>
          </div>
        </template>
      </PageHeader>

      <!-- 内容区 -->
      <section class="content">
        <!-- 数据统计卡片 -->
        <StatsGrid :stats="statsData" />

        <!-- 主要功能区域 -->
        <div class="main-grid">
          <!-- 快速操作 -->
          <QuickActions :actions="quickActions" />

          <!-- 最近课程 -->
          <RecentCourses :courses="recentCourses" />
        </div>

        <!-- 最新消息和待办事项 -->
        <div class="bottom-grid">
          <RecentMessages :messages="recentMessages" />
          <TodoList :todos="todoList" />
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import Sidebar from '@/components/layout/Sidebar.vue'
import PageHeader from '@/components/layout/PageHeader.vue'
import StatsGrid from '@/components/home/StatsGrid.vue'
import QuickActions from '@/components/home/QuickActions.vue'
import RecentCourses from '@/components/home/RecentCourses.vue'
import RecentMessages from '@/components/home/RecentMessages.vue'
import TodoList from '@/components/home/TodoList.vue'

const router = useRouter()

// 菜单配置
const teacherMenuItems = [
  { path: '/home_teacher', icon: '🏠', label: '首页' },
  { path: '/exercise_generate', icon: '📝', label: '习题生成' },
  { path: '/ppt_generate', icon: '📊', label: 'PPT生成' },
  { path: '/course_list', icon: '📊', label: '课程管理' },
  { path: '/course_list', icon: '📊', label: '课程管理' },
  { path: '/notification_list', icon: '📊', label: '通知管理' },
  { path: '/exercise_history', icon: '📚', label: '历史记录' },
]

// 统计数据
const statsData = reactive([
  { icon: '📚', value: 12, label: '课程总数', color: '#667eea' },
  { icon: '👥', value: 156, label: '学生总数', color: '#764ba2' },
  { icon: '📝', value: 23, label: '待批改作业', color: '#f093fb' },
  { icon: '🔔', value: 5, label: '未读消息', color: '#4facfe' },
])

// 快速操作
const quickActions = reactive({
  teaching: [
    {
      icon: '📝',
      label: '习题生成历史记录',
      action: () => router.push('/exercise_history'),
    },
    {
      icon: '📊',
      label: 'PPT制作',
      action: () => console.log('PPT制作'),
    },
  ],
  course: [
    {
      icon: '➕',
      label: '创建新课程',
      action: () => console.log('创建新课程'),
    },
    {
      icon: '📋',
      label: '发布作业',
      action: () => console.log('发布作业'),
    },
  ],
})

// 最近课程
const recentCourses = reactive([
  {
    id: 1,
    name: '高等数学',
    info: '计算机科学与技术 • 周一 8:00-10:00',
    action: () => console.log('进入高等数学课程'),
  },
  {
    id: 2,
    name: '数据结构',
    info: '软件工程 • 周三 14:00-16:00',
    action: () => console.log('进入数据结构课程'),
  },
  {
    id: 3,
    name: '算法设计',
    info: '计算机科学与技术 • 周五 10:00-12:00',
    action: () => console.log('进入算法设计课程'),
  },
])

// 最新消息
const recentMessages = reactive([
  {
    id: 1,
    title: '学生张三提交了作业',
    content: '数据结构 - 第三章练习题',
    time: '2小时前',
  },
  {
    id: 2,
    title: '课程评价提醒',
    content: '高等数学课程收到新的学生评价',
    time: '4小时前',
  },
])

// 待办事项
const todoList = reactive([
  { id: 1, text: '批改高等数学期中考试', completed: false },
  { id: 2, text: '准备下周的算法设计课件', completed: false },
  { id: 3, text: '更新数据结构课程大纲', completed: true },
])

// 退出登录
const handleLogout = () => {
  if (confirm('确定要退出登录吗？')) {
    localStorage.removeItem('token')
    router.push('/login')
  }
}
</script>

<style scoped>
.admin-layout {
  display: flex;
  height: 100vh;
  width: 100vw;
  background: #f5f6fa;
  overflow: hidden;
}

.main {
  flex: 1;
  margin-left: 240px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.content {
  flex: 1;
  padding: 32px;
  overflow-y: auto;
  width: 100%;
}

.header-user {
  display: flex;
  align-items: center;
  gap: 16px;
}

.logout-btn {
  background: #e74c3c;
  color: #fff;
  border: none;
  padding: 8px 20px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.3s ease;
  font-weight: 500;
}

.logout-btn:hover {
  background: #c0392b;
}

.main-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 32px;
  margin-bottom: 32px;
  width: 100%;
}

.bottom-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
  width: 100%;
}

@media (max-width: 1200px) {
  .main-grid {
    grid-template-columns: 1fr;
  }

  .bottom-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .main {
    margin-left: 0;
  }

  .content {
    padding: 16px;
  }
}
</style>