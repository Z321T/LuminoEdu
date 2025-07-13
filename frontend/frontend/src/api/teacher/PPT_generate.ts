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

// PPT生成请求接口
export interface PPTGenerateRequest {
  title: string;
  subject: string;
  teaching_target: string;
  key_points: string[];
  target_grade: string;
  slide_count: number;
  additional_info: string | null;
}

// PPT大纲响应接口
export interface PPTOutlineResponse {
  title: string;
  outline_md: string;
}

// PPT幻灯片接口
export interface PPTSlide {
  title: string;
  content: string;
  note: string;
}

// PPT完整响应接口
export interface PPTCompleteResponse {
  title: string;
  slides: PPTSlide[];
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
    
    // 发送API请求
    const response = await api.post('/teacher/ppt/generate_outline', data);
    
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
 * 从大纲生成完整PPT
 * @param title PPT标题
 * @param file 大纲Markdown文件
 * @returns Promise<PPTCompleteResponse> 包含标题和幻灯片内容
 */
export const generatePPTFromOutline = async (title: string, file: File): Promise<PPTCompleteResponse> => {
  try {
    // 记录API调用开始
    console.log('开始从大纲生成PPT:', title, file.name);
    
    // 创建FormData对象
    const formData = new FormData();
    formData.append('file', file);
    
    // 发送API请求
    const response = await api.post(`/teacher/ppt/generate_from_outline?title=${encodeURIComponent(title)}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    console.log('PPT生成成功:', response.data);
    return response.data;
    
  } catch (error: any) {
    // 处理错误
    console.error('从大纲生成PPT失败:', error);
    
    // 构建友好的错误信息
    let errorMessage = '生成PPT时出错';
    
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
 * 从生成的PPT数据下载PPTX文件
 * @param pptData PPT数据
 * @param filename 文件名
 */
export const downloadPPTX = async (pptData: PPTCompleteResponse, filename: string): Promise<void> => {
  try {
    // 记录API调用开始
    console.log('开始下载PPTX文件:', filename);
    
    // 准备文件名 - 移除扩展名和特殊字符
    const sanitizedFilename = filename.replace(/\.pptx$/, '').replace(/[^\w\s-]/gi, '');
    
    // 发送API请求并获取二进制数据
    const response = await api.get(`/teacher/ppt/download/${sanitizedFilename}`, {
      responseType: 'blob',
      params: {
        title: pptData.title,
        // 如果需要传递其他参数，可以在这里添加
      }
    });
    
    // 创建Blob对象
    const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' });
    
    // 创建下载链接
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${sanitizedFilename}.pptx`;
    
    // 触发下载
    document.body.appendChild(link);
    link.click();
    
    // 清理
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
    
    console.log('PPTX文件下载成功');
    
  } catch (error: any) {
    console.error('下载PPTX文件失败:', error);
    throw new Error('下载PPTX文件失败，请稍后重试');
  }
};

/**
 * 获取支持的学科列表
 * @returns Promise<string[]> 支持的学科列表
 */
export const getSubjectList = async (): Promise<string[]> => {
  try {
    const response = await api.get('/teacher/ppt/subjects');
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
    const response = await api.get('/teacher/ppt/grades');
    return response.data.grades || [];
  } catch (error) {
    console.error('获取年级列表失败:', error);
    return []; // 返回空数组作为默认值
  }
};