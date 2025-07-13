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
        :title="'创建新课程'"
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
        <div class="course-create">
          <form
            @submit.prevent="handleSubmit"
            class="course-form"
          >
            <!-- 课程名称 (必填) -->
            <div class="form-group">
              <label for="name">
                课程名称
                <span class="required-mark">*</span>
              </label>
              <input
                id="name"
                v-model="courseData.name"
                type="text"
                required
                maxlength="100"
                placeholder="请输入课程名称"
              >
            </div>

            <!-- 学期 (必填) -->
            <div class="form-group">
              <label for="semester">
                学期
                <span class="required-mark">*</span>
              </label>
              <select
                id="semester"
                v-model="courseData.semester"
                required
              >
                <option value="">请选择学期</option>
                <option value="2024-春季">2024年春季学期</option>
                <option value="2024-秋季">2024年秋季学期</option>
                <option value="2025-春季">2025年春季学期</option>
                <option value="2025-秋季">2025年秋季学期</option>
                <option value="2026-春季">2026年春季学期</option>
                <option value="2026-秋季">2026年秋季学期</option>
                <option value="2027-春季">2027年春季学期</option>
                <option value="2027-秋季">2027年秋季学期</option>
                <option value="2028-春季">2028年春季学期</option>
                <option value="2028-秋季">2028年秋季学期</option>
                <option value="2029-春季">2029年春季学期</option>
                <option value="2029-秋季">2029年秋季学期</option>
                <option value="2030-春季">2030年春季学期</option>
                <option value="2030-秋季">2030年秋季学期</option>
              </select>
            </div>

            <!-- 学分 (必填) -->
            <div class="form-group">
              <label for="credit">
                学分
                <span class="required-mark">*</span>
              </label>
              <input
                id="credit"
                v-model.number="courseData.credit"
                type="number"
                min="0"
                max="10"
                step="0.5"
                required
                placeholder="请输入课程学分（支持0.5的倍数）"
              >
              <span class="form-hint">支持0.5学分的增减，例如：1.0、1.5、2.0等</span>
            </div>

            <!-- 起止时间 (可选) -->
            <div class="form-dates">
              <div class="form-group">
                <label for="start_date">开始日期</label>
                <input
                  id="start_date"
                  v-model="courseData.start_date"
                  type="date"
                >
              </div>
              <div class="form-group">
                <label for="end_date">结束日期</label>
                <input
                  id="end_date"
                  v-model="courseData.end_date"
                  type="date"
                >
              </div>
            </div>

            <!-- 课程描述 (可选) -->
            <div class="form-group">
              <label for="description">课程描述</label>
              <textarea
                id="description"
                v-model="courseData.description"
                rows="4"
                maxlength="1000"
                placeholder="请输入课程描述（可选）"
              ></textarea>
              <span class="form-hint">选填，最多1000字</span>
            </div>

            <!-- 提交按钮 -->
            <div class="form-actions">
              <button
                type="button"
                class="cancel-btn"
                @click="goBack"
              >
                取消
              </button>
              <button
                type="submit"
                class="submit-btn"
                :disabled="isSubmitting"
              >
                {{ isSubmitting ? '创建中...' : '创建课程' }}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  </div>
</template>

<script lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { createCourse, type CreateCourseRequest } from '@/api/teacher/course_management'
import PageHeader from '@/components/layout/PageHeader.vue'
import SideBar from '@/components/layout/SideBar.vue'

export default {
  name: 'CourseCreate',

  components: {
    PageHeader,
    SideBar,
  },

  setup() {
    const router = useRouter()
    const isSubmitting = ref(false)
    const username = ref(localStorage.getItem('username') || '教师用户')
    const mobileMenuOpen = ref(false)

    // 课程表单数据
    const courseData = reactive<CreateCourseRequest>({
      name: '',
      description: '',
      semester: '',
      credit: 0,
      start_date: '',
      end_date: '',
    })

    // 重置表单数据
    const resetForm = () => {
      courseData.name = ''
      courseData.description = ''
      courseData.semester = ''
      courseData.credit = 0
      courseData.start_date = ''
      courseData.end_date = ''
    }

    // 提交表单
    const handleSubmit = async () => {
      if (isSubmitting.value) return

      try {
        isSubmitting.value = true

        // 处理可选字段
        const submitData = {
          ...courseData,
          description: courseData.description || null,
          start_date: courseData.start_date || null,
          end_date: courseData.end_date || null,
        }

        await createCourse(submitData)
        alert('课程创建成功')
        // 重置表单
        resetForm()
      } catch (error: any) {
        alert(error.message || '创建失败，请稍后重试')
      } finally {
        isSubmitting.value = false
      }
    }

    // 返回上一页
    const goBack = () => {
      router.back()
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

    return {
      courseData,
      isSubmitting,
      username,
      mobileMenuOpen,
      handleSubmit,
      goBack,
      toggleMobileMenu,
      closeMobileMenu,
      handleMenuClick,
      logout,
      resetForm,
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

.course-create {
  max-width: 800px;
  margin: 0 auto;
}

.course-form {
  background: white;
  padding: 32px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 24px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #2d3748;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
}

.form-group textarea {
  resize: vertical;
  min-height: 100px;
}

.form-dates {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 24px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 32px;
}

.cancel-btn,
.submit-btn {
  padding: 10px 24px;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-btn {
  background: #edf2f7;
  color: #4a5568;
}

.submit-btn {
  background: #4299e1;
  color: white;
}

.cancel-btn:hover {
  background: #e2e8f0;
}

.submit-btn:hover {
  background: #3182ce;
}

.submit-btn:disabled {
  background: #90cdf4;
  cursor: not-allowed;
}

.form-hint {
  display: block;
  margin-top: 4px;
  font-size: 12px;
  color: #718096;
}

.required-mark {
  color: #e53e3e;
  margin-left: 4px;
}

@media (max-width: 768px) {
  .main-layout {
    margin-left: 0;
  }

  .content-area {
    padding: 16px;
  }

  .course-form {
    padding: 20px;
  }

  .form-dates {
    grid-template-columns: 1fr;
  }
}
</style>