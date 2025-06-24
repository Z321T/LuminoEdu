<!-- filepath: src/views/admin_home.vue -->
<template>
  <div class="admin-layout">
    <!-- 侧边栏 -->
    <SideBar
      :menuItems="adminMenuItems"
      :activeItem="currentView"
      :class="{ 'mobile-open': mobileMenuOpen }"
      @menuClick="handleMenuClick"
    />

    <!-- 主要内容区域 -->
    <div class="main-layout">
      <!-- 页面头部 -->
      <PageHeader
        :title="getPageTitle()"
        :showMobileMenu="true"
        @toggleMobileMenu="toggleMobileMenu"
      >
        <template #actions>
          <div class="header-stats">
            <div class="stat-badge">
              <span class="stat-number">{{ data.teachers.length }}</span>
              <span class="stat-label">教师</span>
            </div>
            <div class="stat-badge">
              <span class="stat-number">{{ data.students.length }}</span>
              <span class="stat-label">学生</span>
            </div>
          </div>
          <button
            @click="logout"
            class="logout-btn"
          >
            退出登录
          </button>
        </template>
      </PageHeader>

      <!-- 内容区域 - 完全填满 -->
      <main class="content-area">
        <component
          :is="currentView"
          @updateData="updateData"
          @deleteItem="deleteItem"
          :data="data"
        />
      </main>
    </div>

    <!-- 移动端遮罩 -->
    <div
      v-if="mobileMenuOpen"
      class="mobile-overlay"
      @click="closeMobileMenu"
    ></div>
  </div>
</template>

<script>
import PageHeader from '@/components/layout/PageHeader.vue';
import SideBar from '@/components/layout/SideBar.vue';
import CreateTeacher from '@/components/admin/CreateTeacher.vue';
import CreateStudent from '@/components/admin/CreateStudent.vue';
import ListTeachers from '@/components/admin/ListTeachers.vue';
import ListStudents from '@/components/admin/ListStudents.vue';

export default {
  components: {
    PageHeader,
    SideBar,
    CreateTeacher,
    CreateStudent,
    ListTeachers,
    ListStudents,
  },
  data () {
    return {
      currentView: 'CreateTeacher',
      mobileMenuOpen: false,
      data: {
        teachers: JSON.parse(localStorage.getItem('teachers')) || [],
        students: JSON.parse(localStorage.getItem('students')) || [],
      },
      adminMenuItems: [
        { path: 'CreateTeacher', icon: '👨‍🏫', label: '创建教师' },
        { path: 'CreateStudent', icon: '👨‍🎓', label: '创建学生' },
        { path: 'ListTeachers', icon: '📋', label: '教师管理' },
        { path: 'ListStudents', icon: '📝', label: '学生管理' },
      ]
    };
  },
  computed: {
    username () {
      return localStorage.getItem('username') || '管理员';
    }
  },
  methods: {
    handleMenuClick (item) {
      console.log('菜单点击:', item);
      this.currentView = item.path;
      this.closeMobileMenu();
    },

    updateData (type, item) {
      item.id = Date.now() + Math.random();
      item.createdAt = new Date().toLocaleDateString();

      this.data[type].push(item);
      localStorage.setItem(type, JSON.stringify(this.data[type]));

      this.showSuccessMessage(`${type === 'teachers' ? '教师' : '学生'}创建成功！`);
    },

    deleteItem (type, index) {
      if (confirm('确定要删除这条记录吗？')) {
        this.data[type].splice(index, 1);
        localStorage.setItem(type, JSON.stringify(this.data[type]));
        this.showSuccessMessage('删除成功！');
      }
    },

    getPageTitle () {
      const titles = {
        CreateTeacher: '创建教师',
        CreateStudent: '创建学生',
        ListTeachers: '教师管理',
        ListStudents: '学生管理'
      };
      return titles[this.currentView] || '管理面板';
    },

    toggleMobileMenu () {
      this.mobileMenuOpen = !this.mobileMenuOpen;
    },

    closeMobileMenu () {
      this.mobileMenuOpen = false;
    },

    showSuccessMessage (message) {
      const notification = document.createElement('div');
      notification.className = 'success-notification';
      notification.innerHTML = `
        <div class="notification-content">
          <span class="notification-icon">✓</span>
          <span class="notification-text">${message}</span>
        </div>
      `;

      Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        background: '#48bb78',
        color: 'white',
        padding: '15px 25px',
        borderRadius: '8px',
        boxShadow: '0 4px 20px rgba(72, 187, 120, 0.3)',
        zIndex: '10000',
        animation: 'slideInRight 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      });

      document.body.appendChild(notification);

      setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
          if (document.body.contains(notification)) {
            document.body.removeChild(notification);
          }
        }, 300);
      }, 2700);
    },

    logout () {
      if (confirm('确定要退出登录吗？')) {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userRole');
        localStorage.removeItem('username');
        this.$router.push('/admin_login');
      }
    }
  }
};
</script>

<style scoped>
/* 完全重置，确保没有边距 */
.admin-layout {
  width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 0;
  background: #f8fafc;
  overflow: hidden;
  position: relative;
}

/* 主要布局区域 - 正确设置左边距避免被侧边栏遮盖 */
.main-layout {
  margin-left: 280px; /* 增加边距，确保不被侧边栏遮盖 */
  width: calc(100vw - 280px); /* 相应调整宽度 */
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f8fafc;
  position: relative;
}

/* 头部统计徽章 */
.header-stats {
  display: flex;
  gap: 15px;
  margin-right: 20px;
}

.stat-badge {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  box-shadow: 0 2px 10px rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;
}

.stat-badge:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.stat-number {
  font-weight: 700;
  font-size: 16px;
}

.stat-label {
  font-size: 12px;
  opacity: 0.9;
}

/* 退出按钮 */
.logout-btn {
  background: #e53e3e;
  color: white;
  border: none;
  padding: 10px 20px;
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

/* 内容区域 - 完全填满剩余空间 */
.content-area {
  flex: 1;
  width: 100%;
  height: calc(100vh - 80px); /* 减去头部高度 */
  margin: 0;
  padding: 0;
  background: #f8fafc;
  overflow: hidden;
  position: relative;
}

/* 确保子组件也填满 */
.content-area > * {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
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

/* 响应式设计 */
@media (max-width: 1024px) {
  .main-layout {
    margin-left: 0;
    width: 100vw;
  }

  .header-stats {
    gap: 10px;
  }

  .stat-badge {
    padding: 6px 12px;
    font-size: 12px;
  }

  .stat-number {
    font-size: 14px;
  }
}

@media (max-width: 768px) {
  .header-stats {
    display: none;
  }

  .mobile-overlay {
    display: block;
  }

  .logout-btn {
    padding: 8px 16px;
    font-size: 14px;
  }
}

/* 全局动画样式 */
:global(@keyframes slideInRight) {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

:global(@keyframes slideOutRight) {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
}
</style>