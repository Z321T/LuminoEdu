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
        :title="notificationDetail?.title || '通知详情'"
        :showMobileMenu="true"
        @toggleMobileMenu="toggleMobileMenu"
      >
        <template #actions>
          <div class="user-actions">
            <button
              @click="backToList"
              class="back-btn"
            >
              <span class="back-icon">←</span>
              <span>返回列表</span>
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
          正在加载通知详情...
        </div>

        <!-- 通知详情 -->
        <div
          v-else-if="notificationDetail"
          class="notification-detail"
        >
          <!-- 基本信息卡片 -->
          <div class="detail-card">
            <h3>通知信息</h3>
            <div class="info-grid">
              <div class="info-item">
                <span class="label">发布时间:</span>
                <span
                  class="value">{{ formatDateTime(notificationDetail.publish_time) }}</span>
              </div>
              <div class="info-item">
                <span class="label">优先级:</span>
                <span
                  class="value priority-tag"
                  :class="'priority-' + notificationDetail.priority"
                >
                  {{ getPriorityText(notificationDetail.priority) }}
                </span>
              </div>
              <div class="info-item">
                <span class="label">是否需要确认:</span>
                <span
                  class="value">{{ notificationDetail.require_confirmation ? '是' : '否' }}</span>
              </div>
            </div>

            <!-- 通知内容 -->
            <div class="content-section">
              <h4>通知内容</h4>
              <div class="content-box">
                {{ notificationDetail.content }}
              </div>
            </div>
          </div>

          <!-- 确认统计卡片 -->
          <div
            v-if="notificationDetail.require_confirmation"
            class="detail-card"
          >
            <div class="card-header">
              <h3>确认情况</h3>
              <div class="confirmation-stats">
                <div class="stat-item">
                  <span class="stat-label">总学生数:</span>
                  <span
                    class="stat-value">{{ notificationDetail.total_students }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">已确认:</span>
                  <span
                    class="stat-value success">{{ notificationDetail.confirmed_students }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">确认率:</span>
                  <span
                    class="stat-value">{{ (notificationDetail.confirmation_rate * 100).toFixed(1) }}%</span>
                </div>
              </div>
            </div>

            <!-- 确认列表 -->
            <div class="confirmation-list">
              <table v-if="notificationDetail.confirmations.length > 0">
                <thead>
                  <tr>
                    <th>学号</th>
                    <th>姓名</th>
                    <th>确认时间</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="confirmation in notificationDetail.confirmations"
                    :key="confirmation.student_id"
                  >
                    <td>{{ confirmation.student_id }}</td>
                    <td>{{ confirmation.student_name }}</td>
                    <td>{{ formatDateTime(confirmation.confirm_time) }}</td>
                  </tr>
                </tbody>
              </table>
              <div
                v-else
                class="empty-state"
              >
                暂无学生确认
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PageHeader from '@/components/layout/PageHeader.vue'
import SideBar from '@/components/layout/SideBar.vue'
import { getNotificationDetail, type NotificationDetail } from '@/api/teacher/notificaiton'

export default {
  name: 'NotificationDetail',

  components: {
    PageHeader,
    SideBar,
  },

  setup() {
    const route = useRoute()
    const router = useRouter()
    const courseId = Number(route.params.courseId)
    const notificationId = Number(route.params.notificationId)
    const isLoading = ref(true)
    const notificationDetail = ref<NotificationDetail | null>(null)
    const mobileMenuOpen = ref(false)

    // 教师菜单项
    const teacherMenuItems = [
      { path: '/teacher/home', name: '首页', icon: '🏠' },
      { path: '/course_list', name: '课程管理', icon: '📚' },
    ]

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

    // 获取优先级文本
    const getPriorityText = (priority: number) => {
      switch (priority) {
        case 1:
          return '普通'
        case 2:
          return '重要'
        case 3:
          return '紧急'
        default:
          return '未知'
      }
    }

    // 加载通知详情
    const loadNotificationDetail = async () => {
      try {
        const detail = await getNotificationDetail(courseId, notificationId)
        notificationDetail.value = detail
      } catch (error: any) {
        alert(error.message || '获取通知详情失败')
        router.push(`/teacher/course/${courseId}/notifications`)
      } finally {
        isLoading.value = false
      }
    }

    // 返回列表
    const backToList = () => {
      router.push(`/teacher/course/${courseId}/notifications`)
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
      if (!courseId || !notificationId || isNaN(courseId) || isNaN(notificationId)) {
        alert('无效的参数')
        router.push('/course_list')
        return
      }
      loadNotificationDetail()
    })

    return {
      notificationDetail,
      isLoading,
      mobileMenuOpen,
      teacherMenuItems,
      formatDateTime,
      getPriorityText,
      backToList,
      toggleMobileMenu,
      handleMenuClick,
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

.back-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #f7fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  color: #4a5568;
  cursor: pointer;
  transition: all 0.2s;
}

.back-btn:hover {
  background: #edf2f7;
}

.notification-detail {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.detail-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.detail-card h3 {
  margin: 0 0 20px 0;
  color: #2d3748;
  font-size: 18px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.label {
  color: #718096;
  font-size: 14px;
}

.value {
  color: #2d3748;
  font-weight: 500;
}

.priority-tag {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 14px;
}

.priority-1 {
  background: #e6fffa;
  color: #319795;
}

.priority-2 {
  background: #faf5ff;
  color: #805ad5;
}

.priority-3 {
  background: #fff5f5;
  color: #e53e3e;
}

.content-section {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #e2e8f0;
}

.content-section h4 {
  margin: 0 0 16px 0;
  color: #2d3748;
  font-size: 16px;
}

.content-box {
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
  white-space: pre-wrap;
  line-height: 1.6;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.confirmation-stats {
  display: flex;
  gap: 24px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stat-label {
  color: #718096;
}

.stat-value {
  font-size: 18px;
  font-weight: 600;
}

.stat-value.success {
  color: #48bb78;
}

.confirmation-list table {
  width: 100%;
  border-collapse: collapse;
}

.confirmation-list th,
.confirmation-list td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
}

.confirmation-list th {
  background: #f8fafc;
  font-weight: 600;
  color: #4a5568;
}

.confirmation-list tr:hover {
  background: #f8fafc;
}

.empty-state,
.loading-state {
  padding: 40px;
  text-align: center;
  color: #718096;
}

@media (max-width: 768px) {
  .main-layout {
    margin-left: 0;
  }

  .content-area {
    padding: 16px;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .confirmation-stats {
    flex-direction: column;
    gap: 12px;
  }
}
</style>