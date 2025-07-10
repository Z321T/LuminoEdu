import axios from 'axios'
import * as XLSX from 'xlsx' 

// 创建 axios 实例
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000', // 确保使用正确的API基础路径
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
export interface CreateTeachersRequest {
  file: File
}

export interface CreateTeachersResponse {
  total: number
  success_count: number
  failed_count: number
  failed_records: Array<{
    username: string
    success: boolean
    error: string
  }>
}

export interface Teacher {
  id: string
  name: string
  subject: string
  email: string
  phone: string
  workId?: string
  remark?: string
  createdAt: string
}

/**
 * 批量创建教师 - 修复API路径
 */
export const createTeachers = async (file: File): Promise<CreateTeachersResponse> => {
  try {
    // 参数校验
    if (!file) throw new Error('请选择要上传的文件')
    if (!file.name) throw new Error('文件名不能为空')

    const fileExtension = file.name.split('.').pop()?.toLowerCase()
    const validExtensions = ['xlsx', 'xls', 'csv']
    if (!validExtensions.includes(fileExtension || '')) {
      throw new Error('文件格式不支持。请上传Excel文件(.xlsx, .xls)或CSV文件(.csv)')
    }
    if (file.size > 10 * 1024 * 1024) throw new Error('文件过大，请确保文件大小不超过10MB')
    if (file.size === 0) throw new Error('文件不能为空')

    // 构建 FormData
    const formData = new FormData()
    formData.append('file', file)

    // 发起请求
    const response = await api.post('/admin/user_management/create_teachers', formData, {
      timeout: 30000,
    })

    // 解析响应
    const data = response.data
    return {
      total: data.total || 0,
      success_count: data.success_count || 0,
      failed_count: data.failed_count || 0,
      failed_records: data.failed_records || []
    }
  } catch (error: any) {
    // 统一错误处理
    if (!error.response) {
      if (error.code === 'ECONNABORTED') {
        throw new Error('请求超时，文件上传时间较长，请稍后重试')
      }
      throw new Error(`网络错误: ${error.message}`)
    }
    const status = error.response.status
    const errorData = error.response.data
    if (status === 401) throw new Error('认证失败，请重新登录')
    if (status === 403) throw new Error('权限不足，请联系管理员')
    if (status === 404) throw new Error('接口不存在，请检查后端服务')
    if (status === 422) {
      const detail = errorData?.detail
      if (Array.isArray(detail)) {
        const errors = detail.map((err: any) => `${err.loc?.join('.')}: ${err.msg}`).join('; ')
        throw new Error(`参数验证失败: ${errors}`)
      }
      throw new Error(`参数验证失败: ${detail || '请检查文件内容'}`)
    }
    if (status === 500) throw new Error(`服务器内部错误: ${errorData?.detail || '请稍后重试'}`)
    const errorMessage = errorData?.message || errorData?.detail || error.message || '未知错误'
    throw new Error(`批量创建失败: ${errorMessage}`)
  }
}

/**
 * 下载教师Excel导入模板 - 根据后端要求修复格式
 */
export const downloadTeacherTemplate = async (): Promise<Blob> => {
  try {
    console.log('📤 请求下载教师Excel模板')
    
    const response = await api.get('/admin/user_management/teacher_template', {
      responseType: 'blob'
    })

    console.log('📥 教师Excel模板下载成功')
    
    const blob = new Blob([response.data], { 
      type: response.headers['content-type'] || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    })
    
    return blob
    
  } catch (error: any) {
    console.error('❌ 下载教师Excel模板失败，生成本地Excel模板:', error)
    
    // 创建工作簿和工作表
    const wb = XLSX.utils.book_new()
    
    // 定义模板数据
    const templateData = [
      ['姓名', '密码', '教工号', '所属院系'],
      ['张三', '123456', 'T001', '数学系'],
      ['李四', '123456', 'T002', '语文系'],
      ['王五', '123456', 'T003', '英语系'],
      ['赵六', '123456', 'T004', '物理系'],
      ['孙七', '123456', 'T005', '化学系'],
      ['钱八', '123456', 'T006', '生物系'],
      ['周九', '123456', 'T007', '历史系'],
      ['吴十', '123456', 'T008', '地理系'],
      ['', '', '', ''] // 空行供用户填写
    ]
    
    // 创建工作表
    const ws = XLSX.utils.aoa_to_sheet(templateData)
    
    // 设置列宽
    const wscols = [
      {wch: 15}, // 姓名列宽
      {wch: 15}, // 密码列宽
      {wch: 15}, // 教工号列宽
      {wch: 20}  // 所属院系列宽
    ]
    ws['!cols'] = wscols
    
    // 将工作表添加到工作簿
    XLSX.utils.book_append_sheet(wb, ws, '教师导入模板')
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
 console.log('✅ 使用本地生成的教师Excel模板（.xlsx格式）')
return blob
    
    
   

  }
}



