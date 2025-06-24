<template>
  <div class="login-container">
    <!-- 动态背景 -->
    <div class="login-background">
      <div class="background-animation">
        <div class="floating-shape shape-1"></div>
        <div class="floating-shape shape-2"></div>
        <div class="floating-shape shape-3"></div>
        <div class="floating-shape shape-4"></div>
        <div class="floating-shape shape-5"></div>
      </div>
      <!-- 添加渐变光效 -->
      <div class="gradient-overlay"></div>
    </div>

    <!-- 主要内容区域 -->
    <div class="login-content">
      <!-- 登录卡片 -->
      <div class="login-card">
        <!-- 品牌标题 -->
        <div class="brand-header">
          <div class="brand-logo">
            <div class="logo-icon">🎓</div>
            <h1 class="brand-title">LuminoEdu</h1>
          </div>
          <p class="brand-subtitle">智能教育平台</p>
        </div>

        <!-- 登录表单 -->
        <div class="form-container">
          <div class="form-header">
            <h2 class="form-title">欢迎登录</h2>
            <p class="form-subtitle">请输入您的账户信息</p>
          </div>

          <el-form
            ref="loginFormRef"
            :model="loginForm"
            :rules="rules"
            class="login-form"
            @keyup.enter="submitForm"
          >
            <el-form-item
              prop="user_id"
              class="form-item"
            >
              <el-input
                v-model="loginForm.user_id"
                placeholder="请输入用户名"
                class="form-input"
                size="large"
                :prefix-icon="User"
              />
            </el-form-item>

            <el-form-item
              prop="password"
              class="form-item"
            >
              <el-input
                v-model="loginForm.password"
                type="password"
                placeholder="请输入密码"
                show-password
                class="form-input"
                size="large"
                :prefix-icon="Lock"
              />
            </el-form-item>

            <div class="form-options">
              <el-checkbox
                v-model="remember"
                class="remember-me"
              >
                <span class="checkbox-text">记住我</span>
              </el-checkbox>
              <router-link
                to="/forgot-password"
                class="forgot-password"
              >
                忘记密码？
              </router-link>
            </div>

            <el-button
              type="primary"
              @click="submitForm"
              :loading="loading"
              class="login-btn"
              size="large"
            >
              <span class="btn-text">{{ loading ? '登录中...' : '登录' }}</span>
            </el-button>
          </el-form>

          <!-- 底部链接 -->
          <div class="form-footer">
            <span class="footer-text">还没有账户？</span>
            <router-link
              to="/register"
              class="register-link"
            >
              立即注册
            </router-link>
          </div>
        </div>
      </div>

      <!-- 侧边装饰 -->
      <div class="side-decoration">
        <div class="decoration-content">
          <div class="feature-showcase">
            <div class="feature-item">
              <div class="feature-icon">✨</div>
              <div class="feature-text">
                <h3>智能管理</h3>
                <p>高效的课程管理系统</p>
              </div>
            </div>
            <div class="feature-item">
              <div class="feature-icon">📊</div>
              <div class="feature-text">
                <h3>数据可视化</h3>
                <p>直观的学习数据分析</p>
              </div>
            </div>
            <div class="feature-item">
              <div class="feature-icon">🤝</div>
              <div class="feature-text">
                <h3>互动协作</h3>
                <p>师生之间无缝沟通</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, inject, reactive, onMounted } from 'vue'
import type { AxiosInstance } from 'axios'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import { login } from '@/api/login'

// 常量定义
const STORAGE_KEYS = {
  REMEMBER_ME: 'rememberMe',
  SAVED_USERNAME: 'savedUsername',
  SAVED_PASSWORD: 'savedPassword',
}

const router = useRouter()
const http = inject<AxiosInstance>('axios')

const loading = ref(false)
const loginFormRef = ref(null)
const remember = ref(false)

const loginForm = reactive({
  user_id: '',
  password: '',
})

const rules = reactive({
  user_id: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, message: '用户名至少3个字符', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在6-20位之间', trigger: 'blur' },
  ],
})

// 加密存储密码
const encryptPassword = (password: string): string => {
  // 简单的加密方式，你可以使用更安全的加密库
  return btoa(password)
}

