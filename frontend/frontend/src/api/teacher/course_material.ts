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
 * 课程资料接口
 */
export interface CourseMaterial {
  filename: string;
  file_size: number;
  upload_time: string;
  file_extension: string;
}

/**
 * 课程资料列表响应接口
 */
export interface CourseMaterialListResponse {
  course_id: number;
  course_name: string;
  materials: CourseMaterial[];
  total_count: number;
}

/**
 * 获取课程资料列表
 * @param courseId 课程ID
 * @returns Promise<CourseMaterialListResponse>
 */
export const getCourseMaterials = async (courseId: number): Promise<CourseMaterialListResponse> => {
  try {
    const response = await api.get(`/teacher/course_material/${courseId}/materials`);
    return response.data;
  } catch (error: any) {
    console.error('获取课程资料列表失败:', error);
    throw new Error(error.response?.data?.detail || '获取课程资料列表失败');
  }
};

/**
 * 上传响应接口
 */
export interface UploadMaterialResponse {
  success: boolean;
  filename: string;
  file_size: number;
  message: string;
}

/**
 * 支持的文件类型
 */
export const ALLOWED_FILE_TYPES = [
  '.pdf', '.doc', '.docx', '.txt', '.md',  // 文档
  '.xls', '.xlsx',                         // 表格
  '.ppt', '.pptx',                         // 演示文稿
  '.zip', '.rar', '.7z', '.tar', '.gz',    // 压缩文件
  '.jpg', '.jpeg', '.png', '.gif',         // 图片
  '.mp4', '.avi', '.mov'                   // 视频
];

/**
 * 上传课程资料
 * @param courseId 课程ID
 * @param file 文件
 * @returns Promise<UploadMaterialResponse>
 */
export const uploadCourseMaterial = async (
  courseId: number,
  file: File
): Promise<UploadMaterialResponse> => {
  try {
    // 检查文件类型
    const fileExt = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!ALLOWED_FILE_TYPES.includes(fileExt)) {
      throw new Error('不支持的文件类型');
    }

    // 检查文件大小（2GB限制）
    if (file.size > 2 * 1024 * 1024 * 1024) {
      throw new Error('文件大小超过2GB限制');
    }

    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post(
      `/teacher/course_material/${courseId}/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error('上传文件失败:', error);
    throw new Error(error.response?.data?.detail || error.message || '上传文件失败');
  }
};

/**
 * 删除响应接口
 */
export interface DeleteMaterialResponse {
  success: boolean;
  message: string;
}

/**
 * 删除课程资料
 * @param courseId 课程ID
 * @param filename 文件名
 * @returns Promise<DeleteMaterialResponse>
 */
export const deleteCourseMaterial = async (
  courseId: number,
  filename: string
): Promise<DeleteMaterialResponse> => {
  try {
    const response = await api.delete(
      `/teacher/course_material/${courseId}/materials/${filename}`
    );
    return response.data;
  } catch (error: any) {
    console.error('删除文件失败:', error);
    if (error.response?.status === 404) {
      throw new Error('文件不存在或已被删除');
    }
    throw new Error(error.response?.data?.detail || '删除文件失败');
  }
};

/**
 * 下载课程资料
 * @param courseId 课程ID
 * @param filename 文件名
 * @returns Promise<Blob>
 */
export const downloadCourseMaterial = async (
  courseId: number,
  filename: string
): Promise<Blob> => {
  try {
    const response = await api.get(
      `/teacher/course_material/${courseId}/download/${filename}`,
      {
        responseType: 'blob'  // 指定响应类型为二进制数据
      }
    );
    return response.data;
  } catch (error: any) {
    console.error('下载文件失败:', error);
    if (error.response?.status === 404) {
      throw new Error('文件不存在或已被删除');
    }
    throw new Error('下载文件失败，请稍后重试');
  }
};