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
        title="我的文档"
        :showMobileMenu="true"
        @toggleMobileMenu="toggleMobileMenu"
      >
        <template #actions>
          <div class="header-actions">
            <div class="search-box">
              <input
                v-model="searchKeyword"
                type="text"
                placeholder="搜索文档..."
                @keyup.enter="handleSearch"
              />
              <button
                class="search-btn"
                :disabled="isSearching"
                @click="handleSearch"
              >
                {{ isSearching ? '搜索中...' : '搜索' }}
              </button>
            </div>
            <button
              @click="showUploadDialog"
              class="upload-btn"
            >
              <span class="btn-icon">📄</span>
              <span>上传文档</span>
            </button>
          </div>
        </template>
      </PageHeader>

      <!-- 内容区域 -->
      <main class="content-area">
        <!-- 加载状态 -->
        <div
          v-if="isLoading"
          class="loading-state"
        >
          正在加载文档列表...
        </div>

        <!-- 文档列表 -->
        <div
          v-else
          class="document-list"
        >
          <!-- 列表为空时的提示 -->
          <div
            v-if="!documents.length"
            class="empty-state"
          >
            暂无已处理的文档
          </div>

          <!-- 文档列表表格 -->
          <table
            v-else
            class="document-table"
          >
            <thead>
              <tr>
                <th>标题</th>
                <th>类型</th>
                <th>大小</th>
                <th>创建时间</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="doc in documents"
                :key="doc.id"
              >
                <td class="doc-title">
                  {{ doc.title }}
                </td>
                <td>{{ doc.type }}</td>
                <td>{{ formatFileSize(doc.size) }}</td>
                <td>{{ formatDateTime(doc.created_at) }}</td>
                <td>
                  <span
                    class="status-tag"
                    :class="getStatusClass(doc.status)"
                  >
                    {{ doc.status }}
                  </span>
                </td>
                <td class="actions">
                  <button
                    v-if="doc.download_url"
                    @click="downloadDocument(doc)"
                    class="btn download-btn"
                  >
                    下载
                  </button>
                  <button
                    @click="deleteDocument(doc.id)"
                    class="btn delete-btn"
                  >
                    删除
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 添加上传对话框 -->
        <div
          v-if="showDialog"
          class="upload-dialog-overlay"
        >
          <div class="upload-dialog">
            <h3>上传文档</h3>
            <div class="form-group">
              <label>文档标题</label>
              <input
                v-model="uploadForm.title"
                type="text"
                placeholder="请输入文档标题"
                required
              />
            </div>
            <div class="form-group">
              <label>选择文件</label>
              <input
                ref="fileInput"
                type="file"
                @change="handleFileSelect"
                accept=".txt,.docx"
              />
              <div
                class="file-info"
                v-if="uploadForm.file"
              >
                已选择: {{ uploadForm.file.name }}
                ({{ formatFileSize(uploadForm.file.size) }})
              </div>
            </div>
            <div class="format-info">
              <p>支持的格式：</p>
              <ul>
                <li>TXT格式：纯文本文件，向量化效果最佳</li>
                <li>DOCX格式：Word文档，自动提取文本内容</li>
              </ul>
              <p>文件大小限制：500MB</p>
            </div>
            <div class="dialog-actions">
              <button
                @click="handleUpload"
                :disabled="!canUpload || isUploading"
                class="submit-btn"
              >
                {{ isUploading ? '上传中...' : '上传' }}
              </button>
              <button
                @click="closeUploadDialog"
                class="cancel-btn"
              >取消</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script lang="ts">
