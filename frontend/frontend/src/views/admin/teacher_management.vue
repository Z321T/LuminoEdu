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
          <!-- 导入教师按钮 -->
          <button
            @click="goToCreateTeacher"
            class="import-btn"
          >
            <span class="btn-icon">📥</span>
            <span>批量导入教师</span>
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
        <div class="teachers-table-card">
          <!-- 表格标题和搜索 -->
          <div class="table-header">
            <h3 class="table-title">
              <span class="table-icon">👨‍🏫</span>
              教师列表
            </h3>

            <div class="header-actions">
              <!-- 批量操作按钮 -->
              <div
                v-if="selectedTeachers.length > 0"
                class="batch-actions"
              >
                <span class="selected-count">已选择 {{selectedTeachers.length}}
                  个教师</span>
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
                  placeholder="搜索教师姓名/工号/院系..."
                  @input="handleSearch"
                />
              </div>
            </div>
          </div>

          <!-- 教师列表表格 -->
          <div class="table-container">
            <table class="teachers-table">
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
                  <th>工号</th>
                  <th>所属院系</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="loading">
                  <td
                    colspan="6"
                    class="loading-row"
                  >加载中...</td>
                </tr>
                <tr v-else-if="teachers.length === 0">
                  <td
                    colspan="6"
                    class="no-data"
                  >暂无教师数据</td>
                </tr>
                <tr
                  v-for="teacher in teachers"
                  :key="teacher.id"
                >
                  <td>
                    <input
                      type="checkbox"
                      :value="teacher.staff_id"
                      @change="toggleTeacherSelection(teacher.staff_id)"
                      :checked="selectedTeachers.includes(teacher.staff_id)"
                    />
                  </td>
                  <td>{{teacher.id}}</td>
                  <td>{{teacher.username}}</td>
                  <td>{{teacher.staff_id}}</td>
                  <td>{{teacher.department}}</td>
                  <td>
                    <button
                      @click="showTeacherDetail(teacher.id)"
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

    <!-- 教师详情弹窗 -->
    <el-dialog
      v-model="showDetailDialog"
      :title="isEditing ? '编辑教师信息' : '教师详细信息'"
      width="600px"
    >
      <div
        v-if="currentTeacher"
        class="teacher-detail"
      >
        <div
          v-for="(field, index) in teacherFields"
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
              @click="saveTeacherInfo"
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
      title="重置教师密码"
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
          <p>您确定要删除以下 <strong>{{selectedTeachers.length}}</strong> 个教师吗？</p>
          <p class="warning-text">此操作不可撤销，请谨慎操作！</p>
          <div class="teacher-list">
            <div
              v-for="teacherId in selectedTeachers.slice(0, 5)"
              :key="teacherId"
              class="teacher-item"
            >
              {{getTeacherName(teacherId)}} ({{teacherId}})
            </div>
            <div
              v-if="selectedTeachers.length > 5"
              class="more-text"
            >
              还有 {{selectedTeachers.length - 5}} 个教师...
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
import { getTeacherList, deleteTeachers } from '@/api/user_management'

