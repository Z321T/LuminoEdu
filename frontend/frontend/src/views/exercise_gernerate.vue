<template>
  <div class="exercise-generate-layout">
    <!-- 侧边栏 -->
    <aside class="sidebar">
      <div class="logo">LuminoEdu</div>
      <ul class="menu">
        <li class="menu-item">
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
          <h1 class="page-title">智能习题生成</h1>
          <p class="page-subtitle">基于AI技术，快速生成高质量习题</p>
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

            <form
              @submit.prevent="generateExercises"
              class="generate-form"
            >
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

              <!-- 生成按钮 -->
              <div class="form-actions">
                <button
                  type="submit"
                  class="generate-btn"
                  :disabled="isGenerating"
                  :class="{ loading: isGenerating }"
                >
                  <span v-if="!isGenerating">🚀 生成习题</span>
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
            </form>
          </div>

          <!-- 右侧：结果展示 -->
          <div class="result-panel">
            <div class="panel-header">
              <h2>生成结果</h2>
              <p v-if="!generatedExercises.length && !errorMessage">习题生成后将在此处显示</p>
              <p v-else-if="generatedExercises.length">共生成 {{ generatedExercises.length }} 道题目</p>
            </div>

            <!-- 错误状态 -->
            <div v-if="errorMessage" class="error-state">
              <div class="error-icon">❌</div>
              <h3>生成失败</h3>
              <p>{{ errorMessage }}</p>
              <button class="retry-btn" @click="generateExercises">重试</button>
            </div>

            <!-- 空状态 -->
            <div
              v-else-if="!generatedExercises.length && !isGenerating"
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
              <h3>AI正在生成习题...</h3>
              <p>请稍候，这可能需要几秒钟时间</p>
            </div>

            <!-- 习题列表 -->
            <div
              v-if="generatedExercises.length"
              class="exercises-list"
            >
              <div
                v-for="(exercise, index) in generatedExercises"
                :key="index"
                class="exercise-item"
              >
                <div class="exercise-header">
                  <span class="exercise-number">第 {{ index + 1 }} 题</span>
                  <span
                    class="exercise-type">{{ getTypeLabel(exercise.type) }}</span>
                </div>
                <div class="exercise-content">
                  <h4 class="exercise-question">{{ exercise.question }}</h4>

                  <!-- 选择题选项 -->
                  <div
                    v-if="exercise.type === 'choice'"
                    class="choice-options"
                  >
                    <div
                      v-for="(option, optIndex) in exercise.options"
                      :key="optIndex"
                      class="choice-option"
                    >
                      {{ String.fromCharCode(65 + optIndex) }}. {{ option }}
                    </div>
                  </div>

                  <!-- 答案 -->
                  <div class="exercise-answer">
                    <strong>参考答案：</strong>{{ exercise.answer }}
                  </div>

                  <!-- 解析 -->
                  <div
                    v-if="exercise.explanation"
                    class="exercise-explanation"
                  >
                    <strong>解析：</strong>{{ exercise.explanation }}
                  </div>
                </div>
              </div>

              <!-- 操作按钮 -->
              <div class="result-actions">
                <button
                  class="action-btn primary"
                  @click="saveExercises"
                >
                  💾 保存习题
                </button>
                <button
                  class="action-btn"
                  @click="exportExercises"
                >
                  📄 导出文档
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
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { 
  generateExercises, 
  convertTypeToBackend, 
  parseExerciseData,
  type ExerciseGenerateRequest 
} from '@/api/exercise_generate'

const router = useRouter()

// 表单数据
const formData = reactive({
  title: '',
  quantity: 5,
  content: '',
  type: 'choice'
})

// 生成状态
const isGenerating = ref(false)

// 生成的习题
const generatedExercises = ref([])

// 错误信息
const errorMessage = ref('')

// 页面跳转函数
const navigateTo = (path: string) => {
  router.push(path)
}

// 题目类型标签映射
const getTypeLabel = (type: string) => {
  const typeMap = {
    choice: '选择题',
    fill: '填空题',
    essay: '简答题'
  }
  return typeMap[type] || type
}

