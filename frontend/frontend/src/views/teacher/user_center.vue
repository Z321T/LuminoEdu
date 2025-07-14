<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  getCurrentUser,
  type UserInfo,
  updateTeacherInfo,
  changePassword,
} from '@/api/teacher/user'
import { ElMessage } from 'element-plus'
import Sidebar from '@/components/layout/Sidebar.vue'
import PageHeader from '@/components/layout/PageHeader.vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const userInfo = ref<UserInfo | null>(null)
const loading = ref(true)
const isEditing = ref(false)
const editForm = ref({
  intro: '',
  contact_email: '',
  expertise: '',
  office_location: '',
})

const showPasswordDialog = ref(false)
const passwordForm = ref({
  current_password: '',
  new_password: '',
  confirm_password: '',
})
const passwordLoading = ref(false)

const passwordFormRef = ref()

const passwordRules = {
  current_password: [{ required: true, message: '请输入当前密码', trigger: 'blur' }],
  new_password: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    {
      validator: (rule: any, value: string, callback: Function) => {
        if (!value) {
          callback(new Error('请输入密码'))
        } else if (value.length < 6) {
          callback(new Error('密码长度不能小于6位'))
        } else if (!/[A-Z]/.test(value)) {
          callback(new Error('密码必须包含至少一个大写字母'))
        } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
          callback(new Error('密码必须包含至少一个特殊字符'))
        } else {
          callback()
        }
      },
      trigger: 'blur',
    },
  ],
  confirm_password: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (rule: any, value: string, callback: Function) => {
        if (value !== passwordForm.value.new_password) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur',
    },
  ],
}

