<!-- filepath: d:\git\LuminoEdu\frontend\frontend\src\components\home\RecentCourses.vue -->
<template>
  <div class="recent-courses-card">
    <div class="card-header">
      <h3>最近课程</h3>
      <div class="header-actions">
        <button
          class="view-all-link"
          @click="$emit('viewAll')"
        >
          查看全部
        </button>
      </div>
    </div>

    <div class="courses-container">
      <div
        v-if="courses.length === 0"
        class="empty-courses"
      >
        <div class="empty-icon">📚</div>
        <p>暂无最近课程</p>
        <button
          class="create-course-btn"
          @click="$emit('createCourse')"
        >
          创建第一门课程
        </button>
      </div>

      <div
        v-else
        class="courses-list"
      >
        <div
          v-for="course in courses"
          :key="course.id"
          class="course-item"
          :class="{ active: course.status === 'active' }"
          @click="$emit('selectCourse', course)"
        >
          <div class="course-thumbnail">
            <div
              class="course-image"
              :style="{ backgroundColor: course.color || '#3498db' }"
            >
              <span class="course-icon">{{ course.icon || '📖' }}</span>
            </div>
            <div
              v-if="course.status"
              class="course-status-badge"
              :class="`status-${course.status}`"
            >
              {{ getStatusText(course.status) }}
            </div>
          </div>

          <div class="course-info">
            <h4 class="course-title">{{ course.name }}</h4>
            <p class="course-description">{{ course.description }}</p>

            <div class="course-meta">
              <div class="meta-item">
                <span class="meta-icon">👥</span>
                <span class="meta-text">{{ course.studentCount || 0 }}名学生</span>
              </div>
              <div class="meta-item">
                <span class="meta-icon">📅</span>
                <span
                  class="meta-text">{{ formatLastActivity(course.lastActivity) }}</span>
              </div>
            </div>

            <div class="course-progress">
              <div class="progress-info">
                <span class="progress-label">课程进度</span>
                <span
                  class="progress-percentage">{{ course.progress || 0 }}%</span>
              </div>
              <div class="progress-bar">
                <div
                  class="progress-fill"
                  :style="{ width: `${course.progress || 0}%`, backgroundColor: course.color || '#3498db' }"
                ></div>
              </div>
            </div>
          </div>

          <div class="course-actions">
            <button
              class="action-btn primary"
              @click.stop="$emit('enterCourse', course)"
              title="进入课程"
            >
              ➡️
            </button>
            <button
              class="action-btn secondary"
              @click.stop="$emit('editCourse', course)"
              title="编辑课程"
            >
              ✏️
            </button>
            <div class="dropdown">
              <button
                class="action-btn dropdown-trigger"
                @click.stop="toggleDropdown(course.id)"
                title="更多操作"
              >
                ⋮
              </button>
              <div
                v-if="activeDropdown === course.id"
                class="dropdown-menu"
                @click.stop
              >
                <button
                  class="dropdown-item"
                  @click="$emit('duplicateCourse', course)"
                >
                  📋 复制课程
                </button>
                <button
                  class="dropdown-item"
                  @click="$emit('archiveCourse', course)"
                >
                  📦 归档课程
                </button>
                <button
                  class="dropdown-item danger"
                  @click="$emit('deleteCourse', course)"
                >
                  🗑️ 删除课程
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="card-footer">
      <button
        class="add-course-btn"
        @click="$emit('createCourse')"
      >
        ➕ 新建课程
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

interface CourseItem {
  id: number
  name: string
  description: string
  studentCount?: number
  lastActivity: string
  progress?: number
  status?: 'active' | 'draft' | 'archived' | 'completed'
  color?: string
  icon?: string
}

interface Props {
  courses?: CourseItem[]
}

const props = withDefaults(defineProps<Props>(), {
  courses: () => [
    {
      id: 1,
      name: '高等数学',
      description: '微积分基础知识与应用',
      studentCount: 45,
      lastActivity: '2024-01-15T14:30:00',
      progress: 65,
      status: 'active',
      color: '#3498db',
      icon: '📊',
    },
    {
      id: 2,
      name: '线性代数',
      description: '矩阵理论与线性变换',
      studentCount: 38,
      lastActivity: '2024-01-14T10:15:00',
      progress: 40,
      status: 'active',
      color: '#e74c3c',
      icon: '🔢',
    },
    {
      id: 3,
      name: '概率统计',
      description: '概率论与数理统计基础',
      studentCount: 32,
      lastActivity: '2024-01-13T16:45:00',
      progress: 25,
      status: 'draft',
      color: '#2ecc71',
      icon: '📈',
    },
  ],
})

defineEmits<{
  viewAll: []
  createCourse: []
  selectCourse: [course: CourseItem]
  enterCourse: [course: CourseItem]
  editCourse: [course: CourseItem]
  duplicateCourse: [course: CourseItem]
  archiveCourse: [course: CourseItem]
  deleteCourse: [course: CourseItem]
}>()

const activeDropdown = ref<number | null>(null)

const toggleDropdown = (courseId: number) => {
  activeDropdown.value = activeDropdown.value === courseId ? null : courseId
}

