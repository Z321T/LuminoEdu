import axios from 'axios'

// 创建 axios 实例
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  timeout: 60000,
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

// 日志服务接口
export interface LogService {
  name: string
  description: string
}

// 获取日志服务列表响应接口
export interface LogServicesResponse {
  services: LogService[]
}

// 日志条目接口
export interface LogEntry {
  id: number
  timestamp: string
  level: 'INFO' | 'WARNING' | 'ERROR' | 'DEBUG'
  module: string
  user?: string
  message: string
  details?: any
  stackTrace?: string
}

// 获取日志列表请求参数接口
export interface GetLogsRequest {
  service?: string
  level?: string
  module?: string
  user?: string
  start_time?: string
  end_time?: string
  search?: string
  page?: number
  page_size?: number
}

// 获取日志列表响应接口
export interface GetLogsResponse {
  logs: LogEntry[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

// 日志统计接口
export interface LogStats {
  info: number
  warning: number
  error: number
  debug: number
  total: number
}

// 获取日志统计响应接口
export interface LogStatsResponse {
  stats: LogStats
}

// 清空日志响应接口
export interface ClearLogsResponse {
  success: boolean
  message: string
  cleared_count: number
}

// 日志文件接口
export interface LogFile {
  name: string
  date: string
  size: string
}

// 获取日志文件列表请求参数接口
export interface GetLogFilesRequest {
  service_name: string
  start_date?: string
  end_date?: string
}

// 获取日志文件列表响应接口
export interface GetLogFilesResponse {
  files: LogFile[]
  service_name: string
  service_description: string
}

// 获取日志文件内容请求参数接口
export interface GetLogFileContentRequest {
  service_name: string
  file_name: string
}

// 获取日志文件内容响应接口
export interface GetLogFileContentResponse {
  content: string[]
  file_name: string
  service_name: string
}

/**
 * 获取所有可用的日志服务列表
 */
export const getLogServices = async (): Promise<LogServicesResponse> => {
  try {
    console.log('📤 开始获取日志服务列表')
    
    const response = await api.get('/admin/log_management/services')
    
    console.log('📥 获取日志服务列表成功:', response.data)
    return response.data

  } catch (error: any) {
    if (!error.response) {
      throw new Error(`网络错误: ${error.message}`)
    }
    
    const status = error.response.status
    const errorData = error.response.data
    
    switch (status) {
      case 401:
        throw new Error('认证失败，请重新登录')
      case 403:
        throw new Error('权限不足，无法访问日志服务')
      case 404:
        throw new Error('日志服务接口不存在')
      case 500:
        throw new Error(`服务器错误: ${errorData?.detail || '获取日志服务失败'}`)
      default:
        throw new Error(errorData?.message || `获取日志服务失败(${status})`)
    }
  }
}

/**
 * 获取日志列表 - 支持分页和搜索
 */
export const getLogs = async (
  page: number = 1,
  pageSize: number = 50,
  params: Omit<GetLogsRequest, 'page' | 'page_size'> = {},
  retryCount: number = 3
): Promise<GetLogsResponse> => {
  try {
    // 构建查询参数
    const queryParams = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString()
    })
    
    // 添加其他筛选参数
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, String(value))
      }
    })

    try {
      console.log('📤 开始获取日志列表:', { page, pageSize, params })
      
      const response = await api.get(`/admin/log_management/logs?${queryParams}`)
      
      console.log('📥 获取日志列表成功:', response.data)
      return response.data
    } catch (error: any) {
      // 如果是500错误且还有重试次数，进行重试
      if (error.response?.status === 500 && retryCount > 0) {
        console.log(`🔄 日志请求失败，${retryCount}秒后重试...`)
        await new Promise(resolve => setTimeout(resolve, 1000))
        return getLogs(page, pageSize, params, retryCount - 1)
      }
      throw error
    }

  } catch (error: any) {
    if (!error.response) {
      throw new Error(`网络错误: ${error.message}`)
    }
    
    const status = error.response.status
    const errorData = error.response.data
    
    switch (status) {
      case 400:
        throw new Error(`参数验证失败: ${errorData?.detail || '请检查查询参数'}`)
      case 401:
        throw new Error('认证失败，请重新登录')
      case 403:
        throw new Error('权限不足，无法访问日志')
      case 404:
        throw new Error('日志接口不存在')
      case 500:
        throw new Error(`服务器内部错误: ${errorData?.detail || '日志服务暂时不可用'}`)
      default:
        throw new Error(errorData?.message || `获取日志失败(${status})`)
    }
  }
}

