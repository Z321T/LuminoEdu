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

// 课程接口定义
export interface Course {
  id: number;
  name: string;
  description: string;
  semester: string;
  credit: number;
  start_date: string;
  end_date: string;
}

/**
 * 获取教师创建的所有课程
 * @returns Promise<Course[]> 课程列表
 */
export const getAllCourses = async (): Promise<Course[]> => {
  try {
    const response = await api.get('/teacher/course/list')
    console.log('获取课程列表成功:', response.data);
    return response.data
  } catch (error: any) {
    console.error('获取课程列表失败:', error)
    throw new Error('获取课程列表失败')
  }
}

/**
 * 创建新课程的请求接口
 */
export interface CreateCourseRequest {
  name: string;               // 必填，课程名称
  description: string | null; // 可选，课程描述
  semester: string;          // 必填，学期
  credit: number;           // 必填，学分
  start_date: string | null; // 可选，开始日期
  end_date: string | null;   // 可选，结束日期
}

/**
 * 创建新课程
 * @param courseData 课程数据
 * @returns Promise<Course> 创建的课程信息
 */
export const createCourse = async (courseData: CreateCourseRequest): Promise<Course> => {
  try {
    const response = await api.post('/teacher/course/create', courseData)
    return response.data
  } catch (error: any) {
    console.error('创建课程失败:', error)
    throw new Error(error.response?.data?.detail || '创建课程失败')
  }
}



/**
 * 删除课程接口响应
 */
interface DeleteCourseResponse {
  success: boolean;
  message: string;
}

/**
 * 删除课程
 * @param courseId 课程ID
 * @returns Promise<DeleteCourseResponse> 删除结果
 */
export const deleteCourse = async (courseId: number): Promise<DeleteCourseResponse> => {
  try {
    const response = await api.delete(`/teacher/course/${courseId}`);
    return response.data;
  } catch (error: any) {
    console.error('删除课程失败:', error);
    throw new Error(error.response?.data?.detail || '删除课程失败');
  }
};



/**
 * 导入学生响应接口
 */
export interface ImportStudentsResponse {
  success: boolean;
  total: number;
  added: number;
  failed: string[];
  message: string;
}



// ...existing code...

/**
 * 下载学生导入模板
 * @returns Promise<Blob> 返回Excel文件的二进制数据
 */
export const downloadStudentTemplate = async (): Promise<Blob> => {
  try {
    const response = await api.get('/teacher/course/template/add_students', {
      responseType: 'blob',
    });
    return response.data;
  } catch (error: any) {
    console.error('下载模板失败:', error);
    throw new Error('下载模板失败，请稍后重试');
  }
};

/**
 * 通过Excel文件导入学生到课程
 * @param courseId 课程ID
 * @param file Excel文件
 * @returns Promise<ImportStudentsResponse>
 */
export const importStudentsByExcel = async (
  courseId: number,
  file: File
): Promise<ImportStudentsResponse> => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post(
      `/teacher/course/${courseId}/add_students`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error('导入学生失败:', error);
    throw new Error(error.response?.data?.detail || '导入学生失败');
  }
};

/**
 * 课程详情接口（包含学生列表）
 */
export interface CourseDetail extends Course {
  students: {
    id: string;
    name: string;
    class_name?: string;
    email?: string;
  }[];
}

/**
 * 获取课程详情
 * @param courseId 课程ID
 * @returns Promise<CourseDetail>
 */
export const getCourseDetail = async (courseId: number): Promise<CourseDetail> => {
  try {
    const response = await api.get(`/teacher/course/${courseId}`);
    return response.data;
  } catch (error: any) {
    console.error('获取课程详情失败:', error);
    throw new Error(error.response?.data?.detail || '获取课程详情失败');
  }
};