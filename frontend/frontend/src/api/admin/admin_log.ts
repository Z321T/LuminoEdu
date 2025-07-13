import axios from 'axios'

// 创建 axios 实例
const api = axios.create({
  baseURL: 'http://localhost:8000',
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
 * 导出指定服务的日志文件
 * @description 获取指定服务的所有日志文件并合并为一个文件，支持按日期范围筛选
 * @param serviceName 日志服务名称
 * @param startDate 开始日期 (YYYY-MM-DD)，可选
 * @param endDate 结束日期 (YYYY-MM-DD)，可选
 * @returns 合并后的日志文件内容 Blob
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
    
    const response = await api.get(`/admin/log_management/export?${queryParams}`, {
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