// 解密存储的密码
const decryptPassword = (encryptedPassword: string): string => {
  try {
    return atob(encryptedPassword)
  } catch (error) {
    console.error('密码解密失败:', error)
    return ''
  }
}

// 保存登录信息到本地存储
const saveLoginInfo = () => {
  if (remember.value) {
    localStorage.setItem(STORAGE_KEYS.REMEMBER_ME, 'true')
    localStorage.setItem(STORAGE_KEYS.SAVED_USERNAME, loginForm.user_id)
    localStorage.setItem(STORAGE_KEYS.SAVED_PASSWORD, encryptPassword(loginForm.password))

    console.log('登录信息已保存')
  } else {
    // 如果不记住密码，清除保存的信息
    localStorage.removeItem(STORAGE_KEYS.REMEMBER_ME)
    localStorage.removeItem(STORAGE_KEYS.SAVED_USERNAME)
    localStorage.removeItem(STORAGE_KEYS.SAVED_PASSWORD)

    console.log('登录信息已清除')
  }
}

// 从本地存储加载登录信息
const loadSavedLoginInfo = () => {
  const rememberMe = localStorage.getItem(STORAGE_KEYS.REMEMBER_ME)

  if (rememberMe === 'true') {
    const savedUsername = localStorage.getItem(STORAGE_KEYS.SAVED_USERNAME)
    const savedPassword = localStorage.getItem(STORAGE_KEYS.SAVED_PASSWORD)

    if (savedUsername && savedPassword) {
      loginForm.user_id = savedUsername
      loginForm.password = decryptPassword(savedPassword)
      remember.value = true

      console.log('已加载保存的登录信息')
      ElMessage.info('已为您自动填入上次保存的登录信息')
    }
  }
}

// 清除保存的登录信息
const clearSavedLoginInfo = () => {
  localStorage.removeItem(STORAGE_KEYS.REMEMBER_ME)
  localStorage.removeItem(STORAGE_KEYS.SAVED_USERNAME)
  localStorage.removeItem(STORAGE_KEYS.SAVED_PASSWORD)
}

const submitForm = async () => {
  if (!loginFormRef.value) return

  await loginFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      loading.value = true

      try {
        const data = await login(loginForm, http)
        const { access_token, user_id, role, username } = data

        // 登录成功后保存token和用户信息
        localStorage.setItem('token', access_token)
        localStorage.setItem('userInfo', JSON.stringify({ user_id, role, username }))

        // 处理记住密码功能
        saveLoginInfo()

        ElMessage.success('登录成功！欢迎回来')

        // 延迟跳转，让用户看到成功消息
        setTimeout(async () => {
          try {
            let targetRoute
            if (role === 'teacher') {
              targetRoute = '/home_teacher'
            } else if (role === 'student') {
              targetRoute = '/home_student'
            } else if (role === 'admin') {
              targetRoute = '/admin_home' // 跳转到管理员界面
            } else {
              throw new Error('未知角色，无法跳转')
            }

            await router.push(targetRoute)
            console.log(`成功跳转到 ${targetRoute}`)
          } catch (error) {
            console.error('跳转失败:', error)
            await router.push('/login')
            ElMessage.error(error.detail || error.message || '登录失败，请重试')
          }
        }, 1000)

        // 登录失败时，如果密码错误，可以选择清除保存的密码
        if (remember.value && (error.message?.includes('密码') || error.detail?.includes('密码'))) {
          ElMessage.warning('密码可能已过期，已清除保存的密码')
          clearSavedLoginInfo()
          remember.value = false
        }
      } finally {
        loading.value = false
      }
    }
  })
}

// 监听记住我复选框的变化
const handleRememberChange = () => {
  if (!remember.value) {
    // 如果取消勾选记住我，清除保存的信息
    clearSavedLoginInfo()
    ElMessage.info('已清除保存的登录信息')
  }
}

// 组件挂载时加载保存的登录信息
onMounted(() => {
  loadSavedLoginInfo()
})
</script>

<style scoped>
/* 容器样式 */
.login-container {
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  margin: 0;
  position: fixed;
  top: 0;
  left: 0;
  overflow: hidden;
}

/* 背景动画和效果 */
.login-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.background-animation {
  position: relative;
  width: 100%;
  height: 100%;
}

