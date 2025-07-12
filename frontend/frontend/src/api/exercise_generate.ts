import axios from 'axios'

// 创建 axios 实例
const api = axios.create({
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

// 类型定义
export interface ExerciseGenerateRequest {
  content: string
  title: string
  count: number
  types: number[]
}

export enum ExerciseType {
  CHOICE = 1,
  FILL = 2,
  ESSAY = 3
}

export const typeMapping = {
  'choice': ExerciseType.CHOICE,
  'fill': ExerciseType.FILL,
  'essay': ExerciseType.ESSAY
}

// 习题生成API - 返回文件名
export const generateExercises = async (params: ExerciseGenerateRequest): Promise<string> => {
  try {
    // 参数验证
    if (!params.content || !params.title) {
      throw new Error('内容和标题不能为空')
    }
    if (!params.types || params.types.length === 0) {
      throw new Error('必须选择至少一种题目类型')
    }

    const response = await api.post('/teacher/exercise_generator/generate', params)
    
    // 提取文件名
    const data = response.data
    const fileName = data?.md_filename || data?.filename || data?.data || data
    
    if (!fileName || typeof fileName !== 'string') {
      throw new Error('无法从响应中获取有效文件名')
    }
    
    return fileName
    
  } catch (error) {
    // 统一错误处理
    if (!error.response) {
      if (error.code === 'ECONNABORTED') {
        throw new Error('请求超时，AI生成时间较长，请稍后重试')
      }
      throw new Error(`网络错误: ${error.message}`)
    }
    
    const status = error.response.status
    const errorData = error.response.data
    
    if (status === 401) throw new Error('认证失败，请重新登录')
    if (status === 403) throw new Error('权限不足，请联系管理员')  
    if (status === 404) throw new Error('API接口不存在，请检查后端服务')
    if (status === 422) {
      const detail = errorData?.detail
      if (Array.isArray(detail)) {
        const errors = detail.map(err => `${err.loc?.join('.')}: ${err.msg}`).join('; ')
        throw new Error(`参数验证失败: ${errors}`)
      }
      throw new Error(`参数验证失败: ${detail || '请检查输入参数'}`)
    }
    if (status === 500) throw new Error(`服务器内部错误: ${errorData?.detail || '请稍后重试'}`)
    
    const errorMessage = errorData?.message || errorData?.detail || error.message || '未知错误'
    throw new Error(`生成失败: ${errorMessage}`)
  }
}

// 获取习题内容API - 修正响应格式处理
export const getExerciseContent = async (fileName: string): Promise<any> => {
  try {
    if (!fileName) {
      throw new Error('文件名不能为空')
    }

    const response = await api.get(`/teacher/exercise_generator/file_md_content/${fileName}`)
    
    // 处理不同的响应格式
    const data = response.data
    
    // 如果响应有 content 字段，直接返回内容
    if (data && typeof data === 'object' && data.content) {
      return data.content
    }
    
    // 如果响应有 data 字段
    if (data && typeof data === 'object' && data.data) {
      return data.data
    }
    
    // 如果响应直接是字符串
    if (typeof data === 'string') {
      return data
    }
    
    // 如果是标准格式 {code: 200, data: ...}
    if (data && data.code === 200 && data.data) {
      return data.data
    }
    
    // 否则直接返回原始响应数据
    return data
    
  } catch (error) {
    // 统一错误处理
    if (!error.response) {
      throw new Error(`网络错误: ${error.message}`)
    }
    
    const status = error.response.status
    const errorData = error.response.data
    
    if (status === 401) throw new Error('认证失败，请重新登录')
    if (status === 403) throw new Error('权限不足，无法访问该文件')
    if (status === 404) throw new Error('文件不存在或已被删除')
    if (status === 422) {
      const detail = errorData?.detail
      if (Array.isArray(detail)) {
        const errors = detail.map(err => `${err.loc?.join('.')}: ${err.msg}`).join('; ')
        throw new Error(`参数验证失败: ${errors}`)
      }
      throw new Error(`参数验证失败: ${detail}`)
    }
    
    const errorMessage = errorData?.message || errorData?.detail || error.message || '未知错误'
    throw new Error(`获取内容失败: ${errorMessage}`)
  }
}

// 下载习题文件API
export const downloadExerciseFile = async (fileName: string): Promise<void> => {
  try {
    if (!fileName) {
      throw new Error('文件名不能为空')
    }

    console.log('📁 准备下载文件:', fileName)

    const response = await api.get(`/teacher/exercise_generator/download/${fileName}`, {
      responseType: 'blob', // 重要：指定响应类型为blob
    })

    console.log('📄 下载响应:', response)

    // 创建blob对象
    const blob = new Blob([response.data], { 
      type: response.headers['content-type'] || 'text/markdown;charset=utf-8' 
    })

    // 创建下载链接
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    
    // 从响应头获取文件名，如果没有则使用传入的文件名
    const contentDisposition = response.headers['content-disposition']
    let downloadFileName = fileName
    
    if (contentDisposition) {
      const fileNameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)
      if (fileNameMatch && fileNameMatch[1]) {
        downloadFileName = fileNameMatch[1].replace(/['"]/g, '')
      }
    }
    
    link.download = downloadFileName
    link.style.display = 'none'

    // 触发下载
    document.body.appendChild(link)
    link.click()

    // 清理
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    console.log('✅ 文件下载成功:', downloadFileName)

  } catch (error) {
    console.error('💥 下载文件失败:', error)
    
    // 统一错误处理
    if (!error.response) {
      throw new Error(`网络错误: ${error.message}`)
    }
    
    const status = error.response.status
    const errorData = error.response.data
    
    if (status === 401) throw new Error('认证失败，请重新登录')
    if (status === 403) throw new Error('权限不足，无法下载该文件')
    if (status === 404) throw new Error('文件不存在或已被删除')
    if (status === 422) {
      const detail = errorData?.detail
      if (Array.isArray(detail)) {
        const errors = detail.map(err => `${err.loc?.join('.')}: ${err.msg}`).join('; ')
        throw new Error(`参数验证失败: ${errors}`)
      }
      throw new Error(`参数验证失败: ${detail}`)
    }
    
    const errorMessage = errorData?.message || errorData?.detail || error.message || '未知错误'
    throw new Error(`下载失败: ${errorMessage}`)
  }
}

// 更新现有的下载函数，支持从服务器下载
export const downloadExercisesFromServer = async (fileName: string): Promise<void> => {
  try {
    await downloadExerciseFile(fileName)
    
    // 显示成功提示
    showSuccessNotification(`文件 "${fileName}" 下载成功！`)

  } catch (error) {
    console.error('下载失败:', error)
    throw error
  }
}

// 工具函数：显示成功通知
const showSuccessNotification = (message: string): void => {
  const successMsg = document.createElement('div')
  successMsg.textContent = message
  successMsg.style.cssText = `
    position: fixed; top: 20px; right: 20px; z-index: 9999;
    background: #28a745; color: white; padding: 12px 20px;
    border-radius: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    font-size: 14px; font-weight: 500;
  `
  document.body.appendChild(successMsg)

  // 3秒后移除提示
  setTimeout(() => {
    if (document.body.contains(successMsg)) {
      document.body.removeChild(successMsg)
    }
  }, 3000)
}

// 工具函数
export const convertTypeToBackend = (frontendType: string): number => {
  return typeMapping[frontendType] || ExerciseType.CHOICE
}

export const checkAuthStatus = (): boolean => {
  return !!localStorage.getItem('token')
}

// 组合函数 - 一步完成生成和获取内容
export const generateExercisesSimple = async (params: ExerciseGenerateRequest): Promise<{ fileName: string, content: string }> => {
  try {
    // 生成习题
    const fileName = await generateExercises(params)
    
    // 获取内容 - 现在 getExerciseContent 已经处理了各种响应格式
    const content = await getExerciseContent(fileName)
    
    // 验证内容
    if (!content || typeof content !== 'string') {
      throw new Error('获取到的内容无效')
    }
    
    return { fileName, content }
    
  } catch (error) {
    throw error
  }
}