const loadUserInfo = async () => {
  try {
    loading.value = true
    userInfo.value = await getCurrentUser()
    console.log('获取到的用户信息:', userInfo.value)
  } catch (error: any) {
    console.error('加载用户信息失败:', error)
    ElMessage.error(error.message)
    if (error.message.includes('重新登录')) {
      // 清除本地存储
      localStorage.removeItem('token')
      localStorage.removeItem('role')
      router.push('/login')
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadUserInfo()
})

const teacherMenuItems = [
  { path: '/home_teacher', icon: '🏠', label: '首页' },
  { path: '/exercise_generate', icon: '📝', label: '习题生成' },
  { path: '/ppt_generate', icon: '📊', label: 'PPT生成' },
  { path: '/course_list', icon: '📊', label: '课程管理' },
  { path: '/document_list', icon: '📊', label: '文档管理' },
  { path: '/exercise_history', icon: '📚', label: '历史记录' },
  { path: '/user_center', icon: '👤', label: '个人中心' },
]

const startEdit = () => {
  editForm.value = {
    intro: userInfo.value?.intro || '',
    contact_email: userInfo.value?.contact_email || '',
    expertise: userInfo.value?.expertise || '',
    office_location: userInfo.value?.office_location || '',
  }
  isEditing.value = true
}

const handleSave = async () => {
  try {
    loading.value = true
    await updateTeacherInfo(editForm.value)
    await loadUserInfo() // 重新加载用户信息
    isEditing.value = false
    ElMessage.success('更新成功')
  } catch (error: any) {
    ElMessage.error(error.message)
  } finally {
    loading.value = false
  }
}

const handleCancel = () => {
  isEditing.value = false
}

const handleLogout = () => {
  if (confirm('确定要退出登录吗？')) {
    localStorage.removeItem('token')
    router.push('/login')
  }
}

const handleChangePassword = async (formEl: any) => {
  if (!formEl) {
    console.log('表单元素不存在')
    return
  }

  try {
    // 添加日志以便调试
    console.log('开始验证表单')
    await formEl.validate()
    console.log('表单验证通过')

    passwordLoading.value = true
    console.log('开始修改密码', {
      current_password: passwordForm.value.current_password,
      new_password: passwordForm.value.new_password,
    })

    await changePassword({
      current_password: passwordForm.value.current_password,
      new_password: passwordForm.value.new_password,
    })

    ElMessage.success('密码修改成功，请重新登录')
    showPasswordDialog.value = false

    // 清除登录状态，跳转到登录页
    localStorage.removeItem('token')
    router.push('/login')
  } catch (error: any) {
    console.error('修改密码失败:', error)
    ElMessage.error(error.message || '修改密码失败')
  } finally {
    passwordLoading.value = false
  }
}

const resetPasswordForm = (formEl: any) => {
  if (formEl) {
    formEl.resetFields()
  }
  showPasswordDialog.value = false
}
</script>

<template>
  <div class="admin-layout">
    <!-- 侧边栏 -->
    <Sidebar :menu-items="teacherMenuItems" />

    <!-- 主体内容 -->
    <div class="main">
      <!-- 顶部导航栏 -->
      <PageHeader title="个人中心">
        <template #actions>
          <div class="header-user">
            <span>欢迎，{{ userInfo?.username }}</span>
            <button
              class="logout-btn"
              @click="handleLogout"
            >退出登录</button>
          </div>
        </template>
      </PageHeader>

      <!-- 内容区 -->
      <section class="content">
        <el-card
          v-loading="loading"
          class="user-card"
        >
          <template #header>
            <div class="card-header">
              <h2>个人信息</h2>
              <div
                v-if="!loading"
                class="header-actions"
              >
                <el-button
                  @click="showPasswordDialog = true"
                  type="warning"
                >
                  修改密码
                </el-button>
                <el-button
                  v-if="!isEditing"
                  type="primary"
                  @click="startEdit"
                >
                  编辑信息
                </el-button>
                <template v-else>
                  <el-button
                    type="primary"
                    @click="handleSave"
                  >保存</el-button>
                  <el-button @click="handleCancel">取消</el-button>
                </template>
              </div>
            </div>
          </template>

          <div
            v-if="userInfo"
            class="user-info"
          >
            <el-descriptions
              v-if="!isEditing"
              :column="2"
              border
            >
              <el-descriptions-item label="用户名">
                {{ userInfo.username }}
              </el-descriptions-item>

              <el-descriptions-item label="角色">
                {{ userInfo.role === 'teacher' ? '教师' : 
                   userInfo.role === 'student' ? '学生' : '管理员' }}
              </el-descriptions-item>

              <el-descriptions-item label="职工号">
                {{ userInfo.staff_id }}
              </el-descriptions-item>

              <el-descriptions-item label="所属院系">
                {{ userInfo.department }}
              </el-descriptions-item>

              <el-descriptions-item label="研究方向">
                {{ userInfo.expertise }}
              </el-descriptions-item>

              <el-descriptions-item
                label="办公室"
                v-if="userInfo.office_location"
              >
                {{ userInfo.office_location }}
              </el-descriptions-item>

              <el-descriptions-item
                label="联系邮箱"
                v-if="userInfo.contact_email"
              >
                {{ userInfo.contact_email }}
              </el-descriptions-item>

              <el-descriptions-item
                label="个人简介"
                v-if="userInfo.intro"
              >
                {{ userInfo.intro }}
              </el-descriptions-item>
            </el-descriptions>

            <el-form
              v-else
              :model="editForm"
              label-width="120px"
            >
              <el-form-item label="研究方向">
                <el-input
                  v-model="editForm.expertise"
                  placeholder="请输入研究方向"
                />
              </el-form-item>

              <el-form-item label="联系邮箱">
                <el-input
                  v-model="editForm.contact_email"
                  placeholder="请输入联系邮箱"
                />
              </el-form-item>

              <el-form-item label="办公室">
                <el-input
                  v-model="editForm.office_location"
                  placeholder="请输入办公室位置"
                />
              </el-form-item>

              <el-form-item label="个人简介">
                <el-input
                  v-model="editForm.intro"
                  type="textarea"
                  :rows="4"
                  placeholder="请输入个人简介"
                />
              </el-form-item>
            </el-form>
          </div>
        </el-card>
      </section>
    </div>

    <!-- 修改密码对话框 -->
    <el-dialog
      v-model="showPasswordDialog"
      title="修改密码"
      width="500px"
      @closed="resetPasswordForm(passwordFormRef)"
    >
      <el-form
        ref="passwordFormRef"
        :model="passwordForm"
        :rules="passwordRules"
        label-width="100px"
      >
        <el-form-item
          label="当前密码"
          prop="current_password"
        >
          <el-input
            v-model="passwordForm.current_password"
            type="password"
            show-password
            placeholder="请输入当前密码"
          />
        </el-form-item>

        <el-form-item
          label="新密码"
          prop="new_password"
        >
          <el-input
            v-model="passwordForm.new_password"
            type="password"
            show-password
            placeholder="请输入新密码"
          />
          <template #tip>
            <div class="password-tips">
              <p>密码必须满足以下要求：</p>
              <ul>
                <li>至少6个字符</li>
                <li>至少包含1个大写字母</li>
                <li>至少包含1个特殊字符（如：!@#$%^&*(),.?":{}|<>）</li>
              </ul>
            </div>
          </template>
        </el-form-item>

        <el-form-item
          label="确认密码"
          prop="confirm_password"
        >
          <el-input
            v-model="passwordForm.confirm_password"
            type="password"
            show-password
            placeholder="请再次输入新密码"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="resetPasswordForm(passwordFormRef)">取消</el-button>
          <el-button
            type="primary"
            :loading="passwordLoading"
            @click="handleChangePassword(passwordFormRef)"
          >
            确认修改
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

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

.user-card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #ebeef5;
}

.card-header h2 {
  margin: 0;
  font-size: 18px;
  color: #303133;
  font-weight: 600;
}

.user-info {
  padding: 20px;
}

.el-form {
  max-width: 600px;
  margin: 0 auto;
}

.card-header .el-button {
  margin-left: 12px;
}

.card-header .el-button:first-child {
  margin-left: 0;
}

:deep(.el-descriptions) {
  padding: 0;
}

:deep(.el-descriptions__cell) {
  padding: 16px 24px;
}

:deep(.el-descriptions__label) {
  color: #606266;
  font-weight: 600;
  background: #f8f9fa;
  min-width: 120px;
}

:deep(.el-descriptions__content) {
  color: #303133;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.password-tip {
  font-size: 12px;
  color: #909399;
  line-height: 1.2;
  margin-top: 4px;
}

.password-tips {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.password-tips ul {
  margin: 4px 0 0 20px;
  padding: 0;
}

.password-tips li {
  line-height: 1.4;
}

@media (max-width: 768px) {
  .main {
    margin-left: 0;
  }

  .content {
    padding: 16px;
  }

  :deep(.el-descriptions) {
    width: 100%;
  }
}
</style>