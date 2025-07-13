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
 * 教师文档接口
 */
export interface TeacherDocument {
  id: number;
  title: string;
  type: string;
  created_at: string;
  status: string;
  size?: number;
  download_url?: string;
}

/**
 * 获取教师的所有文档
 * @returns Promise<TeacherDocument[]>
 */
export const getTeacherDocuments = async (): Promise<TeacherDocument[]> => {
  try {
    const response = await api.get('/teacher/document_vectorization/list');
    console.log('获取文档列表成功:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('获取文档列表失败:', error);
    throw new Error(error.response?.data?.detail || '获取文档列表失败');
  }
};

/**
 * 上传文档响应
 */
export interface UploadDocumentResponse {
  success: boolean;
  message: string;
  document_id?: number;
}

/**
 * 上传文档
 * @param title 文档标题
 * @param file 文件
 * @returns Promise<UploadDocumentResponse>
 */
export const uploadDocument = async (
  title: string,
  file: File
): Promise<UploadDocumentResponse> => {
  try {
    // 检查文件类型
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension || !['txt', 'docx'].includes(extension)) {
      throw new Error('仅支持 TXT 和 DOCX 格式文件');
    }

    // 检查文件大小（500MB）
    if (file.size > 500 * 1024 * 1024) {
      throw new Error('文件大小不能超过500MB');
    }

    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post(
      `/teacher/document_vectorization/upload?title=${encodeURIComponent(title)}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
         timeout: 300000, // 增加到5分钟
      }
    );
    return response.data;
  } catch (error: any) {
    console.error('上传文档失败:', error);
    throw new Error(error.response?.data?.detail || error.message || '上传文档失败');
  }
};

/**
 * 搜索教师文档
 * @param keyword 搜索关键词
 * @param limit 返回数量限制
 * @returns Promise<TeacherDocument[]>
 */
export const searchTeacherDocuments = async (
  keyword: string,
  limit: number = 20
): Promise<TeacherDocument[]> => {
  try {
    const response = await api.get('/teacher/document_vectorization/search', {
      params: {
        keyword,
        limit
      }
    });
    console.log('搜索文档成功:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('搜索文档失败:', error);
    throw new Error(error.response?.data?.detail || '搜索文档失败');
  }
};