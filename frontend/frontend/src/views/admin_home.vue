<!-- filepath: src/views/admin_home.vue -->
<template>
  <div class="admin-layout">
    <!-- 侧边栏 -->
    <SideBar
      :menuItems="adminMenuItems"
      :activeItem="$route.path"
      :class="{ 'mobile-open': mobileMenuOpen }"
      @menuClick="handleMenuClick"
    />

    <!-- 主要内容区域 -->
    <div class="main-layout">
      <!-- 页面头部 -->
      <PageHeader
        :title="pageTitle"
        :showMobileMenu="true"
        @toggleMobileMenu="toggleMobileMenu"
      >
        <template #actions>
          <!-- 快捷操作按钮组 -->
          <div class="quick-actions">
            <button
              @click="quickCreateTeacher"
              class="quick-btn teacher-btn"
              title="Excel批量创建教师"
            >
              <span class="btn-icon">📊</span>
              <span class="btn-text">Excel导入教师</span>
            </button>

            <button
              @click="quickCreateStudent"
              class="quick-btn student-btn"
              title="快速创建学生"
            >
              <span class="btn-icon">👨‍🎓</span>
              <span class="btn-text">创建学生</span>
            </button>
          </div>

          <!-- 用户信息和退出 -->
          <div class="user-actions">
            <div class="user-info">
              <span class="user-avatar">👤</span>
              <span class="username">{{ username }}</span>
            </div>
            <button
              @click="logout"
              class="logout-btn"
            >
              <span class="logout-icon">🚪</span>
              <span>退出</span>
            </button>
          </div>
        </template>
      </PageHeader>

      <!-- 内容区域 -->
      <main class="content-area">
        <!-- 只在首页显示仪表板 -->
        <div
          v-if="$route.path === '/admin'"
          class="dashboard"
        >
          <!-- 欢迎区域 -->
          <div class="welcome-section">
            <div class="welcome-content">
              <h1>欢迎回来，{{ username }}！</h1>
              <p>管理您的教育平台，通过Excel批量导入创建和管理教师、学生账户</p>
            </div>
            <div class="welcome-illustration">
              <div class="illustration-emoji">🎓</div>
            </div>
          </div>

          <!-- 统计卡片 -->
          <div class="stats-overview">
            <div class="stat-card primary">
              <div class="card-icon">📊</div>
              <div class="card-content">
                <h3>{{ data.teachers.length }}</h3>
                <p>注册教师</p>
                <div class="card-action">
                  <button
                    @click="quickCreateTeacher"
                    class="action-btn"
                  >
                    📊 Excel导入教师
                  </button>
                </div>
              </div>
            </div>

            <div class="stat-card secondary">
              <div class="card-icon">👨‍🎓</div>
              <div class="card-content">
                <h3>{{ data.students.length }}</h3>
                <p>注册学生</p>
                <div class="card-action">
                  <button
                    @click="quickCreateStudent"
                    class="action-btn"
                  >
                    ➕ 添加学生
                  </button>
                </div>
              </div>
            </div>

            <div class="stat-card accent">
              <div class="card-icon">📚</div>
              <div class="card-content">
                <h3>{{ getSubjectCount() }}</h3>
                <p>教学科目</p>
                <div class="card-action">
                  <button
                    @click="viewTeachers"
                    class="action-btn"
                  >
                    📋 查看详情
                  </button>
                </div>
              </div>
            </div>

            <div class="stat-card success">
              <div class="card-icon">📈</div>
              <div class="card-content">
                <h3>{{ getActiveClassCount() }}</h3>
                <p>活跃班级</p>
                <div class="card-action">
                  <button
                    @click="viewStudents"
                    class="action-btn"
                  >
                    📋 查看详情
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- 快速操作区域 -->
          <div class="quick-operations">
            <h2>快速操作</h2>
            <div class="operation-grid">
              <div
                class="operation-card featured"
                @click="quickCreateTeacher"
              >
                <div class="op-icon">📊</div>
                <h3>Excel批量导入教师</h3>
                <p>上传Excel文件，批量创建教师账户，支持模板下载</p>
                <div class="op-badge excel">Excel专用</div>
                <div class="op-features">
                  <span class="feature">📋 模板下载</span>
                  <span class="feature">📈 批量导入</span>
                  <span class="feature">📊 结果统计</span>
                </div>
              </div>

              <div
                class="operation-card"
                @click="quickCreateStudent"
              >
                <div class="op-icon">📝</div>
                <h3>批量创建学生</h3>
                <p>通过Excel文件批量导入学生信息</p>
                <div class="op-badge">推荐</div>
              </div>

              <div
                class="operation-card"
                @click="viewTeachers"
              >
                <div class="op-icon">👥</div>
                <h3>教师管理</h3>
                <p>查看、编辑和管理所有教师信息</p>
              </div>

              <div
                class="operation-card"
                @click="viewStudents"
              >
                <div class="op-icon">📋</div>
                <h3>学生管理</h3>
                <p>查看、编辑和管理所有学生信息</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 其他页面通过路由显示 -->
        <router-view v-else />
      </main>
    </div>

    <!-- 移动端遮罩 -->
    <div
      v-if="mobileMenuOpen"
      class="mobile-overlay"
      @click="closeMobileMenu"
    />

    <!-- 快速提示 -->
    <transition name="tip-fade">
      <div
        v-if="showQuickTip"
        class="quick-tip"
      >
        <div class="tip-content">
          <span class="tip-icon">💡</span>
          <span>{{ quickTipMessage }}</span>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import PageHeader from '@/components/layout/PageHeader.vue';