import { ref, onMounted, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import PageHeader from '@/components/layout/PageHeader.vue'
import SideBar from '@/components/layout/SideBar.vue'
import {
  getTeacherDocuments,
  uploadDocument,
  searchTeacherDocuments,
  type TeacherDocument,
} from '@/api/teacher/document'

export default {
  name: 'DocumentList',

  components: {
    PageHeader,
    SideBar,
  },

  setup() {
    const router = useRouter()
    const isLoading = ref(true)
    const documents = ref<TeacherDocument[]>([])
    const mobileMenuOpen = ref(false)
    const showDialog = ref(false)
    const isUploading = ref(false)
    const uploadForm = reactive({
      title: '',
      file: null as File | null,
    })
    const fileInput = ref<HTMLInputElement | null>(null)
    const searchKeyword = ref('')
    const isSearching = ref(false)

    // 教师菜单项
    const teacherMenuItems = [
      { path: '/teacher/home', name: '首页', icon: '🏠' },
      { path: '/course_list', name: '课程管理', icon: '📚' },
    ]

    // 加载文档列表
    const loadDocuments = async () => {
      isLoading.value = true
      try {
        const docs = await getTeacherDocuments()
        documents.value = docs
      } catch (error: any) {
        alert(error.message || '获取文档列表失败')
      } finally {
        isLoading.value = false
      }
    }

    // 格式化文件大小
    const formatFileSize = (bytes?: number) => {
      if (!bytes) return '-'
      if (bytes === 0) return '0 B'
      const k = 1024
      const sizes = ['B', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    // 格式化日期时间
    const formatDateTime = (dateStr: string) => {
      const date = new Date(dateStr)
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })
    }

    // 获取状态样式类
    const getStatusClass = (status: string) => {
      switch (status.toLowerCase()) {
        case 'completed':
          return 'status-success'
        case 'processing':
          return 'status-processing'
        case 'failed':
          return 'status-error'
        default:
          return ''
      }
    }

    // 下载文档
    const downloadDocument = (doc: TeacherDocument) => {
      if (!doc.download_url) return
      window.open(doc.download_url, '_blank')
    }

    // 删除文档
    const deleteDocument = async (id: number) => {
      if (confirm('确定要删除这个文档吗？此操作不可恢复！')) {
        // TODO: 实现删除功能
        alert('删除功能待实现')
      }
    }

    // 显示上传对话框
    const showUploadDialog = () => {
      showDialog.value = true
    }

    // 关闭上传对话框
    const closeUploadDialog = () => {
      showDialog.value = false
      uploadForm.title = ''
      uploadForm.file = null
      if (fileInput.value) {
        fileInput.value.value = ''
      }
    }

    // 处理文件选择
    const handleFileSelect = (event: Event) => {
      const input = event.target as HTMLInputElement
      if (input.files?.length) {
        uploadForm.file = input.files[0]
      }
    }

    // 计算是否可以上传
    const canUpload = computed(() => {
      return uploadForm.title.trim() && uploadForm.file
    })

    // 上传文档
    const handleUpload = async () => {
      if (!uploadForm.file || !uploadForm.title.trim() || isUploading.value) return

      try {
        isUploading.value = true
        const result = await uploadDocument(uploadForm.title.trim(), uploadForm.file)
        if (result.success) {
          alert('上传成功')
          closeUploadDialog()
          loadDocuments() // 刷新列表
        }
      } catch (error: any) {
        alert(error.message || '上传失败，请稍后重试')
      } finally {
        isUploading.value = false
      }
    }

    // 搜索文档
    const handleSearch = async () => {
      if (!searchKeyword.value.trim()) {
        // 如果搜索关键词为空，加载所有文档
        loadDocuments()
        return
      }

      try {
        isSearching.value = true
        const results = await searchTeacherDocuments(searchKeyword.value.trim())
        documents.value = results
      } catch (error: any) {
        alert(error.message || '搜索失败')
      } finally {
        isSearching.value = false
      }
    }

    // 移动端菜单处理
    const toggleMobileMenu = () => {
      mobileMenuOpen.value = !mobileMenuOpen.value
    }

    const handleMenuClick = (item: any) => {
      router.push(item.path)
      mobileMenuOpen.value = false
    }

    onMounted(() => {
      loadDocuments()
    })

    return {
      documents,
      isLoading,
      mobileMenuOpen,
      teacherMenuItems,
      formatFileSize,
      formatDateTime,
      getStatusClass,
      downloadDocument,
      deleteDocument,
      showDialog,
      isUploading,
      uploadForm,
      showUploadDialog,
      closeUploadDialog,
      handleFileSelect,
      canUpload,
      handleUpload,
      searchKeyword,
      isSearching,
      handleSearch,
      toggleMobileMenu,
      handleMenuClick,
      fileInput,
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

.document-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.document-table th,
.document-table td {
  padding: 16px;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
}

.document-table th {
  background: #f8fafc;
  font-weight: 600;
  color: #4a5568;
}

.document-table tr:hover {
  background: #f8fafc;
}

.doc-title {
  font-weight: 500;
  color: #2d3748;
}

.status-tag {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 14px;
}

.status-success {
  background: #f0fff4;
  color: #48bb78;
}

.status-processing {
  background: #ebf8ff;
  color: #4299e1;
}

.status-error {
  background: #fff5f5;
  color: #e53e3e;
}

.actions {
  display: flex;
  gap: 8px;
}

.btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.download-btn {
  background: #ebf8ff;
  color: #3182ce;
}

.download-btn:hover {
  background: #bee3f8;
}

.delete-btn {
  background: #fff5f5;
  color: #e53e3e;
}

.delete-btn:hover {
  background: #fed7d7;
}

.empty-state,
.loading-state {
  padding: 40px;
  text-align: center;
  color: #718096;
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.upload-btn {
  display: inline-flex;
  align-items: center;
  padding: 8px 16px;
  background: #3182ce;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
}

.upload-btn:hover {
  background: #2b6cb0;
}

.upload-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.upload-dialog {
  background: white;
  padding: 24px;
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.upload-dialog h3 {
  margin: 0 0 20px 0;
  color: #2d3748;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #4a5568;
}

.form-group input[type='text'] {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
}

.file-info {
  margin-top: 8px;
  color: #718096;
  font-size: 14px;
}

.format-info {
  background: #f8fafc;
  padding: 12px;
  border-radius: 6px;
  margin: 16px 0;
  font-size: 14px;
}

.format-info ul {
  margin: 8px 0;
  padding-left: 20px;
  color: #4a5568;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.submit-btn,
.cancel-btn {
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
}

.submit-btn {
  background: #4299e1;
  color: white;
  border: none;
}

.submit-btn:disabled {
  background: #90cdf4;
  cursor: not-allowed;
}

.cancel-btn {
  background: white;
  color: #4a5568;
  border: 1px solid #e2e8f0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.search-box {
  display: flex;
  gap: 8px;
}

.search-box input {
  width: 240px;
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
}

.search-box input:focus {
  outline: none;
  border-color: #4299e1;
  box-shadow: 0 0 0 2px rgba(66, 153, 225, 0.2);
}

.search-btn {
  padding: 8px 16px;
  background: #edf2f7;
  color: #4a5568;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.search-btn:hover:not(:disabled) {
  background: #e2e8f0;
}

.search-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .main-layout {
    margin-left: 0;
  }

  .content-area {
    padding: 16px;
  }

  .actions {
    flex-direction: column;
  }

  .document-table {
    font-size: 14px;
  }

  .document-table th,
  .document-table td {
    padding: 12px;
  }

  .header-actions {
    flex-direction: column;
    gap: 12px;
  }

  .search-box {
    width: 100%;
  }

  .search-box input {
    flex: 1;
  }
}
</style>