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
        title="发布课程通知"
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
        <div class="notification-form">
          <form @submit.prevent="handleSubmit">
            <!-- 标题 -->
            <div class="form-group">
              <label for="title">
                通知标题
                <span class="required-mark">*</span>
              </label>
              <input
                id="title"
                v-model="formData.title"
                type="text"
                required
                maxlength="100"
                placeholder="请输入通知标题"
              >
            </div>

            <!-- 优先级 -->
            <div class="form-group">
              <label for="priority">优先级</label>
              <select
                id="priority"
                v-model="formData.priority"
              >
                <option value="1">普通</option>
                <option value="2">重要</option>
                <option value="3">紧急</option>
              </select>
            </div>

            <!-- 是否需要确认 -->
            <div class="form-group checkbox">
              <label>
                <input
                  type="checkbox"
                  v-model="formData.require_confirmation"
                >
                <span>需要学生确认已读</span>
              </label>
            </div>

            <!-- 通知内容 -->
            <div class="form-group">
              <label for="content">
                通知内容
                <span class="required-mark">*</span>
              </label>
              <textarea
                id="content"
                v-model="formData.content"
                rows="10"
                required
                placeholder="请输入通知内容"
              ></textarea>
            </div>

            <!-- 提交按钮 -->
            <div class="form-actions">
              <button
                type="submit"
                class="submit-btn"
                :disabled="isSubmitting"
              >
                {{ isSubmitting ? '发布中...' : '发布通知' }}
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
import { useRoute, useRouter } from 'vue-router'
import PageHeader from '@/components/layout/PageHeader.vue'
import SideBar from '@/components/layout/SideBar.vue'
import { createNotification } from '@/api/teacher/notificaiton'

export default {
  name: 'NotificationCreate',

  components: {
    PageHeader,
    SideBar,
  },

  setup() {
    const route = useRoute()
    const router = useRouter()
    const courseId = Number(route.params.courseId)
    const isSubmitting = ref(false)
    const mobileMenuOpen = ref(false)

    // 表单数据
    const formData = reactive({
      title: '',
      content: '',
      priority: 1,
      require_confirmation: false,
    })

    // 返回列表
    const backToList = () => {
      router.push(`/teacher/course/${courseId}/notifications`)
    }

    // 提交表单
    const handleSubmit = async () => {
      if (isSubmitting.value) return

      try {
        isSubmitting.value = true
        const result = await createNotification(courseId, formData)

        if (result.success) {
          alert('通知发布成功')
          router.push(`/teacher/course/${courseId}/notifications`)
        }
      } catch (error: any) {
        alert(error.message || '发布失败，请稍后重试')
      } finally {
        isSubmitting.value = false
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

    return {
      formData,
      isSubmitting,
      mobileMenuOpen,
      backToList,
      handleSubmit,
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

.notification-form {
  max-width: 800px;
  margin: 0 auto;
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 24px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #2d3748;
  font-weight: 500;
}

.form-group.checkbox label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.required-mark {
  color: #e53e3e;
  margin-left: 4px;
}

input[type='text'],
select,
textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 16px;
  transition: all 0.2s;
}

input[type='text']:focus,
select:focus,
textarea:focus {
  outline: none;
  border-color: #4299e1;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
}

textarea {
  resize: vertical;
  min-height: 200px;
}

.form-actions {
  display: flex;
  justify-content: center;
  margin-top: 32px;
}

.submit-btn {
  padding: 12px 32px;
  background: #4299e1;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.submit-btn:hover:not(:disabled) {
  background: #3182ce;
}

.submit-btn:disabled {
  background: #90cdf4;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .main-layout {
    margin-left: 0;
  }

  .content-area {
    padding: 16px;
  }

  .notification-form {
    padding: 16px;
  }
}
</style>