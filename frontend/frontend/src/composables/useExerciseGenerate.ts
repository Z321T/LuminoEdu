import { ref } from 'vue'
import {
  generateExercises,
  getExerciseContent,
  convertTypeToBackend,
  downloadExerciseFile,
  type ExerciseGenerateRequest,
} from '@/api/teacher/exercise_generate'

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

      let errorMsg = '获取习题内容时发生错误，请重试'

      if (error.message) {
        if (error.message.includes('网络')) {
          errorMsg = '网络连接失败，请检查网络后重试'
        } else if (error.message.includes('404')) {
          errorMsg = '文件不存在，可能已被删除'
        } else if (error.message.includes('403')) {
          errorMsg = '没有权限访问该文件'
        } else if (error.message.includes('401')) {
          errorMsg = '登录已过期，请重新登录'
        } else {
          errorMsg = error.message
        }
      }

      errorMessage.value = errorMsg
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