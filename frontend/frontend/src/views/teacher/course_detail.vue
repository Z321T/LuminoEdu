<template>
  <div class="teacher-layout">
    <!-- 侧边栏 -->
    <SideBar
        :menuItems="teacherMenuItems"
        :activeItem="$route.path"
        @menuClick="handleMenuClick"
    />

    <!-- 主体内容 -->
    <div class="main">
      <!-- 顶部栏 -->
      <PageHeader title="课程详情">
        <template #actions>
          <div class="header-user">
            <button class="back-btn" @click="goBack">返回课程列表</button>
            <span>欢迎，{{ username }}</span>
            <button class="logout-btn" @click="handleLogout">退出登录</button>
          </div>
        </template>
      </PageHeader>

      <section class="content">
        <div v-if="loading" class="loading">加载中...</div>
        <div v-else-if="error" class="error-state">
          {{ error }}
          <button @click="loadData" class="retry-btn">重新加载</button>
        </div>
        <div v-else-if="courseDetail" class="course-detail-container">
          <!-- 课程基本信息 -->
          <div class="course-info-card">
            <h1>{{ courseDetail.name }}</h1>
            <div class="info-grid">
              <div class="info-item">
                <label>学期：</label>
                <span>{{ courseDetail.semester }}</span>
              </div>
              <div class="info-item">
                <label>学分：</label>
                <span>{{ courseDetail.credit }}</span>
              </div>
              <div class="info-item">
                <label>开始时间：</label>
                <span>{{ formatDateTime(courseDetail.start_date) }}</span>
              </div>
              <div class="info-item">
                <label>结束时间：</label>
                <span>{{ formatDateTime(courseDetail.end_date) }}</span>
              </div>
            </div>
            <div class="description">
              <label>课程描述：</label>
              <p>{{ courseDetail.description || '暂无描述' }}</p>
            </div>
          </div>

          <!-- 课程资料 -->
          <div class="material-section">
            <div class="section-header">
              <h2>课程资料</h2>
              <span class="material-stats">
                共 {{ materialData?.total_count || 0 }} 个文件
              </span>
            </div>

            <div v-if="materialLoading" class="section-loading">加载资料中...</div>
            <div v-else-if="materialError" class="section-error">
              {{ materialError }}
              <button @click="() => loadMaterials()" class="retry-btn">重试</button>
            </div>
            <div v-else-if="materials.length === 0" class="empty-state">
              暂无资料
            </div>
            <div v-else class="material-list">
              <div
                  v-for="material in materials"
                  :key="material.filename"
                  class="material-item"
              >
                <div class="material-icon">📄</div>
                <div class="material-info">
                  <h4>{{ material.filename }}</h4>
                  <div class="material-meta">
                    <span>{{ formatFileSize(material.file_size) }}</span>
                    <span>{{ formatDateTime(material.upload_time) }}</span>
                    <span>{{ material.file_extension }}</span>
                  </div>
                </div>
                <div class="material-actions">
                  <button
                      @click="handleDownload(material.filename)"
                      class="download-btn"
                      :disabled="downloadingFiles.includes(material.filename)"
                  >
                    {{ downloadingFiles.includes(material.filename) ? '下载中...' : '下载' }}
                  </button>
                  <button
                      @click="confirmDeleteMaterial(material.filename)"
                      class="delete-material-btn"
                  >
                    删除
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- 课程通知 -->
          <div class="notification-section">
            <div class="section-header">
              <h2>课程通知</h2>
              <div class="notification-stats">
                共 {{ notificationData?.total_count || 0 }} 条通知
              </div>
            </div>
            <div v-if="notificationLoading" class="section-loading">加载通知中...</div>
            <div v-else-if="notificationError" class="section-error">
              {{ notificationError }}
              <button @click="() => loadNotifications()" class="retry-btn">重试</button>
            </div>
            <div v-else-if="notifications.length === 0" class="empty-state">
              暂无通知
            </div>
            <div v-else class="notification-list">
              <div
                  v-for="notification in notifications"
                  :key="notification.id"
                  class="notification-item"
                  :class="getPriorityClass(notification.priority)"
              >
                <div class="notification-header">
                  <h3>{{ notification.title }}</h3>
                  <div class="notification-meta">
                    <span class="priority">{{ getPriorityText(notification.priority) }}</span>
                    <span class="time">{{ formatDateTime(notification.publish_time) }}</span>
                  </div>
                </div>
                <div class="notification-stats">
                  <span v-if="notification.require_confirmation" class="confirmation-stats">
                    需要确认 - {{ notification.confirmed_students }}/{{ notification.total_students }} 已确认
                  </span>
                  <span v-else class="no-confirmation">无需确认</span>
                </div>
              </div>
            </div>
            <!-- 分页 -->
            <div v-if="notificationData && notificationData.total_pages > 1" class="pagination">
              <button
                  @click="() => loadNotifications(currentPage - 1)"
                  :disabled="currentPage <= 1"
                  class="page-btn"
              >
                上一页
              </button>
              <span class="page-info">
                第 {{ currentPage }} 页，共 {{ notificationData.total_pages }} 页
              </span>
              <button
                  @click="() => loadNotifications(currentPage + 1)"
                  :disabled="currentPage >= notificationData.total_pages"
                  class="page-btn"
              >
                下一页
              </button>
            </div>
          </div>

          <!-- 学生列表 -->
          <div class="students-section">
            <div class="section-header">
              <h2>学生列表</h2>
              <div class="student-actions">
                <span class="student-stats">共 {{ courseDetail.students?.length || 0 }} 名学生</span>
                <button
                    v-if="selectedStudents.length > 0"
                    @click="confirmRemoveStudents"
                    class="remove-students-btn"
                >
                  删除选中学生 ({{ selectedStudents.length }})
                </button>
              </div>
            </div>

            <div v-if="!courseDetail.students || courseDetail.students.length === 0" class="empty-state">
              暂无学生
            </div>
            <div v-else class="student-table">
              <div class="table-header">
                <div class="th">
                  <input
                      type="checkbox"
                      @change="toggleSelectAll"
                      :checked="isAllSelected"
                      :indeterminate="isIndeterminate"
                  />
                </div>
                <div class="th">姓名</div>
                <div class="th">学号</div>
                <div class="th">学院</div>
                <div class="th">年级</div>
              </div>
              <div class="table-body">
                <div
                    v-for="student in courseDetail.students"
                    :key="student.student_id"
                    class="table-row"
                >
                  <div class="td">
                    <input
                        type="checkbox"
                        :value="student.student_id"
                        v-model="selectedStudents"
                    />
                  </div>
                  <div class="td">{{ student.name }}</div>
                  <div class="td">{{ student.student_id }}</div>
                  <div class="td">{{ student.college }}</div>
                  <div class="td">{{ student.grade }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import SideBar from '@/components/layout/SideBar.vue'
import PageHeader from '@/components/layout/PageHeader.vue'
import {
  getTeacherCourseDetail,
  getCourseNotifications,
  getCourseMaterials,
  removeStudentsFromCourse,
  deleteMaterial,
  downloadMaterial,
  formatDateTime,
  formatFileSize,
  getPriorityText,
  getPriorityClass,
  type TeacherCourseDetail,
  type TeacherNotification,
  type TeacherNotificationResponse,
  type CourseMaterial,
  type CourseMaterialResponse
} from '@/api/teacher/course_management'

const router = useRouter()
const route = useRoute()
const username = ref(localStorage.getItem('username') || '教师')

const teacherMenuItems = [
  { path: '/teacher/course', label: '课程管理' },
]

const courseId = computed(() => parseInt(route.params.courseId as string))

// 数据状态
const loading = ref(false)
const error = ref('')
const courseDetail = ref<TeacherCourseDetail | null>(null)

// 学生选择状态
const selectedStudents = ref<string[]>([])

// 通知相关状态
const notificationLoading = ref(false)
const notificationError = ref('')
const notificationData = ref<TeacherNotificationResponse | null>(null)
const notifications = ref<TeacherNotification[]>([])
const currentPage = ref(1)
const pageSize = ref(20)

// 资料相关状态
const materialLoading = ref(false)
const materialError = ref('')
const materialData = ref<CourseMaterialResponse | null>(null)
const materials = ref<CourseMaterial[]>([])
const downloadingFiles = ref<string[]>([])

// 学生选择相关计算属性
const isAllSelected = computed(() => {
  return courseDetail.value?.students &&
      courseDetail.value.students.length > 0 &&
      selectedStudents.value.length === courseDetail.value.students.length
})

const isIndeterminate = computed(() => {
  return selectedStudents.value.length > 0 &&
      selectedStudents.value.length < (courseDetail.value?.students?.length || 0)
})

// 切换全选
const toggleSelectAll = () => {
  if (isAllSelected.value) {
    selectedStudents.value = []
  } else {
    selectedStudents.value = courseDetail.value?.students?.map(s => s.student_id) || []
  }
}

// 确认删除选中学生
const confirmRemoveStudents = async () => {
  if (selectedStudents.value.length === 0) return

  const studentNames = courseDetail.value?.students
      ?.filter(s => selectedStudents.value.includes(s.student_id))
      ?.map(s => s.name)
      ?.join('、') || ''

  if (confirm(`确定要从课程中删除以下学生吗？\n${studentNames}\n\n此操作不可恢复！`)) {
    try {
      const result = await removeStudentsFromCourse(courseId.value, selectedStudents.value)
      if (result.success) {
        alert(`成功删除 ${result.removed} 名学生`)
        selectedStudents.value = []
        // 重新加载课程详情
        await loadCourseDetail()
      }
    } catch (error: any) {
      alert(error.message || '删除学生失败，请稍后重试')
    }
  }
}

// 确认删除资料
const confirmDeleteMaterial = async (filename: string) => {
  if (confirm(`确定要删除资料"${filename}"吗？\n此操作不可恢复！`)) {
    try {
      const result = await deleteMaterial(courseId.value, filename)
      if (result.success) {
        alert('资料删除成功')
        // 重新加载资料列表
        await loadMaterials()
      }
    } catch (error: any) {
      alert(error.message || '删除资料失败，请稍后重试')
    }
  }
}

// 下载资料
const handleDownload = async (filename: string) => {
  try {
    downloadingFiles.value.push(filename)
    await downloadMaterial(courseId.value, filename)
  } catch (error: any) {
    alert(error.message || '下载失败，请稍后重试')
  } finally {
    downloadingFiles.value = downloadingFiles.value.filter(f => f !== filename)
  }
}

// 加载课程详情
const loadCourseDetail = async () => {
  try {
    courseDetail.value = await getTeacherCourseDetail(courseId.value)
  } catch (err: any) {
    throw new Error(`获取课程详情失败: ${err.message}`)
  }
}

// 加载通知
const loadNotifications = async (page: number = 1) => {
  notificationLoading.value = true
  notificationError.value = ''

  try {
    const response = await getCourseNotifications(courseId.value, page, pageSize.value)
    notificationData.value = response
    notifications.value = response.notifications
    currentPage.value = page
    console.log('成功加载通知列表:', response)
  } catch (err: any) {
    console.error('获取通知失败:', err)
    notificationError.value = err.message
  } finally {
    notificationLoading.value = false
  }
}

// 加载资料
const loadMaterials = async () => {
  materialLoading.value = true
  materialError.value = ''

  try {
    const response = await getCourseMaterials(courseId.value)
    materialData.value = response
    materials.value = response.materials
    console.log('成功加载资料列表:', response)
  } catch (err: any) {
    console.error('获取资料失败:', err)
    materialError.value = err.message
  } finally {
    materialLoading.value = false
  }
}

// 加载所有数据
const loadData = async () => {
  loading.value = true
  error.value = ''

  try {
    await Promise.all([
      loadCourseDetail(),
      loadNotifications(),
      loadMaterials()
    ])
  } catch (err: any) {
    console.error('加载数据失败:', err)
    error.value = err.message
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  router.push('/teacher/course')
}

const handleLogout = () => {
  if (confirm('确定要退出登录吗？')) {
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    router.push('/login')
  }
}

const handleMenuClick = (item: any) => {
  router.push(item.path)
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
/* 保持原有样式不变 */
.teacher-layout {
  display: flex;
  height: 100vh;
  width: 100vw;
  background: #f5f6fa;
  overflow: hidden;
}

.main {
  position: relative;
  flex: 1;
  margin-left: 240px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.header-user {
  position: absolute;
  top: 24px;
  right: 48px;
  display: flex;
  align-items: center;
  gap: 16px;
  z-index: 10;
}

.back-btn {
  background: #3182ce;
  color: #fff;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.3s;
  font-weight: 500;
}

.back-btn:hover {
  background: #2c5aa0;
}

.logout-btn {
  background: #e74c3c;
  color: #fff;
  border: none;
  padding: 8px 20px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.3s;
  font-weight: 500;
}

.logout-btn:hover {
  background: #c0392b;
}

.content {
  flex: 1;
  padding: 32px;
  overflow-y: auto;
  width: 100%;
  box-sizing: border-box;
}

.loading, .error-state {
  text-align: center;
  padding: 60px 20px;
  color: #718096;
  font-size: 16px;
}

.error-state {
  color: #e53e3e;
}

.retry-btn {
  margin-top: 12px;
  background: #3182ce;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.retry-btn:hover {
  background: #2c5aa0;
}

.course-detail-container {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.course-info-card {
  background: #fff;
  border-radius: 8px;
  padding: 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.course-info-card h1 {
  margin: 0 0 24px 0;
  color: #2d3748;
  font-size: 28px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.info-item {
  display: flex;
  align-items: center;
}

.info-item label {
  font-weight: 500;
  color: #4a5568;
  min-width: 80px;
}

.info-item span {
  color: #2d3748;
}

.description label {
  font-weight: 500;
  color: #4a5568;
  display: block;
  margin-bottom: 8px;
}

.description p {
  color: #718096;
  line-height: 1.6;
  margin: 0;
}

.students-section, .notification-section, .material-section {
  background: #fff;
  border-radius: 8px;
  padding: 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e2e8f0;
}

.section-header h2 {
  margin: 0;
  color: #2d3748;
  font-size: 20px;
}

.student-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.student-stats, .notification-stats, .material-stats {
  color: #718096;
  font-size: 14px;
}

.remove-students-btn {
  background: #e53e3e;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background 0.3s;
}

.remove-students-btn:hover {
  background: #c53030;
}

.section-loading, .section-error, .empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #718096;
}

.section-error {
  color: #e53e3e;
}

/* 学生表格样式 */
.student-table {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
}

.table-header {
  display: grid;
  grid-template-columns: 50px 1fr 1fr 2fr 1fr;
  background: #f7fafc;
  border-bottom: 1px solid #e2e8f0;
}

.table-body {
  display: flex;
  flex-direction: column;
}

.table-row {
  display: grid;
  grid-template-columns: 50px 1fr 1fr 2fr 1fr;
  border-bottom: 1px solid #f1f5f9;
}

.table-row:last-child {
  border-bottom: none;
}

.table-row:hover {
  background: #f8fafc;
}

.th, .td {
  padding: 12px 16px;
  text-align: left;
  display: flex;
  align-items: center;
}

.th {
  font-weight: 600;
  color: #4a5568;
  background: #f7fafc;
}

.td {
  color: #2d3748;
}

/* 通知列表样式 */
.notification-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.notification-item {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 20px;
  transition: box-shadow 0.3s;
}

.notification-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.notification-item.urgent {
  border-left: 4px solid #e53e3e;
}

.notification-item.important {
  border-left: 4px solid #ed8936;
}

.notification-item.normal {
  border-left: 4px solid #38a169;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.notification-header h3 {
  margin: 0;
  color: #2d3748;
  font-size: 16px;
}

.notification-meta {
  display: flex;
  gap: 12px;
  font-size: 12px;
}

.priority {
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 500;
}

.notification-item.urgent .priority {
  background: #fed7d7;
  color: #c53030;
}

.notification-item.important .priority {
  background: #feebc8;
  color: #c05621;
}

.notification-item.normal .priority {
  background: #c6f6d5;
  color: #2f855a;
}

.time {
  color: #a0aec0;
}

.notification-stats .confirmation-stats {
  color: #3182ce;
  font-weight: 500;
}

.notification-stats .no-confirmation {
  color: #718096;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #e2e8f0;
}

.page-btn {
  background: #3182ce;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.page-btn:hover:not(:disabled) {
  background: #2c5aa0;
}

.page-btn:disabled {
  background: #cbd5e0;
  cursor: not-allowed;
}

.page-info {
  color: #4a5568;
  font-size: 14px;
}

/* 资料列表样式 */
.material-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.material-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  transition: box-shadow 0.3s;
}

.material-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.material-icon {
  font-size: 24px;
  color: #4a5568;
}

.material-info {
  flex: 1;
}

.material-info h4 {
  margin: 0 0 4px 0;
  color: #2d3748;
  font-size: 16px;
}

.material-meta {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #a0aec0;
}

.material-actions {
  display: flex;
  gap: 8px;
}

.download-btn {
  background: #3182ce;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: background 0.3s;
}

.download-btn:hover:not(:disabled) {
  background: #2c5aa0;
}

.download-btn:disabled {
  background: #cbd5e0;
  cursor: not-allowed;
}

.delete-material-btn {
  background: #e53e3e;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: background 0.3s;
}

.delete-material-btn:hover {
  background: #c53030;
}

@media (max-width: 900px) {
  .main {
    margin-left: 60px;
  }
  .content {
    padding: 12px;
  }
  .course-info-card, .students-section, .notification-section, .material-section {
    padding: 16px;
  }
  .info-grid {
    grid-template-columns: 1fr;
  }
  .table-header, .table-row {
    grid-template-columns: 40px 1fr 1fr;
  }
  .th:nth-child(4), .th:nth-child(5),
  .td:nth-child(4), .td:nth-child(5) {
    display: none;
  }
  .notification-header {
    flex-direction: column;
    gap: 8px;
  }
  .material-item {
    flex-direction: column;
    align-items: flex-start;
  }
  .material-actions {
    width: 100%;
    justify-content: flex-end;
  }
  .student-actions {
    flex-direction: column;
    align-items: flex-end;
    gap: 8px;
  }
}
</style>