/**
 * 获取日志统计信息
 */
export const getLogStats = async (params: Pick<GetLogsRequest, 'service' | 'start_time' | 'end_time'> = {}): Promise<LogStatsResponse> => {
  try {
    console.log('📤 开始获取日志统计:', params)
    
    // 构建查询参数
    const queryParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, String(value))
      }
    })
    
    const response = await api.get(`/admin/log_management/stats?${queryParams}`)
    
    console.log('📥 获取日志统计成功:', response.data)
    return response.data

  } catch (error: any) {
    if (!error.response) {
      throw new Error(`网络错误: ${error.message}`)
    }
    
    const status = error.response.status
    const errorData = error.response.data
    
    switch (status) {
      case 400:
        throw new Error(`参数验证失败: ${errorData?.detail || '请检查查询参数'}`)
      case 401:
        throw new Error('认证失败，请重新登录')
      case 403:
        throw new Error('权限不足，无法访问日志统计')
      case 404:
        throw new Error('日志统计接口不存在')
      case 500:
        throw new Error(`服务器错误: ${errorData?.detail || '获取日志统计失败'}`)
      default:
        throw new Error(errorData?.message || `获取日志统计失败(${status})`)
    }
  }
}

/**
 * 获取单个日志详细信息
 */
export const getLogDetail = async (logId: number): Promise<LogEntry> => {
  try {
    const id = String(logId)
    console.log('📤 开始获取日志详情, ID:', id)
    
    const response = await api.get(`/admin/log_management/logs/${id}`)
    
    console.log('📥 获取日志详情成功:', response.data)
    return response.data

  } catch (error: any) {
    if (!error.response) {
      throw new Error(`网络错误: ${error.message}`)
    }
    
    const status = error.response.status
    const errorData = error.response.data
    
    switch (status) {
      case 400:
        throw new Error('请求参数无效')
      case 401:
        throw new Error('认证失败，请重新登录')
      case 403:
        throw new Error('权限不足，无法访问该日志详情')
      case 404:
        throw new Error(`未找到ID为 ${logId} 的日志记录`)
      case 500:
        throw new Error(`服务器错误: ${errorData?.detail || '获取日志详情失败'}`)
      default:
        throw new Error(errorData?.message || `获取日志详情失败(${status})`)
    }
  }
}

/**
 * 导出日志
 */
export const exportLogs = async (params: GetLogsRequest = {}): Promise<Blob> => {
  try {
    console.log('📤 开始导出日志:', params)
    
    // 构建查询参数
    const queryParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, String(value))
      }
    })
    
    const response = await api.get(`/admin/log_management/export?${queryParams}`, {
      responseType: 'blob',
      timeout: 60000 // 导出可能需要更长时间
    })
    
    console.log('📥 导出日志成功')
    
    const blob = new Blob([response.data], { 
      type: response.headers['content-type'] || 'text/csv;charset=utf-8' 
    })
    
    return blob

  } catch (error: any) {
    if (!error.response) {
      if (error.code === 'ECONNABORTED') {
        throw new Error('导出超时，数据量较大，请稍后重试')
      }
      throw new Error(`网络错误: ${error.message}`)
    }
    
    const status = error.response.status
    const errorData = error.response.data
    
    switch (status) {
      case 400:
        throw new Error('导出参数错误，请检查筛选条件')
      case 401:
        throw new Error('认证失败，请重新登录')
      case 403:
        throw new Error('权限不足，无法导出日志')
      case 404:
        throw new Error('导出接口不存在')
      case 500:
        throw new Error(`服务器错误: ${errorData?.detail || '导出失败'}`)
      default:
        throw new Error(errorData?.message || `导出日志失败(${status})`)
    }
  }
}

