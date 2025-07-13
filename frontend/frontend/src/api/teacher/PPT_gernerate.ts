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

// PPT生成请求接口
export interface PPTGenerateRequest {
  title: string;
  subject: string;
  teaching_target: string;
  key_points: string[];
  target_grade: string;
  slide_count: number;
  additional_info: string;
}

// PPT大纲响应接口
export interface PPTOutlineResponse {
  title: string;
  outline_md: string;
}

/**
 * 生成PPT大纲
 * @param data PPT生成请求参数
 * @returns Promise<PPTOutlineResponse> 包含标题和markdown格式大纲
 */
export const generatePPTOutline = async (data: PPTGenerateRequest): Promise<PPTOutlineResponse> => {
  try {
    // 记录API调用开始
    console.log('开始生成PPT大纲:', data);
    
    // 创建请求配置
    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
    };
    
    // 如果有认证token，添加到请求头
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    // 发送API请求
    const response = await axios.post(
      `${API_BASE_URL}/teacher/ppt/generate_outline`,
      data,
      config
    );
    
    console.log('PPT大纲生成成功:', response.data);
    return response.data;
    
  } catch (error: any) {
    // 处理错误
    console.error('PPT大纲生成失败:', error);
    
    // 构建友好的错误信息
    let errorMessage = '生成PPT大纲时出错';
    
    if (error.response) {
      // 服务器返回错误
      const status = error.response.status;
      const data = error.response.data;
      
      switch (status) {
        case 400:
          errorMessage = `参数错误: ${data.detail || '请检查输入内容'}`;
          break;
        case 401:
          errorMessage = '未授权，请重新登录';
          break;
        case 403:
          errorMessage = '权限不足，无法访问此功能';
          break;
        case 404:
          errorMessage = 'API接口不存在';
          break;
        case 422:
          errorMessage = `数据验证失败: ${data.detail || '请检查输入格式'}`;
          break;
        case 500:
          errorMessage = `服务器错误: ${data.detail || '请稍后重试'}`;
          break;
        default:
          errorMessage = `请求失败 (${status}): ${data.detail || '请稍后重试'}`;
      }
    } else if (error.request) {
      // 请求发送但没有收到响应
      errorMessage = '服务器无响应，请检查网络连接';
    }
    
    throw new Error(errorMessage);
  }
};

/**
 * 获取支持的学科列表
 * @returns Promise<string[]> 支持的学科列表
 */
export const getSubjectList = async (): Promise<string[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/teacher/ppt/subjects`);
    return response.data.subjects || [];
  } catch (error) {
    console.error('获取学科列表失败:', error);
    return []; // 返回空数组作为默认值
  }
};

/**
 * 获取支持的年级列表
 * @returns Promise<string[]> 支持的年级列表
 */
export const getGradeList = async (): Promise<string[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/teacher/ppt/grades`);
    return response.data.grades || [];
  } catch (error) {
    console.error('获取年级列表失败:', error);
    return []; // 返回空数组作为默认值
  }
};