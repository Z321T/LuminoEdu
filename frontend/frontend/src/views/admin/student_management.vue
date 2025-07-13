<template>
  <div class="admin-layout">
    <!-- 侧边栏 -->
    <SideBar :menuItems="adminMenuItems" />

    <!-- 主要内容区域 -->
    <div class="main-layout">
      <!-- 页面头部 -->
      <PageHeader title="管理系统">
        <template #actions>
          <div class="header-user">
            <span>欢迎，{{ username }}</span>
            <button class="logout-btn" @click="handleLogout">退出登录</button>
          </div>
        </template>
      </PageHeader>

      <!-- 内容区域 -->
      <main class="content-area">
        <div class="students-table-card">
          <div class="table-header">
            <h3 class="table-title">
              学生列表
            </h3>
            <div class="header-actions">
              <div v-if="selectedStudents.length > 0" class="batch-actions">
                <span class="selected-count">已选择 {{ selectedStudents.length }} 个学生</span>
                <button class="delete-btn" @click="showDeleteConfirm">
                  <span>批量删除</span>
                </button>
              </div>
              <!-- 在表格头部或合适位置添加 -->
              <button class="import-btn" @click="goToCreateStudent">
                导入学生
              </button>
            </div>
          </div>
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
                <th>姓名</th>
                <th>学号</th>
                <th>学院</th>
                <th>操作</th>
              </tr>
              </thead>
              <tbody>
              <tr v-if="loading">
                <td colspan="9" class="loading-row">加载中...</td>
              </tr>
              <tr v-else-if="students.length === 0">
                <td colspan="9" class="no-data">暂无学生数据</td>
              </tr>
              <tr v-for="student in students" :key="student.id">
                <td>
                  <input
                      type="checkbox"
                      :value="student.student_id"
                      @change="toggleStudentSelection(student.student_id)"
                      :checked="selectedStudents.includes(student.student_id)"
                  />
                </td>
                <td>{{ student.username }}</td>
                <td>{{ student.student_id }}</td>
                <td>{{ student.college }}</td>
                <td>
                  <button class="detail-btn" @click="showStudentDetail(student.student_id)">
                    查看详情
                  </button>
                </td>
              </tr>
              </tbody>
            </table>
          </div>
          <div class="pagination">
            <button :disabled="currentPage <= 1" @click="handlePageChange(currentPage - 1)">上一页</button>
            <span class="page-info">第 {{ currentPage }} 页 / 共 {{ totalPages }} 页</span>
            <button :disabled="currentPage >= totalPages" @click="handlePageChange(currentPage + 1)">下一页</button>
          </div>
        </div>
      </main>
    </div>

    <!-- 移动端遮罩 -->
    <div v-if="mobileMenuOpen" class="mobile-overlay" @click="closeMobileMenu" />

    <!-- 快速提示 -->
    <transition name="tip-fade">
      <div v-if="showQuickTip" class="quick-tip">
        <div class="tip-content">
          <span class="tip-icon">💡</span>
          <span>{{ quickTipMessage }}</span>
        </div>
      </div>
    </transition>

    <!-- 学生详细信息弹窗 -->
    <el-dialog v-model="showDetailDialog" :title="isEditing ? '编辑学生信息' : '学生详细信息'" width="600px">
      <div v-if="currentStudent" class="student-detail">
        <div v-for="(field, index) in studentFields" :key="index" class="detail-item">
          <label>{{ field.label }}：</label>
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
          <span v-else>{{ formatFieldValue(field.key) }}</span>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <template v-if="isEditing">
            <el-button @click="cancelEdit">取消</el-button>
            <el-button type="primary" @click="saveStudentInfo">保存</el-button>
          </template>
          <template v-else>
            <el-button @click="showDetailDialog = false">关闭</el-button>
            <el-button type="warning" @click="showResetPasswordDialog">重置密码</el-button>
            <el-button type="primary" @click="startEdit">编辑</el-button>
          </template>
        </span>
      </template>
    </el-dialog>

    <!-- 重置密码弹窗 -->
    <el-dialog v-model="showPasswordDialog" title="重置学生密码" width="400px">
      <div class="password-form">
        <div class="form-item">
          <label>新密码：</label>
          <input v-model="newPassword" type="password" placeholder="请输入新密码" class="password-input" />
        </div>
        <div class="form-item">
          <label>确认密码：</label>
          <input v-model="confirmPassword" type="password" placeholder="请确认新密码" class="password-input" />
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="closePasswordDialog">取消</el-button>
          <el-button type="primary" @click="resetPassword">确认重置</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 删除确认弹窗 -->
    <el-dialog v-model="showDeleteDialog" title="确认删除" width="500px">
      <div class="delete-confirm">
        <div class="warning-icon">⚠️</div>
        <div class="confirm-text">
          <p>您确定要删除以下 <strong>{{ selectedStudents.length }}</strong> 个学生吗？</p>
          <p class="warning-text">此操作不可撤销，请谨慎操作！</p>
          <div class="student-list">
            <div v-for="studentId in selectedStudents.slice(0, 5)" :key="studentId" class="student-item">
              {{ getStudentName(studentId) }} ({{ studentId }})
            </div>
            <div v-if="selectedStudents.length > 5" class="more-text">
              还有 {{ selectedStudents.length - 5 }} 个学生...
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showDeleteDialog = false">取消</el-button>
          <el-button type="danger" @click="confirmDelete">确认删除</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import PageHeader from '@/components/layout/PageHeader.vue'
