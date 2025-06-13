import axios from 'axios'

// 创建 axios 实例
const api = axios.create({
  timeout: 30000,
})

// 请求拦截器
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

// 响应拦截器
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

// 习题历史记录类型定义
export interface ExerciseHistoryItem {
  filename: string
  created_at: string
  size_kb: number
  title?: string
  id?: string
  content_preview?: string
  exercise_types?: string[]
  exercise_count?: number
  updated_at?: string
  file_size?: number
  status?: 'completed' | 'generating' | 'failed'
}

// 根据实际接口响应格式调整
export interface ExerciseHistoryResponse {
  exercises: ExerciseHistoryItem[]
  code?: number
  message?: string
}

// 删除响应格式
export interface DeleteResponse {
  code?: number
  message?: string
  success?: boolean
}

// 获取习题历史列表
export const getExerciseHistory = async (params: {
  limit?: number
  title_filter?: string
}): Promise<ExerciseHistoryResponse> => {
  try {
    console.log('📋 请求习题历史列表，参数:', params)
    
    const response = await api.get('/teacher/exercise_generator/list', { 
      params: {
        limit: params.limit || 50,
        title_filter: params.title_filter || null
      }
    })
    
    console.log('📋 历史列表响应:', response.data)
    return response.data
    
  } catch (error: any) {
    console.error('💥 获取历史列表失败:', error)
    
    if (!error.response) {
      throw new Error(`网络错误: ${error.message}`)
    }
    
    const status = error.response.status
    const errorData = error.response.data
    
    if (status === 401) throw new Error('认证失败，请重新登录')
    if (status === 403) throw new Error('权限不足')
    if (status === 404) throw new Error('接口不存在')
    if (status === 422) {
      const detail = errorData?.detail
      if (Array.isArray(detail)) {
        const errors = detail.map(err => `${err.loc?.join('.')}: ${err.msg}`).join('; ')
        throw new Error(`参数验证失败: ${errors}`)
      }
      throw new Error(`参数验证失败: ${detail}`)
    }
    
    const errorMessage = errorData?.message || errorData?.detail || error.message || '获取历史失败'
    throw new Error(errorMessage)
  }
}

// 删除单个习题历史记录 - 使用实际的删除接口
export const deleteExerciseHistory = async (filename: string): Promise<DeleteResponse> => {
  try {
    console.log('🗑️ 请求删除习题文件，文件名:', filename)
    
    // 使用实际的删除接口路径，文件名需要进行URL编码
    const encodedFilename = encodeURIComponent(filename)
    const response = await api.delete(`/teacher/exercise_generator/delete/${encodedFilename}`)
    
    console.log('🗑️ 删除响应:', response.data)
    
    return response.data || { success: true, message: '删除成功' }
    
  } catch (error: any) {
    console.error('💥 删除文件失败:', error)
    
    if (!error.response) {
      throw new Error(`网络错误: ${error.message}`)
    }
    
    const status = error.response.status
    const errorData = error.response.data
    
    // 处理不同的HTTP状态码
    if (status === 401) throw new Error('认证失败，请重新登录')
    if (status === 403) throw new Error('权限不足，无法删除此文件')
    if (status === 404) throw new Error('文件不存在或已被删除')
    if (status === 409) throw new Error('文件正在使用中，无法删除')
    if (status === 500) throw new Error('服务器内部错误，删除失败')
    
    // 处理验证错误
    if (status === 422) {
      const detail = errorData?.detail
      if (Array.isArray(detail)) {
        const errors = detail.map(err => `${err.loc?.join('.')}: ${err.msg}`).join('; ')
        throw new Error(`参数验证失败: ${errors}`)
      }
      throw new Error(`参数验证失败: ${detail}`)
    }
    
    // 通用错误处理
    const errorMessage = errorData?.message || errorData?.detail || error.message || '删除失败'
    throw new Error(errorMessage)
  }
}

// 批量删除习题历史记录 - 如果后端支持批量删除
export const batchDeleteExerciseHistory = async (filenames: string[]): Promise<void> => {
  try {
    console.log('🗑️ 请求批量删除习题文件，文件列表:', filenames)
    
    // 如果后端有专门的批量删除接口
    // await api.post('/teacher/exercise_generator/batch_delete', { filenames })
    
    // 如果没有批量删除接口，就逐个删除
    const deletePromises = filenames.map(filename => deleteExerciseHistory(filename))
    await Promise.all(deletePromises)
    
    console.log('🗑️ 批量删除完成')
    
  } catch (error: any) {
    console.error('💥 批量删除失败:', error)
    throw error
  }
}

// 工具函数：从文件名中提取标题
export const extractTitleFromFilename = (filename: string): string => {
  // 文件名格式: teacher_T2025001_20250610_180152_二叉树.md
  const parts = filename.split('_')
  if (parts.length >= 5) {
    // 提取最后一部分作为标题，去掉.md后缀
    const titlePart = parts.slice(4).join('_')
    return titlePart.replace('.md', '')
  }
  return filename.replace('.md', '')
}

// 工具函数：从文件名中提取ID
export const extractIdFromFilename = (filename: string): string => {
  return filename // 使用文件名作为唯一ID
}

// 验证文件名格式
export const validateFilename = (filename: string): boolean => {
  if (!filename || filename.trim() === '') {
    return false
  }
  
  // 检查文件名是否包含非法字符
  const invalidChars = /[<>:"/\\|?*]/
  if (invalidChars.test(filename)) {
    return false
  }
  
  return true
}

// 获取单个习题历史记录详情
export const getExerciseHistoryDetail = async (filename: string): Promise<ExerciseHistoryItem> => {
  try {
    const encodedFilename = encodeURIComponent(filename)
    const response = await api.get(`/teacher/exercise_generator/detail/${encodedFilename}`)
    console.log('📋 请求习题历史记录详情，文件名:', filename)
    return response.data
  } catch (error: any) {
    if (!error.response) {
      throw new Error(`网络错误: ${error.message}`)
    }
    
    const status = error.response.status
    const errorData = error.response.data
    
    const errorMessage = errorData?.message || errorData?.detail || error.message || '获取历史记录详情失败'
    if (status === 404) throw new Error('文件不存在')
    if (status === 403) throw new Error('权限不足')
    if (status === 401) throw new Error('认证失败，请重新登录')
    
    throw new Error(errorMessage)
  }
}