const getStatusText = (status: string): string => {
  const statusMap: Record<string, string> = {
    active: '进行中',
    draft: '草稿',
    archived: '已归档',
    completed: '已完成',
  }
  return statusMap[status] || status
}

const formatLastActivity = (timeString: string): string => {
  const time = new Date(timeString)
  const now = new Date()
  const diffMs = now.getTime() - time.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 1) return '刚刚活动'
  if (diffMins < 60) return `${diffMins}分钟前活动`
  if (diffHours < 24) return `${diffHours}小时前活动`
  if (diffDays < 7) return `${diffDays}天前活动`

  return time.toLocaleDateString('zh-CN') + ' 活动'
}

// 点击外部关闭下拉菜单
const handleClickOutside = (event: Event) => {
  if (!event.target || !(event.target as Element).closest('.dropdown')) {
    activeDropdown.value = null
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.recent-courses-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  height: fit-content;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 24px 16px 24px;
  border-bottom: 1px solid #f0f0f0;
}

.card-header h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 18px;
  font-weight: 600;
}

.view-all-link {
  background: none;
  border: none;
  color: #3498db;
  cursor: pointer;
  font-size: 14px;
  text-decoration: underline;
  transition: color 0.3s ease;
}

.view-all-link:hover {
  color: #2980b9;
}

.courses-container {
  flex: 1;
  overflow-y: auto;
  max-height: 500px;
}

.empty-courses {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #666;
  text-align: center;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.create-course-btn {
  background: #3498db;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  margin-top: 16px;
  transition: background 0.3s ease;
}

.create-course-btn:hover {
  background: #2980b9;
}

.courses-list {
  padding: 16px 0;
}

.course-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 20px 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  border-bottom: 1px solid #f5f5f5;
  position: relative;
}

.course-item:last-child {
  border-bottom: none;
}

.course-item:hover {
  background: #f8f9fa;
}

.course-item.active {
  background: #f0f8ff;
  border-left: 3px solid #3498db;
}

.course-thumbnail {
  position: relative;
  flex-shrink: 0;
}

.course-image {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.course-status-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-active {
  background: #d4edda;
  color: #155724;
}

.status-draft {
  background: #fff3cd;
  color: #856404;
}

.status-archived {
  background: #e2e3e5;
  color: #6c757d;
}

.status-completed {
  background: #cce5ff;
  color: #004085;
}

.course-info {
  flex: 1;
  min-width: 0;
}

.course-title {
  margin: 0 0 6px 0;
  color: #2c3e50;
  font-size: 16px;
  font-weight: 600;
  line-height: 1.3;
}

.course-description {
  margin: 0 0 12px 0;
  color: #666;
  font-size: 13px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.course-meta {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.meta-icon {
  font-size: 12px;
}

.meta-text {
  font-size: 12px;
  color: #666;
}

.course-progress {
  margin-bottom: 8px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.progress-label {
  font-size: 12px;
  color: #666;
}

.progress-percentage {
  font-size: 12px;
  font-weight: 600;
  color: #2c3e50;
}

.progress-bar {
  height: 4px;
  background: #e9ecef;
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.3s ease;
}

.course-actions {
  display: flex;
  align-items: flex-start;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.course-item:hover .course-actions {
  opacity: 1;
}

.action-btn {
  background: none;
  border: 1px solid #ddd;
  padding: 6px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
}

.action-btn.primary:hover {
  background: #3498db;
  border-color: #3498db;
  color: white;
}

.action-btn.secondary:hover {
  background: #f8f9fa;
  border-color: #dee2e6;
}

.dropdown {
  position: relative;
}

.dropdown-trigger:hover {
  background: #f8f9fa;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border: 1px solid #e1e8ed;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  min-width: 120px;
  z-index: 1000;
  margin-top: 4px;
}

.dropdown-item {
  display: block;
  width: 100%;
  padding: 8px 12px;
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  font-size: 12px;
  color: #2c3e50;
  transition: background 0.3s ease;
}

.dropdown-item:hover {
  background: #f8f9fa;
}

.dropdown-item.danger {
  color: #e74c3c;
}

.dropdown-item.danger:hover {
  background: #fff5f5;
}

.card-footer {
  padding: 16px 24px;
  border-top: 1px solid #f0f0f0;
}

.add-course-btn {
  background: #28a745;
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background 0.3s ease;
  width: 100%;
}

.add-course-btn:hover {
  background: #218838;
}

.courses-container::-webkit-scrollbar {
  width: 4px;
}

.courses-container::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.courses-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 2px;
}

.courses-container::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

@media (max-width: 768px) {
  .card-header,
  .card-footer {
    padding-left: 20px;
    padding-right: 20px;
  }

  .course-item {
    padding-left: 20px;
    padding-right: 20px;
    flex-direction: column;
    gap: 12px;
  }

  .course-actions {
    opacity: 1;
    align-self: flex-end;
  }

  .course-meta {
    gap: 12px;
  }

  .course-image {
    width: 50px;
    height: 50px;
    font-size: 20px;
  }
}
</style>