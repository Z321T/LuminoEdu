<template>
  <div class="admin-layout">
    <!-- 侧边栏 -->
    <aside class="sidebar">
      <div class="logo">LuminoEdu</div>
      <ul class="menu">
        <li class="menu-item active" @click="navigateTo('/home_teacher')">
          <i class="icon">🏠</i>
          <span>首页</span>
        </li>
        <li class="menu-item" @click="navigateTo('/exercise_generate')">
          <i class="icon">📝</i>
          <span>习题生成</span>
        </li>
        <li class="menu-item">
          <i class="icon">📚</i>
          <span>课程管理</span>
        </li>
        <li class="menu-item">
          <i class="icon">👥</i>
          <span>学生管理</span>
        </li>
        <li class="menu-item">
          <i class="icon">📝</i>
          <span>作业批改</span>
        </li>
        <li class="menu-item">
          <i class="icon">🔔</i>
          <span>消息通知</span>
        </li>
        <li class="menu-item">
          <i class="icon">⚙️</i>
          <span>设置</span>
        </li>
      </ul>
    </aside>
    <!-- 主体内容 -->
    <div class="main">
      <!-- 顶部导航栏 -->
      <header class="header">
        <div class="header-title">教师后台管理系统</div>
        <div class="header-user">
          <span>欢迎，张老师</span>
          <button class="logout-btn">退出登录</button>
        </div>
      </header>
      <!-- 内容区 -->
      <section class="content">
        <!-- 数据统计卡片 -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">📚</div>
            <div class="stat-info">
              <h3>12</h3>
              <p>课程总数</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">👥</div>
            <div class="stat-info">
              <h3>156</h3>
              <p>学生总数</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">📝</div>
            <div class="stat-info">
              <h3>23</h3>
              <p>待批改作业</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">🔔</div>
            <div class="stat-info">
              <h3>5</h3>
              <p>未读消息</p>
            </div>
          </div>
        </div>

        <!-- 主要功能区域 -->
        <div class="main-grid">
          <!-- 快速操作 -->
          <div class="panel">
            <h3 class="panel-title">快速操作</h3>
            <div class="quick-actions">
              <!-- 左侧功能栏 -->
              <div class="action-column">
                <h4 class="column-title">教学工具</h4>
                <button class="action-btn" @click="navigateTo('/exercise_generate')">
                  <div class="action-icon">📝</div>
                  <span>习题生成</span>
                </button>
                <button class="action-btn">
                  <div class="action-icon">📊</div>
                  <span>PPT制作</span>
                </button>
              </div>

              <!-- 右侧功能栏 -->
              <div class="action-column">
                <h4 class="column-title">课程管理</h4>
                <button class="action-btn">
                  <div class="action-icon">➕</div>
                  <span>创建新课程</span>
                </button>
                <button class="action-btn">
                  <div class="action-icon">📋</div>
                  <span>发布作业</span>
                </button>
              </div>
            </div>
          </div>

          <!-- 最近课程 -->
          <div class="panel">
            <h3 class="panel-title">最近课程</h3>
            <div class="course-list">
              <div class="course-item">
                <div class="course-info">
                  <h4>高等数学</h4>
                  <p>计算机科学与技术 • 周一 8:00-10:00</p>
                </div>
                <button class="btn-primary">进入课程</button>
              </div>
              <div class="course-item">
                <div class="course-info">
                  <h4>数据结构</h4>
                  <p>软件工程 • 周三 14:00-16:00</p>
                </div>
                <button class="btn-primary">进入课程</button>
              </div>
              <div class="course-item">
                <div class="course-info">
                  <h4>算法设计</h4>
                  <p>计算机科学与技术 • 周五 10:00-12:00</p>
                </div>
                <button class="btn-primary">进入课程</button>
              </div>
            </div>
          </div>
        </div>

        <!-- 最新消息和待办事项 -->
        <div class="bottom-grid">
          <div class="panel">
            <h3 class="panel-title">最新消息</h3>
            <div class="message-list">
              <div class="message-item">
                <div class="message-content">
                  <h4>学生张三提交了作业</h4>
                  <p>数据结构 - 第三章练习题</p>
                  <span class="time">2小时前</span>
                </div>
              </div>
              <div class="message-item">
                <div class="message-content">
                  <h4>课程评价提醒</h4>
                  <p>高等数学课程收到新的学生评价</p>
                  <span class="time">4小时前</span>
                </div>
              </div>
            </div>
          </div>

          <div class="panel">
            <h3 class="panel-title">待办事项</h3>
            <div class="todo-list">
              <div class="todo-item">
                <input
                  type="checkbox"
                  class="todo-checkbox"
                >
                <span>批改高等数学期中考试</span>
              </div>
              <div class="todo-item">
                <input
                  type="checkbox"
                  class="todo-checkbox"
                >
                <span>准备下周的算法设计课件</span>
              </div>
              <div class="todo-item">
                <input
                  type="checkbox"
                  class="todo-checkbox"
                  checked
                >
                <span class="completed">更新数据结构课程大纲</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

