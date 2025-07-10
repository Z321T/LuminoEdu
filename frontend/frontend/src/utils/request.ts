import { ref } from 'vue'
import {
  generateExercises,
  getExerciseContent,
  convertTypeToBackend,
  downloadExerciseFile,
  type ExerciseGenerateRequest,
} from '@/api/exercise_generate'
import { apiRequest, apiGet, apiPost, apiPut, apiDelete } from '@/api/request'

export function useExerciseGenerate(formData: any) {
  // 生成状态
  const isGenerating = ref(false)
  const generationStep = ref('') // 'generating' | 'fetching'
  
  // markdown 内容
  const markdownContent = ref('')
  
  // 错误信息
  const errorMessage = ref('')
  
  // 文件名
  const fileName = ref('')

  // 验证文件名
  const validateFileName = (fileNameToValidate: string): boolean => {
    console.log('🔍 验证文件名:', fileNameToValidate)

    if (!fileNameToValidate) {
      console.error('❌ 文件名为空')
      return false
    }

    if (typeof fileNameToValidate !== 'string') {
      console.error('❌ 文件名不是字符串类型:', typeof fileNameToValidate)
      return false
    }

    const trimmed = fileNameToValidate.trim()
    if (trimmed.length === 0) {
      console.error('❌ 文件名只包含空白字符')
      return false
    }

    console.log('✅ 文件名验证通过')
    return true
  }

  // 第一步：生成习题文件
  const generateExerciseFile = async () => {
    try {
      isGenerating.value = true
      generationStep.value = 'generating'
      errorMessage.value = ''

      const requestParams: ExerciseGenerateRequest = {
        title: formData.title || '未命名习题集',
        content: formData.content,
        count: formData.quantity,
        types: [convertTypeToBackend(formData.type)],
      }

      console.log('发送生成请求:', requestParams)

      const generatedFileName = await generateExercises(requestParams)

      console.log('后端返回的文件名:', generatedFileName)

      if (!validateFileName(generatedFileName)) {
        throw new Error(`无效的文件名: "${generatedFileName}"`)
      }

      fileName.value = generatedFileName.trim()
      console.log('成功获取到文件名:', fileName.value)
    } catch (error: any) {
      console.error('生成习题文件失败:', error)
      errorMessage.value = error.message || '生成习题文件时发生错误，请重试'
    } finally {
      isGenerating.value = false
      generationStep.value = ''
    }
  }

  // 第二步：获取习题内容
  const fetchExerciseContent = async () => {
    if (!fileName.value) {
      errorMessage.value = '请先生成习题文件'
      return
    }

    try {
      isGenerating.value = true
      generationStep.value = 'fetching'
      errorMessage.value = ''

      console.log('📁 准备获取文件内容，文件名:', fileName.value)

      const content = await getExerciseContent(fileName.value)

      console.log('📄 获取到的内容类型:', typeof content)
      console.log('📄 内容长度:', content?.length || 0)

      if (!content) {
        throw new Error('获取到的内容为空')
      }

      if (typeof content !== 'string') {
        throw new Error(`内容类型错误，期望字符串，实际: ${typeof content}`)
      }

      const trimmedContent = content.trim()
      if (trimmedContent.length === 0) {
        throw new Error('获取到的内容只包含空白字符')
      }

      markdownContent.value = trimmedContent
      console.log('✅ 成功获取到 markdown 内容')
    } catch (error: any) {
      console.error('💥 获取习题内容失败:', error)
      errorMessage.value = error.message || '获取习题内容时发生错误，请重试'
    } finally {
      isGenerating.value = false
      generationStep.value = ''
    }
  }

  // 一键生成
  const handleGenerateExercises = async () => {
    try {
      isGenerating.value = true
      errorMessage.value = ''
      markdownContent.value = ''
      fileName.value = ''

      const requestParams: ExerciseGenerateRequest = {
        title: formData.title || '未命名习题集',
        content: formData.content,
        count: formData.quantity,
        types: [convertTypeToBackend(formData.type)],
      }

      console.log('一键生成 - 发送请求:', requestParams)

      // 第一步：生成习题
      generationStep.value = 'generating'
      const generatedFileName = await generateExercises(requestParams)

      if (!generatedFileName || typeof generatedFileName !== 'string' || !generatedFileName.trim()) {
        throw new Error(`无效的文件名: "${generatedFileName}"`)
      }

      fileName.value = generatedFileName
      console.log('一键生成 - 获取到文件名:', generatedFileName)

      // 第二步：获取内容
      generationStep.value = 'fetching'
      console.log('一键生成 - 开始获取文件内容')

      const content = await getExerciseContent(generatedFileName)

      if (!content || typeof content !== 'string') {
        throw new Error('获取到的内容无效')
      }

      markdownContent.value = content
      console.log('一键生成 - 成功完成，内容长度:', content.length)
    } catch (error: any) {
      console.error('一键生成流程失败:', error)
      errorMessage.value = error.message || '生成习题时发生错误，请重试'
      markdownContent.value = ''
    } finally {
      isGenerating.value = false
      generationStep.value = ''
    }
  }

  // 下载习题
  const downloadExercises = async () => {
    if (!markdownContent.value) {
      errorMessage.value = '没有可下载的内容'
      return
    }

    try {
      // 如果有文件名，尝试从服务器下载
      if (fileName.value) {
        console.log('📁 从服务器下载文件:', fileName.value)
        await downloadExerciseFile(fileName.value)
        return
      }

      // 否则进行本地下载
      console.log('📁 进行本地下载')
      await downloadExercisesLocal()
    } catch (error: any) {
      console.error('下载失败:', error)

      // 如果服务器下载失败，尝试本地下载
      if (fileName.value && error.message.includes('404')) {
        console.log('📁 服务器文件不存在，切换到本地下载')
        try {
          await downloadExercisesLocal()
        } catch (localError) {
          errorMessage.value = '文件下载失败，请重试'
        }
      } else {
        errorMessage.value = error.message || '文件下载失败，请重试'
      }
    }
  }

  // 本地下载函数
  const downloadExercisesLocal = async (): Promise<void> => {
    try {
      const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '').replace('T', '_')
      const filename = `${formData.title || '习题集'}_${timestamp}.md`

      const blob = new Blob([markdownContent.value], { type: 'text/markdown;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      link.style.display = 'none'

      document.body.appendChild(link)
      link.click()

      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      console.log('✅ 本地文件下载成功:', filename)
      showDownloadSuccessMessage(filename)
    } catch (error) {
      console.error('本地下载失败:', error)
      throw new Error('本地下载失败，请重试')
    }
  }

  // 显示下载成功消息
  const showDownloadSuccessMessage = (filename: string): void => {
    const successMsg = document.createElement('div')
    successMsg.textContent = `文件 "${filename}" 下载成功！`
    successMsg.style.cssText = `
      position: fixed; top: 20px; right: 20px; z-index: 9999;
      background: #28a745; color: white; padding: 12px 20px;
      border-radius: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      font-size: 14px; font-weight: 500;
    `
    document.body.appendChild(successMsg)

    setTimeout(() => {
      if (document.body.contains(successMsg)) {
        document.body.removeChild(successMsg)
      }
    }, 3000)
  }

  // 重置表单
  const resetForm = () => {
    formData.title = ''
    formData.quantity = 5
    formData.content = ''
    formData.type = 'choice'
    errorMessage.value = ''
    markdownContent.value = ''
    fileName.value = ''
  }

  // 清空结果
  const clearResults = () => {
    markdownContent.value = ''
    errorMessage.value = ''
    fileName.value = ''
  }

  return {
    isGenerating,
    generationStep,
    markdownContent,
    errorMessage,
    fileName,
    generateExerciseFile,
    fetchExerciseContent,
    handleGenerateExercises,
    downloadExercises,
    resetForm,
    clearResults
  }
}

// API请求工具类

export interface ApiRequestConfig {
  url: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  data?: any
  headers?: Record<string, string>
  responseType?: 'json' | 'blob' | 'text'
}

interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

export async function apiRequest<T>(config: ApiRequestConfig): Promise<T> {
  const {
    url,
    method,
    data,
    headers = {},
    responseType = 'json'
  } = config

  // 添加认证头
  const token = localStorage.getItem('token')
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const fetchConfig: RequestInit = {
    method,
    headers,
  }

  // 处理请求体
  if (data) {
    if (data instanceof FormData) {
      fetchConfig.body = data
      // FormData 会自动设置 Content-Type，所以删除手动设置的
      delete headers['Content-Type']
    } else {
      fetchConfig.body = JSON.stringify(data)
      headers['Content-Type'] = 'application/json'
    }
  }

  const response = await fetch(url, fetchConfig)

  if (!response.ok) {
    const error = new Error(`HTTP ${response.status}: ${response.statusText}`) as any
    error.status = response.status
    throw error
  }

  if (responseType === 'blob') {
    return response.blob() as Promise<T>
  } else if (responseType === 'text') {
    return response.text() as Promise<T>
  } else {
    return response.json() as Promise<T>
  }
}

// 模拟创建教师API
async function mockCreateTeachers(formData: FormData): Promise<any> {
  console.log('📊 模拟Excel批量创建教师')
  
  const file = formData.get('file') as File
  if (!file) {
    throw new Error('未找到上传文件')
  }

  console.log('📁 处理文件:', {
    name: file.name,
    size: file.size,
    type: file.type
  })

  // 模拟文件处理
  const mockTeachers = [
    {
      id: Date.now() + 1,
      name: '张三',
      subject: '数学',
      email: 'zhangsan@school.com',
      phone: '13800138000',
      workId: 'T001',
      remark: '班主任',
      createdAt: new Date().toISOString()
    },
    {
      id: Date.now() + 2,
      name: '李四',
      subject: '语文',
      email: 'lisi@school.com',
      phone: '13800138001',
      workId: 'T002',
      remark: '年级组长',
      createdAt: new Date().toISOString()
    },
    {
      id: Date.now() + 3,
      name: '王五',
      subject: '英语',
      email: 'wangwu@school.com',
      phone: '13800138002',
      workId: 'T003',
      remark: '',
      createdAt: new Date().toISOString()
    },
    {
      id: Date.now() + 4,
      name: '赵六',
      subject: '物理',
      email: 'zhaoliu@school.com',
      phone: '13800138003',
      workId: 'T004',
      remark: '实验室管理员',
      createdAt: new Date().toISOString()
    }
  ]

  // 模拟部分失败情况
  const failedRecords = [
    {
      username: '孙七',
      success: false,
      error: '邮箱格式不正确'
    }
  ]

  // 保存到localStorage
  const existingTeachers = JSON.parse(localStorage.getItem('teachers') || '[]')
  const updatedTeachers = [...existingTeachers, ...mockTeachers]
  localStorage.setItem('teachers', JSON.stringify(updatedTeachers))

  const result = {
    total: 5,
    success_count: 4,
    failed_count: 1,
    failed_records: failedRecords
  }

  console.log('✅ 模拟教师创建成功:', result)
  return result
}

// 模拟获取教师列表API
async function mockGetTeachers(): Promise<any> {
  console.log('📋 模拟获取教师列表')
  
  const teachers = JSON.parse(localStorage.getItem('teachers') || '[]')
  
  const result = {
    teachers: teachers
  }

  console.log('✅ 教师列表获取成功:', result)
  return result
}

// 模拟下载模板API
async function mockDownloadTemplate(): Promise<Blob> {
  console.log('📥 模拟下载Excel模板')
  
  const templateData = [
    '教师姓名,任教科目,邮箱地址,联系电话,工号,备注',
    '张三,数学,zhangsan@school.com,13800138000,T001,班主任',
    '李四,语文,lisi@school.com,13800138001,T002,年级组长',
    '王五,英语,wangwu@school.com,13800138002,T003,',
    '赵六,物理,zhaoliu@school.com,13800138003,T004,实验室管理员',
    '孙七,化学,sunqi@school.com,13800138004,T005,',
    '钱八,生物,qianba@school.com,13800138005,T006,',
    ',,,,,' // 空行供用户填写
  ].join('\n')

  // 创建CSV格式的Blob，添加BOM支持中文
  const blob = new Blob(['\ufeff' + templateData], { 
    type: 'text/csv;charset=utf-8' 
  })

  console.log('✅ Excel模板生成成功')
  return blob
}

// 错误处理工具
export class ApiError extends Error {
  status: number
  code: string

  constructor(message: string, status: number = 500, code: string = 'UNKNOWN_ERROR') {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

// 请求拦截器
export function setupRequestInterceptors() {
  console.log('🔧 API请求拦截器已设置')
}

// 响应拦截器
export function setupResponseInterceptors() {
  console.log('🔧 API响应拦截器已设置')
}