/**
 * 清空日志
 */
export const clearLogs = async (service?: string): Promise<ClearLogsResponse> => {
  try {
    console.log('📤 开始清空日志:', { service })
    
    const queryParams = new URLSearchParams()
    if (service) {
      queryParams.append('service', service)
    }
    
    const response = await api.delete(`/admin/log_management/clear?${queryParams}`)
    
    console.log('📥 清空日志成功:', response.data)
    return response.data

  } catch (error: any) {
    if (!error.response) {
      throw new Error(`网络错误: ${error.message}`)
    }
    
    const status = error.response.status
    const errorData = error.response.data
    
    switch (status) {
      case 400:
        throw new Error(`参数验证失败: ${errorData?.detail || '请检查服务参数'}`)
      case 401:
        throw new Error('认证失败，请重新登录')
      case 403:
        throw new Error('权限不足，无法清空日志')
      case 404:
        throw new Error('清空日志接口不存在')
      case 500:
        throw new Error(`服务器错误: ${errorData?.detail || '清空日志失败'}`)
      default:
        throw new Error(errorData?.message || `清空日志失败(${status})`)
    }
  }
}

/**
 * 实时获取最新日志（用于自动刷新）
 */
export const getLatestLogs = async (since?: string): Promise<LogEntry[]> => {
  try {
    console.log('📤 开始获取最新日志:', { since })
    
    const queryParams = new URLSearchParams()
    if (since) {
      queryParams.append('since', since)
    }
    
    const response = await api.get(`/admin/log_management/latest?${queryParams}`)
    
    console.log('📥 获取最新日志成功:', response.data)
    return response.data.logs || []

  } catch (error: any) {
    if (!error.response) {
      throw new Error(`网络错误: ${error.message}`)
    }
    
    const status = error.response.status
    const errorData = error.response.data
    
    switch (status) {
      case 400:
        throw new Error(`参数验证失败: ${errorData?.detail || '请检查时间参数'}`)
      case 401:
        throw new Error('认证失败，请重新登录')
      case 403:
        throw new Error('权限不足，无法访问最新日志')
      case 404:
        throw new Error('最新日志接口不存在')
      case 500:
        throw new Error(`服务器错误: ${errorData?.detail || '获取最新日志失败'}`)
      default:
        throw new Error(errorData?.message || `获取最新日志失败(${status})`)
    }
  }
}

/**
 * 获取指定服务的日志文件列表
 */
export const getLogFiles = async (params: GetLogFilesRequest): Promise<GetLogFilesResponse> => {
  try {
    console.log('📤 开始获取日志文件列表:', params)
    
    if (!params.service_name) {
      throw new Error('服务名称不能为空')
    }
    
    // 构建查询参数
    const queryParams = new URLSearchParams({
      service_name: params.service_name
    })
    
    // 添加可选的日期参数
    if (params.start_date) {
      queryParams.append('start_date', params.start_date)
    }
    if (params.end_date) {
      queryParams.append('end_date', params.end_date)
    }
    
    const response = await api.get(`/admin/log_management/files?${queryParams}`)
    
    console.log('📥 获取日志文件列表成功:', response.data)
    return response.data

  } catch (error: any) {
    if (!error.response) {
      throw new Error(`网络错误: ${error.message}`)
    }
    
    const status = error.response.status
    const errorData = error.response.data
    
    switch (status) {
      case 400:
        throw new Error(`参数验证失败: ${errorData?.detail || '请检查服务名称和日期格式'}`)
      case 401:
        throw new Error('认证失败，请重新登录')
      case 403:
        throw new Error('权限不足，无法访问该服务的日志文件')
      case 404:
        throw new Error(`未找到服务 ${params.service_name} 的日志文件`)
      case 500:
        throw new Error(`服务器错误: ${errorData?.detail || '获取日志文件列表失败'}`)
      default:
        throw new Error(errorData?.message || `获取日志文件列表失败(${status})`)
    }
  }
}

