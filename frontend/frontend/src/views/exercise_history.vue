<template>
  <div class="exercise-history-layout">
    <!-- 侧边栏 -->
    <aside class="sidebar">
      <div class="logo">LuminoEdu</div>
      <ul class="menu">
        <li
          class="menu-item"
          @click="navigateTo('/home_teacher')"
        >
          <i class="icon">🏠</i>
          <span>首页</span>
        </li>
        <li
          class="menu-item"
          @click="navigateTo('/exercise_generate')"
        >
          <i class="icon">📝</i>
          <span>习题生成</span>
        </li>
        <li class="menu-item active">
          <i class="icon">📚</i>
          <span>历史记录</span>
        </li>
        <li class="menu-item">
          <i class="icon">👥</i>
          <span>学生管理</span>
        </li>
        <li class="menu-item">
          <i class="icon">⚙️</i>
          <span>设置</span>
        </li>
      </ul>
    </aside>

    <!-- 主内容区 -->
    <main class="main">
      <!-- 头部 -->
      <header class="header">
        <h1>习题生成历史</h1>
        <div class="header-actions">
          <button
            class="btn btn-primary"
            @click="navigateTo('/exercise_generate')"
          >
            ➕ 生成新习题
          </button>
        </div>
      </header>

      <!-- 搜索和筛选 -->
      <div class="search-section">
        <div class="search-bar">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索习题标题或文件名..."
            class="search-input"
            @keyup.enter="searchExercises"
          >
          <button
            class="search-btn"
            @click="searchExercises"
          >
            🔍 搜索
          </button>
        </div>

        <div class="filter-bar">
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

          <button
            class="reset-btn"
            @click="resetFilters"
          >
            重置
          </button>
        </div>
      </div>

      <!-- 批量操作 -->
      <div
        class="batch-actions"
        v-if="selectedItems.length > 0"
      >
        <span class="selected-count">已选择 {{ selectedItems.length }} 项</span>
        <button
          class="btn btn-danger"
          @click="batchDelete"
        >
          🗑️ 批量删除
        </button>
        <button
          class="btn btn-secondary"
          @click="clearSelection"
        >
          取消选择
        </button>
      </div>

      <!-- 加载状态 -->
      <div
        v-if="loading"
        class="loading"
      >
        <div class="loading-spinner"></div>
        <p>正在加载历史记录...</p>
      </div>

      <!-- 错误信息 -->
      <div
        v-if="errorMessage"
        class="error-message"
      >
        {{ errorMessage }}
        <button
          @click="loadHistory"
          class="retry-btn"
        >重试</button>
      </div>

      <!-- 历史记录列表 -->
      <div
        v-if="!loading && !errorMessage"
        class="history-list"
      >
        <!-- 空状态 -->
        <div
          v-if="historyItems.length === 0"
          class="empty-state"
        >
          <div class="empty-icon">📝</div>
          <h3>还没有习题生成记录</h3>
          <p>开始生成你的第一个习题集吧！</p>
          <button
            class="btn btn-primary"
            @click="navigateTo('/exercise_generate')"
          >
            立即生成
          </button>
        </div>

        <!-- 记录列表 -->
        <div
          v-else
          class="history-grid"
        >
          <div
            v-for="item in historyItems"
            :key="item.id || item.filename"
            class="history-card"
            :class="{ selected: selectedItems.includes(item.id || item.filename) }"
          >
            <!-- 选择框 -->
            <div class="card-checkbox">
              <input
                type="checkbox"
                :value="item.id || item.filename"
                v-model="selectedItems"
                class="checkbox"
              >
            </div>

            <!-- 状态标识 -->
            <div
              class="card-status"
              :class="item.status || 'completed'"
            >
              <span v-if="(item.status || 'completed') === 'completed'">✅</span>
              <span v-else-if="item.status === 'generating'">⏳</span>
              <span v-else>❌</span>
            </div>

            <!-- 卡片内容 -->
            <div class="card-content">
              <h3 class="card-title">{{ item.title || item.filename }}</h3>
              <p class="card-preview">{{ item.content_preview || '暂无预览' }}</p>

              <div class="card-meta">
                <div class="meta-item">
                  <span class="meta-label">文件名：</span>
                  <span class="meta-value">{{ item.filename }}</span>
                </div>
                <div
                  class="meta-item"
                  v-if="item.exercise_count"
                >
                  <span class="meta-label">题目数量：</span>
                  <span class="meta-value">{{ item.exercise_count }}</span>
                </div>
                <div
                  class="meta-item"
                  v-if="item.exercise_types"
                >
                  <span class="meta-label">题目类型：</span>
                  <span
                    class="meta-value">{{ formatExerciseTypes(item.exercise_types) }}</span>
                </div>
                <div class="meta-item">
                  <span class="meta-label">创建时间：</span>
                  <span
                    class="meta-value">{{ formatDate(item.created_at) }}</span>
                </div>
                <div
                  class="meta-item"
                  v-if="item.file_size"
                >
                  <span class="meta-label">文件大小：</span>
                  <span
                    class="meta-value">{{ formatFileSize(item.file_size) }}</span>
                </div>
              </div>
            </div>

            <!-- 操作按钮 -->
            <div class="card-actions">
              <button
                class="action-btn view-btn"
                @click="viewExercise(item)"
                :disabled="item.status === 'generating'"
              >
                👁️ 查看
              </button>
              <button
                class="action-btn download-btn"
                @click="downloadExercise(item)"
                :disabled="item.status === 'generating'"
              >
                📄 下载
              </button>
              <button
                class="action-btn delete-btn"
                @click="deleteItem(item)"
              >
                🗑️ 删除
              </button>
            </div>
          </div>
        </div>

        <!-- 简化的统计信息 -->
        <div
          v-if="historyItems.length > 0"
          class="summary-info"
        >
          <div class="summary-text">
            共找到 {{ historyItems.length }} 条记录
            <span v-if="queryParams.title_filter">
              （搜索：{{ queryParams.title_filter }}）
            </span>
          </div>
        </div>
      </div>
    </main>
  </div>

  <!-- 查看详情模态框 -->
  <div
    v-if="showDetailModal"
    class="modal-overlay"
    @click="closeDetailModal"
  >
    <div
      class="modal-content"
      @click.stop
    >
      <div class="modal-header">
        <h2>{{ selectedExercise?.title || selectedExercise?.filename }}</h2>
        <button
          class="modal-close"
          @click="closeDetailModal"
        >✕</button>
      </div>
      <div class="modal-body">
        <div class="detail-section">
          <h4>基本信息</h4>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="detail-label">文件名：</span>
              <span class="detail-value">{{ selectedExercise?.filename }}</span>
            </div>
            <div
              class="detail-item"
              v-if="selectedExercise?.exercise_count"
            >
              <span class="detail-label">题目数量：</span>
              <span
                class="detail-value">{{ selectedExercise?.exercise_count }}</span>
            </div>
            <div
              class="detail-item"
              v-if="selectedExercise?.exercise_types"
            >
              <span class="detail-label">题目类型：</span>
              <span
                class="detail-value">{{ formatExerciseTypes(selectedExercise?.exercise_types) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">创建时间：</span>
              <span
                class="detail-value">{{ formatDate(selectedExercise?.created_at || '') }}</span>
            </div>
          </div>
        </div>
        <div
          class="detail-section"
          v-if="selectedExercise?.content_preview"
        >
          <h4>内容预览</h4>
          <div class="content-preview">
            {{ selectedExercise?.content_preview }}
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button
          class="btn btn-primary"
          @click="downloadExercise(selectedExercise!)"
        >
          📄 下载文件
        </button>
        <button
          class="btn btn-secondary"
          @click="closeDetailModal"
        >
          关闭
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  getExerciseHistory,
  deleteExerciseHistory,
  batchDeleteExerciseHistory,
  extractTitleFromFilename,
  extractIdFromFilename,
  type ExerciseHistoryItem,
} from '@/api/exercise_history'
import { downloadExerciseFile } from '@/api/exercise_generate'

const router = useRouter()

// 响应式数据
const loading = ref(true)
const errorMessage = ref('')
const historyItems = ref<ExerciseHistoryItem[]>([])
const selectedItems = ref<string[]>([])
const searchQuery = ref('')
const showDetailModal = ref(false)
const selectedExercise = ref<ExerciseHistoryItem | null>(null)

// 查询参数
const queryParams = reactive({
  limit: 50,
  title_filter: '',
})

// 简化的分页信息
const pagination = reactive({
  total: 0,
  currentPage: 1,
  pageSize: 50,
  totalPages: 0,
})

// 页面跳转
const navigateTo = (path: string) => {
  router.push(path)
}

// 加载历史记录 - 修改为处理新的数据格式
const loadHistory = async () => {
  try {
    loading.value = true
    errorMessage.value = ''

    const params = {
      limit: queryParams.limit,
      title_filter: queryParams.title_filter || undefined,
    }

    console.log('🔄 开始加载历史记录，参数:', params)

    const response = await getExerciseHistory(params)

    console.log('📋 获取到的响应:', response)

    // 处理新的响应格式 {exercises: [...]}
    let items: ExerciseHistoryItem[] = []

    if (response && Array.isArray(response.exercises)) {
      // 处理 {exercises: [...]} 格式
      items = response.exercises.map((item) => ({
        ...item,
        // 从文件名中提取标题和ID
        title: extractTitleFromFilename(item.filename),
        id: extractIdFromFilename(item.filename),
        // 将 size_kb 转换为 file_size (bytes)
        file_size: item.size_kb ? Math.round(item.size_kb * 1024) : undefined,
        // 设置默认状态
        status: 'completed' as const,
        // 添加一些默认值
        content_preview: `生成于 ${formatDate(item.created_at)}`,
        exercise_types: ['选择题'], // 默认类型，可以根据实际情况调整
        exercise_count: 5, // 默认数量，可以根据实际情况调整
      }))
    } else if (Array.isArray(response)) {
      // 如果响应直接是数组
      items = response.map((item) => ({
        ...item,
        title: extractTitleFromFilename(item.filename),
        id: extractIdFromFilename(item.filename),
        file_size: item.size_kb ? Math.round(item.size_kb * 1024) : undefined,
        status: 'completed' as const,
      }))
    } else {
      console.warn('未识别的响应格式:', response)
      items = []
    }

    historyItems.value = items

    // 更新分页信息（基于本地数据）
    pagination.total = items.length
    pagination.totalPages = Math.ceil(items.length / pagination.pageSize)

    console.log('📋 处理后的历史记录数量:', items.length)
    console.log('📋 处理后的数据示例:', items[0])
  } catch (error: any) {
    console.error('💥 加载历史记录失败:', error)
    errorMessage.value = error.message || '加载失败，请重试'
    historyItems.value = []

    // 重置分页信息
    pagination.total = 0
    pagination.totalPages = 0
  } finally {
    loading.value = false
  }
}

// 搜索习题 - 客户端搜索
const searchExercises = () => {
  // 如果有搜索关键词，进行客户端过滤
  if (searchQuery.value.trim()) {
    // 这里可以选择重新请求服务器，或者在客户端过滤
    queryParams.title_filter = searchQuery.value
    loadHistory()
  } else {
    // 如果没有搜索关键词，显示所有数据
    queryParams.title_filter = ''
    loadHistory()
  }
}

// 重置筛选
const resetFilters = () => {
  searchQuery.value = ''
  queryParams.title_filter = ''
  queryParams.limit = 50
  loadHistory()
}

// 查看习题详情
const viewExercise = (item: ExerciseHistoryItem) => {
  selectedExercise.value = item
  showDetailModal.value = true
}

const closeDetailModal = () => {
  showDetailModal.value = false
  selectedExercise.value = null
}

// 下载习题
const downloadExercise = async (item: ExerciseHistoryItem) => {
  try {
    await downloadExerciseFile(item.filename)
  } catch (error: any) {
    console.error('下载失败:', error)
    alert(error.message || '下载失败，请重试')
  }
}

// 删除单个记录
const deleteItem = async (item: ExerciseHistoryItem) => {
  if (!confirm(`确定要删除习题"${item.title || item.filename}"吗？此操作不可撤销。`)) {
    return
  }

  try {
    await deleteExerciseHistory(item.filename)
    await loadHistory()
    alert('删除成功')
  } catch (error: any) {
    console.error('删除失败:', error)
    alert(error.message || '删除失败，请重试')
  }
}

// 批量删除
const batchDelete = async () => {
  if (!confirm(`确定要删除选中的 ${selectedItems.value.length} 个习题吗？此操作不可撤销。`)) {
    return
  }

  try {
    // 从选中的ID中找到对应的文件名
    const selectedFilenames = historyItems.value
      .filter((item) => selectedItems.value.includes(item.id || item.filename))
      .map((item) => item.filename)

    await batchDeleteExerciseHistory(selectedFilenames)
    selectedItems.value = []
    await loadHistory()
    alert('批量删除成功')
  } catch (error: any) {
    console.error('批量删除失败:', error)
    alert(error.message || '批量删除失败，请重试')
  }
}

// 清除选择
const clearSelection = () => {
  selectedItems.value = []
}

// 格式化工具函数
const formatDate = (dateString: string): string => {
  if (!dateString) return '未知时间'
  try {
    return new Date(dateString).toLocaleString('zh-CN')
  } catch (error) {
    return dateString
  }
}

const formatExerciseTypes = (types?: string[]): string => {
  if (!types || types.length === 0) return '未知类型'

  const typeMap: Record<string, string> = {
    choice: '选择题',
    fill: '填空题',
    essay: '简答题',
  }

  return types.map((type) => typeMap[type] || type).join('、')
}

const formatFileSize = (bytes?: number): string => {
  if (!bytes) return '未知大小'
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
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

/* 侧边栏样式 */
.sidebar {
  width: 240px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  position: fixed;
  height: 100vh;
  z-index: 1000;
}

.logo {
  padding: 20px;
  font-size: 24px;
  font-weight: bold;
  text-align: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.menu {
  list-style: none;
  padding: 20px 0;
  margin: 0;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  border-left: 3px solid transparent;
}

.menu-item:hover,
.menu-item.active {
  background: rgba(255, 255, 255, 0.1);
  border-left-color: #fff;
}

.menu-item .icon {
  margin-right: 12px;
  font-size: 18px;
}

/* 主内容区样式 */
.main {
  flex: 1;
  margin-left: 240px;
  padding: 0;
  overflow-y: auto;
}

.header {
  background: white;
  padding: 20px 30px;
  border-bottom: 1px solid #e1e8ed;
  display: flex;
  justify-content: between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header h1 {
  margin: 0;
  color: #2c3e50;
  font-size: 28px;
}

.header-actions {
  margin-left: auto;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  text-decoration: none;
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

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-danger {
  background: #dc3545;
  color: white;
}

/* 搜索和筛选区域 */
.search-section {
  background: white;
  padding: 20px 30px;
  border-bottom: 1px solid #e1e8ed;
}

.search-bar {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.search-input {
  flex: 1;
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
}

.search-btn {
  padding: 10px 20px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.filter-bar {
  display: flex;
  gap: 15px;
  align-items: center;
  flex-wrap: wrap;
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

.date-input {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.filter-btn,
.reset-btn {
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.filter-btn {
  background: #28a745;
  color: white;
  border-color: #28a745;
}

.reset-btn {
  background: #6c757d;
  color: white;
  border-color: #6c757d;
}

/* 批量操作 */
.batch-actions {
  background: #fff3cd;
  padding: 15px 30px;
  border-bottom: 1px solid #ffeaa7;
  display: flex;
  align-items: center;
  gap: 15px;
}

.selected-count {
  font-weight: 500;
  color: #856404;
}

/* 加载和错误状态 */
.loading {
  text-align: center;
  padding: 60px 20px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.error-message {
  text-align: center;
  padding: 40px 20px;
  color: #dc3545;
}

.retry-btn {
  margin-left: 10px;
  padding: 6px 12px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 80px 20px;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 20px;
}

.empty-state h3 {
  color: #2c3e50;
  margin-bottom: 10px;
}

.empty-state p {
  color: #666;
  margin-bottom: 30px;
}

/* 历史记录网格 */
.history-list {
  padding: 20px 30px;
}

.history-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

/* 历史记录卡片 */
.history-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  position: relative;
  border: 2px solid transparent;
}

.history-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.history-card.selected {
  border-color: #667eea;
  background: #f8f9ff;
}

.card-checkbox {
  position: absolute;
  top: 15px;
  left: 15px;
}

.checkbox {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.card-status {
  position: absolute;
  top: 15px;
  right: 15px;
  font-size: 20px;
}

.card-status.completed {
  color: #28a745;
}

.card-status.generating {
  color: #ffc107;
}

.card-status.failed {
  color: #dc3545;
}

.card-content {
  margin: 10px 0 20px;
  padding-left: 30px;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 10px;
  line-height: 1.4;
}

.card-preview {
  color: #666;
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 15px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-meta {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  font-size: 13px;
}

.meta-item {
  display: flex;
  align-items: center;
}

.meta-label {
  color: #666;
  margin-right: 4px;
}

.meta-value {
  color: #2c3e50;
  font-weight: 500;
}

.card-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  padding-top: 15px;
  border-top: 1px solid #f1f3f4;
}

.action-btn {
  padding: 6px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s ease;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.view-btn {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.view-btn:hover:not(:disabled) {
  background: #0056b3;
}

.download-btn {
  background: #28a745;
  color: white;
  border-color: #28a745;
}

.download-btn:hover:not(:disabled) {
  background: #1e7e34;
}

.delete-btn {
  background: #dc3545;
  color: white;
  border-color: #dc3545;
}

.delete-btn:hover {
  background: #c82333;
}

/* 分页样式 */
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: 30px;
}

.page-btn {
  padding: 8px 16px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  gap: 5px;
}

.page-num {
  width: 36px;
  height: 36px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.page-num.active {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.page-info {
  font-size: 14px;
  color: #666;
  margin-left: 20px;
}

/* 模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.modal-header {
  padding: 20px 30px;
  border-bottom: 1px solid #e1e8ed;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
  color: #2c3e50;
}

.modal-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
}

.modal-body {
  padding: 30px;
}

.detail-section {
  margin-bottom: 30px;
}

.detail-section h4 {
  margin: 0 0 15px 0;
  color: #2c3e50;
  font-size: 16px;
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-label {
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.detail-value {
  font-size: 14px;
  color: #2c3e50;
}

.content-preview {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 6px;
  font-size: 14px;
  line-height: 1.6;
  color: #2c3e50;
  max-height: 200px;
  overflow-y: auto;
}

.modal-footer {
  padding: 20px 30px;
  border-top: 1px solid #e1e8ed;
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

/* 添加新的样式 */
.limit-select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.summary-info {
  text-align: center;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-top: 20px;
}

.summary-text {
  color: #666;
  font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
  }

  .main {
    margin-left: 0;
  }

  .history-grid {
    grid-template-columns: 1fr;
  }

  .header {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }

  .search-bar,
  .filter-bar {
    flex-direction: column;
    gap: 10px;
  }

  .batch-actions {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .modal-content {
    width: 95%;
    margin: 20px;
  }

  .detail-grid {
    grid-template-columns: 1fr;
  }
}
</style>