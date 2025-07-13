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
        :title="`课程通知 - ${courseName}`"
        :showMobileMenu="true"
        @toggleMobileMenu="toggleMobileMenu"
      >
        <template #actions>
          <div class="user-actions">
            <button
              @click="createNotification"
              class="create-btn"
            >
              <span class="btn-icon">+</span>
              <span>发布通知</span>
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
          正在加载通知列表...
        </div>

        <!-- 通知列表 -->
        <div
          v-else
          class="notification-list"
        >
          <!-- 列表为空时的提示 -->
          <div
            v-if="notifications.length === 0"
            class="empty-state"
          >
            暂无通知，点击"发布通知"创建新通知
          </div>

          <!-- 通知列表表格 -->
          <table
            v-else
            class="notification-table"
          >
            <thead>
              <tr>
                <th>标题</th>
                <th>发布时间</th>
                <th>更新时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="notification in notifications"
                :key="notification.id"
              >
                <td>{{ notification.title }}</td>
                <td>{{ formatDate(notification.created_at) }}</td>
                <td>{{ formatDate(notification.updated_at) }}</td>
                <td class="actions">
                  <button
                    @click="viewNotificationDetail(notification)"
                    class="btn view-btn"
                  >
                    查看详情
                  </button>
                  <button
                    @click="editNotification(notification)"
                    class="btn edit-btn"
                  >
                    编辑
                  </button>
                  <button
                    @click="deleteNotification(notification.id)"
                    class="btn delete-btn"
                  >
                    删除
                  </button>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- 分页器 -->
          <div class="pagination">
            <button
              :disabled="currentPage === 1"
              @click="changePage(currentPage - 1)"
              class="page-btn"
            >
              上一页
            </button>
            <span class="page-info">
              第 {{ currentPage }}/{{ totalPages }} 页
            </span>
            <button
              :disabled="currentPage === totalPages"
              @click="changePage(currentPage + 1)"
              class="page-btn"
            >
              下一页
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
import { getCourseNotifications, type CourseNotification } from '@/api/teacher/notificaiton'
import PageHeader from '@/components/layout/PageHeader.vue'
import SideBar from '@/components/layout/SideBar.vue'

export default {
  name: 'NotificationList',

  components: {
    PageHeader,
    SideBar,
  },

  setup() {
    const route = useRoute()
    const router = useRouter()
    const courseId = Number(route.params.courseId)
    const courseName = ref('课程通知')
    const isLoading = ref(true)
    const notifications = ref<CourseNotification[]>([])
    const mobileMenuOpen = ref(false)
    const currentPage = ref(1)
    const pageSize = ref(20)
    const totalPages = ref(1)

    // 格式化日期
    const formatDate = (dateStr: string) => {
      const date = new Date(dateStr)
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })
    }

    // 加载通知列表
    const loadNotifications = async (page: number = 1) => {
      if (!courseId || isNaN(courseId)) {
        alert('无效的课程ID')
        router.push('/course_list')
        return
      }

      try {
        isLoading.value = true
        const result = await getCourseNotifications(courseId, page, pageSize.value)
        notifications.value = result.items
        totalPages.value = result.total_pages
        currentPage.value = page
      } catch (error: any) {
        alert(error.message || '获取通知列表失败')
      } finally {
        isLoading.value = false
      }
    }

    // 切换页码
    const changePage = (page: number) => {
      if (page < 1 || page > totalPages.value) return
      loadNotifications(page)
    }

    // 创建新通知
    const createNotification = () => {
      router.push(`/notification_create/${courseId}`)
    }

    // 编辑通知
    const editNotification = (notification: CourseNotification) => {
      router.push(`/teacher/course/${courseId}/notification/${notification.id}/edit`)
    }

    // 删除通知
    const deleteNotification = async (notificationId: number) => {
      if (confirm('确定要删除这条通知吗？此操作不可恢复！')) {
        // TODO: 实现删除通知的功能
        alert('删除功能待实现')
      }
    }

    // 查看通知详情
    const viewNotificationDetail = (notification: CourseNotification) => {
      router.push(`/notification_detail/${courseId}/${notification.id}/`)
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
      loadNotifications()
    })

    return {
      courseName,
      notifications,
      isLoading,
      currentPage,
      totalPages,
      mobileMenuOpen,
      formatDate,
      createNotification,
      editNotification,
      deleteNotification,
      changePage,
      toggleMobileMenu,
      handleMenuClick,
      viewNotificationDetail,
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

.create-btn {
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
}

.create-btn:hover {
  background: #3182ce;
}

.btn-icon {
  font-size: 18px;
}

.notification-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.notification-table th,
.notification-table td {
  padding: 16px;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
}

.notification-table th {
  background: #f8fafc;
  font-weight: 600;
  color: #4a5568;
}

.notification-table tr:hover {
  background: #f8fafc;
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

.edit-btn {
  background: #ebf8ff;
  color: #3182ce;
}

.edit-btn:hover {
  background: #bee3f8;
}

.delete-btn {
  background: #fff5f5;
  color: #e53e3e;
}

.delete-btn:hover {
  background: #fed7d7;
}

.view-btn {
  background: #f0fff4;
  color: #48bb78;
}

.view-btn:hover {
  background: #c6f6d5;
}

.pagination {
  margin-top: 24px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
}

.page-btn {
  padding: 8px 16px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  color: #4a5568;
  cursor: pointer;
  transition: all 0.2s;
}

.page-btn:hover:not(:disabled) {
  background: #f7fafc;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  color: #4a5568;
}

.loading-state,
.empty-state {
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

  .notification-table {
    font-size: 14px;
  }

  .notification-table th,
  .notification-table td {
    padding: 12px;
  }
}
</style>