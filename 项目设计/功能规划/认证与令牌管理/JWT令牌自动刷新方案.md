# JWT令牌自动刷新实现方案

"自动在后台刷新令牌"是指在用户令牌即将过期前，前端自动向后端请求新令牌，从而避免用户会话中断需要重新登录的情况。

## 1. 后端实现刷新令牌端点

首先，需要在后端添加一个刷新令牌的端点：

```python
@router.post("/refresh-token", response_model=Token)
async def refresh_token(current_user = Depends(auth_current_user)):
    """刷新访问令牌，延长用户会话"""
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={
            "sub": current_user.username, 
            "id": current_user.id, 
            "role": current_user.role
        },
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": current_user.id,
        "role": current_user.role,
        "username": current_user.username
    }
```

## 2. 前端实现自动刷新逻辑

### 令牌管理工具函数改进

```javascript
// src/utils/auth.js
export function setToken(token) {
  localStorage.setItem('access_token', token)
  // 设置过期时间为当前时间 + 30分钟
  const expireTime = new Date().getTime() + 30 * 60 * 1000
  localStorage.setItem('token_expire', expireTime)
}

// 获取令牌剩余有效时间(毫秒)
export function getTokenRemainingTime() {
  const expireTime = localStorage.getItem('token_expire')
  if (!expireTime) return 0
  
  return Math.max(0, Number(expireTime) - new Date().getTime())
}

// 判断是否需要刷新令牌 (小于5分钟时刷新)
export function needRefreshToken() {
  const remainingTime = getTokenRemainingTime()
  return remainingTime > 0 && remainingTime < 5 * 60 * 1000
}
```

### 创建令牌刷新服务

```javascript
// src/utils/tokenRefresher.js
import { getToken, setToken, needRefreshToken } from './auth'
import axios from 'axios'

class TokenRefresher {
  constructor() {
    this.isRefreshing = false
    this.refreshInterval = null
  }

  // 开始定时检查令牌
  startTokenRefresher() {
    // 每分钟检查一次令牌状态
    this.refreshInterval = setInterval(() => {
      this.checkAndRefreshToken()
    }, 60 * 1000)
  }

  // 停止刷新
  stopTokenRefresher() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval)
      this.refreshInterval = null
    }
  }

  // 检查并刷新令牌
  async checkAndRefreshToken() {
    // 如果没有令牌或已在刷新中，直接返回
    if (!getToken() || this.isRefreshing) return
    
    // 检查是否需要刷新
    if (needRefreshToken()) {
      try {
        this.isRefreshing = true
        
        // 调用刷新令牌接口
        const response = await axios.post('/api/auth/refresh-token', {}, {
          headers: { 'Authorization': `Bearer ${getToken()}` }
        })
        
        // 更新令牌
        if (response.data.access_token) {
          setToken(response.data.access_token)
          console.log('令牌已自动刷新')
        }
      } catch (error) {
        console.error('刷新令牌失败', error)
      } finally {
        this.isRefreshing = false
      }
    }
  }
}

export default new TokenRefresher()
```

### 在应用启动时初始化

```javascript
// main.js
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import tokenRefresher from './utils/tokenRefresher'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.mount('#app')

// 启动令牌刷新服务
tokenRefresher.startTokenRefresher()
```

### 在用户登出时停止刷新

```javascript
// stores/user.js 中的 logout 方法
logout() {
  removeToken()
  tokenRefresher.stopTokenRefresher() // 停止令牌刷新
  this.$reset()
}
```

## 3. 处理请求期间的令牌刷新

为了处理在请求过程中令牌过期的情况，可以增强 Axios 拦截器：

```javascript
// src/utils/request.js
import axios from 'axios'
import { getToken, removeToken, isTokenExpired, needRefreshToken } from '@/utils/auth'
import router from '@/router'
import { ElMessage } from 'element-plus'
import tokenRefresher from './tokenRefresher'

const service = axios.create({
  baseURL: '/api',
  timeout: 5000
})

// 请求队列，用于存储待重发的请求
let pendingRequests = []
let isRefreshingToken = false

// 请求拦截器
service.interceptors.request.use(
  async config => {
    const token = getToken()
    if (token) {
      // 如果令牌即将过期，先刷新令牌
      if (needRefreshToken() && !isRefreshingToken && config.url !== 'auth/refresh-token') {
        isRefreshingToken = true
        try {
          await tokenRefresher.checkAndRefreshToken()
        } finally {
          isRefreshingToken = false
        }
      }
      
      // 添加令牌到请求头
      config.headers['Authorization'] = `Bearer ${getToken()}`
    }
    return config
  },
  error => Promise.reject(error)
)

export default service
```

这种方法可以让用户在不知不觉中持续使用系统，无需因为会话过期而中断操作重新登录，大大提升了用户体验。

注意：自动刷新令牌需要后端对应的支持，需要先实现上述后端的刷新令牌端点。