.floating-shape {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  animation: float 20s infinite ease-in-out;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.shape-1 {
  width: 120px;
  height: 120px;
  top: 10%;
  left: 8%;
  animation-delay: 0s;
}

.shape-2 {
  width: 80px;
  height: 80px;
  top: 70%;
  right: 10%;
  animation-delay: -5s;
}

.shape-3 {
  width: 100px;
  height: 100px;
  bottom: 20%;
  left: 15%;
  animation-delay: -10s;
}

.shape-4 {
  width: 60px;
  height: 60px;
  top: 30%;
  right: 30%;
  animation-delay: -15s;
}

.shape-5 {
  width: 140px;
  height: 140px;
  bottom: 10%;
  right: 20%;
  animation-delay: -7s;
}

.gradient-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at 30% 20%, rgba(102, 126, 234, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 70% 80%, rgba(240, 147, 251, 0.3) 0%, transparent 50%);
  animation: gradientShift 15s ease-in-out infinite;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0px) rotate(0deg) scale(1);
  }
  33% {
    transform: translateY(-30px) rotate(120deg) scale(1.1);
  }
  66% {
    transform: translateY(-15px) rotate(240deg) scale(0.9);
  }
}

@keyframes gradientShift {
  0%,
  100% {
    opacity: 0.6;
  }
  50% {
    opacity: 0.8;
  }
}

/* 主内容区域 - 毛玻璃效果 */
.login-content {
  position: relative;
  z-index: 10;
  display: grid;
  grid-template-columns: 1fr 1fr;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 24px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  overflow: hidden;
  width: 90%;
  max-width: 1000px;
  height: auto;
  max-height: 90vh;
  transition: all 0.3s ease;
}

.login-content:hover {
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.3);
}

/* 登录卡片 */
.login-card {
  padding: 50px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 500px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  position: relative;
}

.login-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
  border-radius: inherit;
  pointer-events: none;
}

/* 品牌标题 */
.brand-header {
  text-align: center;
  margin-bottom: 40px;
  position: relative;
  z-index: 2;
}

.brand-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-bottom: 12px;
}

.logo-icon {
  font-size: 2.5rem;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  width: 60px;
  height: 60px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
  backdrop-filter: blur(10px);
}

.brand-title {
  font-size: 2rem;
  font-weight: 800;
  background: linear-gradient(135deg, #2d3748, #4a5568);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.brand-subtitle {
  color: rgba(45, 55, 72, 0.8);
  font-size: 1rem;
  margin: 0;
  font-weight: 500;
}

/* 表单容器 */
.form-container {
  flex: 1;
  position: relative;
  z-index: 2;
}

.form-header {
  text-align: center;
  margin-bottom: 30px;
}

.form-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0 0 8px 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.form-subtitle {
  color: rgba(113, 128, 150, 0.9);
  font-size: 0.95rem;
  margin: 0;
}

/* 表单样式 */
.login-form {
  margin-bottom: 25px;
}

.form-item {
  margin-bottom: 24px;
}

.form-input :deep(.el-input__wrapper) {
  background: rgba(255, 255, 255, 0.9);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  height: 52px;
}

.form-input :deep(.el-input__wrapper:hover) {
  border-color: rgba(102, 126, 234, 0.4);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

.form-input :deep(.el-input__wrapper.is-focus) {
  border-color: #667eea;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.15), 0 8px 25px rgba(102, 126, 234, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

.form-input :deep(.el-input__inner) {
  color: #2d3748;
  font-size: 1rem;
  font-weight: 500;
  padding-left: 16px;
}

.form-input :deep(.el-input__inner::placeholder) {
  color: rgba(160, 174, 192, 0.8);
}

.form-input :deep(.el-input__prefix-inner) {
  color: #667eea;
}

/* 表单选项 */
.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.remember-me {
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 4px 8px;
  border-radius: 6px;
}

.remember-me:hover {
  background: rgba(102, 126, 234, 0.1);
}

.remember-me :deep(.el-checkbox__input) {
  margin-right: 8px;
}

.remember-me :deep(.el-checkbox__inner) {
  border-color: rgba(102, 126, 234, 0.5);
  background: rgba(255, 255, 255, 0.9);
  transition: all 0.3s ease;
}

.remember-me :deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-color: #667eea;
}

.checkbox-text {
  color: rgba(74, 85, 104, 0.9);
  font-size: 0.9rem;
  font-weight: 500;
  user-select: none;
}

.forgot-password {
  color: #667eea;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.3s ease;
  padding: 4px 8px;
  border-radius: 6px;
}

.forgot-password:hover {
  color: #5a6fd8;
  background: rgba(102, 126, 234, 0.1);
}

/* 登录按钮 */
.login-btn {
  width: 100%;
  height: 52px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 700;
  transition: all 0.3s ease;
  margin-bottom: 25px;
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3), 0 3px 10px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
}

.login-btn:before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.login-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 35px rgba(102, 126, 234, 0.4), 0 5px 15px rgba(0, 0, 0, 0.15);
}

