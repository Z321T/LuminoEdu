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

/**
 * 课程通知接口
 */
export interface CourseNotification {
  id: number;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

/**
 * 分页响应接口
 */
export interface PaginatedResponse<T> {
  total: number;
  items: T[];
  page: number;
  page_size: number;
  total_pages: number;
}

/**
 * 获取课程通知列表
 * @param courseId 课程ID
 * @param page 页码
 * @param pageSize 每页数量
 * @returns Promise<PaginatedResponse<CourseNotification>>
 */
export const getCourseNotifications = async (
  courseId: number,
  page: number = 1,
  pageSize: number = 20
): Promise<PaginatedResponse<CourseNotification>> => {
  try {
    const response = await api.get(
      `/teacher/course_notification/${courseId}/notifications`,
      {
        params: {
          page,
          page_size: pageSize
        }
      }
    );
    return response.data;
  } catch (error: any) {
    console.error('获取课程通知列表失败:', error);
    throw new Error(error.response?.data?.detail || '获取课程通知列表失败');
  }
};