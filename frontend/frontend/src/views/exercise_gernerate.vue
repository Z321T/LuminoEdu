<template>
  <div class="exercise-generate-layout">
    <!-- 侧边栏 -->
    <aside class="sidebar">
      <div class="logo">LuminoEdu</div>
      <ul class="menu">
        <li
          class="menu-item"
          @click="navigateTo('/home_teacher')"
        >
          <i class="icon">🏠</i>
          <span>首页</span>
        </li>
        <li class="menu-item active">
          <i class="icon">📝</i>
          <span>习题生成</span>
        </li>
        <li class="menu-item">
          <i class="icon">📚</i>
          <span>课程管理</span>
        </li>
        <li class="menu-item">
          <i class="icon">👥</i>
          <span>学生管理</span>
        </li>
        <li class="menu-item">
          <i class="icon">📊</i>
          <span>作业批改</span>
        </li>
        <li class="menu-item">
          <i class="icon">🔔</i>
          <span>消息通知</span>
        </li>
        <li class="menu-item">
          <i class="icon">⚙️</i>
          <span>设置</span>
        </li>
      </ul>
    </aside>

    <!-- 主体内容 -->
    <div class="main">
      <!-- 顶部导航栏 -->
      <header class="header">
        <div class="header-left">
          <button
            class="back-btn"
            @click="navigateTo('/home_teacher')"
          >
            ← 返回首页
          </button>
          <div>
            <h1 class="page-title">智能习题生成</h1>
            <p class="page-subtitle">基于AI技术，快速生成高质量习题</p>
          </div>
        </div>
        <div class="header-user">
          <span>欢迎，张老师</span>
          <button class="logout-btn">退出登录</button>
        </div>
      </header>

      <!-- 内容区 -->
      <section class="content">
        <div class="generate-container">
          <!-- 左侧：生成表单 -->
          <div class="form-panel">
            <div class="panel-header">
              <h2>习题生成设置</h2>
              <p>请填写以下信息来生成习题</p>
            </div>

            <div class="generate-form">
              <!-- 标题输入 -->
              <div class="form-group">
                <label
                  for="title"
                  class="form-label"
                >题目标题</label>
                <input
                  id="title"
                  v-model="formData.title"
                  type="text"
                  class="form-input"
                  placeholder="请输入题目标题，如：数据结构-二叉树"
                  required
                />
              </div>

              <!-- 题目数量 -->
              <div class="form-group">
                <label
                  for="quantity"
                  class="form-label"
                >生成数量</label>
                <input
                  id="quantity"
                  v-model.number="formData.quantity"
                  type="number"
                  class="form-input"
                  placeholder="请输入题目数量"
                  min="1"
                  max="50"
                  required
                />
              </div>

              <!-- 题目内容描述 -->
              <div class="form-group">
                <label
                  for="content"
                  class="form-label"
                >题目内容描述</label>
                <textarea
                  id="content"
                  v-model="formData.content"
                  class="form-textarea"
                  placeholder="请描述题目的具体要求和内容范围，如：关于二叉树的遍历算法，难度为中等"
                  rows="4"
                  required
                ></textarea>
              </div>

              <!-- 题目类型选择 -->
              <div class="form-group">
                <label class="form-label">题目类型</label>
                <div class="radio-group">
                  <label class="radio-item">
                    <input
                      v-model="formData.type"
                      type="radio"
                      value="choice"
                      class="radio-input"
                    />
                    <span class="radio-custom"></span>
                    <span class="radio-label">选择题</span>
                  </label>
                  <label class="radio-item">
                    <input
                      v-model="formData.type"
                      type="radio"
                      value="fill"
                      class="radio-input"
                    />
                    <span class="radio-custom"></span>
                    <span class="radio-label">填空题</span>
                  </label>
                  <label class="radio-item">
                    <input
                      v-model="formData.type"
                      type="radio"
                      value="essay"
                      class="radio-input"
                    />
                    <span class="radio-custom"></span>
                    <span class="radio-label">简答题</span>
                  </label>
                </div>
              </div>

              <!-- 生成按钮区域 -->
              <div class="form-actions">
                <!-- 第一步：生成习题按钮 -->
                <button
                  type="button"
                  class="generate-btn step-btn"
                  :disabled="isGenerating || !formData.title || !formData.content"
                  @click="generateExerciseFile"
                >
                  <span v-if="generationStep !== 'generating'">🎯
                    第一步：生成习题文件</span>
                  <span v-else>⏳ 正在生成...</span>
                </button>

                <!-- 第二步：获取习题内容按钮 -->
                <button
                  type="button"
                  class="fetch-btn step-btn"
                  :disabled="!fileName || isGenerating"
                  @click="fetchExerciseContent"
                >
                  <span v-if="generationStep !== 'fetching'">📄
                    第二步：获取习题内容</span>
                  <span v-else>⏳ 正在获取...</span>
                </button>

                <!-- 一键生成按钮 -->
                <button
                  type="button"
                  class="generate-btn primary"
                  :disabled="isGenerating || !formData.title || !formData.content"
                  @click="handleGenerateExercises"
                >
                  <span v-if="!isGenerating">🚀 一键生成习题</span>
                  <span v-else>⏳ 生成中...</span>
                </button>

                <button
                  type="button"
                  class="reset-btn"
                  @click="resetForm"
                >
                  🔄 重置表单
                </button>
              </div>

              <!-- 步骤提示 -->
              <div class="step-indicator">
                <div
                  class="step-item"
                  :class="{ active: fileName, completed: fileName }"
                >
                  <span class="step-number">1</span>
                  <span class="step-text">生成习题文件</span>
                </div>
                <div class="step-arrow">→</div>
                <div
                  class="step-item"
                  :class="{ active: markdownContent, completed: markdownContent }"
                >
                  <span class="step-number">2</span>
                  <span class="step-text">获取习题内容</span>
                </div>
              </div>

              <!-- 文件名显示 -->
              <div
                v-if="fileName"
                class="file-path-display"
              >
                <h4>生成的文件名：</h4>
                <code>{{ fileName }}</code>
              </div>
            </div>
          </div>

          <!-- 右侧：结果展示 -->
          <div class="result-panel">
            <div class="panel-header">
              <h2>生成结果</h2>
              <p v-if="!markdownContent && !errorMessage">习题生成后将在此处显示</p>
              <p v-else-if="markdownContent">习题已生成完成</p>
            </div>

            <!-- 错误状态 -->
            <div
              v-if="errorMessage"
              class="error-state"
            >
              <div class="error-icon">❌</div>
              <h3>生成失败</h3>
              <p>{{ errorMessage }}</p>
              <button
                class="retry-btn"
                @click="handleGenerateExercises"
              >重试</button>
            </div>

            <!-- 空状态 -->
            <div
              v-else-if="!markdownContent && !isGenerating"
              class="empty-state"
            >
              <div class="empty-icon">📝</div>
              <h3>暂无习题</h3>
              <p>请在左侧填写信息并点击生成按钮</p>
            </div>

            <!-- 加载状态 -->
            <div
              v-if="isGenerating"
              class="loading-state"
            >
              <div class="loading-spinner"></div>
              <h3 v-if="generationStep === 'generating'">AI正在生成习题文件...</h3>
              <h3 v-else-if="generationStep === 'fetching'">正在获取习题内容...</h3>
              <p>请稍候，这可能需要几秒钟时间</p>
            </div>

            <!-- markdown 内容展示 -->
            <div
              v-if="markdownContent"
              class="markdown-content"
            >
              <div
                class="content-viewer"
                v-html="renderedMarkdown"
              ></div>

              <!-- 简化的操作按钮 - 只保留下载功能 -->
              <div class="result-actions">
                <button
                  class="action-btn primary"
                  @click="downloadExercises"
                >
                  📄 下载习题
                </button>
                <button
                  class="action-btn"
                  @click="clearResults"
                >
                  🗑️ 清空结果
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { marked } from 'marked'
import {
  generateExercises,
  getExerciseContent,
  convertTypeToBackend,
  downloadExerciseFile,
  type ExerciseGenerateRequest,
} from '@/api/exercise_generate'

