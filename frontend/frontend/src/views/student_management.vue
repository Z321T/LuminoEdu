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
          <!-- 导入学生按钮 -->
          <button
            @click="goToCreateStudent"
            class="import-btn"
          >
            <span class="btn-icon">📥</span>
            <span>批量导入学生</span>
          </button>

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
        <div class="students-table-card">
          <div class="table-header">
            <h3 class="table-title">
              <span class="table-icon">👨‍🎓</span>
              学生列表
            </h3>

            <!-- 搜索框 -->
            <div class="search-box">
              <input
                v-model="searchKeyword"
                type="text"
                placeholder="搜索学生姓名/学号/院系/专业..."
                @input="handleSearch"
              />
            </div>
          </div>

          <!-- 学生列表表格 -->
          <div class="table-container">
            <table class="students-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>姓名</th>
                  <th>学号</th>
                  <th>学院</th>
                  <th>专业</th>
                  <th>年级</th>
                  <th>入学年份</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="loading">
                  <td
                    colspan="8"
                    class="loading-row"
                  >加载中...</td>
                </tr>
                <tr v-else-if="students.length === 0">
                  <td
                    colspan="8"
                    class="no-data"
                  >暂无学生数据</td>
                </tr>
                <tr
                  v-for="student in students"
                  :key="student.id"
                >
                  <td>{{student.id}}</td>
                  <td>{{student.username}}</td>
                  <td>{{student.student_id}}</td>
                  <td>{{student.department}}</td>
                  <td>{{student.major}}</td>
                  <td>{{student.grade}}</td>
                  <td>{{student.enrollment_year}}</td>
                  <td>
                    <button
                      @click="showStudentDetail(student.student_id)"
                      class="detail-btn"
                    >
                      查看详情
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- 分页控件 -->
          <div class="pagination">
            <button
              :disabled="currentPage <= 1"
              @click="handlePageChange(currentPage - 1)"
            >上一页</button>
            <span class="page-info">
              第 {{currentPage}} 页 / 共 {{totalPages}} 页
            </span>
            <button
              :disabled="currentPage >= totalPages"
              @click="handlePageChange(currentPage + 1)"
            >下一页</button>
          </div>
        </div>
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
import PageHeader from '@/components/layout/PageHeader.vue'
import SideBar from '@/components/layout/SideBar.vue'
import { getStudentList } from '@/api/user_management'

export default {
  name: 'student_management',
  components: {
    PageHeader,
    SideBar
  },

  data () {
    return {
      // 列表相关数据
      students: [],
      currentPage: 1,
      pageSize: 20,
      total: 0,
      loading: false,
      searchKeyword: '',
      searchTimer: null,

      // 侧边栏相关
      mobileMenuOpen: false,
      showQuickTip: false,
      quickTipMessage: '',
      adminMenuItems: [
        { path: '/admin/student-management', icon: '👨‍🎓', label: '学生管理' }
      ]
    }
  },

  computed: {
    totalPages () {
      return Math.ceil(this.total / this.pageSize)
    },
    username () {
      return localStorage.getItem('username') || '管理员'
    },
    pageTitle () {
      return '学生管理'
    }
  },

  mounted () {
    this.loadStudents()
  },

  methods: {
    // 加载学生列表
    async loadStudents () {
      try {
        this.loading = true
        const response = await getStudentList(
          this.currentPage,
          this.pageSize,
          this.searchKeyword
        )

        this.students = response.students
        this.total = response.total
        this.currentPage = response.page
        this.pageSize = response.page_size

      } catch (error) {
        console.error('加载学生列表失败:', error)
      } finally {
        this.loading = false
      }
    },

    // 处理搜索
    handleSearch () {
      if (this.searchTimer) {
        clearTimeout(this.searchTimer)
      }

      this.searchTimer = setTimeout(() => {
        this.currentPage = 1
        this.loadStudents()
      }, 300)
    },

    // 处理分页
    handlePageChange (page) {
      this.currentPage = page
      this.loadStudents()
    },

    // 跳转到创建学生页面
    goToCreateStudent () {
      this.$router.push('/admin/create-student')
    },

    // 退出登录
    logout () {
      localStorage.removeItem('isLoggedIn')
      localStorage.removeItem('token')
      localStorage.removeItem('username')
      this.$router.push('/login')
      this.showQuickTipMessage('👋 已安全退出')
    },

    // 侧边栏相关方法
    toggleMobileMenu () {
      this.mobileMenuOpen = !this.mobileMenuOpen
    },

    handleMenuClick (item) {
      if (item.path !== this.$route.path) {
        this.$router.push(item.path)
      }
      this.mobileMenuOpen = false
    },

    closeMobileMenu () {
      this.mobileMenuOpen = false
    },

    showQuickTipMessage (message) {
      this.quickTipMessage = message
      this.showQuickTip = true
      setTimeout(() => {
        this.showQuickTip = false
      }, 2000)
    }
  }
}
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

