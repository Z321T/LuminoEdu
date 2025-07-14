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
        localStorage.removeItem('username')
        window.location.href = '/login'
      }
      return Promise.reject(error)
    }
)

// 课程接口定义
export interface Course {
  id: number
  name: string
  description: string
  semester: string
  credit: number
  start_date: string
  end_date: string
}

// 获取教师所有课程
export const getAllCourses = async (): Promise<Course[]> => {
  try {
    const response = await api.get<Course[]>('/teacher/course/list')
    return response.data
  } catch (error: any) {
    console.error('请求失败:', error)

    if (error.response) {
      const status = error.response.status
      const message = error.response.data?.detail || error.response.statusText || '请求失败'
      throw new Error(`${status}: ${message}`)
    } else if (error.request) {
      throw new Error('网络连接失败，请检查网络设置')
    } else {
      throw new Error(error.message || '获取课程失败')
    }
  }
}

// 删除课程响应类型
export interface DeleteCourseResponse {
  success: boolean
  message: string
}

// 删除课程
export const deleteCourse = async (courseId: number): Promise<DeleteCourseResponse> => {
  try {
    const response = await api.delete<DeleteCourseResponse>(`/teacher/course/${courseId}`)
    return response.data
  } catch (error: any) {
    console.error('删除课程失败:', error)

    if (error.response) {
      const status = error.response.status
      const message = error.response.data?.detail || error.response.statusText || '删除失败'
      throw new Error(`${status}: ${message}`)
    } else if (error.request) {
      throw new Error('网络连接失败，请检查网络设置')
    } else {
      throw new Error(error.message || '删除课程失败')
    }
  }
}

// 创建课程请求和响应类型
export interface CreateCourseRequest {
  name: string
  description: string
  semester: string
  credit: number
  start_date: string
  end_date: string
}

export interface CreateCourseResponse {
  id: number
  name: string
  description: string
}

// 创建课程
export const createCourse = async (courseData: CreateCourseRequest): Promise<CreateCourseResponse> => {
  try {
    const response = await api.post<CreateCourseResponse>('/teacher/course/create', courseData)
    return response.data
  } catch (error: any) {
    console.error('创建课程失败:', error)

    if (error.response) {
      const status = error.response.status
      const message = error.response.data?.detail || error.response.statusText || '创建失败'
      throw new Error(`${status}: ${message}`)
    } else if (error.request) {
      throw new Error('网络连接失败，请检查网络设置')
    } else {
      throw new Error(error.message || '创建课程失败')
    }
  }
}

// 教师课程详情接口
export interface TeacherCourseDetail {
  id: number
  name: string
  description: string
  semester: string
  credit: number
  start_date: string
  end_date: string
  students: CourseStudent[]
}

export interface CourseStudent {
  name: string
  student_id: string
  college: string
  grade: string
}

// 教师通知接口
export interface TeacherNotification {
  id: number
  title: string
  priority: number
  require_confirmation: boolean
  publish_time: string
  confirmed_students: number
  total_students: number
}

export interface TeacherNotificationResponse {
  notifications: TeacherNotification[]
  total_count: number
  page: number
  page_size: number
  total_pages: number
}

// 课程资料接口
export interface CourseMaterial {
  filename: string
  file_size: number
  upload_time: string
  file_extension: string
}

export interface CourseMaterialResponse {
  course_id: number
  course_name: string
  materials: CourseMaterial[]
  total_count: number
}

// 获取教师课程详情
export const getTeacherCourseDetail = async (courseId: number): Promise<TeacherCourseDetail> => {
  try {
    const response = await api.get<TeacherCourseDetail>(`/teacher/course/${courseId}`)
    return response.data
  } catch (error: any) {
    console.error('获取课程详情失败:', error)
    throw new Error(error.response?.data?.detail || '获取课程详情失败')
  }
}

// 获取课程通知
export const getCourseNotifications = async (
    courseId: number,
    page: number = 1,
    pageSize: number = 20
): Promise<TeacherNotificationResponse> => {
  try {
    const response = await api.get<TeacherNotificationResponse>(
        `/teacher/course_notification/${courseId}/notifications`,
        {
          params: { page, page_size: pageSize }
        }
    )
    return response.data
  } catch (error: any) {
    console.error('获取课程通知失败:', error)
    throw new Error(error.response?.data?.detail || '获取课程通知失败')
  }
}

// 获取课程资料
export const getCourseMaterials = async (courseId: number): Promise<CourseMaterialResponse> => {
  try {
    const response = await api.get<CourseMaterialResponse>(`/teacher/course_material/${courseId}/materials`)
    return response.data
  } catch (error: any) {
    console.error('获取课程资料失败:', error)
    throw new Error(error.response?.data?.detail || '获取课程资料失败')
  }
}

// 优先级文本映射
export const getPriorityText = (priority: number): string => {
  const priorityMap: Record<number, string> = {
    1: '普通',
    2: '重要',
    3: '紧急'
  }
  return priorityMap[priority] || '普通'
}

// 优先级样式类名
export const getPriorityClass = (priority: number): string => {
  const classMap: Record<number, string> = {
    1: 'normal',
    2: 'important',
    3: 'urgent'
  }
  return classMap[priority] || 'normal'
}

// 格式化文件大小
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 删除课程学生请求接口
export interface RemoveStudentsRequest {
  student_ids: string[]
}

// 删除课程学生响应接口
export interface RemoveStudentsResponse {
  success: boolean
  removed: number
  message: string
}

// 删除课程资料响应接口
export interface DeleteMaterialResponse {
  success: boolean
  message: string
}

// 批量删除课程学生
export const removeStudentsFromCourse = async (
    courseId: number,
    studentIds: string[]
): Promise<RemoveStudentsResponse> => {
  try {
    const response = await api.delete<RemoveStudentsResponse>(
        `/teacher/course/${courseId}/students`,
        {
          data: { student_ids: studentIds }
        }
    )
    return response.data
  } catch (error: any) {
    console.error('删除学生失败:', error)
    throw new Error(error.response?.data?.detail || '删除学生失败')
  }
}

// 删除课程资料
export const deleteMaterial = async (
    courseId: number,
    filename: string
): Promise<DeleteMaterialResponse> => {
  try {
    const response = await api.delete<DeleteMaterialResponse>(
        `/teacher/course_material/${courseId}/materials/${encodeURIComponent(filename)}`
    )
    return response.data
  } catch (error: any) {
    console.error('删除资料失败:', error)
    throw new Error(error.response?.data?.detail || '删除资料失败')
  }
}

// 下载课程资料
export const downloadMaterial = async (
    courseId: number,
    filename: string
): Promise<void> => {
  try {
    const response = await api.get(
        `/teacher/course_material/${courseId}/download/${encodeURIComponent(filename)}`,
        {
          responseType: 'blob'
        }
    )

    // 创建下载链接
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (error: any) {
    console.error('下载资料失败:', error)
    throw new Error(error.response?.data?.detail || '下载资料失败')
  }
}

// 格式化日期时间
export const formatDateTime = (dateString: string): string => {
  return new Date(dateString).toLocaleString('zh-CN')
}