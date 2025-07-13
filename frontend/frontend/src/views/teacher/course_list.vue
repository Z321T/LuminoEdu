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
        :title="'课程管理'"
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
        <div class="course-manage">
          <!-- 功能按钮区 -->
          <div class="action-bar">
            <button
              @click="createCourse"
              class="create-btn"
            >
              <span class="icon">📚</span> 创建新课程
            </button>
          </div>

          <!-- 课程列表 -->
          <div class="table-container">
            <div
              v-if="isLoading"
              class="loading-state"
            >
              正在加载课程列表...
            </div>

            <table
              v-else
              class="course-table"
            >
              <thead>
                <tr>
                  <th>课程名称</th>
                  <th>学期</th>
                  <th>学分</th>
                  <th>起止时间</th>
                  <th>描述</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="course in courseList"
                  :key="course.id"
                >
                  <td>{{ course.name }}</td>
                  <td>{{ course.semester }}</td>
                  <td>{{ course.credit }}</td>
                  <td
                    :class="{ 'text-muted': !course.start_date && !course.end_date }"
                  >
                    {{ formatDateRange(course.start_date, course.end_date) }}
                  </td>
                  <td class="description">{{ course.description }}</td>
                  <td class="actions">
                    <button
                      @click="editCourse(course)"
                      class="btn edit-btn"
                    >
                      编辑
                    </button>
                    <button
                      @click="addStudents(course)"
                      class="btn add-btn"
                    >
                      添加学生
                    </button>
                    <button
                      @click="viewNotifications(course)"
                      class="btn notify-btn"
                    >
                      通知
                    </button>
                    <button
                      @click="viewMaterials(course)"
                      class="btn material-btn"
                    >
                      资料
                    </button>
                    <button
                      @click="confirmDelete(course.id)"
                      class="btn delete-btn"
                    >
                      删除
                    </button>
                    <button
                      @click="viewCourseDetail(course)"
                      class="btn view-btn"
                    >
                      查看详情
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
import {
  getAllCourses,
  deleteCourse,
  getCourseDetail,
  type Course,
} from '@/api/teacher/course_management'
import PageHeader from '@/components/layout/PageHeader.vue'
import SideBar from '@/components/layout/SideBar.vue'

export default {
  name: 'CourseManage',

  components: {
    PageHeader,
    SideBar,
  },

  setup() {
    const router = useRouter()
    const isLoading = ref(true)
    const courseList = ref<Course[]>([])
    const mobileMenuOpen = ref(false)
    const username = ref(localStorage.getItem('username') || '教师用户')

    // 格式化日期范围
    const formatDateRange = (start: string | null, end: string | null) => {
      if (!start && !end) {
        return '未设置'
      }
      if (start && !end) {
        return `从 ${start} 开始`
      }
      if (!start && end) {
        return `至 ${end} 结束`
      }
      return `${start} 至 ${end}`
    }

    // 加载课程列表
    const loadCourses = async () => {
      try {
        const courses = await getAllCourses()
        courseList.value = courses
      } catch (error) {
        console.error('获取课程列表失败:', error)
      } finally {
        isLoading.value = false
      }
    }

    // 创建新课程
    const createCourse = () => {
      router.push('/course_create')
    }

    // 编辑课程
    const editCourse = (course: Course) => {
      router.push(`/teacher/course/edit/${course.id}`)
    }

    // 删除课程
    const confirmDelete = async (id: number) => {
      try {
        if (confirm('确定要删除这个课程吗？此操作不可恢复！')) {
          const result = await deleteCourse(id)
          if (result.success) {
            // 从列表中移除已删除的课程
            courseList.value = courseList.value.filter((course) => course.id !== id)
            alert(result.message || '删除成功')
          }
        }
      } catch (error: any) {
        alert(error.message || '删除失败，请稍后重试')
      }
    }

    // 导入学生
    const addStudents = (course: Course) => {
      console.log('添加学生到课程:', course)
      router.push(`/course_addstudent/${course.id}`)
    }

    // 查看课程详情
    const viewCourseDetail = (course: Course) => {
      router.push(`/course_detail/${course.id}`)
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

    // 查看通知
    const viewNotifications = (course: Course) => {
      router.push(`/notification_list/${course.id}`)
    }

    // 查看课程资料
    const viewMaterials = (course: Course) => {
      router.push(`/teacher/course/${course.id}/materials`)
    }

    onMounted(() => {
      loadCourses()
    })

    return {
      isLoading,
      courseList,
      username,
      mobileMenuOpen,
      formatDateRange,
      createCourse,
      editCourse,
      confirmDelete,
      addStudents,
      viewCourseDetail,
      toggleMobileMenu,
      closeMobileMenu,
      handleMenuClick,
      logout,
      viewNotifications,
      viewMaterials,
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

.action-bar {
  margin-bottom: 24px;
}

.create-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: #4299e1;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.create-btn:hover {
  background: #3182ce;
}

.table-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: auto;
}

.course-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.course-table th,
.course-table td {
  padding: 16px;
  border-bottom: 1px solid #e2e8f0;
}

.course-table th {
  background: #f8fafc;
  font-weight: 600;
  color: #4a5568;
}

.course-table tr:hover {
  background: #f8fafc;
}

.description {
  max-width: 300px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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

.edit-btn {
  background: #ebf8ff;
  color: #3182ce;
}

.delete-btn {
  background: #fff5f5;
  color: #e53e3e;
}

.add-btn {
  background: #e6fffa;
  color: #319795;
}

.view-btn {
  background: #f0fff4;
  color: #48bb78;
}

.material-btn {
  background: #faf5ff;
  color: #805ad5;
}

.edit-btn:hover {
  background: #bee3f8;
}
.delete-btn:hover {
  background: #fed7d7;
}

.add-btn:hover {
  background: #b2f5ea;
}

.view-btn:hover {
  background: #c6f6d5;
}

.material-btn:hover {
  background: #e9d8fd;
}

.loading-state {
  padding: 40px;
  text-align: center;
  color: #4a5568;
}

.text-muted {
  color: #a0aec0;
  font-style: italic;
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
    gap: 8px;
  }

  .btn {
    width: 100%;
  }
}
</style>