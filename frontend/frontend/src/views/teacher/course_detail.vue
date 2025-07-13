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
        :title="courseDetail?.name || '课程详情'"
        :showMobileMenu="true"
        @toggleMobileMenu="toggleMobileMenu"
      >
        <template #actions>
          <div class="user-actions">
            <button
              @click="backToCourseList"
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
        <div
          v-if="isLoading"
          class="loading-state"
        >
          正在加载课程详情...
        </div>

        <div
          v-else-if="courseDetail"
          class="course-detail"
        >
          <!-- 基本信息卡片 -->
          <div class="detail-card">
            <h3>课程信息</h3>
            <div class="info-grid">
              <div class="info-item">
                <span class="label">课程名称:</span>
                <span class="value">{{ courseDetail.name }}</span>
              </div>
              <div class="info-item">
                <span class="label">学期:</span>
                <span class="value">{{ courseDetail.semester }}</span>
              </div>
              <div class="info-item">
                <span class="label">学分:</span>
                <span class="value">{{ courseDetail.credit }}</span>
              </div>
              <div class="info-item">
                <span class="label">起止时间:</span>
                <span
                  class="value">{{ formatDateRange(courseDetail.start_date, courseDetail.end_date) }}</span>
              </div>
              <div class="info-item full-width">
                <span class="label">课程描述:</span>
                <span
                  class="value description">{{ courseDetail.description || '暂无描述' }}</span>
              </div>
            </div>
          </div>

          <!-- 学生列表卡片 -->
          <div class="detail-card">
            <div class="card-header">
              <h3>学生列表</h3>
              <span class="student-count">共 {{ courseDetail.students.length }}
                名学生</span>
            </div>

            <div class="table-container">
              <table
                v-if="courseDetail.students.length > 0"
                class="student-table"
              >
                <thead>
                  <tr>
                    <th>学号</th>
                    <th>姓名</th>
                    <th>班级</th>
                    <th>邮箱</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="student in courseDetail.students"
                    :key="student.id"
                  >
                    <td>{{ student.id }}</td>
                    <td>{{ student.name }}</td>
                    <td>{{ student.class_name || '-' }}</td>
                    <td>{{ student.email || '-' }}</td>
                  </tr>
                </tbody>
              </table>
              <div
                v-else
                class="empty-state"
              >
                暂无学生，可以通过"添加学生"功能导入学生
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
import { getCourseDetail, type CourseDetail } from '@/api/teacher/course_management'
import PageHeader from '@/components/layout/PageHeader.vue'
import SideBar from '@/components/layout/SideBar.vue'

export default {
  name: 'CourseDetail',

  components: {
    PageHeader,
    SideBar,
  },

  setup() {
    const route = useRoute()
    const router = useRouter()
    const courseId = Number(route.params.courseId)
    const isLoading = ref(true)
    const courseDetail = ref<CourseDetail | null>(null)
    const mobileMenuOpen = ref(false)

    // 格式化日期范围
    const formatDateRange = (start: string | null, end: string | null) => {
      if (!start && !end) return '未设置'
      if (start && !end) return `从 ${start} 开始`
      if (!start && end) return `至 ${end} 结束`
      return `${start} 至 ${end}`
    }

    // 加载课程详情
    const loadCourseDetail = async () => {
      try {
        const detail = await getCourseDetail(courseId)
        courseDetail.value = detail
      } catch (error: any) {
        alert(error.message || '获取课程详情失败')
        router.push('/course_list')
      } finally {
        isLoading.value = false
      }
    }

    // 返回课程列表
    const backToCourseList = () => {
      router.push('/course_list')
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
      loadCourseDetail()
    })

    return {
      courseDetail,
      isLoading,
      mobileMenuOpen,
      formatDateRange,
      backToCourseList,
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

.course-detail {
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

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.student-count {
  color: #718096;
  font-size: 14px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-item.full-width {
  grid-column: 1 / -1;
}

.label {
  color: #718096;
  font-size: 14px;
}

.value {
  color: #2d3748;
  font-weight: 500;
}

.value.description {
  font-weight: normal;
  white-space: pre-wrap;
}

.table-container {
  overflow-x: auto;
}

.student-table {
  width: 100%;
  border-collapse: collapse;
}

.student-table th,
.student-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
}

.student-table th {
  background: #f8fafc;
  font-weight: 600;
  color: #4a5568;
}

.student-table tr:hover {
  background: #f8fafc;
}

.empty-state {
  padding: 40px;
  text-align: center;
  color: #718096;
  background: #f8fafc;
  border-radius: 8px;
}

.loading-state {
  padding: 40px;
  text-align: center;
  color: #4a5568;
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

  .table-container {
    margin: 0 -24px;
    padding: 0 24px;
  }
}
</style>