import SideBar from '@/components/layout/SideBar.vue';

export default {
  name: 'AdminHome',

  components: {
    PageHeader,
    SideBar,
  },

  data () {
    return {
      mobileMenuOpen: false,
      showQuickTip: false,
      quickTipMessage: '',
      data: {
        teachers: JSON.parse(localStorage.getItem('teachers')) || [],
        students: JSON.parse(localStorage.getItem('students')) || [],
      },
      adminMenuItems: [
        { path: '/admin', icon: '🏠', label: '首页概览' },
        { path: '/admin/create-teacher', icon: '📊', label: 'Excel导入教师' },
        { path: '/admin/create-student', icon: '👨‍🎓', label: '创建学生' },
        { path: '/admin/teachers', icon: '📋', label: '教师管理' },
        { path: '/admin/students', icon: '📝', label: '学生管理' },
      ],
      recentActivities: []
    };
  },

  computed: {
    username () {
      return localStorage.getItem('username') || '管理员';
    },

    pageTitle () {
      const titles = {
        '/admin': '管理面板',
        '/admin/create-teacher': 'Excel导入教师',
        '/admin/create-student': '创建学生',
        '/admin/teachers': '教师管理',
        '/admin/students': '学生管理'
      };
      return titles[this.$route.path] || '管理面板';
    }
  },

  mounted () {
    console.log('🏠 AdminHome组件已挂载');
    console.log('🛤️ 当前路由:', this.$route.path);
    // 初始化数据
    this.loadData();
  },

  methods: {
    handleMenuClick (item) {
      console.log('🔄 菜单点击:', item.label);

      if (item.path !== this.$route.path) {
        this.$router.push(item.path);
      }

      this.closeMobileMenu();
      this.showQuickTipMessage(`已切换到 ${item.label}`);
    },

    quickCreateTeacher () {
      console.log('🎯 Excel批量导入教师');
      this.$router.push('/admin/create-teacher');
      this.closeMobileMenu();
      this.showQuickTipMessage('📊 进入Excel批量导入教师页面');
    },

    quickCreateStudent () {
      console.log('🎯 快速创建学生');
      this.$router.push('/admin/create-student');
      this.closeMobileMenu();
      this.showQuickTipMessage('🚀 开始创建学生');
    },

    viewTeachers () {
      this.$router.push('/admin/teachers');
      this.showQuickTipMessage('📋 查看教师列表');
    },

    viewStudents () {
      this.$router.push('/admin/students');
      this.showQuickTipMessage('📝 查看学生列表');
    },

    toggleMobileMenu () {
      this.mobileMenuOpen = !this.mobileMenuOpen;
      console.log('📱 切换移动端菜单:', this.mobileMenuOpen);
    },

    closeMobileMenu () {
      this.mobileMenuOpen = false;
      console.log('📱 关闭移动端菜单');
    },

    showQuickTipMessage (message) {
      this.quickTipMessage = message;
      this.showQuickTip = true;
      console.log('💡 显示提示:', message);

      setTimeout(() => {
        this.showQuickTip = false;
      }, 2000);
    },

    // 获取科目数量
    getSubjectCount () {
      const subjects = new Set();
      this.data.teachers.forEach(teacher => {
        if (teacher.subject) {
          subjects.add(teacher.subject);
        }
      });
      return subjects.size;
    },

    // 获取活跃班级数量
    getActiveClassCount () {
      const classes = new Set();
      this.data.students.forEach(student => {
        if (student.className) {
          classes.add(student.className);
        }
      });
      return classes.size;
    },

    // 加载数据
    loadData () {
      try {
        const teachers = JSON.parse(localStorage.getItem('teachers')) || [];
        const students = JSON.parse(localStorage.getItem('students')) || [];

        this.data = {
          teachers,
          students
        };

        console.log('📊 数据加载完成:', {
          teachers: teachers.length,
          students: students.length
        });
      } catch (error) {
        console.error('❌ 数据加载失败:', error);
        this.data = {
          teachers: [],
          students: []
        };
      }
    },

    // 退出登录
    logout () {
      console.log('🚪 用户退出登录');

      // 清除本地存储
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('userRole');
      localStorage.removeItem('username');
      localStorage.removeItem('authToken');

      // 跳转到登录页
      this.$router.push('/admin/login');

      this.showQuickTipMessage('👋 已安全退出');
    }
  }
};
</script>