const router = useRouter()

// 表单数据
const formData = reactive({
  title: '',
  quantity: 5,
  content: '',
  type: 'choice',
})

// 生成状态
const isGenerating = ref(false)
const generationStep = ref('') // 'generating' | 'fetching'

// markdown 内容
const markdownContent = ref('')

// 错误信息
const errorMessage = ref('')

// 修改：将 filePath 改为 fileName
const fileName = ref('')

// 页面跳转函数
const navigateTo = (path: string) => {
  router.push(path)
}

// 渲染 markdown 内容
const renderedMarkdown = computed(() => {
  if (!markdownContent.value) return ''
  return marked(markdownContent.value)
})

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
    console.log('文件名类型:', typeof generatedFileName)

    // 使用验证函数
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

// 第二步：获取习题内容 - 简化版本
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

    // 调用API获取内容 - 现在API已经处理了各种响应格式
    const content = await getExerciseContent(fileName.value)

    console.log('📄 获取到的内容类型:', typeof content)
    console.log('📄 内容长度:', content?.length || 0)

    // 验证内容
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

    // 成功获取内容
    markdownContent.value = trimmedContent
    console.log('✅ 成功获取到 markdown 内容')
    console.log('📊 内容预览:', trimmedContent.substring(0, 100) + '...')
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

