<template>
  <div class="exercise-generate-layout">
    <!-- 侧边栏 -->
    <Sidebar :menu-items="teacherMenuItems" />

    <!-- 主体内容 -->
    <div class="main">
      <!-- 顶部导航栏 -->
      <PageHeader title="智能习题生成">
        <template #actions>
          <button
            class="btn btn-primary"
            @click="navigateTo('/exercise_history')"
          >
            📚 查看历史记录
          </button>
          <div class="header-user">
            <span>欢迎，张老师</span>
            <button
              class="logout-btn"
              @click="handleLogout"
            >退出登录</button>
          </div>
        </template>
      </PageHeader>

      <!-- 内容区 -->
      <section class="content">
        <div class="generate-container">
          <!-- 左侧：生成表单 -->
          <ExerciseForm
            v-model:form-data="formData"
            :is-generating="isGenerating"
            :generation-step="generationStep"
            :file-name="fileName"
            @generate-file="generateExerciseFile"
            @fetch-content="fetchExerciseContent"
            @one-click-generate="handleGenerateExercises"
            @reset="resetForm"
          />

          <!-- 右侧：结果展示 -->
          <ExerciseResult
            :markdown-content="markdownContent"
            :is-generating="isGenerating"
            :generation-step="generationStep"
            :error-message="errorMessage"
            @download="downloadExercises"
            @clear="clearResults"
            @retry="handleGenerateExercises"
          />
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import Sidebar from '@/components/layout/Sidebar.vue'
import PageHeader from '@/components/layout/PageHeader.vue'
import ExerciseForm from '@/components/exercise/ExerciseForm.vue'
import ExerciseResult from '@/components/exercise/ExerciseResult.vue'
import { useExerciseGenerate } from '@/composables/useExerciseGenerate'

const router = useRouter()

// 菜单配置
const teacherMenuItems = [
  { path: '/home_teacher', icon: '🏠', label: '首页' },
  { path: '/exercise_generate', icon: '📝', label: '习题生成' },
  { path: '/exercise_history', icon: '📚', label: '历史记录' },
  { path: '/course_management', icon: '📚', label: '课程管理' },
  { path: '/student_management', icon: '👥', label: '学生管理' },
  { path: '/settings', icon: '⚙️', label: '设置' },
]

// 表单数据
const formData = reactive({
  title: '',
  quantity: 5,
  content: '',
  type: 'choice',
})

// 使用组合式API管理习题生成逻辑
const {
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
  clearResults,
} = useExerciseGenerate(formData)

// 页面跳转
const navigateTo = (path: string) => {
  router.push(path)
}

// 退出登录
const handleLogout = () => {
  if (confirm('确定要退出登录吗？')) {
    localStorage.removeItem('token')
    router.push('/login')
  }
}
</script>

<style scoped>
.exercise-generate-layout {
  display: flex;
  height: 100vh;
  width: 100vw;
  background: #f5f6fa;
}

.main {
  flex: 1;
  margin-left: 240px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background: #f5f6fa;
}

.generate-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  width: 100%;
  margin: 0;
  padding: 0;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
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

@media (max-width: 1200px) {
  .generate-container {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}

@media (max-width: 768px) {
  .main {
    margin-left: 0;
  }

  .content {
    padding: 12px;
  }
}
</style>