// 页面跳转函数
const navigateTo = (path: string) => {
  router.push(path)
}
</script>

<style scoped>
/* 重置默认样式，消除边距 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.admin-layout {
  display: flex;
  height: 100vh;
  width: 100vw;
  background: #f5f6fa;
  overflow: hidden;
}

.sidebar {
  width: 260px;
  background: #2d3a4b;
  color: #fff;
  display: flex;
  flex-direction: column;
  padding: 0;
  box-shadow: 2px 0 6px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
}

.logo {
  font-size: 24px;
  font-weight: bold;
  text-align: center;
  padding: 24px 0;
  letter-spacing: 2px;
  background: #223047;
  border-bottom: 1px solid #3a4a5c;
}

.menu {
  list-style: none;
  padding: 16px 0;
  margin: 0;
  flex: 1;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 16px 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin: 4px 16px;
  border-radius: 8px;
}

.menu-item:hover,
.menu-item.active {
  background: #3a4a5c;
  transform: translateX(4px);
}

.menu-item .icon {
  margin-right: 12px;
  font-size: 16px;
}

.main {
  flex: 1;
  display: flex;
  flex-direction: column;
  width: calc(100vw - 260px);
  overflow: hidden;
}

.header {
  height: 70px;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  z-index: 10;
  flex-shrink: 0;
}

.header-title {
  font-size: 22px;
  font-weight: 600;
  color: #2d3a4b;
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

.content {
  flex: 1;
  padding: 32px;
  overflow-y: auto;
  width: 100%;
}

/* 统计卡片网格 - 充满宽度 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  margin-bottom: 32px;
  width: 100%;
}

.stat-card {
  background: #fff;
  padding: 32px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  transition: transform 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
}

.stat-icon {
  font-size: 40px;
  margin-right: 20px;
}

.stat-info h3 {
  margin: 0;
  font-size: 32px;
  font-weight: bold;
  color: #2d3a4b;
}

.stat-info p {
  margin: 8px 0 0;
  color: #666;
  font-size: 16px;
}

/* 主要内容网格 - 充满宽度 */
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

.panel {
  background: #fff;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  width: 100%;
}

.panel-title {
  margin: 0 0 24px;
  color: #2d3a4b;
  font-size: 20px;
  font-weight: 600;
  border-bottom: 2px solid #f0f2f5;
  padding-bottom: 16px;
}

/* 课程列表 */
.course-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.course-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  transition: background 0.3s ease;
}

.course-item:hover {
  background: #e9ecef;
}

.course-info h4 {
  margin: 0 0 8px;
  color: #2d3a4b;
  font-size: 16px;
}

.course-info p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.btn-primary {
  background: #3498db;
  color: #fff;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.3s ease;
  font-size: 14px;
}

.btn-primary:hover {
  background: #2980b9;
}

/* 快速操作 - 重新设计为左右分栏 */
.quick-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.action-column {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.column-title {
  font-size: 16px;
  font-weight: 600;
  color: #2d3a4b;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e9ecef;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background: #f8f9fa;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 100px;
  justify-content: center;
}

.action-btn:hover {
  background: #e9ecef;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.action-icon {
  font-size: 24px;
  margin-bottom: 8px;
}

.action-btn span {
  font-size: 14px;
  color: #2d3a4b;
  font-weight: 500;
}

/* 消息列表 */
.message-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message-item {
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #3498db;
}

.message-content h4 {
  margin: 0 0 8px;
  font-size: 16px;
  color: #2d3a4b;
}

.message-content p {
  margin: 0 0 12px;
  font-size: 14px;
  color: #666;
}

.time {
  font-size: 12px;
  color: #999;
}

/* 待办事项 */
.todo-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.todo-item {
  display: flex;
  align-items: center;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.todo-checkbox {
  margin-right: 16px;
  transform: scale(1.3);
}

.todo-item span {
  font-size: 14px;
  color: #2d3a4b;
}

.completed {
  text-decoration: line-through;
  color: #999 !important;
}

/* 响应式设计 */
@media (max-width: 1400px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 1200px) {
  .main-grid {
    grid-template-columns: 1fr;
  }

  .bottom-grid {
    grid-template-columns: 1fr;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .sidebar {
    width: 200px;
  }

  .main {
    width: calc(100vw - 200px);
  }

  .content {
    padding: 16px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .quick-actions {
    grid-template-columns: 1fr;
  }
}
</style>