// 一键生成 - 简化版本
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

// 保存习题
const saveExercises = () => {
  alert('习题已保存到题库')
}

// 修改下载函数 - 支持从服务器下载和本地下载
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
    // 生成文件名（包含时间戳）
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '').replace('T', '_')
    const filename = `${formData.title || '习题集'}_${timestamp}.md`

    // 创建 Blob 对象
    const blob = new Blob([markdownContent.value], { type: 'text/markdown;charset=utf-8' })

    // 创建下载链接
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.style.display = 'none'

    // 触发下载
    document.body.appendChild(link)
    link.click()

    // 清理
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    console.log('✅ 本地文件下载成功:', filename)

    // 显示成功提示
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

  // 3秒后移除提示
  setTimeout(() => {
    if (document.body.contains(successMsg)) {
      document.body.removeChild(successMsg)
    }
  }, 3000)
}

// 添加单独的服务器下载按钮函数（可选）
const downloadFromServer = async () => {
  if (!fileName.value) {
    errorMessage.value = '没有可下载的文件'
    return
  }

  try {
    console.log('📁 从服务器下载文件:', fileName.value)
    await downloadExerciseFile(fileName.value)
  } catch (error: any) {
    console.error('服务器下载失败:', error)
    errorMessage.value = error.message || '从服务器下载失败，请重试'
  }
}

// 添加一个验证函数来检查文件名格式
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

  if (!trimmed.endsWith('.md')) {
    console.warn('⚠️ 文件名不以.md结尾:', trimmed)
  }

  console.log('✅ 文件名验证通过')
  return true
}
</script>

