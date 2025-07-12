import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useLocalStorage } from './useLocalStorage'

interface User {
  id: string
  name: string
  email: string
  role: 'teacher' | 'student' | 'admin'
  avatar?: string
}

interface LoginCredentials {
  email: string
  password: string
}

interface RegisterData {
  name: string
  email: string
  password: string
  role: 'teacher' | 'student'
}

export function useAuth() {
  const router = useRouter()
  
  // 使用 localStorage 持久化存储
  const [storedToken, setStoredToken, removeStoredToken] = useLocalStorage<string>('auth_token', '')
  const [storedUser, setStoredUser, removeStoredUser] = useLocalStorage<User | null>('auth_user', null)
  
  // 响应式状态
  const isLoading = ref(false)
  const errorMessage = ref('')
  
  // 计算属性
  const isAuthenticated = computed(() => !!storedToken.value && !!storedUser.value)
  const currentUser = computed(() => storedUser.value)
  const userRole = computed(() => storedUser.value?.role)
  
  // 登录
  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      isLoading.value = true
      errorMessage.value = ''
      
      // 模拟 API 调用
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // 模拟登录验证
      if (credentials.email === 'teacher@example.com' && credentials.password === 'password') {
        const user: User = {
          id: 'teacher_001',
          name: '张老师',
          email: credentials.email,
          role: 'teacher',
          avatar: ''
        }
        
        const token = 'mock_jwt_token_' + Date.now()
        
        // 存储到 localStorage
        setStoredToken(token)
        setStoredUser(user)
        
        console.log('✅ 登录成功:', user)
        return true
      } else {
        throw new Error('邮箱或密码错误')
      }
    } catch (error: any) {
      console.error('❌ 登录失败:', error)
      errorMessage.value = error.message || '登录失败，请重试'
      return false
    } finally {
      isLoading.value = false
    }
  }
  
  // 注册
  const register = async (data: RegisterData): Promise<boolean> => {
    try {
      isLoading.value = true
      errorMessage.value = ''
      
      // 模拟 API 调用
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // 模拟注册逻辑
      const user: User = {
        id: `${data.role}_${Date.now()}`,
        name: data.name,
        email: data.email,
        role: data.role,
        avatar: ''
      }
      
      const token = 'mock_jwt_token_' + Date.now()
      
      // 存储到 localStorage
      setStoredToken(token)
      setStoredUser(user)
      
      console.log('✅ 注册成功:', user)
      return true
    } catch (error: any) {
      console.error('❌ 注册失败:', error)
      errorMessage.value = error.message || '注册失败，请重试'
      return false
    } finally {
      isLoading.value = false
    }
  }
  
  // 登出
  const logout = async (): Promise<void> => {
    try {
      isLoading.value = true
      
      // 模拟 API 调用（如果需要通知服务器）
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // 清除存储的数据
      removeStoredToken()
      removeStoredUser()
      
      // 跳转到登录页
      await router.push('/login')
      
      console.log('✅ 登出成功')
    } catch (error: any) {
      console.error('❌ 登出失败:', error)
      // 即使登出失败，也要清除本地数据
      removeStoredToken()
      removeStoredUser()
      await router.push('/login')
    } finally {
      isLoading.value = false
    }
  }
  
  // 刷新用户信息
  const refreshUser = async (): Promise<void> => {
    if (!storedToken.value) return
    
    try {
      isLoading.value = true
      
      // 模拟 API 调用获取最新用户信息
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // 这里应该是真实的 API 调用
      // const response = await api.get('/user/profile')
      // setStoredUser(response.data)
      
      console.log('✅ 用户信息刷新成功')
    } catch (error: any) {
      console.error('❌ 刷新用户信息失败:', error)
      // 如果 token 无效，清除认证状态
      if (error.status === 401) {
        await logout()
      }
    } finally {
      isLoading.value = false
    }
  }
  
  // 更新用户资料
  const updateProfile = async (userData: Partial<User>): Promise<boolean> => {
    if (!currentUser.value) return false
    
    try {
      isLoading.value = true
      errorMessage.value = ''
      
      // 模拟 API 调用
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // 更新本地用户数据
      const updatedUser = { ...currentUser.value, ...userData }
      setStoredUser(updatedUser)
      
      console.log('✅ 用户资料更新成功:', updatedUser)
      return true
    } catch (error: any) {
      console.error('❌ 更新用户资料失败:', error)
      errorMessage.value = error.message || '更新失败，请重试'
      return false
    } finally {
      isLoading.value = false
    }
  }
  
  // 检查认证状态
  const checkAuth = async (): Promise<boolean> => {
    if (!storedToken.value) return false
    
    try {
      // 验证 token 是否有效
      await refreshUser()
      return true
    } catch (error) {
      await logout()
      return false
    }
  }
  
  // 权限检查
  const hasPermission = (requiredRole: string | string[]): boolean => {
    if (!currentUser.value) return false
    
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
    return roles.includes(currentUser.value.role)
  }
  
  // 清除错误信息
  const clearError = () => {
    errorMessage.value = ''
  }
  
  return {
    // 状态
    isLoading: readonly(isLoading),
    errorMessage: readonly(errorMessage),
    isAuthenticated,
    currentUser,
    userRole,
    
    // 方法
    login,
    register,
    logout,
    refreshUser,
    updateProfile,
    checkAuth,
    hasPermission,
    clearError
  }
}