/**
 * 下载指定的日志文件
 */
export const downloadLogFile = async (serviceName: string, fileName: string): Promise<Blob> => {
  try {
    console.log('📤 开始下载日志文件:', { serviceName, fileName })
    
    if (!serviceName || !fileName) {
      throw new Error('服务名称和文件名不能为空')
    }
    
    const queryParams = new URLSearchParams({
      service_name: serviceName,
      file_name: fileName
    })
    
    const response = await api.get(`/admin/log_management/download?${queryParams}`, {
      responseType: 'blob',
      timeout: 120000 // 下载可能需要更长时间
    })
    
    console.log('📥 下载日志文件成功')
    
    const blob = new Blob([response.data], { 
      type: response.headers['content-type'] || 'application/octet-stream' 
    })
    
    return blob

  } catch (error: any) {
    if (!error.response) {
      if (error.code === 'ECONNABORTED') {
        throw new Error('下载超时，文件较大，请稍后重试')
      }
      throw new Error(`网络错误: ${error.message}`)
    }
    
    const status = error.response.status
    const errorData = error.response.data
    
    switch (status) {
      case 400:
        throw new Error('下载参数错误，请检查服务名称和文件名')
      case 401:
        throw new Error('认证失败，请重新登录')
      case 403:
        throw new Error('权限不足，无法下载该日志文件')
      case 404:
        throw new Error(`未找到文件 ${fileName}`)
      case 500:
        throw new Error(`服务器错误: ${errorData?.detail || '下载失败'}`)
      default:
        throw new Error(errorData?.message || `下载日志文件失败(${status})`)
    }
  }
}

/**
 * 获取指定日志文件的内容
 */
export const getLogFileContent = async (params: GetLogFileContentRequest): Promise<GetLogFileContentResponse> => {
  try {
    console.log('📤 开始获取日志文件内容:', params)
    
    if (!params.service_name) {
      throw new Error('服务名称不能为空')
    }
    
    if (!params.file_name) {
      throw new Error('文件名称不能为空')
    }
    
    // 构建查询参数
    const queryParams = new URLSearchParams({
      service_name: params.service_name,
      file_name: params.file_name
    })
    
    const response = await api.get(`/admin/log_management/content?${queryParams}`, {
      timeout: 30000 // 读取文件内容可能需要较长时间
    })
    
    console.log('📥 获取日志文件内容成功:', {
      fileName: response.data.file_name,
      serviceName: response.data.service_name,
      lineCount: response.data.content?.length || 0
    })
    
    return response.data

  } catch (error: any) {
    if (!error.response) {
      if (error.code === 'ECONNABORTED') {
        throw new Error('读取文件超时，文件较大，请稍后重试')
      }
      throw new Error(`网络错误: ${error.message}`)
    }
    
    const status = error.response.status
    const errorData = error.response.data
    
    switch (status) {
      case 400:
        throw new Error(`参数验证失败: ${errorData?.detail || '请检查服务名称和文件名'}`)
      case 401:
        throw new Error('认证失败，请重新登录')
      case 403:
        throw new Error('权限不足，无法访问该日志文件')
      case 404:
        throw new Error(`未找到文件: ${params.file_name}`)
      case 413:
        throw new Error('文件过大，无法直接查看，请下载后查看')
      case 500:
        throw new Error(`服务器错误: ${errorData?.detail || '读取文件内容失败'}`)
      default:
        throw new Error(errorData?.message || `获取日志文件内容失败(${status})`)
    }
  }
}

/**
 * 搜索日志文件内容
 */