// 添加教师列表响应接口
export interface TeacherListResponse {
  total: number
  page: number
  page_size: number
  teachers: Array<{
    id: number
    username: string
    staff_id: string
    department: string
  }>
}
/**
 * 获取教师列表 - 修复API路径
 */
export const getTeacherList = async (
  page: number = 1,
  pageSize: number = 20,
  search?: string,
  retryCount: number = 3
): Promise<TeacherListResponse> => {
  try {
    // 构建查询参数
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString()
    })
    
    if (search) {
      params.append('search', search)
    }

    try {
      const response = await api.get(`/admin/user_management/list_teachers?${params}`)
      return response.data
    } catch (error: any) {
      // 如果是500错误且还有重试次数，进行重试
      if (error.response?.status === 500 && retryCount > 0) {
        console.log(`🔄 搜索请求失败，${retryCount}秒后重试...`)
        await new Promise(resolve => setTimeout(resolve, 1000))
        return getTeacherList(page, pageSize, search, retryCount - 1)
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
        throw new Error('搜索参数无效，请检查输入')
      case 401:
        throw new Error('认证失败，请重新登录')
      case 403:
        throw new Error('权限不足，无法获取教师列表')
      case 404:
        throw new Error('教师列表接口不存在')
      case 500:
        throw new Error(`服务器内部错误: ${errorData?.detail || '搜索服务暂时不可用'}`)
      default:
        throw new Error(errorData?.message || `获取教师列表失败(${status})`)
    }
  }
}

// 添加教师详情接口
export interface TeacherDetail {
  id: number
  username: string
  staff_id: string
  department: string
  created_at: string
  expertise: string
  intro: string
  contact_email: string
  office_location: string
}


/**
 * 获取单个教师详细信息
 */
export const getTeacherDetail = async (teacherId: string): Promise<TeacherDetail> => {
  try {
    // 确保 teacherId 为字符串类型
    const id = String(teacherId)
    const response = await api.get(`/admin/user_management/teacher_detail/${id}`)
    console.log("@@",response.data);
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
        throw new Error('权限不足，无法访问该教师信息')
      case 404:
        throw new Error('未找到该教师')
      case 500:
        throw new Error(`服务器错误: ${errorData?.detail || '获取教师信息失败'}`)
      default:
        throw new Error(errorData?.message || `获取教师信息失败(${status})`)
    }
  }
}

/**
 * 更新教师信息 - 修复API路径
 */
export const updateTeacher = async (teacherId: string, updateData: Partial<Teacher>): Promise<void> => {
  try {
    console.log('📤 请求更新教师信息:', teacherId, updateData)
    
    const response = await api.put(`/admin/user_management/update_teacher/${teacherId}`, updateData)
    
    console.log('📥 教师信息更新成功:', response.data)
    
  } catch (error: any) {
    console.error('❌ 更新教师信息失败:', error)
    
    if (!error.response) {
      throw new Error(`网络错误: ${error.message}`)
    }
    
    const status = error.response.status
    const errorData = error.response.data
    
    if (status === 401) throw new Error('认证失败，请重新登录')
    if (status === 403) throw new Error('权限不足，无法更新教师信息')
    if (status === 404) throw new Error('教师不存在')
    if (status === 422) throw new Error('输入数据格式错误')
    if (status === 500) throw new Error('服务器内部错误，请稍后重试')
    
    const errorMessage = errorData?.detail || errorData?.message || error.message || '未知错误'
    throw new Error(`更新教师信息失败: ${errorMessage}`)
  }
}