.content-area {
  flex: 1;
  width: 100%;
  height: calc(100vh - 80px);
  margin: 0;
  padding: 20px;
  background: #f8fafc;
  overflow-y: auto;
  position: relative;
}

/* 学生列表卡片样式 */
.students-table-card {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  margin-bottom: 20px;
}

/* 表格头部样式 */
.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.table-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 20px;
  font-weight: 600;
  color: #2d3748;
  margin: 0;
}

.table-icon {
  font-size: 24px;
  color: #667eea;
}

/* 搜索框样式 */
.search-box input {
  padding: 8px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  width: 280px;
  font-size: 14px;
  transition: all 0.3s ease;
}

.search-box input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

/* 表格样式 */
.table-container {
  overflow-x: auto;
}

.students-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.students-table th,
.students-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
}

.students-table th {
  background: #f7fafc;
  font-weight: 600;
  color: #2d3748;
  white-space: nowrap;
}

.students-table tr:hover {
  background: #f0f7ff;
}

/* 操作按钮样式 */
.detail-btn {
  padding: 6px 12px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.3s ease;
}

.detail-btn:hover {
  background: #5a67d8;
  transform: translateY(-1px);
}

/* 分页控件样式 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 24px;
}

.pagination button {
  padding: 8px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: white;
  color: #4a5568;
  cursor: pointer;
  transition: all 0.3s ease;
}

.pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination button:hover:not(:disabled) {
  background: #f7fafc;
  border-color: #667eea;
  color: #667eea;
}

.page-info {
  color: #4a5568;
  font-size: 14px;
}

/* 导入按钮样式 */
.import-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
}

.import-btn:hover {
  background: #5a67d8;
  transform: translateY(-1px);
}

/* 用户信息和退出按钮样式 */
.user-actions {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-left: 24px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-avatar {
  font-size: 20px;
}

.username {
  color: #2d3748;
  font-weight: 500;
}

.logout-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: #f7fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  color: #4a5568;
  cursor: pointer;
  transition: all 0.3s ease;
}

.logout-btn:hover {
  background: #edf2f7;
  color: #e53e3e;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .main-layout {
    margin-left: 0;
    width: 100vw;
  }

  .table-header {
    flex-direction: column;
    gap: 16px;
  }

  .search-box input {
    width: 100%;
  }

  .user-actions {
    margin-left: 0;
    margin-top: 16px;
  }
}

/* 加载和空数据状态样式 */
.loading-row,
.no-data {
  text-align: center;
  padding: 32px;
  color: #718096;
  font-style: italic;
}

/* 快速提示样式 */
.tip-fade-enter-active,
.tip-fade-leave-active {
  transition: opacity 0.3s ease;
}

.tip-fade-enter-from,
.tip-fade-leave-to {
  opacity: 0;
}

.quick-tip {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
}

.tip-content {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: #2d3748;
  color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.tip-icon {
  font-size: 16px;
}
</style>