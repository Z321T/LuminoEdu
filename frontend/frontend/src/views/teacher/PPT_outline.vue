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
        :title="'PPT大纲管理'"
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
        <div class="outline-manage">
          <div class="table-container">
            <!-- 加载状态 -->
            <div
              v-if="isLoading"
              class="loading-state"
            >
              正在加载大纲列表...
            </div>

            <!-- 表格 -->
            <table
              v-else
              class="outline-table"
            >
              <thead>
                <tr>
                  <th>标题</th>
                  <th>文件名</th>
                  <th>预览</th>
                  <th>创建时间</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="outline in outlinesList"
                  :key="outline.id"
                >
                  <td>{{ outline.title }}</td>
                  <td>{{ outline.filename}}</td>
                  <td>{{ outline.preview }}</td>
                  <td>{{ formatDate(outline.created_at) }}</td>
                  <td class="actions">

                    <button
                      @click="confirmDelete(outline.filename)"
                      class="btn delete-btn"
                    >
                      删除
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
import { getAllPPTOutlines, deletePPTOutlineFile } from '@/api/teacher/PPT_generate'
import PageHeader from '@/components/layout/PageHeader.vue'
import SideBar from '@/components/layout/SideBar.vue'

export default {
  name: 'PPTOutlineManage',

  components: {
    PageHeader,
    SideBar,
  },

  setup() {
    const router = useRouter()
    const isLoading = ref(true)
    const outlinesList = ref([])
    const mobileMenuOpen = ref(false)

    // 获取用户名
    const username = ref(localStorage.getItem('username') || '教师用户')

    // 侧边栏菜单项
    const teacherMenuItems = [
      { path: '/teacher/dashboard', icon: '📊', label: '教学看板' },
      { path: '/teacher/exercises', icon: '📝', label: '练习管理' },
      { path: '/teacher/assignments', icon: '📚', label: '作业管理' },
      { path: '/teacher/students', icon: '👨‍🎓', label: '学生管理' },
      { path: '/teacher/ppt-generate', icon: '🖥️', label: 'PPT生成' },
      { path: '/teacher/ppt-outlines', icon: '📋', label: '大纲管理' },
    ]

    // 格式化日期
    const formatDate = (dateString: string): string => {
      if (!dateString) return '未知日期'
      const year = dateString.slice(0, 4)
      const month = dateString.slice(4, 6)
      const day = dateString.slice(6, 8)
      return `${year}-${month}-${day}`
    }

    // 加载大纲列表
    const loadOutlines = async () => {
      try {
        const outlines = await getAllPPTOutlines()
        console.log('@@获取到的大纲列表:', outlines)
        outlinesList.value = outlines.outlines
        console.log('@@大纲列表:', outlinesList.value)
      } catch (error) {
        console.error('获取大纲列表失败:', error)
      } finally {
        isLoading.value = false
      }
    }

    // 删除大纲
    const confirmDelete = async (filename: string) => {
      try {
        if (confirm('确定要删除这个大纲文件吗？此操作不可恢复！')) {
          // 调用删除API
          await deletePPTOutlineFile(filename)

          // 从列表中移除
          outlinesList.value = outlinesList.value.filter((item) => item.filename !== filename)

          // 显示成功消息
          alert('删除成功')
        }
      } catch (error: any) {
        // 显示错误消息
        alert(error.message || '删除失败，请稍后重试')
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
      loadOutlines()
    })

    return {
      isLoading,
      outlinesList,
      username,
      teacherMenuItems,
      mobileMenuOpen,
      formatDate,
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

.outline-manage {
  height: 100%;
}

.table-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: auto;
}

.outline-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.outline-table th,
.outline-table td {
  padding: 16px;
  border-bottom: 1px solid #e2e8f0;
}

.outline-table th {
  background: #f8fafc;
  font-weight: 600;
  color: #4a5568;
}

.outline-table tr:hover {
  background: #f8fafc;
}

.actions {
  display: flex;
  gap: 8px;
}

.btn {
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.view-btn {
  background: #ebf8ff;
  color: #3182ce;
}

.generate-btn {
  background: #e6fffa;
  color: #319795;
}

.delete-btn {
  background: #fff5f5;
  color: #e53e3e;
}

.view-btn:hover {
  background: #bee3f8;
}
.generate-btn:hover {
  background: #b2f5ea;
}
.delete-btn:hover {
  background: #fed7d7;
}

.loading-state {
  padding: 40px;
  text-align: center;
  color: #4a5568;
}

/* 用户信息样式 */
.user-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.logout-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #e53e3e;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.logout-btn:hover {
  background: #c53030;
}

/* 移动端样式 */
.mobile-overlay {
  display: none;
}

@media (max-width: 768px) {
  .main-layout {
    margin-left: 0;
  }

  .mobile-overlay {
    display: block;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 40;
  }

  .content-area {
    padding: 16px;
  }

  .actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }
}
</style>