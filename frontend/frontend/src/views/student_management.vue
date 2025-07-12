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

            <div class="header-actions">
              <!-- 批量操作按钮 -->
              <div
                v-if="selectedStudents.length > 0"
                class="batch-actions"
              >
                <span class="selected-count">已选择 {{selectedStudents.length}}
                  个学生</span>
                <button
                  @click="showDeleteConfirm"
                  class="delete-btn"
                >
                  <span class="btn-icon">🗑️</span>
                  <span>批量删除</span>
                </button>
              </div>

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
          </div>

          <!-- 学生列表表格 -->
          <div class="table-container">
            <table class="students-table">
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      @change="toggleAllSelection"
                      :checked="isAllSelected"
                      :indeterminate="isIndeterminate"
                    />
                  </th>
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
                    colspan="9"
                    class="loading-row"
                  >加载中...</td>
                </tr>
                <tr v-else-if="students.length === 0">
                  <td
                    colspan="9"
                    class="no-data"
                  >暂无学生数据</td>
                </tr>
                <tr
                  v-for="student in students"
                  :key="student.id"
                >
                  <td>
                    <input
                      type="checkbox"
                      :value="student.student_id"
                      @change="toggleStudentSelection(student.student_id)"
                      :checked="selectedStudents.includes(student.student_id)"
                    />
                  </td>
                  <td>{{student.id}}</td>
                  <td>{{student.username}}</td>
                  <td>{{student.student_id}}</td>
                  <td>{{student.department}}</td>
                  <td>{{student.major}}</td>
                  <td>{{student.grade}}</td>
                  <td>{{student.enrollment_year}}</td>
                  <td>
                    <button
                      @click="showStudentDetail(student.id)"
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

    <!-- 学生详细信息弹窗 -->
    <el-dialog
      v-model="showDetailDialog"
      :title="isEditing ? '编辑学生信息' : '学生详细信息'"
      width="600px"
    >
      <div
        v-if="currentStudent"
        class="student-detail"
      >
        <div
          v-for="(field, index) in studentFields"
          :key="index"
          class="detail-item"
        >
          <label>{{field.label}}：</label>
          <template v-if="isEditing">
            <input
              v-if="field.type === 'text'"
              v-model="editForm[field.key]"
              :type="field.inputType || 'text'"
              class="edit-input"
            />
            <textarea
              v-else-if="field.type === 'textarea'"
              v-model="editForm[field.key]"
              class="edit-textarea"
            ></textarea>
          </template>
          <span v-else>{{formatFieldValue(field.key)}}</span>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <template v-if="isEditing">
            <el-button @click="cancelEdit">取消</el-button>
            <el-button
              type="primary"
              @click="saveStudentInfo"
            >保存</el-button>
          </template>
          <template v-else>
            <el-button @click="showDetailDialog = false">关闭</el-button>
            <el-button
              type="warning"
              @click="showResetPasswordDialog"
            >重置密码</el-button>
            <el-button
              type="primary"
              @click="startEdit"
            >编辑</el-button>
          </template>
        </span>
      </template>
    </el-dialog>

    <!-- 重置密码弹窗 -->
    <el-dialog
      v-model="showPasswordDialog"
      title="重置学生密码"
      width="400px"
    >
      <div class="password-form">
        <div class="form-item">
          <label>新密码：</label>
          <input
            v-model="newPassword"
            type="password"
            placeholder="请输入新密码"
            class="password-input"
          />
        </div>
        <div class="form-item">
          <label>确认密码：</label>
          <input
            v-model="confirmPassword"
            type="password"
            placeholder="请确认新密码"
            class="password-input"
          />
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="closePasswordDialog">取消</el-button>
          <el-button
            type="primary"
            @click="resetPassword"
          >确认重置</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 删除确认弹窗 -->
    <el-dialog
      v-model="showDeleteDialog"
      title="确认删除"
      width="500px"
    >
      <div class="delete-confirm">
        <div class="warning-icon">⚠️</div>
        <div class="confirm-text">
          <p>您确定要删除以下 <strong>{{selectedStudents.length}}</strong> 个学生吗？</p>
          <p class="warning-text">此操作不可撤销，请谨慎操作！</p>
          <div class="student-list">
            <div
              v-for="studentId in selectedStudents.slice(0, 5)"
              :key="studentId"
              class="student-item"
            >
              {{getStudentName(studentId)}} ({{studentId}})
            </div>
            <div
              v-if="selectedStudents.length > 5"
              class="more-text"
            >
              还有 {{selectedStudents.length - 5}} 个学生...
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showDeleteDialog = false">取消</el-button>
          <el-button
            type="danger"
            @click="confirmDelete"
          >确认删除</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import PageHeader from '@/components/layout/PageHeader.vue'
