import axios from 'axios'

// 创建 axios 实例
const api = axios.create({
  timeout: 60000, // 增加超时时间到60秒，因为AI生成可能需要较长时间
})

// 请求拦截器 - 添加认证信息
api.interceptors.request.use(
  (config) => {
    // 从 localStorage 获取 token（与登录系统保持一致）
    const token = localStorage.getItem('token')
    
    if (token) {
      // 使用 Bearer token 格式，这是最常见的JWT认证方式
      config.headers.Authorization = `Bearer ${token}`
    }
    
    console.log('🚀 发送请求:', {
      url: config.url,
      method: config.method,
      data: config.data,
      params: config.params,
      headers: config.headers
    })
    return config
  },
  (error) => {
    console.error('❌ 请求拦截器错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器 - 处理认证错误
api.interceptors.response.use(
  (response) => {
    console.log('✅ 响应成功:', {
      status: response.status,
      data: response.data,
      url: response.config.url
    })
    return response
  },
  (error) => {
    console.error('❌ 响应错误:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url,
      message: error.message,
      code: error.code
    })
    
    if (error.response?.status === 401) {
      console.error('认证失败，token可能已过期')
      // 清除本地存储的认证信息
      localStorage.removeItem('token')
      
      // 跳转到登录页
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// 定义请求参数类型
export interface ExerciseGenerateRequest {
  content: string
  title: string
  count: number
  types: number[]
}

// 定义生成响应数据类型
export interface ExerciseGenerateResponse {
  code: number
  data: string // 后端返回的文件路径
  message?: string
}

// 定义获取内容响应数据类型
export interface ExerciseContentResponse {
  code: number
  data: string // 后端返回的markdown内容
  message?: string
}

// 题目类型枚举
export enum ExerciseType {
  CHOICE = 1,    // 选择题
  FILL = 2,      // 填空题
  ESSAY = 3      // 简答题
}

// 题目类型映射
export const typeMapping = {
  'choice': ExerciseType.CHOICE,
  'fill': ExerciseType.FILL,
  'essay': ExerciseType.ESSAY
}

// 习题生成API - 返回文件路径
export const generateExercises = async (params: ExerciseGenerateRequest): Promise<any> => {
  try {
    console.log('📝 开始发送习题生成请求:', params)
    
    // 验证参数
    if (!params.content || !params.title) {
      throw new Error('内容和标题不能为空')
    }
    
    if (!params.types || params.types.length === 0) {
      throw new Error('必须选择至少一种题目类型')
    }
    
    console.log('🌐 准备发送请求到:', '/teacher/exercise_generator/generate')
    
    const response = await api.post('/teacher/exercise_generator/generate', params)
    
    console.log('📋 习题生成原始响应:', response)
    console.log('📋 习题生成响应数据:', response.data)
    
    // 直接返回后端的响应数据，让前端处理
    return response.data
    
  } catch (error) {
    console.error('💥 习题生成详细错误信息:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      statusText: error.response?.statusText,
      config: error.config,
      code: error.code,
      name: error.name
    })
    
    // 处理网络相关错误
    if (!error.response) {
      if (error.code === 'ECONNABORTED') {
        throw new Error('请求超时，AI生成时间较长，请稍后重试')
      } else if (error.code === 'ERR_NETWORK') {
        throw new Error('网络连接失败，请检查网络连接或服务器状态')
      } else if (error.code === 'ERR_CONNECTION_REFUSED') {
        throw new Error('连接被拒绝，请检查服务器是否正在运行')
      } else {
        throw new Error(`网络错误: ${error.message}`)
      }
    }
    
    // 处理HTTP状态码错误
    if (error.response?.status === 401) {
      throw new Error('认证失败，请重新登录')
    } else if (error.response?.status === 403) {
      throw new Error('权限不足，请联系管理员')
    } else if (error.response?.status === 404) {
      throw new Error('API接口不存在，请检查后端服务')
    } else if (error.response?.status === 422) {
      const errorDetail = error.response?.data?.detail
      if (Array.isArray(errorDetail)) {
        const errorMessages = errorDetail.map(err => `${err.loc?.join('.')}: ${err.msg}`).join('; ')
        throw new Error(`参数验证失败: ${errorMessages}`)
      } else {
        throw new Error(`参数验证失败: ${errorDetail || '请检查输入参数'}`)
      }
    } else if (error.response?.status === 500) {
      throw new Error(`服务器内部错误: ${error.response?.data?.detail || '请稍后重试'}`)
    } else {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.detail || 
                          error.message || 
                          '未知错误'
      throw new Error(`生成失败: ${errorMessage}`)
    }
  }
}

// 获取习题内容API - 通过文件路径获取markdown内容
export const getExerciseContent = async (filePath: string): Promise<any> => {
  try {
    console.log('📁 原始文件路径:', filePath)
    
    if (!filePath) {
      throw new Error('文件路径不能为空')
    }
    
    // 处理Windows路径 - 将反斜杠转换为正斜杠
    const normalizedPath = filePath.replace(/\\/g, '/')
    console.log('📁 标准化文件路径:', normalizedPath)
    
    // 尝试多种参数传递方式
    const requestConfig = {
      params: { 
        path: normalizedPath,
        file_path: normalizedPath,  // 可能后端期望这个参数名
        filePath: normalizedPath    // 或者这个参数名
      }
    }
    
    console.log('📁 发送请求配置:', requestConfig)
    
    const response = await api.get('/teacher/exercise_generator/file_md_content', requestConfig)
    
    console.log('📄 获取内容原始响应:', response)
    console.log('📄 获取内容响应数据:', response.data)
    
    // 直接返回后端的响应数据，让前端处理
    return response.data
    
  } catch (error) {
    console.error('💥 获取习题内容详细错误信息:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      statusText: error.response?.statusText,
      filePath: filePath,
      code: error.code,
      config: error.config
    })
    
    // 特别处理 422 错误
    if (error.response?.status === 422) {
      const errorDetail = error.response?.data?.detail
      if (Array.isArray(errorDetail)) {
        const errorMessages = errorDetail.map(err => {
          const location = err.loc?.join('.') || '未知字段'
          const message = err.msg || '验证失败'
          return `${location}: ${message}`
        }).join('; ')
        throw new Error(`参数验证失败: ${errorMessages}`)
      } else if (typeof errorDetail === 'string') {
        throw new Error(`参数验证失败: ${errorDetail}`)
      } else {
        throw new Error(`参数验证失败，请检查文件路径格式: ${filePath}`)
      }
    }
    
    // 处理网络相关错误
    if (!error.response) {
      if (error.code === 'ERR_NETWORK') {
        throw new Error('网络连接失败，请检查网络连接或服务器状态')
      } else {
        throw new Error(`网络错误: ${error.message}`)
      }
    }
    
    // 处理HTTP状态码错误
    if (error.response?.status === 401) {
      throw new Error('认证失败，请重新登录')
    } else if (error.response?.status === 404) {
      throw new Error('文件不存在或已被删除')
    } else if (error.response?.status === 403) {
      throw new Error('权限不足，无法访问该文件')
    } else {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.detail || 
                          error.message || 
                          '未知错误'
      throw new Error(`获取内容失败: ${errorMessage}`)
    }
  }
}

// 工具函数：将前端类型转换为后端类型
export const convertTypeToBackend = (frontendType: string): number => {
  const result = typeMapping[frontendType] || ExerciseType.CHOICE
  console.log(`🔄 类型转换: ${frontendType} -> ${result}`)
  return result
}

// 工具函数：检查是否已登录
export const checkAuthStatus = (): boolean => {
  const token = localStorage.getItem('token')
  const hasToken = !!token
  console.log(`🔐 认证状态检查: ${hasToken ? '已登录' : '未登录'}`)
  if (hasToken) {
    console.log('🎫 Token 长度:', token.length)
  }
  return hasToken
}

// 工具函数：测试网络连接
export const testConnection = async (): Promise<boolean> => {
  try {
    console.log('🔍 测试网络连接...')
    const response = await api.get('/teacher/exercise_generator/test', { timeout: 5000 })
    console.log('✅ 网络连接正常')
    return true
  } catch (error) {
    console.error('❌ 网络连接测试失败:', error)
    return false
  }
}