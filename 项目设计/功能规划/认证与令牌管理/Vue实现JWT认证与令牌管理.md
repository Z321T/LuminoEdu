# Vue 前端实现 JWT 认证与会话管理

基于后端的 JWT 认证机制，Vue 前端需要完成以下几个关键部分：

## 1. Token 存储与管理

```javascript
// src/utils/auth.js
export function getToken() {
  return localStorage.getItem('access_token')
}

export function setToken(token) {
  localStorage.setItem('access_token', token)
  // 存储过期时间（当前时间 + 30分钟）
  const expireTime = new Date().getTime() + 30 * 60 * 1000
  localStorage.setItem('token_expire', expireTime)
}

export function removeToken() {
  localStorage.removeItem('access_token')
  localStorage.removeItem('token_expire')
}

export function isTokenExpired() {
  const expireTime = localStorage.getItem('token_expire')
  return expireTime ? new Date().getTime() >= Number(expireTime) : true
}
```

## 2. Axios 请求拦截器

```javascript
// src/utils/request.js
import axios from 'axios'
import { getToken, removeToken, isTokenExpired } from '@/utils/auth'
import router from '@/router'
import { ElMessage } from 'element-plus'

const service = axios.create({
  baseURL: '/api',
  timeout: 5000
})

// 请求拦截器
service.interceptors.request.use(
  config => {
    const token = getToken()
    if (token) {
      // 检查令牌是否过期
      if (isTokenExpired()) {
        removeToken()
        router.push('/login')
        return Promise.reject(new Error('登录已过期，请重新登录'))
      }
      // JWT令牌添加到请求头
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  error => Promise.reject(error)
)

// 响应拦截器
service.interceptors.response.use(
  response => response.data,
  error => {
    if (error.response && error.response.status === 401) {
      // 401错误处理
      ElMessage.error('登录已过期，请重新登录')
      removeToken()
      router.push('/login')
    } else {
      ElMessage.error(error.message || '请求失败')
    }
    return Promise.reject(error)
  }
)

export default service
```

## 3. Vuex/Pinia 状态管理

```javascript
// Pinia示例 (src/stores/user.js)
import { defineStore } from 'pinia'
import { getToken, setToken, removeToken } from '@/utils/auth'
import { login, getUserInfo } from '@/api/user'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: getToken() || '',
    userId: '',
    username: '',
    role: '',
  }),
  
  actions: {
    // 登录
    async login(userInfo) {
      const { user_id, password, role } = userInfo
      try {
        const data = await login({ user_id, password, role })
        setToken(data.access_token)
        this.token = data.access_token
        this.userId = data.user_id
        this.role = data.role
        this.username = data.username
        return data
      } catch (error) {
        throw error
      }
    },
    
    // 获取用户信息
    async getInfo() {
      try {
        const data = await getUserInfo()
        this.userId = data.id
        this.username = data.username
        this.role = data.role
        return data
      } catch (error) {
        throw error
      }
    },
    
    // 登出
    logout() {
      removeToken()
      this.$reset()
    }
  }
})
```

## 4. Vue-Router 路由守卫

```javascript
// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import { getToken } from '@/utils/auth'
import { useUserStore } from '@/stores/user'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      component: () => import('@/views/Login.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/',
      component: () => import('@/views/Layout.vue'),
      meta: { requiresAuth: true },
      children: [
        // 受保护的路由
      ]
    }
  ]
})

router.beforeEach(async (to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const token = getToken()
  
  if (requiresAuth && !token) {
    // 需要认证但没有令牌
    next('/login')
  } else if (token && to.path === '/login') {
    // 已登录用户不应该访问登录页
    next('/')
  } else if (token && requiresAuth) {
    const userStore = useUserStore()
    // 尝试获取用户信息（如果还没有）
    if (!userStore.username) {
      try {
        await userStore.getInfo()
        next()
      } catch (error) {
        userStore.logout()
        next('/login')
      }
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router
```

## 5. 登录组件实现

```vue
<!-- src/views/Login.vue -->
<template>
  <div class="login-container">
    <el-form :model="loginForm" status-icon ref="loginFormRef">
      <el-form-item prop="user_id">
        <el-input v-model="loginForm.user_id" placeholder="请输入账号"></el-input>
      </el-form-item>
      <el-form-item prop="password">
        <el-input v-model="loginForm.password" type="password" placeholder="请输入密码"></el-input>
      </el-form-item>
      <el-form-item prop="role">
        <el-select v-model="loginForm.role" placeholder="选择角色">
          <el-option label="学生" value="student"></el-option>
          <el-option label="教师" value="teacher"></el-option>
          <el-option label="管理员" value="admin"></el-option>
        </el-select>
      </el-form-item>
      <el-button type="primary" @click="handleLogin">登录</el-button>
    </el-form>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()
const loginFormRef = ref(null)

const loginForm = reactive({
  user_id: '',
  password: '',
  role: 'student'
})

const handleLogin = async () => {
  try {
    await userStore.login(loginForm)
    ElMessage.success('登录成功')
    router.push('/')
  } catch (error) {
    ElMessage.error(error.message || '登录失败')
  }
}
</script>
```

## 6. 处理会话过期的策略

由于服务端设置了30分钟的过期时间，前端可以：

1. 在用户操作时检查令牌是否即将过期
2. 在接近过期时（如剩余5分钟）提醒用户
3. 或自动在后台刷新令牌（如果后端支持）

通过以上实现，前端可以有效地配合后端JWT认证机制，实现完整的用户认证与会话管理。