import SideBar from '@/components/layout/Sidebar.vue'
import { getStudentList, updateStudent, resetStudentPassword, deleteStudents } from '@/api/admin/user_management'

const router = useRouter()
const username = ref(localStorage.getItem('username') || '管理员')
const mobileMenuOpen = ref(false)
const showQuickTip = ref(false)
const quickTipMessage = ref('')

const students = ref<any[]>([])
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)
const loading = ref(false)
const searchKeyword = ref('')

const selectedStudents = ref<string[]>([])
const showDetailDialog = ref(false)
const currentStudent = ref<any>(null)
const isEditing = ref(false)
const editForm = reactive<any>({})
const showPasswordDialog = ref(false)
const newPassword = ref('')
const confirmPassword = ref('')
const showDeleteDialog = ref(false)

const adminMenuItems = [
  { path: '/admin/log_management', label: '日志管理' },
  { path: '/admin/teacher_management', label: '教师管理' },
  { path: '/admin/student_management', label: '学生管理' },
  { path: '/admin/model_management', label: '模型管理' },
]

const studentFields = [
  { key: 'username', label: '姓名', type: 'text' },
  { key: 'student_id', label: '学号', type: 'text' },
  { key: 'college', label: '学院', type: 'text' },
  { key: 'major', label: '专业', type: 'text' },
  { key: 'grade', label: '年级', type: 'text' },
  { key: 'enrollment_year', label: '入学年份', type: 'text', inputType: 'number' },
  { key: 'intro', label: '个人简介', type: 'textarea' },
  { key: 'contact_email', label: '邮箱', type: 'text', inputType: 'email' }
]

const totalPages = computed(() => Math.ceil(total.value / pageSize.value))
const isAllSelected = computed(() => selectedStudents.value.length === students.value.length && students.value.length > 0)
const isIndeterminate = computed(() => selectedStudents.value.length > 0 && selectedStudents.value.length < students.value.length)

onMounted(() => {
  loadStudents()
})

const loadStudents = async () => {
  try {
    loading.value = true
    const response = await getStudentList(currentPage.value, pageSize.value, searchKeyword.value)
    students.value = response.students
    total.value = response.total
    currentPage.value = response.page
    pageSize.value = response.page_size
  } catch (error) {
    showQuickTipMessage('加载学生列表失败')
  } finally {
    loading.value = false
  }
}


const handlePageChange = (page: number) => {
  currentPage.value = page
  loadStudents()
}

const goToCreateStudent = () => {
  router.push('/admin/create_student')
}

const handleLogout = () => {
  if (confirm('确定要退出登录吗？')) {
    localStorage.removeItem('isLoggedIn')
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    router.push('/login')
  }
}