export default {
  name: 'teacher_management',
  components: {
    PageHeader,
    SideBar
  },

  data () {
    return {
      // 列表相关数据
      teachers: [],
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
        { path: '/admin/log_management', icon: '📝', label: '日志管理' },
        { path: '/admin/teacher-management', icon: '👨‍🏫', label: '教师管理' },
        { path: '/admin/student-management', icon: '👨‍🎓', label: '学生管理' }
      ],

      // 教师详情相关
      showDetailDialog: false,
      currentTeacher: null,

      // 编辑相关
      isEditing: false,
      editForm: {},
      teacherFields: [
        { key: 'username', label: '姓名', type: 'text' },
        { key: 'staff_id', label: '工号', type: 'text' },
        { key: 'department', label: '院系', type: 'text' },
        { key: 'expertise', label: '专业领域', type: 'text' },
        { key: 'intro', label: '个人简介', type: 'textarea' },
        { key: 'contact_email', label: '联系邮箱', type: 'text', inputType: 'email' },
        { key: 'office_location', label: '办公地点', type: 'text' }
      ],

      // 重置密码相关
      showPasswordDialog: false,
      newPassword: '',
      confirmPassword: '',

      // 批量操作相关
      selectedTeachers: [],
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
      return '教师管理'
    },
    isAllSelected () {
      return this.teachers.length > 0 && this.selectedTeachers.length === this.teachers.length
    },
    isIndeterminate () {
      return this.selectedTeachers.length > 0 && this.selectedTeachers.length < this.teachers.length
    }
  },

  mounted () {
    this.loadTeachers()
  },

  methods: {
    // 加载教师列表
    async loadTeachers () {
      try {
        this.loading = true
        const response = await getTeacherList(
          this.currentPage,
          this.pageSize,
          this.searchKeyword
        )

        this.teachers = response.teachers
        this.total = response.total
        this.currentPage = response.page
        this.pageSize = response.page_size

      } catch (error) {
        console.error('加载教师列表失败:', error)
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
        this.loadTeachers()
      }, 300)
    },

    // 处理分页
    handlePageChange (page) {
      this.currentPage = page
      this.loadTeachers()
    },

    // 显示教师详情
    async showTeacherDetail (teacherId) {
      try {
        this.currentTeacher = await getTeacherDetail(teacherId.toString())
        this.showDetailDialog = true
      } catch (error) {
        console.error('获取教师详情失败:', error)
        this.showQuickTipMessage('获取教师详情失败')
      }
    },

    // 跳转到创建教师页面
    goToCreateTeacher () {
      this.$router.push('/admin/create-teacher')
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
    },

    formatDate (dateString) {
      if (!dateString) return '-'
      const date = new Date(dateString)
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    },

    // 编辑相关方法
    startEdit () {
      this.editForm = { ...this.currentTeacher }
      this.isEditing = true
    },

    cancelEdit () {
      this.isEditing = false
      this.editForm = {}
    },

    async saveTeacherInfo () {
      try {
        const data = {
          username: this.editForm.username,
          staff_id: this.editForm.staff_id,
          department: this.editForm.department,
          expertise: this.editForm.expertise,
          intro: this.editForm.intro,
          contact_email: this.editForm.contact_email,
          office_location: this.editForm.office_location
        }

        const result = await updateTeacherInfo(this.currentTeacher.staff_id, data)

        if (result.status === 'success') {
          this.showQuickTipMessage('✅ 更新成功')
          this.isEditing = false
          // 刷新列表和当前教师信息
          await this.loadTeachers()
          this.currentTeacher = { ...this.editForm }
        }
      } catch (error) {
        this.showQuickTipMessage(`❌ ${error.message}`)
      }
    },

    formatFieldValue (key) {
      const value = this.currentTeacher[key]
      if (value === null || value === undefined) return '暂无'
      if (key === 'created_at') return this.formatDate(value)
      return value
    },

    // 重置密码相关方法
    showResetPasswordDialog () {
      this.newPassword = ''
      this.confirmPassword = ''
      this.showPasswordDialog = true
    },

    closePasswordDialog () {
      this.showPasswordDialog = false
      this.newPassword = ''
      this.confirmPassword = ''
    },

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

        const result = await resetTeacherPassword(this.currentTeacher.staff_id, this.newPassword)

        if (result.status === 'success') {
          this.showQuickTipMessage('✅ 密码重置成功')
          this.closePasswordDialog()
        }
      } catch (error) {
        this.showQuickTipMessage(`❌ ${error.message}`)
      }
    },

    // 批量操作相关方法
    toggleTeacherSelection (teacherId) {
      const index = this.selectedTeachers.indexOf(teacherId)
      if (index === -1) {
        this.selectedTeachers.push(teacherId)
      } else {
        this.selectedTeachers.splice(index, 1)
      }
    },

    toggleAllSelection () {
      if (this.isAllSelected) {
        this.selectedTeachers = []
      } else {
        this.selectedTeachers = this.teachers.map(teacher => teacher.staff_id)
      }
    },

    showDeleteConfirm () {
      if (this.selectedTeachers.length === 0) {
        this.showQuickTipMessage('❌ 请先选择要删除的教师')
        return
      }
      this.showDeleteDialog = true
    },

    closeDeleteConfirm () {
      this.showDeleteDialog = false
    },

    async confirmDelete () {
      try {
        const result = await deleteTeachers(this.selectedTeachers)

        if (result.success) {
          this.showQuickTipMessage(`✅ 成功删除 ${result.deleted} 个教师`)
          this.selectedTeachers = []
          this.showDeleteDialog = false
          // 刷新列表
          await this.loadTeachers()
        }
      } catch (error) {
        this.showQuickTipMessage(`❌ ${error.message}`)
      }
    },

    getTeacherName (teacherId) {
      const teacher = this.teachers.find(t => t.staff_id === teacherId)
      return teacher ? teacher.username : teacherId
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

/* 教师列表卡片样式 */
.teachers-table-card {
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

.teachers-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.teachers-table th,
.teachers-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
}

.teachers-table th {
  background: #f7fafc;
  font-weight: 600;
  color: #2d3748;
  white-space: nowrap;
}

.teachers-table tr:hover {
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

/* 教师详情弹窗样式 */
.teacher-detail {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 8px;
}

.detail-item {
  display: flex;
  gap: 12px;
}

.detail-item label {
  min-width: 80px;
  color: #4a5568;
  font-weight: 500;
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

/* 编辑输入框样式 */
.edit-input,
.edit-textarea {
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  width: 100%;
  font-size: 14px;
  margin-top: 4px;
}

.edit-textarea {
  min-height: 80px;
  resize: vertical;
}

/* 密码输入框样式 */
.password-input {
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  width: 100%;
  font-size: 14px;
  margin-top: 4px;
}

/* 批量操作样式 */
.batch-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.selected-count {
  color: #2d3748;
  font-weight: 500;
}

.delete-btn {
  padding: 8px 16px;
  background: #e53e3e;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
}

.delete-btn:hover {
  background: #c53030;
  transform: translateY(-1px);
}

/* 删除确认弹窗样式 */
.delete-confirm {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
}

.warning-icon {
  font-size: 28px;
  color: #e53e3e;
  align-self: center;
}

.confirm-text {
  color: #4a5568;
  font-size: 14px;
}

.teacher-list {
  max-height: 200px;
  overflow-y: auto;
  padding: 8px;
  background: #f7fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.teacher-item {
  padding: 4px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.more-text {
  color: #a0aec0;
  font-size: 12px;
  text-align: center;
}
</style>