/**
 * 重置教师密码 - 修复API路径
 */
export const resetTeacherPassword = async (teacherId: string, newPassword: string): Promise<void> => {
  try {
    console.log('📤 请求重置教师密码:', teacherId)
    
    const response = await api.post(`/admin/user_management/reset_teacher_password/${teacherId}`, {
      new_password: newPassword
    })
    
    console.log('📥 教师密码重置成功:', response.data)
    
  } catch (error: any) {
    console.error('❌ 重置教师密码失败:', error)
    
    if (!error.response) {
      throw new Error(`网络错误: ${error.message}`)
    }
    
    const status = error.response.status
    const errorData = error.response.data
    
    if (status === 401) throw new Error('认证失败，请重新登录')
    if (status === 403) throw new Error('权限不足，无法重置密码')
    if (status === 404) throw new Error('教师不存在')
    if (status === 422) throw new Error('密码格式不正确')
    if (status === 500) throw new Error('服务器内部错误，请稍后重试')
    
    const errorMessage = errorData?.detail || errorData?.message || error.message || '未知错误'
    throw new Error(`重置教师密码失败: ${errorMessage}`)
  }
}

/**
 * 测试连接 - 修复API路径
 */
export const testConnection = async (): Promise<boolean> => {
  try {
    const response = await api.get('/admin/user_management/list_teachers?page=1&page_size=1')
    return response.status === 200
  } catch (error) {
    console.error('❌ 连接测试失败:', error)
    return false
  }
}




/**
 * 下载学生Excel导入模板
 */
export const downloadStudentTemplate = async (): Promise<Blob> => {
  try {
    console.log('📤 请求下载学生Excel模板')
    
    const response = await api.get('/admin/user_management/student_template', {
      responseType: 'blob'
    })

    console.log('📥 学生Excel模板下载成功')
    
    const blob = new Blob([response.data], { 
      type: response.headers['content-type'] || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    })
    
    return blob
    
  } catch (error: any) {
    console.error('❌ 下载学生Excel模板失败，生成本地Excel模板:', error)
    
    // 创建工作簿和工作表
    const wb = XLSX.utils.book_new()
    
    // 定义模板数据 - 学生版本
    const templateData = [
      ['姓名', '密码', '学号', '学院', '专业', '年级', '入学年份'],
      ['张三', '123456', 'S001', '计算机学院', '软件工程', '2023级', '2023'],
      ['李四', '123456', 'S002', '信息学院', '通信工程', '2023级', '2023'],
      ['王五', '123456', 'S003', '经管学院', '工商管理', '2023级', '2023'],
      ['赵六', '123456', 'S004', '外国语学院', '英语', '2023级', '2023'], 
      ['孙七', '123456', 'S005', '艺术学院', '数字媒体', '2023级', '2023'],
      ['', '', '', '', '', '', ''] // 空行供用户填写
    ]
    
    // 创建工作表
    const ws = XLSX.utils.aoa_to_sheet(templateData)
    
    // 设置列宽
    const wscols = [
      {wch: 15}, // 姓名列宽
      {wch: 15}, // 密码列宽 
      {wch: 15}, // 学号列宽
      {wch: 20}, // 学院列宽
      {wch: 20}, // 专业列宽
      {wch: 12}, // 年级列宽
      {wch: 12}  // 入学年份列宽
    ]
    ws['!cols'] = wscols
    
    // 将工作表添加到工作簿
    XLSX.utils.book_append_sheet(wb, ws, '学生导入模板')
    
    // 生成Excel二进制数据
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
    
    // 转换为Blob
    const blob = new Blob([excelBuffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    })
    
    console.log('✅ 使用本地生成的学生Excel模板（.xlsx格式）')
    return blob
  }
}

/**
 * 验证Excel文件是否包含所需列
 */
export const validateStudentExcel = (headers: string[]): boolean => {
  const required_columns = ['姓名', '密码', '学号', '学院', '专业', '年级', '入学年份']
  return required_columns.every(col => headers.includes(col))
}


