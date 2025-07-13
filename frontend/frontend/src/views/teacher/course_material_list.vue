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
        :title="`课程资料 - ${courseName}`"
        :showMobileMenu="true"
        @toggleMobileMenu="toggleMobileMenu"
      >
        <template #actions>
          <div class="user-actions">
            <!-- 修改上传按钮 -->
            <button
              @click="triggerUpload"
              class="upload-btn"
            >
              <span class="btn-icon">📤</span>
              <span>{{ isUploading ? '上传中...' : '上传资料' }}</span>
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
          正在加载课程资料...
        </div>

        <!-- 资料列表 -->
        <div
          v-else
          class="material-list"
        >
          <!-- 列表为空时的提示 -->
          <div
            v-if="!materials.length"
            class="empty-state"
          >
            暂无课程资料，点击"上传资料"添加
          </div>

          <!-- 资料列表表格 -->
          <table
            v-else
            class="material-table"
          >
            <thead>
              <tr>
                <th>文件名</th>
                <th>大小</th>
                <th>上传时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="material in materials"
                :key="material.filename"
              >
                <td class="filename">
                  <span
                    class="file-icon">{{ getFileIcon(material.file_extension) }}</span>
                  {{ material.filename }}
                </td>
                <td>{{ formatFileSize(material.file_size) }}</td>
                <td>{{ formatDateTime(material.upload_time) }}</td>
                <td class="actions">
                  <button
                    @click="downloadMaterial(material)"
                    class="btn download-btn"
                    :data-filename="material.filename"
                  >
                    下载
                  </button>
                  <button
                    @click="deleteMaterial(material.filename)"
                    class="btn delete-btn"
                  >
                    删除
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>
    </div>

    <!-- 隐藏的文件输入框 -->
    <input
      type="file"
      ref="fileInput"
      @change="handleFileSelect"
      style="display: none"
      :accept="ALLOWED_FILE_TYPES.join(',')"
    >
  </div>
</template>

<script lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PageHeader from '@/components/layout/PageHeader.vue'
import SideBar from '@/components/layout/SideBar.vue'
import {
  getCourseMaterials,
  type CourseMaterial,
  uploadCourseMaterial,
  deleteCourseMaterial,
  ALLOWED_FILE_TYPES,
  downloadCourseMaterial,
} from '@/api/teacher/course_material'

export default {
  name: 'CourseMaterialList',

  components: {
    PageHeader,
    SideBar,
  },

  setup() {
    const route = useRoute()
    const router = useRouter()
    const courseId = Number(route.params.courseId)
    const courseName = ref('')
    const isLoading = ref(true)
    const materials = ref<CourseMaterial[]>([])
    const mobileMenuOpen = ref(false)
    const fileInput = ref<HTMLInputElement | null>(null)
    const isUploading = ref(false)

    // 教师菜单项
    const teacherMenuItems = [
      { path: '/teacher/home', name: '首页', icon: '🏠' },
      { path: '/course_list', name: '课程管理', icon: '📚' },
    ]

    // 加载课程资料
    const loadMaterials = async () => {
      try {
        const response = await getCourseMaterials(courseId)
        materials.value = response.materials
        courseName.value = response.course_name
      } catch (error: any) {
        alert(error.message || '获取课程资料失败')
      } finally {
        isLoading.value = false
      }
    }

    // 格式化文件大小
    const formatFileSize = (bytes: number) => {
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

    // 获取文件图标
    const getFileIcon = (extension: string) => {
      switch (extension.toLowerCase()) {
        case 'pdf':
          return '📄'
        case 'doc':
        case 'docx':
          return '📝'
        case 'xls':
        case 'xlsx':
          return '📊'
        case 'ppt':
        case 'pptx':
          return '📽'
        case 'jpg':
        case 'jpeg':
        case 'png':
          return '🖼'
        case 'zip':
        case 'rar':
          return '📦'
        default:
          return '📄'
      }
    }

    // 触发文件选择
    const triggerUpload = () => {
      fileInput.value?.click()
    }

    // 处理文件选择
    const handleFileSelect = async (event: Event) => {
      const input = event.target as HTMLInputElement
      const file = input.files?.[0]

      if (!file) return

      try {
        isUploading.value = true
        const result = await uploadCourseMaterial(courseId, file)

        if (result.success) {
          alert('上传成功')
          // 刷新资料列表
          loadMaterials()
        }
      } catch (error: any) {
        alert(error.message || '上传失败，请稍后重试')
      } finally {
        isUploading.value = false
        // 清空文件选择
        if (fileInput.value) {
          fileInput.value.value = ''
        }
      }
    }

    // 下载资料
    const downloadMaterial = async (material: CourseMaterial) => {
      try {
        // 创建下载中提示
        const downloadBtn = document.querySelector(
          `[data-filename="${material.filename}"]`
        ) as HTMLButtonElement
        if (downloadBtn) {
          downloadBtn.disabled = true
          downloadBtn.textContent = '下载中...'
        }

        const blob = await downloadCourseMaterial(courseId, material.filename)

        // 创建下载链接
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = material.filename // 设置下载文件名
        document.body.appendChild(link)

        // 触发下载
        link.click()

        // 清理
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      } catch (error: any) {
        alert(error.message || '下载失败，请稍后重试')
      } finally {
        // 恢复按钮状态
        const downloadBtn = document.querySelector(
          `[data-filename="${material.filename}"]`
        ) as HTMLButtonElement
        if (downloadBtn) {
          downloadBtn.disabled = false
          downloadBtn.textContent = '下载'
        }
      }
    }

    // 删除资料
    const deleteMaterial = async (filename: string) => {
      try {
        if (!confirm(`确定要删除文件 "${filename}" 吗？此操作不可恢复！`)) {
          return
        }

        const result = await deleteCourseMaterial(courseId, filename)
        if (result.success) {
          alert(result.message || '删除成功')
          // 刷新资料列表
          loadMaterials()
        }
      } catch (error: any) {
        alert(error.message || '删除失败，请稍后重试')
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
      if (!courseId || isNaN(courseId)) {
        alert('无效的课程ID')
        router.push('/course_list')
        return
      }
      loadMaterials()
    })

    return {
      courseName,
      materials,
      isLoading,
      mobileMenuOpen,
      teacherMenuItems,
      formatFileSize,
      formatDateTime,
      getFileIcon,
      uploadMaterial: triggerUpload,
      downloadMaterial,
      deleteMaterial,
      toggleMobileMenu,
      handleMenuClick,
      fileInput,
      isUploading,
      ALLOWED_FILE_TYPES,
      triggerUpload,
      handleFileSelect,
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

.upload-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #4299e1;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  overflow: hidden;
}

.upload-btn:hover {
  background: #3182ce;
}

.upload-btn:disabled {
  background: #90cdf4;
  cursor: not-allowed;
}

.material-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.material-table th,
.material-table td {
  padding: 16px;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
}

.material-table th {
  background: #f8fafc;
  font-weight: 600;
  color: #4a5568;
}

.material-table tr:hover {
  background: #f8fafc;
}

.filename {
  display: flex;
  align-items: center;
  gap: 8px;
}

.file-icon {
  font-size: 20px;
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

  .material-table {
    font-size: 14px;
  }

  .material-table th,
  .material-table td {
    padding: 12px;
  }
}
</style>