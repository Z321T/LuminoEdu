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
        :title="'PPT文件管理'"
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
        <div class="ppt-files-manage">
          <div class="table-container">
            <!-- 加载状态 -->
            <div
              v-if="isLoading"
              class="loading-state"
            >
              正在加载PPT文件列表...
            </div>

            <!-- 表格 -->
            <table
              v-else
              class="ppt-files-table"
            >
              <thead>
                <tr>
                  <th>文件名</th>
                  <th>大小</th>
                  <th>创建时间</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="file in pptFiles"
                  :key="file.file_name"
                >
                  <td>{{ file.file_name }}</td>
                  <td>{{ formatFileSize(file.size) }}</td>
                  <td>{{ formatTimestamp(file.created_at) }}</td>
                  <td class="actions">

                    <button
                      @click="confirmDelete(file.file_name)"
                      class="btn delete-btn"
                    >
                      <span class="icon">🗑️</span> 删除
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>

    <!-- 移动端遮罩 -->
    <div
      v-if="mobileMenuOpen"
      class="mobile-overlay"
      @click="closeMobileMenu"
    />
  </div>
</template>

<script lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getPPTFileList, deletePPTFile } from '@/api/teacher/PPT_generate'
import PageHeader from '@/components/layout/PageHeader.vue'
import SideBar from '@/components/layout/SideBar.vue'

export default {
  name: 'PPTFilesManage',

  components: {
    PageHeader,
    SideBar,
  },

  setup() {
    const router = useRouter()
    const isLoading = ref(true)
    const pptFiles = ref([])
    const mobileMenuOpen = ref(false)
    const username = ref(localStorage.getItem('username') || '教师用户')

    // 侧边栏菜单项
    const teacherMenuItems = [
      { path: '/teacher/dashboard', icon: '📊', label: '教学看板' },
      { path: '/teacher/exercises', icon: '📝', label: '练习管理' },
      { path: '/teacher/assignments', icon: '📚', label: '作业管理' },
      { path: '/teacher/students', icon: '👨‍🎓', label: '学生管理' },
      { path: '/teacher/ppt-generate', icon: '🖥️', label: 'PPT生成' },
      { path: '/teacher/ppt-outlines', icon: '📋', label: '大纲管理' },
      { path: '/teacher/ppt-files', icon: '📁', label: 'PPT文件' },
    ]

    // 格式化文件大小
    const formatFileSize = (bytes: number): string => {
      if (bytes === 0) return '0 B'
      const k = 1024
      const sizes = ['B', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
    }

    // 格式化时间戳
    const formatTimestamp = (timestamp: number): string => {
      const date = new Date(timestamp * 1000)
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })
    }

    // 加载PPT文件列表
    const loadPPTFiles = async () => {
      try {
        const response = await getPPTFileList()
        pptFiles.value = response.files
      } catch (error) {
        console.error('获取PPT文件列表失败:', error)
        alert('获取文件列表失败，请稍后重试')
      } finally {
        isLoading.value = false
      }
    }

    // 删除文件
    const confirmDelete = async (fileName: string) => {
      if (confirm('确定要删除这个PPT文件吗？此操作不可恢复！')) {
        try {
          await deletePPTFile(fileName)
          pptFiles.value = pptFiles.value.filter((file) => file.file_name !== fileName)
          alert('删除成功')
        } catch (error) {
          alert('删除失败，请稍后重试')
        }
      }
    }

    // 移动端菜单
    const toggleMobileMenu = () => {
      mobileMenuOpen.value = !mobileMenuOpen.value
    }

    const closeMobileMenu = () => {
      mobileMenuOpen.value = false
    }

    const handleMenuClick = (item: any) => {
      router.push(item.path)
      closeMobileMenu()
    }

    // 退出登录
    const logout = () => {
      localStorage.removeItem('token')
      localStorage.removeItem('username')
      router.push('/login')
    }

    onMounted(() => {
      loadPPTFiles()
    })

    return {
      isLoading,
      pptFiles,
      username,
      teacherMenuItems,
      mobileMenuOpen,
      formatFileSize,
      formatTimestamp,
      confirmDelete,
      toggleMobileMenu,
      closeMobileMenu,
      handleMenuClick,
      logout,
    }
  },
}
</script>

<style scoped>
/* 复用之前的基础样式 */
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

.table-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: auto;
}

/* PPT文件表格特定样式 */
.ppt-files-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.ppt-files-table th,
.ppt-files-table td {
  padding: 16px;
  border-bottom: 1px solid #e2e8f0;
}

.ppt-files-table th {
  background: #f8fafc;
  font-weight: 600;
  color: #4a5568;
}

.ppt-files-table tr:hover {
  background: #f8fafc;
}

.actions {
  display: flex;
  gap: 8px;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.download-btn {
  background: #ebf8ff;
  color: #3182ce;
}

.delete-btn {
  background: #fff5f5;
  color: #e53e3e;
}

.download-btn:hover {
  background: #bee3f8;
}

.delete-btn:hover {
  background: #fed7d7;
}

/* 其他样式保持不变... */
</style>