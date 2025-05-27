<template>
  <div class="login-container">
    <div class="login-background">
      <div class="login-overlay"></div>
    </div>

    <!-- 登录卡片包裹在 transition 内，添加过渡动画 -->
    <transition name="fade-zoom">
      <el-card
        class="login-card"
        v-if="showCard"
      >
        <div class="login-header">
          <div class="logo-container">
            <img
              src="@/assets/logo.svg"
              alt="Logo"
              class="logo"
            />
          </div>
          <h2 class="login-title">欢迎回来</h2>
          <p class="login-subtitle">请登录您的账户以继续</p>
        </div>

        <el-form
          ref="loginFormRef"
          :model="loginForm"
          :rules="rules"
          class="login-form"
        >
          <el-form-item prop="username">
            <el-input
              v-model="loginForm.username"
              placeholder="请输入用户名"
              class="custom-input"
              size="large"
            >
              <template #prefix>
                <el-icon>
                  <user />
                </el-icon>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item prop="password">
            <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="请输入密码"
              show-password
              class="custom-input"
              size="large"
            >
              <template #prefix>
                <el-icon>
                  <lock />
                </el-icon>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item prop="role">
            <el-select
              v-model="loginForm.role"
              placeholder="请选择角色"
              class="custom-select"
            >
              <el-option
                label="学生"
                value="student"
              ></el-option>
              <el-option
                label="教师"
                value="teacher"
              ></el-option>
              <el-option
                label="管理员"
                value="admin"
              ></el-option>
            </el-select>
          </el-form-item>

          <el-form-item class="login-options">
            <el-checkbox
              v-model="remember"
              class="remember-me"
            >记住密码</el-checkbox>
            <router-link
              to="/forgot-password"
              class="forgot-password"
            >忘记密码？</router-link>
          </el-form-item>

          <el-form-item>
            <el-button
              type="primary"
              @click="submitForm"
              :loading="loading"
              class="login-button"
              size="large"
            >
              登 录
            </el-button>
          </el-form-item>

        </el-form>
      </el-card>
    </transition>
  </div>
</template>


<script setup lang="ts">
import { ref, inject, reactive, onMounted } from 'vue'
import type { AxiosInstance } from 'axios'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { login } from '@/api/login' // 引入登录请求的API

const router = useRouter()
/// 从应用实例中注入 axios
const http = inject<AxiosInstance>('axios')

const showCard = ref(true) // 控制卡片显示
const loading = ref(false)

const loginFormRef = ref(null)
const remember = ref(false)
const loginForm = reactive({
  username: '',
  password: '',
  role: 'student', // 默认角色为学生
})

const rules = reactive({
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在6-20位之间', trigger: 'blur' },
  ],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }],
})

const submitForm = async () => {
  await loginFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      loading.value = true
      showCard.value = false // 隐藏卡片触发动画

      try {
        const response = await login(loginForm, http)
        const { data, headers } = response

        if (data.success) {
          const token = headers['authorization'] // 假设JWT令牌在Authorization头中
          if (token) {
            localStorage.setItem('token', token)
          }
          ElMessage.success('登录成功')
          router.push('/home_student') // 根据角色重定向或统一页面
        } else {
          ElMessage.error(data.message || '登录失败')
        }
      } catch (error) {
        console.error('Error during login:', error)
        ElMessage.error('登录失败：未知错误')
        router.push('/InvalidPass')
      } finally {
        loading.value = false
        showCard.value = true // 保证出错也可以重新显示卡片
      }
    }
  })
}

onMounted(() => {
  showCard.value = true
})
</script>

<style scoped>
/* 动画过渡样式 */
.fade-zoom-enter-active {
  animation: fadeZoomIn 0.5s ease-out;
}
.fade-zoom-leave-active {
  animation: fadeZoomOut 0.3s ease-in forwards;
}

@keyframes fadeZoomIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes fadeZoomOut {
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(0.95);
  }
}

.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  width: 100%;
  position: relative;
  overflow: hidden;
  background-color: #f9fafb;
  padding: 2rem;
}

.login-background {
  position: absolute;
  top: 0;
  width: 100%;
  height: 100%;
  background: url('https://source.unsplash.com/random/3840x2160/?abstract,blur') no-repeat center
    center;
  background-size: cover;
  z-index: 0;
  opacity: 0.8;
}

.login-overlay {
  position: absolute;
  top: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    to right bottom,
    rgba(255, 255, 255, 0.6),
    rgba(255, 255, 255, 0.5),
    rgba(255, 255, 255, 0.4)
  );
  backdrop-filter: blur(8px);
  z-index: 1;
}

.login-card {
  width: 61.8vw;
  max-width: 500px;
  min-width: 320px;
  padding: 2.5rem;
  border-radius: 1rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  position: relative;
  z-index: 10;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(8px);
  color: white;
  margin: 0 auto;
  transition: all 0.3s ease;
}

/* 展开伪类 */
.login-card:hover {
  background: rgba(255, 255, 255, 0.15);
  box-shadow: 0 30px 60px -12px rgba(0, 0, 0, 0.3);
}

.login-header {
  text-align: center;
  margin-bottom: 1rem;
}

.logo {
  width: 48px;
  height: 48px;
  margin-bottom: 0.5rem;
}

.login-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 0.25rem;
}

.login-subtitle {
  color: #6b7280;
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
}

.custom-input .el-input__wrapper {
  background-color: #f9fafb;
  border-radius: 0.5rem;
  border: 1px solid #d1d5db;
  color: #111827;
  transition: border-color 0.2s;
}

.custom-input .el-input__wrapper:hover {
  border-color: #9ca3af;
}

.custom-input .el-input__wrapper.is-focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 1px #6366f1;
}

.custom-input .el-input__inner::placeholder {
  color: #9ca3af;
}

.login-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.remember-me .el-checkbox__label {
  color: #6b7280;
}

.forgot-password {
  font-size: 0.85rem;
  color: #6b7280;
  text-decoration: none;
}
.forgot-password.hover {
  text-decoration: underline;
}

.login-button {
  background-color: #10a37f;
  color: white;
  font-weight: 600;
  width: 100%;
  border: none;
}
.login-button:hover {
  background-color: #0e8c6e;
}

.social-login {
  margin-top: 1.5rem;
  text-align: center;
}

.divider {
  font-size: 0.8rem;
  color: #9ca3af;
  margin-bottom: 0.5rem;
  position: relative;
}

.divider span {
  background-color: white;
  padding: 0 1rem;
  position: relative;
  z-index: 1;
}

.divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background-color: #e5e7eb;
  z-index: 0;
}

.social-icons {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
}

.social-icon {
  background-color: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

.social-icon:hover {
  background-color: #e5e7eb;
}

.login-footer {
  text-align: center;
  color: #6b7280;
  font-size: 0.875rem;
  margin-top: 1rem;
}

.register-link {
  color: #10a37f;
  font-weight: 500;
  margin-left: 4px;
}
.register-link:hover {
  text-decoration: underline;
}
</style>
