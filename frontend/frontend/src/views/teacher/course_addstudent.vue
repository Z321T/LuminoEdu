<template>
  <div class="teacher-layout">
    <!-- 侧边栏 -->
    <SideBar
      :menuItems="teacherMenuItems"
      :activeItem="$route.path"
      :class="{ 'mobile-open': mobileMenuOpen }"
      @menuClick="handleMenuClick"
    />

    <!-- 主要内容区域 -->
    <div class="main-layout">
      <!-- 页面头部 -->
      <PageHeader
        :title="`导入学生 - ${courseName}`"
        :showMobileMenu="true"
        @toggleMobileMenu="toggleMobileMenu"
      >
        <template #actions>
          <div class="user-actions">
            <div class="user-info">
              <span class="user-avatar">👤</span>
              <span class="username">{{ username }}</span>
            </div>
            <button
              @click="logout"
              class="logout-btn"
            >
              <span class="logout-icon">🚪</span>
              <span>退出</span>
            </button>
          </div>
        </template>
      </PageHeader>

      <!-- 内容区域 -->
      <main class="content-area">
        <div class="import-container">
          <!-- 导入说明 -->
          <div class="import-guide">
            <h3>导入说明</h3>
            <ul>
              <li>请使用Excel文件(.xlsx或.xls格式)</li>
              <li>第一行为表头，从第二行开始为学生数据</li>
              <li>必需列：学号、姓名</li>
              <li>可选列：班级、邮箱</li>
            </ul>
            <div class="template-download">
              <a
                href="#"
                @click.prevent="handleTemplateDownload"
              >
                <span class="download-icon">📥</span>
                下载导入模板
              </a>
            </div>
          </div>

          <!-- 文件上传区域 -->
          <div
            class="upload-area"
            @dragover.prevent
            @drop.prevent="handleFileDrop"
          >
            <input
              type="file"
              ref="fileInput"
              @change="handleFileSelect"
              accept=".xlsx,.xls"
              class="file-input"
            >
            <div class="upload-content">
              <span class="upload-icon">📄</span>
              <p class="upload-text">
                {{ file ? file.name : '点击或拖拽Excel文件到此处' }}
              </p>
              <button
                v-if="!file"
                @click="triggerFileInput"
                class="select-btn"
              >
                选择文件
              </button>
            </div>
          </div>

          <!-- 导入结果 -->
          <div
            v-if="importResult"
            :class="['import-result', importResult.success ? 'success' : 'error']"
          >
            <h4>导入结果</h4>
            <!-- 显示服务器返回的消息 -->
            <div class="result-message">
              {{ importResult.message }}
            </div>

            <div class="result-stats">
              <div class="stat-item">
                <span class="stat-label">总数:</span>
                <span class="stat-value">{{ importResult.total }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">成功:</span>
                <span class="stat-value success">{{ importResult.added }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">失败:</span>
                <span
                  class="stat-value error">{{ importResult.failed.length }}</span>
              </div>
            </div>

            <!-- 失败列表部分保持不变 -->
            <div
              v-if="importResult.failed.length > 0"
              class="failed-list"
            >
              <h5>失败详情：</h5>
              <div class="failed-items">
                <div
                  v-for="(item, index) in importResult.failed"
                  :key="index"
                  class="failed-item"
                >
                  <span class="failed-icon">❌</span>
                  <span class="failed-text">{{ item }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="actions">
            <button
              class="import-btn"
              @click="handleImport"
              :disabled="!file || isImporting"
            >
              {{ isImporting ? '导入中...' : '开始导入' }}
            </button>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  importStudentsByExcel,
  downloadStudentTemplate,
  type ImportStudentsResponse,
} from '@/api/teacher/course_management'
import PageHeader from '@/components/layout/PageHeader.vue'
import SideBar from '@/components/layout/SideBar.vue'

export default {
  name: 'CourseAddStudent',

  components: {
    PageHeader,
    SideBar,
  },

  setup() {
    const route = useRoute()
    const router = useRouter()
    const courseId = Number(route.params.id)
    const courseName = ref('')
    const username = ref(localStorage.getItem('username') || '教师用户')
    const mobileMenuOpen = ref(false)

    const file = ref<File | null>(null)
    const fileInput = ref<HTMLInputElement | null>(null)
    const isImporting = ref(false)
    const importResult = ref<ImportStudentsResponse | null>(null)

    // 触发文件选择
    const triggerFileInput = () => {
      fileInput.value?.click()
    }

    // 处理文件选择
    const handleFileSelect = (event: Event) => {
      const input = event.target as HTMLInputElement
      if (input.files?.length) {
        file.value = input.files[0]
        importResult.value = null
      }
    }

    // 处理文件拖放
    const handleFileDrop = (event: DragEvent) => {
      const droppedFiles = event.dataTransfer?.files
      if (droppedFiles?.length) {
        file.value = droppedFiles[0]
        importResult.value = null
      }
    }

    // 导入学生
    const handleImport = async () => {
      if (!file.value || isImporting.value) return

      try {
        isImporting.value = true
        importResult.value = await importStudentsByExcel(courseId, file.value)

        // 只有在完全成功时才清空文件
        if (importResult.value.success && importResult.value.failed.length === 0) {
          file.value = null
          if (fileInput.value) fileInput.value.value = ''
        }
      } catch (error: any) {
        alert(error.message || '导入失败，请稍后重试')
      } finally {
        isImporting.value = false
      }
    }

    // 处理模板下载
    const handleTemplateDownload = async () => {
      try {
        const blob = await downloadStudentTemplate()
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = '学生导入模板.xlsx'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      } catch (error: any) {
        alert(error.message || '下载模板失败，请稍后重试')
      }
    }

    return {
      courseId,
      courseName,
      username,
      mobileMenuOpen,
      file,
      fileInput,
      isImporting,
      importResult,
      triggerFileInput,
      handleFileSelect,
      handleFileDrop,
      handleImport,
      handleTemplateDownload,
    }
  },
}
</script>

<style scoped>
.teacher-layout {
  display: flex;
  width: 100vw;
  height: 100vh;
  background: #f8fafc;
}

.main-layout {
  flex: 1;
  margin-left: 280px;
  display: flex;
  flex-direction: column;
}

.content-area {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

.import-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* 导入说明区域 */
.import-guide {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.import-guide h3 {
  margin: 0 0 16px 0;
  color: #2d3748;
  font-size: 18px;
}

.import-guide ul {
  padding-left: 20px;
  margin: 0;
  color: #4a5568;
}

.import-guide li {
  margin-bottom: 8px;
}

.template-download {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e2e8f0;
}

.template-download a {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #4299e1;
  text-decoration: none;
  font-weight: 500;
}

.template-download a:hover {
  color: #3182ce;
}

/* 上传区域 */
.upload-area {
  background: white;
  border: 2px dashed #e2e8f0;
  border-radius: 12px;
  padding: 40px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-area:hover {
  border-color: #4299e1;
  background: #f7fafc;
}

.file-input {
  display: none;
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.upload-icon {
  font-size: 48px;
  color: #4a5568;
}

.upload-text {
  margin: 0;
  color: #4a5568;
  font-size: 16px;
}

.select-btn {
  background: #4299e1;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.select-btn:hover {
  background: #3182ce;
}

/* 导入结果样式更新 */
.import-result {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.import-result.success {
  border-left: 4px solid #48bb78;
}

.import-result.error {
  border-left: 4px solid #e53e3e;
}

.import-result h4 {
  margin: 0 0 20px 0;
  color: #2d3748;
  font-size: 18px;
}

.result-stats {
  display: flex;
  gap: 32px;
  margin-bottom: 20px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stat-label {
  color: #4a5568;
  font-weight: 500;
}

.stat-value {
  font-size: 18px;
  font-weight: 600;
}

.stat-value.success {
  color: #48bb78;
}

.stat-value.error {
  color: #e53e3e;
}

.failed-list {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e2e8f0;
}

.failed-list h5 {
  margin: 0 0 12px 0;
  color: #2d3748;
  font-size: 16px;
}

.failed-items {
  background: #fff5f5;
  border-radius: 8px;
  padding: 16px;
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #fed7d7;
}

.failed-item {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  margin: 4px;
  background: white;
  border-radius: 4px;
  border: 1px solid #fed7d7;
}

.failed-icon {
  color: #e53e3e;
  font-size: 14px;
}

.failed-text {
  color: #c53030;
  font-family: monospace;
  font-size: 15px;
  font-weight: 500;
}

.result-message {
  margin: 20px 0 0 0;
  padding: 16px;
  background: #fff5f5;
  border-radius: 8px;
  color: #c53030;
  font-weight: 500;
  text-align: center;
  border: 1px solid #fed7d7;
}

/* 操作按钮 */
.actions {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}

.import-btn {
  background: #4299e1;
  color: white;
  border: none;
  padding: 12px 32px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 160px;
}

.import-btn:hover {
  background: #3182ce;
}

.import-btn:disabled {
  background: #90cdf4;
  cursor: not-allowed;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .main-layout {
    margin-left: 0;
  }

  .content-area {
    padding: 16px;
  }

  .import-guide,
  .upload-area,
  .import-result {
    padding: 16px;
  }

  .upload-area {
    min-height: 200px;
  }

  .actions {
    padding: 0 16px;
  }

  .import-btn {
    width: 100%;
  }
}
</style>