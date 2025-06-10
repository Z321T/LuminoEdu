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

// 习题历史记录类型定义 - 根据实际返回数据调整
export interface ExerciseHistoryItem {
  filename: string
  created_at: string
  size_kb: number
  // 从文件名中提取的信息
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

// 获取习题历史列表 - 使用实际接口路径和参数
export const getExerciseHistory = async (params: {
  limit?: number
  title_filter?: string
}): Promise<ExerciseHistoryResponse> => {
  try {
    console.log('📋 请求习题历史列表，参数:', params)
    
    // 使用实际的接口路径
    const response = await api.get('/teacher/exercise_generator/list', { 
      params: {
        limit: params.limit || 50,
        title_filter: params.title_filter || null
      }
    })
    
    console.log('📋 历史列表响应:', response)
    console.log('📋 响应数据:', response.data)
    
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

// 工具函数：从文件名中提取标题
export const extractTitleFromFilename = (filename: string): string => {
  // 文件名格式: teacher_T2025001_20250610_180152_二叉树.md
  const parts = filename.split('_')
  if (parts.length >= 5) {
    // 提取最后一部分作为标题，去掉.md后缀
    const titlePart = parts.slice(4).join('_') // 处理标题中可能包含下划线的情况
    return titlePart.replace('.md', '')
  }
  return filename.replace('.md', '')
}

// 工具函数：从文件名中提取ID
export const extractIdFromFilename = (filename: string): string => {
  return filename // 使用文件名作为唯一ID
}

// 删除习题历史记录 - 如果有删除接口的话
export const deleteExerciseHistory = async (filename: string): Promise<void> => {
  try {
    // 假设删除接口，可能需要根据实际接口调整
    await api.delete(`/teacher/exercise_generator/delete/${filename}`)
  } catch (error: any) {
    if (!error.response) {
      throw new Error(`网络错误: ${error.message}`)
    }
    
    const errorMessage = error.response?.data?.message || error.response?.data?.detail || '删除失败'
    throw new Error(errorMessage)
  }
}

// 批量删除习题历史记录 - 如果有批量删除接口的话
export const batchDeleteExerciseHistory = async (filenames: string[]): Promise<void> => {
  try {
    // 假设批量删除接口，可能需要根据实际接口调整
    await api.post('/teacher/exercise_generator/batch_delete', { filenames })
  } catch (error: any) {
    if (!error.response) {
      throw new Error(`网络错误: ${error.message}`)
    }
    
    const errorMessage = error.response?.data?.message || error.response?.data?.detail || '批量删除失败'
    throw new Error(errorMessage)
  }
}

// 创建习题历史记录 - 如果有创建接口的话
export const createExerciseHistory = async (data: ExerciseHistoryItem): Promise<void> => {
  try {
    // 使用实际的接口路径
    await api.post('/teacher/exercise_generator/create', data)
    console.log('📥 创建习题历史记录，数据:', data)
  } catch (error: any) {
    if (!error.response) {
      throw new Error(`网络错误: ${error.message}`)
    }
    
    const errorMessage = error.response?.data?.message || error.response?.data?.detail || '创建失败'
    throw new Error(errorMessage)
  }
}

// 更新习题历史记录 - 如果有更新接口的话
export const updateExerciseHistory = async (filename: string, data: Partial<ExerciseHistoryItem>): Promise<void> => {
  try {
    // 使用实际的接口路径
    await api.put(`/teacher/exercise_generator/update/${filename}`, data)
    console.log('✏️ 更新习题历史记录，文件名:', filename, '数据:', data)
  } catch (error: any) {
    if (!error.response) {
      throw new Error(`网络错误: ${error.message}`)
    }
    
    const errorMessage = error.response?.data?.message || error.response?.data?.detail || '更新失败'
    throw new Error(errorMessage)
  }
}

// 获取单个习题历史记录详情 - 根据实际接口路径和参数
export const getExerciseHistoryDetail = async (filename: string): Promise<ExerciseHistoryItem> => {
  try {
    // 使用实际的接口路径
    const response = await api.get(`/teacher/exercise_generator/detail/${filename}`)
    console.log('📋 请求习题历史记录详情，文件名:', filename)
    return response.data
  } catch (error: any) {
    if (!error.response) {
      throw new Error(`网络错误: ${error.message}`)
    }
    
    const status = error.response.status
    const errorData = error.response.data
    
    const errorMessage = errorData?.message || errorData?.detail || error.message || '获取历史记录详情失败'
    if (status === 404) throw new Error('接口不存在')
    if (status === 403) throw new Error('权限不足')
    if (status === 401) throw new Error('认证失败，请重新登录')
    
    throw new Error(errorMessage)
  }
}  