// 生成习题
const generateExercises = async () => {
  try {
    isGenerating.value = true
    errorMessage.value = ''
    
    // 构造请求参数
    const requestParams: ExerciseGenerateRequest = {
      title: formData.title || '未命名习题集',
      content: formData.content,
      count: formData.quantity,
      types: [convertTypeToBackend(formData.type)]
    }
    
    // 调用API
    const response = await generateExercises(requestParams)
    
    if (response.code === 200) {
      // 解析返回的JSON字符串
      const exerciseData = parseExerciseData(response.data)
      
      if (exerciseData) {
        // 如果后端返回的是数组格式
        if (Array.isArray(exerciseData)) {
          generatedExercises.value = exerciseData
        } else {
          // 如果后端返回的是其他格式，需要根据实际情况调整
          generatedExercises.value = [exerciseData]
        }
      } else {
        throw new Error('解析返回数据失败')
      }
    } else {
      throw new Error(response.message || '生成习题失败')
    }
  } catch (error) {
    console.error('生成习题失败:', error)
    errorMessage.value = error.message || '生成习题时发生错误，请重试'
    generatedExercises.value = []
  } finally {
    isGenerating.value = false
  }
}

// 重置表单
const resetForm = () => {
  formData.title = ''
  formData.quantity = 5
  formData.content = ''
  formData.type = 'choice'
  errorMessage.value = ''
}

// 保存习题
const saveExercises = () => {
  // 这里可以调用保存API
  alert('习题已保存到题库')
}

// 导出习题
const exportExercises = () => {
  // 这里可以实现导出功能
  alert('习题导出功能开发中')
}

// 清空结果
const clearResults = () => {
  generatedExercises.value = []
  errorMessage.value = ''
}
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.exercise-generate-layout {
  display: flex;
  height: 100vh;
  width: 100vw;
  background: #f5f6fa;
  overflow: hidden;
}

.sidebar {
  width: 260px;
  background: #2d3a4b;
  color: #fff;
  display: flex;
  flex-direction: column;
  padding: 0;
  box-shadow: 2px 0 6px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
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
  width: calc(100vw - 260px);
  overflow: hidden;
}

.header {
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 32px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  flex-shrink: 0;
}

.header-left h1 {
  font-size: 28px;
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
  padding: 32px;
  overflow-y: auto;
}

.generate-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
  max-width: 1400px;
  margin: 0 auto;
  height: 100%;
}

.form-panel,
.result-panel {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.panel-header {
  padding: 24px 32px;
  border-bottom: 1px solid #e9ecef;
  background: #f8f9fa;
}

.panel-header h2 {
  color: #2d3a4b;
  margin-bottom: 8px;
  font-size: 20px;
}

.panel-header p {
  color: #666;
  font-size: 14px;
}

.generate-form {
  padding: 32px;
  flex: 1;
}

.form-group {
  margin-bottom: 24px;
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
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #3498db;
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

.radio-group {
  display: flex;
  gap: 24px;
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
  display: flex;
  gap: 16px;
  margin-top: 32px;
}

.generate-btn,
.reset-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.generate-btn {
  background: #3498db;
  color: white;
  flex: 1;
}

.generate-btn:hover:not(:disabled) {
  background: #2980b9;
  transform: translateY(-2px);
}

.generate-btn:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}

.reset-btn {
  background: #f8f9fa;
  color: #666;
  border: 2px solid #e9ecef;
}

.reset-btn:hover {
  background: #e9ecef;
}

.result-panel {
  position: relative;
}

.empty-state,
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
  text-align: center;
  padding: 32px;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
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

.exercises-list {
  padding: 32px;
  flex: 1;
}

.exercise-item {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  border-left: 4px solid #3498db;
}

.exercise-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.exercise-number {
  font-weight: 600;
  color: #2d3a4b;
}

.exercise-type {
  background: #3498db;
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
}

.exercise-question {
  color: #2d3a4b;
  margin-bottom: 16px;
  line-height: 1.6;
}

.choice-options {
  margin-bottom: 16px;
}

.choice-option {
  padding: 8px 0;
  color: #666;
}

.exercise-answer,
.exercise-explanation {
  margin-bottom: 12px;
  padding: 12px;
  background: white;
  border-radius: 6px;
  font-size: 14px;
}

.result-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  padding: 24px 0;
  border-top: 1px solid #e9ecef;
}

.action-btn {
  padding: 10px 20px;
  border: 2px solid #e9ecef;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
}

.action-btn.primary {
  background: #3498db;
  color: white;
  border-color: #3498db;
}

.action-btn:hover {
  transform: translateY(-2px);
}

.action-btn.primary:hover {
  background: #2980b9;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .generate-container {
    grid-template-columns: 1fr;
    gap: 24px;
  }
}

@media (max-width: 768px) {
  .sidebar {
    width: 200px;
  }

  .main {
    width: calc(100vw - 200px);
  }

  .content {
    padding: 16px;
  }

  .radio-group {
    flex-direction: column;
    gap: 12px;
  }
}
</style>