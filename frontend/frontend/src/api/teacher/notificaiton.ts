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



/**
 * 创建通知请求接口
 */
export interface CreateNotificationRequest {
  title: string;
  content: string;
  priority: number;
  require_confirmation: boolean;
}

/**
 * 创建通知响应接口
 */
export interface CreateNotificationResponse {
  success: boolean;
  message: string;
  notification_id: number;
}

/**
 * 创建课程通知
 * @param courseId 课程ID
 * @param data 通知数据
 * @returns Promise<CreateNotificationResponse>
 */
export const createNotification = async (
  courseId: number,
  data: CreateNotificationRequest
): Promise<CreateNotificationResponse> => {
  try {
    const response = await api.post(
      `/teacher/course_notification/${courseId}/notifications`,
      data
    );
    console.log('创建通知成功:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('创建通知失败:', error);
    throw new Error(error.response?.data?.detail || '创建通知失败');
  }
};
/**
 * 通知确认信息
 */
export interface NotificationConfirmation {
  student_id: string;
  student_name: string;
  confirm_time: string;
}

/**
 * 通知详情接口
 */
export interface NotificationDetail {
  id: number;
  title: string;
  content: string;
  priority: number;
  require_confirmation: boolean;
  publish_time: string;
  total_students: number;
  confirmed_students: number;
  confirmation_rate: number;
  confirmations: NotificationConfirmation[];
}

/**
 * 获取通知详情
 * @param courseId 课程ID
 * @param notificationId 通知ID
 * @returns Promise<NotificationDetail>
 */
export const getNotificationDetail = async (
  courseId: number,
  notificationId: number
): Promise<NotificationDetail> => {
  try {
    const response = await api.get(
      `/teacher/course_notification/${courseId}/notifications/${notificationId}`
    );
    return response.data;
  } catch (error: any) {
    console.error('获取通知详情失败:', error);
    throw new Error(error.response?.data?.detail || '获取通知详情失败');
  }
};