<style scoped>
/* 基础布局样式 */
.admin-layout {
  width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 0;
  background: #f8fafc;
  overflow: hidden;
  position: relative;
}

.main-layout {
  margin-left: 280px;
  width: calc(100vw - 280px);
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f8fafc;
  position: relative;
}

/* 快捷操作样式 */
.quick-actions {
  display: flex;
  gap: 12px;
  margin-right: 20px;
}

.quick-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.teacher-btn {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.student-btn {
  background: linear-gradient(135deg, #f093fb, #f5576c);
  color: white;
}

.quick-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.btn-icon {
  font-size: 16px;
}

.btn-text {
  font-weight: 500;
}

/* 用户操作样式 */
.user-actions {
  display: flex;
  align-items: center;
  gap: 15px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  background: white;
  padding: 8px 12px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.user-avatar {
  font-size: 16px;
}

.username {
  font-weight: 500;
  color: #2d3748;
  font-size: 14px;
}

.logout-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #e53e3e;
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(229, 62, 62, 0.3);
}

.logout-btn:hover {
  background: #c53030;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(229, 62, 62, 0.4);
}

.logout-icon {
  font-size: 14px;
}

/* 内容区域样式 */
.content-area {
  flex: 1;
  width: 100%;
  height: calc(100vh - 80px);
  margin: 0;
  padding: 0;
  background: #f8fafc;
  overflow: hidden;
  position: relative;
}

.dashboard {
  width: 100%;
  height: 100%;
  padding: 30px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 30px;
}

/* 欢迎区域样式 */
.welcome-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
}

.welcome-content h1 {
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 10px 0;
}

.welcome-content p {
  font-size: 16px;
  opacity: 0.9;
  margin: 0;
}

.welcome-illustration {
  font-size: 80px;
  opacity: 0.3;
}

/* 统计卡片样式 */
.stats-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.stat-card {
  background: white;
  padding: 30px;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #667eea, #764ba2);
}

.stat-card.secondary::before {
  background: linear-gradient(90deg, #f093fb, #f5576c);
}

.stat-card.accent::before {
  background: linear-gradient(90deg, #4facfe, #00f2fe);
}

.stat-card.success::before {
  background: linear-gradient(90deg, #43e97b, #38f9d7);
}

.stat-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.12);
}

.card-icon {
  font-size: 48px;
  margin-bottom: 20px;
}

.card-content h3 {
  font-size: 36px;
  font-weight: 700;
  color: #2d3748;
  margin: 0 0 8px 0;
}

.card-content p {
  color: #718096;
  margin: 0 0 20px 0;
  font-size: 16px;
}

.action-btn {
  background: #f7fafc;
  color: #4a5568;
  border: 2px solid #e2e8f0;
  padding: 10px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  font-size: 14px;
}

.action-btn:hover {
  background: #edf2f7;
  border-color: #cbd5e0;
}

/* 快速操作样式 */
.quick-operations h2 {
  color: #2d3748;
  margin: 0 0 20px 0;
  font-size: 24px;
  font-weight: 600;
}

.operation-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.operation-card {
  background: white;
  padding: 30px;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.operation-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.12);
}

.op-icon {
  font-size: 48px;
  margin-bottom: 20px;
}

.operation-card h3 {
  color: #2d3748;
  margin: 0 0 10px 0;
  font-size: 18px;
  font-weight: 600;
}

.operation-card p {
  color: #718096;
  margin: 0 0 15px 0;
  font-size: 14px;
  line-height: 1.5;
}

.op-badge {
  background: #667eea;
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
  display: inline-block;
  margin-bottom: 10px;
}

.op-badge.excel {
  background: linear-gradient(135deg, #667eea, #764ba2);
}

.op-features {
  display: flex;
  gap: 10px;
  margin-top: 15px;
  flex-wrap: wrap;
}

.feature {
  background: #e6f3ff;
  color: #2c5282;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
}

.operation-card.featured {
  background: linear-gradient(135deg, #f7fafc, #edf2f7);
  border: 2px solid #667eea;
  position: relative;
}

.operation-card.featured::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #667eea, #764ba2);
}

/* 移动端遮罩 */
.mobile-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  display: none;
}

/* 快速提示样式 */
.quick-tip {
  position: fixed;
  bottom: 30px;
  right: 30px;
  background: #667eea;
  color: white;
  padding: 15px 20px;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
  z-index: 1000;
  max-width: 300px;
}

.tip-content {
  display: flex;
  align-items: center;
  gap: 10px;
}

.tip-icon {
  font-size: 18px;
}

/* 过渡动画 */
.tip-fade-enter-active,
.tip-fade-leave-active {
  transition: all 0.3s ease;
}

.tip-fade-enter-from,
.tip-fade-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .main-layout {
    margin-left: 260px;
    width: calc(100vw - 260px);
  }
}

@media (max-width: 768px) {
  .main-layout {
    margin-left: 0;
    width: 100vw;
  }

  .mobile-overlay {
    display: block;
  }

  .quick-actions {
    gap: 8px;
    margin-right: 10px;
  }

  .quick-btn {
    padding: 8px 12px;
    font-size: 12px;
  }

  .btn-text {
    display: none;
  }

  .operation-grid {
    grid-template-columns: 1fr;
  }

  .stats-overview {
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
  }

  .dashboard {
    padding: 20px;
    gap: 20px;
  }
}

@media (max-width: 480px) {
  .stats-overview {
    grid-template-columns: 1fr;
  }

  .user-actions {
    gap: 10px;
  }

  .username {
    display: none;
  }

  .logout-btn span:last-child {
    display: none;
  }
}
</style>