import SideBar from '@/components/layout/SideBar.vue'
import { getStudentList, updateStudent, resetStudentPassword } from '@/api/user_management'

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
      ],

      // 学生详情弹窗相关
      showDetailDialog: false,
      currentStudent: null,
      isEditing: false,
      editForm: {},
      studentFields: [
        { key: 'username', label: '姓名', type: 'text' },
        { key: 'student_id', label: '学号', type: 'text' },
        { key: 'college', label: '学院', type: 'text' },
        { key: 'major', label: '专业', type: 'text' },
        { key: 'grade', label: '年级', type: 'text' },
        { key: 'enrollment_year', label: '入学年份', type: 'text', inputType: 'number' },
        { key: 'intro', label: '个人简介', type: 'textarea' },
        { key: 'contact_email', label: '邮箱', type: 'text', inputType: 'email' }
      ],

      // 重置密码相关
      showPasswordDialog: false,
      newPassword: '',
      confirmPassword: '',

      // 批量操作相关
      selectedStudents: [],
      showDeleteDialog: false
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
    },
    isAllSelected () {
      return this.selectedStudents.length === this.students.length && this.students.length > 0
    },
    isIndeterminate () {
      return this.selectedStudents.length > 0 && this.selectedStudents.length < this.students.length
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

    // 显示学生详情
    showStudentDetail (studentId) {
      const student = this.students.find(s => s.student_id === studentId)
      this.currentStudent = student || null
      this.showDetailDialog = true
    },

    // 开始编辑
    startEdit () {
      this.editForm = { ...this.currentStudent }
      this.isEditing = true
    },

    // 取消编辑
    cancelEdit () {
      this.isEditing = false
      this.editForm = {}
    },

    // 保存学生信息
    async saveStudentInfo () {
      try {
        const data = {
          ...this.editForm,
          enrollment_year: Number(this.editForm.enrollment_year)
        }

        const result = await updateStudent(this.currentStudent.student_id, data)

        if (result.status === 'success') {
          this.showQuickTipMessage('✅ 更新成功')
          this.isEditing = false
          // 刷新列表和当前学生信息
          await this.loadStudents()
          this.currentStudent = { ...this.editForm }
        }
      } catch (error) {
        this.showQuickTipMessage(`❌ ${error.message}`)
      }
    },

    // 显示重置密码弹窗
    showResetPasswordDialog () {
      this.newPassword = ''
      this.confirmPassword = ''
      this.showPasswordDialog = true
    },

    // 关闭重置密码弹窗
    closePasswordDialog () {
      this.showPasswordDialog = false
      this.newPassword = ''
      this.confirmPassword = ''
    },

    // 重置密码
    async resetPassword () {
      try {
        // 密码验证
        if (!this.newPassword) {
          this.showQuickTipMessage('❌ 请输入新密码')
          return
        }

        if (this.newPassword.length < 6) {
          this.showQuickTipMessage('❌ 密码长度不能少于6位')
          return
        }

        if (this.newPassword !== this.confirmPassword) {
          this.showQuickTipMessage('❌ 两次输入的密码不一致')
          return
        }

        const result = await resetStudentPassword(this.currentStudent.student_id, this.newPassword)

        if (result.status === 'success') {
          this.showQuickTipMessage('✅ 密码重置成功')
          this.closePasswordDialog()
        }
      } catch (error) {
        this.showQuickTipMessage(`❌ ${error.message}`)
      }
    },

    // 格式化字段值
    formatFieldValue (key) {
      const value = this.currentStudent[key]
      if (value === null || value === undefined) return '暂无'
      if (key === 'created_at') return this.formatDate(value)
      return value
    },

    // 格式化日期
    formatDate (timestamp) {
      const date = new Date(timestamp)
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
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
    },

    // 批量操作相关方法
    toggleStudentSelection (studentId) {
      const index = this.selectedStudents.indexOf(studentId)
      if (index === -1) {
        this.selectedStudents.push(studentId)
      } else {
        this.selectedStudents.splice(index, 1)
      }
    },

    toggleAllSelection () {
      if (this.isAllSelected) {
        this.selectedStudents = []
      } else {
        this.selectedStudents = this.students.map(s => s.student_id)
      }
    },

    showDeleteConfirm () {
      this.showDeleteDialog = true
    },

    closeDeleteConfirm () {
      this.showDeleteDialog = false
    },

    async confirmDelete () {
      try {
        // TODO: 调用批量删除接口
        this.showQuickTipMessage('✅ 批量删除成功')
        this.selectedStudents = []
        this.closeDeleteConfirm()
        await this.loadStudents()
      } catch (error) {
        this.showQuickTipMessage(`❌ ${error.message}`)
      }
    },

    getStudentName (studentId) {
      const student = this.students.find(s => s.student_id === studentId)
      return student ? student.username : '未知'
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

/* 学生详情弹窗样式 */
.student-detail {
  margin-top: 20px;
}

.detail-item {
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-item label {
  flex: 0 0 100px;
  font-weight: 500;
  color: #2d3748;
}

.detail-item span,
.detail-item p {
  flex: 1;
  margin-left: 16px;
  color: #4a5568;
  line-height: 1.6;
}

/* 编辑学生信息样式 */
.edit-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.3s ease;
}

.edit-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.edit-textarea {
  width: 100%;
  min-height: 80px;
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
  resize: vertical;
  transition: all 0.3s ease;
}

.edit-textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

/* 重置密码弹窗样式 */
.password-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.password-input {
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.3s ease;
}

.password-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.password-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.form-item label {
  min-width: 80px;
  color: #4a5568;
  font-weight: 500;
}

.password-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.3s ease;
}

.password-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

/* 删除确认弹窗样式 */
.delete-confirm {
  display: flex;
  align-items: center;
  gap: 16px;
}

.warning-icon {
  font-size: 28px;
  color: #e53e3e;
}

.confirm-text {
  flex: 1;
  color: #4a5568;
  line-height: 1.6;
}

.student-list {
  margin-top: 8px;
  padding-left: 24px;
  border-left: 2px solid #e2e8f0;
}

.student-item {
  color: #2d3748;
  font-weight: 500;
}

.more-text {
  color: #718096;
  margin-top: 4px;
}

/* 批量操作样式 */
.batch-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.selected-count {
  color: #4a5568;
  font-size: 14px;
}

.delete-btn {
  padding: 6px 12px;
  background: #e53e3e;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.3s ease;
}

.delete-btn:hover {
  background: #c53030;
  transform: translateY(-1px);
}

/* 批量操作样式 */
.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.batch-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.selected-count {
  color: #667eea;
  font-size: 14px;
  font-weight: 500;
}

.delete-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: #e53e3e;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.3s ease;
}

.delete-btn:hover {
  background: #c53030;
  transform: translateY(-1px);
}

/* 删除确认弹窗样式 */
.delete-confirm {
  display: flex;
  gap: 16px;
  padding: 16px;
}

.warning-icon {
  font-size: 32px;
  color: #f56565;
}

.confirm-text {
  flex: 1;
}

.warning-text {
  color: #e53e3e;
  font-size: 14px;
  margin: 8px 0;
}

.student-list {
  max-height: 120px;
  overflow-y: auto;
  background: #f7fafc;
  border-radius: 6px;
  padding: 8px;
  margin-top: 12px;
}

.student-item {
  padding: 4px 0;
  font-size: 14px;
  color: #4a5568;
}

.more-text {
  padding: 4px 0;
  font-size: 14px;
  color: #718096;
  font-style: italic;
}
</style>