<style scoped>
.exercise-generate-layout {
  display: flex;
  height: 100vh;
  width: 100vw;
  background: #f5f6fa;
  margin: 0;
  padding: 0;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.sidebar {
  width: 260px;
  background: #2d3a4b;
  color: #fff;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  margin: 0;
  padding: 0;
}

.logo {
  font-size: 24px;
  font-weight: bold;
  text-align: center;
  padding: 24px 0;
  letter-spacing: 2px;
  background: #223047;
  border-bottom: 1px solid #3a4a5c;
}

.menu {
  list-style: none;
  padding: 16px 0;
  margin: 0;
  flex: 1;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 16px 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin: 4px 16px;
  border-radius: 8px;
}

.menu-item:hover,
.menu-item.active {
  background: #3a4a5c;
  transform: translateX(4px);
}

.menu-item .icon {
  margin-right: 12px;
  font-size: 16px;
}

.main {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  margin: 0;
  padding: 0;
}

.header {
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 32px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.back-btn {
  background: #f8f9fa;
  color: #2d3a4b;
  border: 2px solid #e9ecef;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  font-weight: 500;
}

.back-btn:hover {
  background: #e9ecef;
  transform: translateX(-2px);
}

.header-left h1 {
  font-size: 24px;
  color: #2d3a4b;
  margin-bottom: 4px;
}

.header-left p {
  color: #666;
  font-size: 14px;
}

.header-user {
  display: flex;
  align-items: center;
  gap: 16px;
}

.logout-btn {
  background: #e74c3c;
  color: #fff;
  border: none;
  padding: 8px 20px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.3s ease;
  font-weight: 500;
}

.logout-btn:hover {
  background: #c0392b;
}

.content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background: #f5f6fa;
  margin: 0;
}

.generate-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  width: 100%;
  margin: 0;
  padding: 0;
}

.form-panel,
.result-panel {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  height: fit-content;
  min-height: 500px;
  margin: 0;
  width: 100%;
}

.panel-header {
  padding: 20px 24px;
  border-bottom: 1px solid #e9ecef;
  background: #f8f9fa;
  flex-shrink: 0;
}

.panel-header h2 {
  color: #2d3a4b;
  margin-bottom: 8px;
  font-size: 18px;
}

.panel-header p {
  color: #666;
  font-size: 14px;
}

.generate-form {
  padding: 24px;
  flex: 1;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  font-weight: 600;
  color: #2d3a4b;
  margin-bottom: 8px;
  font-size: 14px;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.3s ease;
  box-sizing: border-box;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #3498db;
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.radio-group {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.radio-item {
  display: flex;
  align-items: center;
  cursor: pointer;
  gap: 8px;
}

.radio-input {
  display: none;
}

.radio-custom {
  width: 18px;
  height: 18px;
  border: 2px solid #ddd;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.radio-input:checked + .radio-custom {
  border-color: #3498db;
  background: #3498db;
}

.radio-input:checked + .radio-custom::after {
  content: '';
  width: 8px;
  height: 8px;
  background: white;
  border-radius: 50%;
}

.radio-label {
  font-size: 14px;
  color: #2d3a4b;
}

.form-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 20px;
}

.generate-btn,
.reset-btn,
.fetch-btn,
.step-btn {
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.generate-btn {
  background: #3498db;
  color: white;
}

.generate-btn:hover:not(:disabled) {
  background: #2980b9;
  transform: translateY(-2px);
}

.generate-btn:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}

.fetch-btn {
  background: #27ae60;
  color: white;
}

.fetch-btn:hover:not(:disabled) {
  background: #229954;
  transform: translateY(-2px);
}

.fetch-btn:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}

.reset-btn {
  background: #f8f9fa;
  color: #666;
  border: 2px solid #e9ecef;
  grid-column: 1 / -1;
}

.reset-btn:hover {
  background: #e9ecef;
}

.primary {
  background: #e74c3c !important;
  grid-column: 1 / -1;
  padding: 16px 20px;
  font-size: 16px;
  margin-bottom: 12px;
}

.primary:hover:not(:disabled) {
  background: #c0392b !important;
}

.step-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 20px 0;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.step-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  opacity: 0.5;
  transition: all 0.3s ease;
}

.step-item.active {
  opacity: 1;
  color: #3498db;
}

.step-item.completed {
  opacity: 1;
  color: #27ae60;
}

.step-number {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  transition: all 0.3s ease;
  font-size: 14px;
}