// 添加学生相关的接口类型定义
export interface CreateStudentsResponse {
  total: number
  success_count: number 
  failed_count: number
  failed_records: Array<{
    username: string
    success: boolean
    error: string
  }>
}

/**
 * 批量创建学生
 */
export const createStudents = async (file: File): Promise<CreateStudentsResponse> => {
  try {
    // 参数校验
    if (!file) throw new Error('请选择要上传的文件')
    if (!file.name) throw new Error('文件名不能为空')

    const fileExtension = file.name.split('.').pop()?.toLowerCase()
    const validExtensions = ['xlsx', 'xls', 'csv']
    if (!validExtensions.includes(fileExtension || '')) {
      throw new Error('文件格式不支持。请上传Excel文件(.xlsx, .xls)或CSV文件(.csv)')
    }
    if (file.size > 10 * 1024 * 1024) throw new Error('文件过大，请确保文件大小不超过10MB')
    if (file.size === 0) throw new Error('文件不能为空')

    // 构建 FormData
    const formData = new FormData()
    formData.append('file', file)

    // 发起请求
    const response = await api.post('/admin/user_management/create_students', formData, {
      timeout: 30000,
    })

    // 解析响应
    const data = response.data
    return {
      total: data.total || 0,
      success_count: data.success_count || 0,
      failed_count: data.failed_count || 0,
      failed_records: data.failed_records || []
    }
  } catch (error: any) {
    // 统一错误处理
    if (!error.response) {
      if (error.code === 'ECONNABORTED') {
        throw new Error('请求超时，文件上传时间较长，请稍后重试')
      }
      throw new Error(`网络错误: ${error.message}`)
    }
    const status = error.response.status
    const errorData = error.response.data
    if (status === 401) throw new Error('认证失败，请重新登录')
    if (status === 403) throw new Error('权限不足，请联系管理员')
    if (status === 404) throw new Error('接口不存在，请检查后端服务')
    if (status === 422) {
      const detail = errorData?.detail
      if (Array.isArray(detail)) {
        const errors = detail.map((err: any) => `${err.loc?.join('.')}: ${err.msg}`).join('; ')
        throw new Error(`参数验证失败: ${errors}`)
      }
      throw new Error(`参数验证失败: ${detail || '请检查文件内容'}`)
    }
    if (status === 500) throw new Error(`服务器内部错误: ${errorData?.detail || '请稍后重试'}`)
    const errorMessage = errorData?.message || errorData?.detail || error.message || '未知错误'
    throw new Error(`批量创建失败: ${errorMessage}`)
  }
}


// 添加学生列表响应接口
export interface StudentListResponse {
  total: number
  page: number
  page_size: number
  students: Array<{
    id: number
    username: string
    student_id: string  // 学号
    department: string  // 学院
    major: string      // 专业
    grade: string      // 年级
    enrollment_year: string  // 入学年份
  }>
}

/**
 * 获取学生列表 - 支持分页和搜索
 */
export const getStudentList = async (
  page: number = 1,
  pageSize: number = 20,
  search?: string,
  retryCount: number = 3
): Promise<StudentListResponse> => {
  try {
    // 构建查询参数
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString()
    })
    
    if (search) {
      params.append('search', search)
    }

    try {
      const response = await api.get(`/admin/user_management/list_students?${params}`)
      return response.data
    } catch (error: any) {
      // 如果是500错误且还有重试次数，进行重试
      if (error.response?.status === 500 && retryCount > 0) {
        console.log(`🔄 搜索请求失败，${retryCount}秒后重试...`)
        await new Promise(resolve => setTimeout(resolve, 1000))
        return getStudentList(page, pageSize, search, retryCount - 1)
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
        throw new Error('搜索参数无效，请检查输入')
      case 401:
        throw new Error('认证失败，请重新登录')
      case 403:
        throw new Error('权限不足，无法获取学生列表')
      case 404:
        throw new Error('学生列表接口不存在')
      case 500:
        throw new Error(`服务器内部错误: ${errorData?.detail || '搜索服务暂时不可用'}`)
      default:
        throw new Error(errorData?.message || `获取学生列表失败(${status})`)
    }
  }
}