export const searchLogFileContent = async (
  serviceName: string, 
  fileName: string, 
  keyword: string,
  caseSensitive: boolean = false
): Promise<{ lines: Array<{lineNumber: number, content: string, matches: number}>, totalMatches: number }> => {
  try {
    console.log('📤 开始搜索日志文件内容:', { serviceName, fileName, keyword, caseSensitive })
    
    const response = await getLogFileContent({ service_name: serviceName, file_name: fileName })
    const content = response.content
    
    const searchKeyword = caseSensitive ? keyword : keyword.toLowerCase()
    const results: Array<{lineNumber: number, content: string, matches: number}> = []
    let totalMatches = 0
    
    content.forEach((line, index) => {
      const searchLine = caseSensitive ? line : line.toLowerCase()
      const matches = (searchLine.match(new RegExp(searchKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length
      
      if (matches > 0) {
        results.push({
          lineNumber: index + 1,
          content: line,
          matches: matches
        })
        totalMatches += matches
      }
    })
    
    console.log('📥 搜索日志文件内容完成:', { 
      lineCount: results.length, 
      totalMatches 
    })
    
    return { lines: results, totalMatches }

  } catch (error: any) {
    console.error('❌ 搜索日志文件内容失败:', error)
    throw error
  }
}

// 工具函数：格式化日志级别
export const formatLogLevel = (level: string): string => {
  const levelMap: Record<string, string> = {
    'INFO': 'ℹ️ 信息',
    'WARNING': '⚠️ 警告',
    'ERROR': '❌ 错误',
    'DEBUG': '🐛 调试'
  }
  return levelMap[level] || level
}

// 工具函数：获取日志级别颜色
export const getLogLevelColor = (level: string): string => {
  const colorMap: Record<string, string> = {
    'INFO': '#3182ce',
    'WARNING': '#d69e2e',
    'ERROR': '#e53e3e',
    'DEBUG': '#805ad5'
  }
  return colorMap[level] || '#4a5568'
}

// 工具函数：格式化时间
export const formatLogTime = (timestamp: string): string => {
  return new Date(timestamp).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// 工具函数：格式化文件大小
export const formatFileSize = (sizeStr: string): string => {
  try {
    const size = parseFloat(sizeStr)
    if (isNaN(size)) return sizeStr
    
    const units = ['B', 'KB', 'MB', 'GB']
    let unitIndex = 0
    let formattedSize = size
    
    while (formattedSize >= 1024 && unitIndex < units.length - 1) {
      formattedSize /= 1024
      unitIndex++
    }
    
    return `${formattedSize.toFixed(2)} ${units[unitIndex]}`
  } catch (error) {
    return sizeStr
  }
}

// 工具函数：格式化文件日期
export const formatFileDate = (dateStr: string): string => {
  try {
    return new Date(dateStr).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (error) {
    return dateStr
  }
}

// 工具函数：验证日期格式
export const validateDateFormat = (date: string): boolean => {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/
  return dateRegex.test(date)
}

// 工具函数：获取文件扩展名
export const getFileExtension = (filename: string): string => {
  const lastDot = filename.lastIndexOf('.')
  return lastDot > 0 ? filename.substring(lastDot + 1).toLowerCase() : ''
}

// 工具函数：判断是否为日志文件
export const isLogFile = (filename: string): boolean => {
  const logExtensions = ['log', 'txt', 'out', 'err']
  const extension = getFileExtension(filename)
  return logExtensions.includes(extension)
}

// 工具函数：本地触发文件下载
export const triggerDownload = (blob: Blob, filename: string): void => {
  try {
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = filename
    link.style.display = 'none'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(link.href)
    
    console.log('📥 文件下载成功:', filename)
  } catch (error) {
    console.error('❌ 文件下载失败:', error)
    throw new Error('文件下载失败，请重试')
  }
}

// 工具函数：解析日志行
export const parseLogLine = (line: string): {
  timestamp?: string,
  level?: string,
  module?: string,
  message?: string,
  raw: string
} => {
  try {
    // 常见的日志格式正则
    const patterns = [
      // 2024-01-01 12:00:00 [INFO] module: message
      /^(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2})\s*\[(\w+)\]\s*(\w+):\s*(.+)$/,
      // 2024-01-01T12:00:00Z INFO module: message  
      /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z?)\s+(\w+)\s+(\w+):\s*(.+)$/,
      // [2024-01-01 12:00:00] INFO module - message
      /^\[(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2})\]\s+(\w+)\s+(\w+)\s*-\s*(.+)$/
    ]
    
    for (const pattern of patterns) {
      const match = line.match(pattern)
      if (match) {
        return {
          timestamp: match[1],
          level: match[2],
          module: match[3],
          message: match[4],
          raw: line
        }
      }
    }
    
    // 如果没有匹配到任何格式，返回原始内容
    return { raw: line }
    
  } catch (error) {
    return { raw: line }
  }
}

// 工具函数：按日志级别过滤内容
export const filterLogContentByLevel = (content: string[], level: string): string[] => {
  if (!level || level === 'ALL' || level === '') return content
  
  return content.filter(line => {
    const parsed = parseLogLine(line)
    return parsed.level?.toLowerCase() === level.toLowerCase()
  })
}

// 工具函数：按时间范围过滤内容
export const filterLogContentByTime = (
  content: string[], 
  startTime?: string, 
  endTime?: string
): string[] => {
  if (!startTime && !endTime) return content
  
  const start = startTime ? new Date(startTime) : null
  const end = endTime ? new Date(endTime) : null
  
  return content.filter(line => {
    const parsed = parseLogLine(line)
    if (!parsed.timestamp) return true // 保留无时间戳的行
    
    try {
      const lineTime = new Date(parsed.timestamp)
      
      if (start && lineTime < start) return false
      if (end && lineTime > end) return false
      
      return true
    } catch (error) {
      return true // 时间解析失败时保留该行
    }
  })
}

// 工具函数：高亮关键词
export const highlightKeywords = (
  text: string, 
  keywords: string[], 
  caseSensitive: boolean = false
): string => {
  if (!keywords.length) return text
  
  let result = text
  
  keywords.forEach(keyword => {
    if (!keyword.trim()) return
    
    const flags = caseSensitive ? 'g' : 'gi'
    const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regex = new RegExp(`(${escapedKeyword})`, flags)
    
    result = result.replace(regex, '<mark class="log-highlight">$1</mark>')
  })
  
  return result
}

// 工具函数：统计日志级别分布
export const analyzeLogContent = (content: string[]): {
  totalLines: number,
  levelStats: Record<string, number>,
  timeRange: { start?: string, end?: string },
  moduleStats: Record<string, number>
} => {
  const levelStats: Record<string, number> = {}
  const moduleStats: Record<string, number> = {}
  let earliest: Date | null = null
  let latest: Date | null = null
  
  content.forEach(line => {
    const parsed = parseLogLine(line)
    
    // 统计级别
    if (parsed.level) {
      const level = parsed.level.toUpperCase()
      levelStats[level] = (levelStats[level] || 0) + 1
    }
    
    // 统计模块
    if (parsed.module) {
      moduleStats[parsed.module] = (moduleStats[parsed.module] || 0) + 1
    }
    
    // 统计时间范围
    if (parsed.timestamp) {
      try {
        const time = new Date(parsed.timestamp)
        if (!earliest || time < earliest) earliest = time
        if (!latest || time > latest) latest = time
      } catch (error) {
        // 忽略时间解析错误
      }
    }
  })
  
  return {
    totalLines: content.length,
    levelStats,
    timeRange: {
      start: earliest?.toISOString(),
      end: latest?.toISOString()
    },
    moduleStats
  }
}

// 工具函数：获取日志行的CSS类名
export const getLogLineClass = (line: string): string => {
  const parsed = parseLogLine(line)
  if (parsed.level) {
    return parsed.level.toLowerCase()
  }
  return ''
}

// 工具函数：本地导出为CSV
export const exportLocalCsv = (logs: LogEntry[], filename: string = 'logs.csv'): void => {
  try {
    console.log('📤 开始本地导出日志:', { count: logs.length, filename })
    
    const headers = ['时间', '级别', '模块', '用户', '消息']
    const csvContent = [
      headers.join(','),
      ...logs.map(log => [
        formatLogTime(log.timestamp),
        log.level,
        log.module,
        log.user || '',
        `"${log.message.replace(/"/g, '""')}"`
      ].join(','))
    ].join('\n')

    // 添加 BOM 以确保中文正确显示
    const blob = new Blob(['\ufeff' + csvContent], { 
      type: 'text/csv;charset=utf-8;' 
    })
    
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = filename
    link.style.display = 'none'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(link.href)
    
    console.log('📥 本地导出日志成功')
  } catch (error) {
    console.error('❌ 本地导出日志失败:', error)
    throw new Error('本地导出失败，请重试')
  }
}

// 工具函数：防抖函数
export const debounce = (func: Function, wait: number): Function => {
  let timeout: NodeJS.Timeout | null = null
  
  return function executedFunction(...args: any[]) {
    const later = () => {
      if (timeout) clearTimeout(timeout)
      func(...args)
    }
    
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// 工具函数：节流函数
export const throttle = (func: Function, limit: number): Function => {
  let inThrottle: boolean = false
  
  return function(...args: any[]) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

// 工具函数：深度克隆
export const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj.getTime()) as any
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as any
  if (typeof obj === 'object') {
    const copy: any = {}
    Object.keys(obj).forEach(key => {
      copy[key] = deepClone((obj as any)[key])
    })
    return copy
  }
  return obj
}

// 工具函数：格式化字节大小
export const formatBytes = (bytes: number, decimals: number = 2): string => {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB']
  
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

// 工具函数：复制到剪贴板
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    } else {
      // 降级方案
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      const successful = document.execCommand('copy')
      document.body.removeChild(textarea)
      return successful
    }
  } catch (error) {
    console.error('复制到剪贴板失败:', error)
    return false
  }
}

// 工具函数：判断是否为移动设备
export const isMobile = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

// 工具函数：滚动到顶部
export const scrollToTop = (element?: HTMLElement): void => {
  const target = element || window
  if (target instanceof Window) {
    target.scrollTo({ top: 0, behavior: 'smooth' })
  } else {
    target.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

/**
 * 导出指定服务的日志文件（合并多个文件）
 */
export const exportServiceLogs = async (
  serviceName: string,
  startDate?: string,
  endDate?: string
): Promise<Blob> => {
  try {
    console.log('📤 开始导出服务日志:', { serviceName, startDate, endDate })
    
    if (!serviceName) {
      throw new Error('服务名称不能为空')
    }
    
    // 构建查询参数
    const queryParams = new URLSearchParams({
      service_name: serviceName
    })
    
    // 添加可选的日期参数
    if (startDate) {
      queryParams.append('start_date', startDate)
    }
    if (endDate) {
      queryParams.append('end_date', endDate)
    }
    
    const response = await api.get(`/admin/log_management/export_service_logs?${queryParams}`, {
      responseType: 'blob',
      timeout: 120000 // 导出可能需要较长时间
    })
    
    console.log('📥 导出服务日志成功')
    
    const blob = new Blob([response.data], { 
      type: response.headers['content-type'] || 'text/plain;charset=utf-8' 
    })
    
    return blob

  } catch (error: any) {
    if (!error.response) {
      if (error.code === 'ECONNABORTED') {
        throw new Error('导出超时，日志文件较大，请稍后重试')
      }
      throw new Error(`网络错误: ${error.message}`)
    }
    
    const status = error.response.status
    const errorData = error.response.data
    
    switch (status) {
      case 400:
        throw new Error(`参数验证失败: ${errorData?.detail || '请检查服务名称和日期格式'}`)
      case 401:
        throw new Error('认证失败，请重新登录')
      case 403:
        throw new Error('权限不足，无法导出该服务的日志')
      case 404:
        throw new Error(`未找到服务 ${serviceName} 的日志文件`)
      case 500:
        throw new Error(`服务器错误: ${errorData?.detail || '导出日志失败'}`)
      default:
        throw new Error(errorData?.message || `导出日志文件失败(${status})`)
    }
  }
}