.login-btn:hover:before {
  left: 100%;
}

.login-btn:disabled {
  background: rgba(189, 195, 199, 0.8);
  cursor: not-allowed;
  transform: none;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.btn-text {
  position: relative;
  z-index: 2;
}

/* 表单底部 */
.form-footer {
  text-align: center;
  color: rgba(113, 128, 150, 0.9);
  font-size: 0.9rem;
}

.footer-text {
  margin-right: 8px;
}

.register-link {
  color: #667eea;
  text-decoration: none;
  font-weight: 700;
  transition: all 0.3s ease;
  padding: 4px 8px;
  border-radius: 6px;
}

.register-link:hover {
  color: #5a6fd8;
  background: rgba(102, 126, 234, 0.1);
}

/* 侧边装饰 */
.side-decoration {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.9) 0%, rgba(118, 75, 162, 0.9) 100%);
  padding: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  min-height: 500px;
  position: relative;
  backdrop-filter: blur(20px);
}

.side-decoration::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
}

.decoration-content {
  width: 100%;
  max-width: 320px;
  position: relative;
  z-index: 2;
}

.feature-showcase {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.feature-item:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.feature-icon {
  font-size: 2.2rem;
  width: 60px;
  height: 60px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  flex-shrink: 0;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.feature-text h3 {
  font-size: 1.2rem;
  font-weight: 700;
  margin: 0 0 6px 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.feature-text p {
  font-size: 0.95rem;
  opacity: 0.9;
  margin: 0;
  line-height: 1.5;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .login-content {
    grid-template-columns: 1fr;
    width: 95%;
    max-width: 480px;
  }

  .side-decoration {
    order: -1;
    padding: 30px 25px;
    min-height: auto;
  }

  .feature-showcase {
    flex-direction: row;
    justify-content: space-around;
    gap: 20px;
  }

  .feature-item {
    flex-direction: column;
    text-align: center;
    gap: 12px;
    padding: 16px;
  }

  .feature-icon {
    width: 50px;
    height: 50px;
    font-size: 1.8rem;
  }

  .feature-text h3 {
    font-size: 1rem;
  }

  .feature-text p {
    font-size: 0.85rem;
  }

  .login-card {
    padding: 35px 30px;
    min-height: auto;
  }

  .brand-title {
    font-size: 1.8rem;
  }

  .form-title {
    font-size: 1.5rem;
  }
}

@media (max-width: 768px) {
  .login-container {
    padding: 20px;
  }

  .login-card {
    padding: 30px 25px;
  }

  .brand-logo {
    flex-direction: column;
    gap: 12px;
  }

  .brand-title {
    font-size: 1.6rem;
  }

  .form-input :deep(.el-input__wrapper) {
    height: 48px;
  }

  .login-btn {
    height: 48px;
    font-size: 1rem;
  }
}

/* 针对小屏幕高度 */
@media (max-height: 700px) {
  .login-container {
    align-items: flex-start;
    padding: 30px 20px;
  }

  .login-content {
    margin-top: 20px;
    margin-bottom: 20px;
  }

  .login-card {
    padding: 30px;
    min-height: auto;
  }

  .brand-header {
    margin-bottom: 25px;
  }

  .form-header {
    margin-bottom: 20px;
  }

  .form-item {
    margin-bottom: 18px;
  }
}

/* 确保大屏幕下的显示效果 */
@media (min-width: 1200px) {
  .login-content {
    max-width: 1200px;
  }

  .login-card {
    padding: 60px;
  }

  .side-decoration {
    padding: 60px;
  }
}
</style>