.step-item.active .step-number {
  background: #3498db;
  color: white;
}

.step-item.completed .step-number {
  background: #27ae60;
  color: white;
}

.step-text {
  font-size: 12px;
  text-align: center;
}

.step-arrow {
  margin: 0 16px;
  font-size: 16px;
  color: #ddd;
}

.file-path-display {
  margin-top: 16px;
  padding: 12px;
  background: #e8f5e8;
  border-radius: 8px;
  border-left: 4px solid #27ae60;
}

.file-path-display h4 {
  margin-bottom: 8px;
  color: #27ae60;
  font-size: 14px;
}

.file-path-display code {
  background: #fff;
  padding: 8px 12px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  word-break: break-all;
  display: block;
}

/* 右侧面板样式 */
.result-panel {
  position: relative;
}

.empty-state,
.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  text-align: center;
  padding: 32px;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.error-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.error-state h3 {
  color: #e74c3c;
  margin-bottom: 12px;
}

.error-state p {
  color: #666;
  margin-bottom: 20px;
}

.retry-btn {
  background: #e74c3c;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.retry-btn:hover {
  background: #c0392b;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.markdown-content {
  padding: 24px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.content-viewer {
  flex: 1;
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  overflow-y: auto;
  max-height: 400px;
}

.result-actions {
  display: flex;
  gap: 12px;
  padding: 16px 0;
  border-top: 1px solid #e9ecef;
  justify-content: center;
  flex-shrink: 0;
}

.action-btn {
  padding: 12px 24px;
  border: 2px solid #e9ecef;
  background: white;
  color: #666;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-btn:hover {
  background: #f8f9fa;
  border-color: #ddd;
  transform: translateY(-2px);
}

.action-btn.primary {
  background: #3498db;
  color: white;
  border-color: #3498db;
}

.action-btn.primary:hover {
  background: #2980b9;
  border-color: #2980b9;
}

/* 自定义滚动条样式 */
.content::-webkit-scrollbar,
.content-viewer::-webkit-scrollbar {
  width: 8px;
}

.content::-webkit-scrollbar-track,
.content-viewer::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.content::-webkit-scrollbar-thumb,
.content-viewer::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.content::-webkit-scrollbar-thumb:hover,
.content-viewer::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Markdown 样式 */
.content-viewer :deep(h1),
.content-viewer :deep(h2),
.content-viewer :deep(h3),
.content-viewer :deep(h4) {
  color: #2d3a4b;
  margin: 16px 0 8px 0;
  font-size: 16px;
}

.content-viewer :deep(h1) {
  font-size: 18px;
}

.content-viewer :deep(p) {
  line-height: 1.6;
  margin-bottom: 12px;
  color: #333;
  font-size: 14px;
}

.content-viewer :deep(ol),
.content-viewer :deep(ul) {
  margin: 12px 0;
  padding-left: 20px;
}

.content-viewer :deep(li) {
  margin-bottom: 6px;
  line-height: 1.5;
  font-size: 14px;
}

.content-viewer :deep(code) {
  background: #e9ecef;
  padding: 2px 4px;
  border-radius: 3px;
  font-family: 'Courier New', monospace;
  font-size: 12px;
}

.content-viewer :deep(pre) {
  background: #2d3a4b;
  color: #fff;
  padding: 12px;
  border-radius: 6px;
  overflow-x: auto;
  margin: 12px 0;
  font-size: 12px;
}

.content-viewer :deep(blockquote) {
  border-left: 3px solid #3498db;
  margin: 12px 0;
  padding-left: 12px;
  color: #666;
  font-style: italic;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .generate-container {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}

@media (max-width: 768px) {
  .sidebar {
    width: 200px;
  }

  .content {
    padding: 12px;
  }

  .radio-group {
    flex-direction: column;
    gap: 12px;
  }

  .form-actions {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 600px) {
  .result-actions {
    flex-direction: column;
  }

  .action-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>