const showQuickTipMessage = (message: string) => {
  quickTipMessage.value = message
  showQuickTip.value = true
  setTimeout(() => {
    showQuickTip.value = false
  }, 2000)
}

const closeMobileMenu = () => {
  mobileMenuOpen.value = false
}

const showStudentDetail = (studentId: string) => {
  const student = students.value.find(s => s.student_id === studentId)
  currentStudent.value = student || null
  showDetailDialog.value = true
}

const startEdit = () => {
  Object.assign(editForm, currentStudent.value)
  isEditing.value = true
}

const cancelEdit = () => {
  isEditing.value = false
  Object.keys(editForm).forEach(key => delete editForm[key])
}

const saveStudentInfo = async () => {
  try {
    const data = {
      ...editForm,
      enrollment_year: Number(editForm.enrollment_year)
    }
    const result = await updateStudent(currentStudent.value.student_id, data)
    if (result.status === 'success') {
      showQuickTipMessage('更新成功')
      isEditing.value = false
      await loadStudents()
      currentStudent.value = { ...editForm }
    }
  } catch (error: any) {
    showQuickTipMessage(`${error.message}`)
  }
}

const showResetPasswordDialog = () => {
  newPassword.value = ''
  confirmPassword.value = ''
  showPasswordDialog.value = true
}

const closePasswordDialog = () => {
  showPasswordDialog.value = false
  newPassword.value = ''
  confirmPassword.value = ''
}

const resetPassword = async () => {
  try {
    if (!newPassword.value) {
      showQuickTipMessage('请输入新密码')
      return
    }
    if (newPassword.value.length < 6) {
      showQuickTipMessage('密码长度不能少于6位')
      return
    }
    if (newPassword.value !== confirmPassword.value) {
      showQuickTipMessage('两次输入的密码不一致')
      return
    }
    const result = await resetStudentPassword(currentStudent.value.student_id, newPassword.value)
    if (result.status === 'success') {
      showQuickTipMessage('密码重置成功')
      closePasswordDialog()
    }
  } catch (error: any) {
    showQuickTipMessage(`${error.message}`)
  }
}

const formatFieldValue = (key: string) => {
  const value = currentStudent.value?.[key]
  if (value === null || value === undefined) return '暂无'
  return value
}

const toggleStudentSelection = (studentId: string) => {
  const index = selectedStudents.value.indexOf(studentId)
  if (index === -1) {
    selectedStudents.value.push(studentId)
  } else {
    selectedStudents.value.splice(index, 1)
  }
}

const toggleAllSelection = () => {
  if (isAllSelected.value) {
    selectedStudents.value = []
  } else {
    selectedStudents.value = students.value.map(s => s.student_id)
  }
}

const showDeleteConfirm = () => {
  showDeleteDialog.value = true
}

const closeDeleteConfirm = () => {
  showDeleteDialog.value = false
}

const confirmDelete = async () => {
  try {
    if (selectedStudents.value.length === 0) return
    await deleteStudents(selectedStudents.value)
    showQuickTipMessage('批量删除成功')
    selectedStudents.value = []
    closeDeleteConfirm()
    await loadStudents()
  } catch (error: any) {
    showQuickTipMessage(`${error.message}`)
  }
}

const getStudentName = (studentId: string) => {
  const student = students.value.find(s => s.student_id === studentId)
  return student ? student.username : '未知'
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
  margin-left: 240px;
  width: calc(100vw - 240px);
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f8fafc;
  position: relative;
}

.header-user {
  position: absolute;
  top: 24px;
  right: 48px;
  display: flex;
  align-items: center;
  gap: 16px;
  z-index: 10;
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

.logout-btn {
  background: #e74c3c;
  color: #fff;
  border: none;
  padding: 8px 20px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.3s;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
}

.logout-btn:hover {
  background: #c0392b;
  color: #fff;
}

/* 空数据状态样式 */
.no-data {
  text-align: center;
  padding: 32px;
  color: #718096;
  font-style: italic;
}

/* 响应式设计 */
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

</style>