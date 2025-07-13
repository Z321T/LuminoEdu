<template>
  <div class="exercise-history-layout">
    <!-- 侧边栏 -->
    <Sidebar :menu-items="teacherMenuItems" />

    <!-- 主内容区 -->
    <main class="main">
      <!-- 头部 -->
      <PageHeader title="习题生成历史">
        <template #actions>
          <button
            class="btn btn-primary"
            @click="navigateTo('/exercise_generate')"
          >
            ➕ 生成新习题
          </button>
        </template>
      </PageHeader>

      <!-- 搜索和筛选 -->
      <SearchFilter
        v-model="searchQuery"
        search-placeholder="搜索习题标题或文件名..."
        @search="searchExercises"
        @reset="resetFilters"
      >
        <template #filters>
          <div class="filter-item">
            <label>显示数量：</label>
            <select
              v-model="queryParams.limit"
              @change="loadHistory"
              class="limit-select"
            >
              <option value="10">10条</option>
              <option value="20">20条</option>
              <option value="50">50条</option>
              <option value="100">100条</option>
            </select>
          </div>
        </template>
      </SearchFilter>

      <!-- 批量操作 -->
      <BatchActions
        :selected-count="selectedItems.length"
        @clear="clearSelection"
      >
        <template #actions>
          <button
            class="btn btn-danger"
            @click="batchDelete"
            :disabled="batchDeleteLoading"
          >
            <span v-if="batchDeleteLoading">⏳ 删除中...</span>
            <span v-else>🗑️ 批量删除</span>
          </button>
        </template>
      </BatchActions>

      <!-- 加载状态 -->
      <LoadingState
        v-if="loading"
        type="spinner"
        message="正在加载历史记录..."
      />

      <!-- 错误信息 -->
      <ErrorMessage
        v-if="errorMessage"
        :message="errorMessage"
        @retry="loadHistory"
      />

      <!-- 历史记录列表 -->
      <ExerciseHistoryList
        v-if="!loading && !errorMessage"
        :items="historyItems"
        :selected-items="selectedItems"
        @update:selected-items="selectedItems = $event"
        @view="viewExercise"
        @download="downloadExercise"
        @delete="deleteItem"
      />

      <!-- 详情模态框 -->
      <ExerciseDetailModal
        v-if="showDetailModal"
        :exercise="selectedExercise"
        @close="closeDetailModal"
        @download="downloadExercise"
      />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Sidebar from '@/components/layout/Sidebar.vue'
import PageHeader from '@/components/layout/PageHeader.vue'
import SearchFilter from '@/components/common/SearchFilter.vue'
import BatchActions from '@/components/common/BatchActions.vue'
import LoadingState from '@/components/common/LoadingState.vue'
import ErrorMessage from '@/components/common/ErrorMessage.vue'
import ExerciseHistoryList from '@/components/exercise/ExerciseHistoryList.vue'
import ExerciseDetailModal from '@/components/exercise/ExerciseDetailModal.vue'
import { useExerciseHistory } from '@/composables/useExerciseHistory'

const router = useRouter()

// 菜单配置
const teacherMenuItems = [
  { path: '/home_teacher', icon: '🏠', label: '首页' },
  { path: '/exercise_generate', icon: '📝', label: '习题生成' },
  { path: '/exercise_history', icon: '📚', label: '历史记录' },
  { path: '/student_management', icon: '👥', label: '学生管理' },
  { path: '/settings', icon: '⚙️', label: '设置' },
]

// 使用组合式API管理状态
const {
  loading,
  errorMessage,
  historyItems,
  selectedItems,
  searchQuery,
  queryParams,
  deleteLoading,
  batchDeleteLoading,
  loadHistory,
  searchExercises,
  resetFilters,
  deleteItem,
  batchDelete,
  clearSelection,
  downloadExercise,
} = useExerciseHistory()

// 详情模态框
const showDetailModal = ref(false)
const selectedExercise = ref(null)

const navigateTo = (path: string) => {
  router.push(path)
}

const viewExercise = (item: any) => {
  selectedExercise.value = item
  showDetailModal.value = true
}

const closeDetailModal = () => {
  showDetailModal.value = false
  selectedExercise.value = null
}

// 组件挂载时加载数据
onMounted(() => {
  loadHistory()
})
</script>

<style scoped>
.exercise-history-layout {
  display: flex;
  height: 100vh;
  width: 100vw;
  background: #f5f6fa;
}

.main {
  flex: 1;
  margin-left: 240px;
  overflow-y: auto;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-danger {
  background: #dc3545;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background: #c82333;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-item label {
  font-size: 14px;
  color: #666;
}

.limit-select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

@media (max-width: 768px) {
  .main {
    margin-left: 0;
  }
}
</style>