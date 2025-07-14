import axios from 'axios'
import router from '@/router'

// 创建 axios 实例
const api = axios.create({
   baseURL: 'http://localhost:8000',
  timeout: 60000, // AI生成需要较长时间
})

// 请求拦截器 - 添加认证信息
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// 响应拦截器 - 处理认证错误
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export interface TeacherInfo {
  staff_id: string
  department: string
  expertise: string
  intro?: string | null
  contact_email?: string | null
  office_location?: string | null
}

export interface UserInfo {
  username: string
  role: user|assistant|system
  staff_id?: string
  department?: string
  expertise?: string
  intro?: string | null
  contact_email?: string | null
  office_location?: string | null
}

export const getCurrentUser = async (): Promise<UserInfo> => {
  try {
    // 确保请求带上 token
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('未登录或会话已过期')
    }

    const response = await api.get('/user/profile', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (response.status === 200) {
      return response.data
    }
    
    throw new Error('获取用户信息失败')
  } catch (error: any) {
    console.error('获取用户信息失败:', error)
    if (error.response?.status === 401) {
      // 如果是认证问题，跳转到登录页
      router.push('/login')
      throw new Error('请重新登录')
    }
    throw new Error(error.response?.data?.detail || '获取用户信息失败')
  }
}

export interface UpdateTeacherInfo {
  intro?: string | null
  contact_email?: string | null
  expertise?: string
  office_location?: string | null
}

export const updateTeacherInfo = async (data: UpdateTeacherInfo): Promise<any> => {
  try {
    const response = await api.put('/user/profile/teacher', data)
    return response.data
  } catch (error: any) {
    console.error('更新用户信息失败:', error)
    throw new Error(error.response?.data?.detail || '更新用户信息失败')
  }
}

export interface ChangePasswordData {
  current_password: string;
  new_password: string;
}

export const changePassword = async (data: ChangePasswordData): Promise<any> => {
  try {
    // 验证密码格式
    if (!data.current_password || !data.new_password) {
      throw new Error('当前密码和新密码都不能为空');
    }

    // 确保请求格式正确
    const requestData = {
      current_password: data.current_password,
      new_password: data.new_password
    };

    const response = await api.post('/user/change_password', requestData);

    if (response.status === 200) {
      return response.data;
    }

    throw new Error(response.data?.message || '修改密码失败');
  } catch (error: any) {
    console.error('修改密码失败:', error);
    if (error.response?.status === 422) {
      // 处理验证错误
      const errorDetail = error.response.data.detail;
      if (Array.isArray(errorDetail)) {
        // 获取具体的错误消息
        const errorMessage = errorDetail[0]?.msg || '密码格式不正确';
        throw new Error(errorMessage);
      }
    }
    throw new Error(error.response?.data?.detail || error.message || '修改密码失败');
  }
};