<!-- filepath: d:\git\LuminoEdu\frontend\frontend\src\components\exercise\ExerciseHistoryList.vue -->
<template>
  <div class="exercise-list">
    <div
      v-if="items.length === 0"
      class="empty-state"
    >
      <div class="empty-icon">📝</div>
      <h3>暂无历史记录</h3>
      <p>您还没有生成过习题，点击上方按钮开始生成吧！</p>
    </div>

    <div
      v-else
      class="exercise-grid"
    >
      <div
        v-for="item in items"
        :key="item.id || item.filename"
        class="exercise-card"
        :class="{ selected: selectedItems.includes(item.id || item.filename) }"
      >
        <!-- 选择框 -->
        <div class="card-header">
          <input
            type="checkbox"
            :value="item.id || item.filename"
            :checked="selectedItems.includes(item.id || item.filename)"
            @change="handleSelection($event, item)"
            class="select-checkbox"
          >
          <div
            class="card-status"
            :class="item.status"
          >
            <span v-if="item.status === 'completed'">✅</span>
            <span v-else-if="item.status === 'generating'">⏳</span>
            <span v-else>❌</span>
          </div>
        </div>

        <!-- 卡片内容 -->
        <div class="card-content">
          <h3 class="card-title">{{ item.title || '未命名习题' }}</h3>
          <p class="card-filename">{{ item.filename }}</p>

          <div class="card-meta">
            <div class="meta-item">
              <span class="meta-label">创建时间：</span>
              <span class="meta-value">{{ formatDate(item.created_at) }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">文件大小：</span>
              <span
                class="meta-value">{{ formatFileSize(item.file_size || item.size_kb * 1024) }}</span>
            </div>
            <div
              class="meta-item"
              v-if="item.exercise_types"
            >
              <span class="meta-label">题目类型：</span>
              <span
                class="meta-value">{{ formatExerciseTypes(item.exercise_types) }}</span>
            </div>
            <div
              class="meta-item"
              v-if="item.exercise_count"
            >
              <span class="meta-label">题目数量：</span>
              <span class="meta-value">{{ item.exercise_count }}题</span>
            </div>
          </div>

          <div
            class="card-preview"
            v-if="item.content_preview"
          >
            <p>{{ item.content_preview }}</p>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="card-actions">
          <button
            class="action-btn view-btn"
            @click="$emit('view', item)"
            :disabled="item.status === 'generating'"
            title="查看详情"
          >
            👁️ 查看
          </button>
          <button
            class="action-btn download-btn"
            @click="$emit('download', item)"
            :disabled="item.status === 'generating'"
            title="下载文件"
          >
            📄 下载
          </button>
          <button
            class="action-btn delete-btn"
            @click="$emit('delete', item)"
            :disabled="item.status === 'generating'"
            title="删除文件"
          >
            🗑️ 删除
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ExerciseHistoryItem } from '@/api/exercise_history'

interface Props {
  items: ExerciseHistoryItem[]
  selectedItems: string[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:selectedItems': [items: string[]]
  view: [item: ExerciseHistoryItem]
  download: [item: ExerciseHistoryItem]
  delete: [item: ExerciseHistoryItem]
}>()

const handleSelection = (event: Event, item: ExerciseHistoryItem) => {
  const target = event.target as HTMLInputElement
  const itemId = item.id || item.filename

  let newSelection = [...props.selectedItems]

  if (target.checked) {
    if (!newSelection.includes(itemId)) {
      newSelection.push(itemId)
    }
  } else {
    newSelection = newSelection.filter((id) => id !== itemId)
  }

  emit('update:selectedItems', newSelection)
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

const formatFileSize = (bytes?: number): string => {
  if (!bytes) return '未知大小'
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
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
</script>

<style scoped>
.exercise-list {
  padding: 30px;
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
  color: #666;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 20px;
}

.empty-state h3 {
  margin: 0 0 15px 0;
  color: #333;
}

.empty-state p {
  margin: 0;
  line-height: 1.6;
}

.exercise-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 24px;
}

.exercise-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border: 2px solid transparent;
  transition: all 0.3s ease;
}

.exercise-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.exercise-card.selected {
  border-color: #667eea;
  background: #f8f9ff;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.select-checkbox {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.card-status {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  background: #f8f9fa;
}

.card-status.completed {
  background: #d4edda;
  color: #155724;
}

.card-status.generating {
  background: #fff3cd;
  color: #856404;
}

.card-status.failed {
  background: #f8d7da;
  color: #721c24;
}

.card-title {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  line-height: 1.4;
}

.card-filename {
  margin: 0 0 15px 0;
  font-size: 12px;
  color: #666;
  font-family: monospace;
  background: #f8f9fa;
  padding: 4px 8px;
  border-radius: 4px;
}

.card-meta {
  margin-bottom: 15px;
}

.meta-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
  font-size: 14px;
}

.meta-label {
  color: #666;
  font-weight: 500;
}

.meta-value {
  color: #333;
}

.card-preview {
  margin-bottom: 20px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
  border-left: 3px solid #667eea;
}

.card-preview p {
  margin: 0;
  font-size: 14px;
  color: #666;
  line-height: 1.5;
}

.card-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.action-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 4px;
}

.view-btn {
  background: #007bff;
  color: white;
}

.view-btn:hover:not(:disabled) {
  background: #0056b3;
}

.download-btn {
  background: #28a745;
  color: white;
}

.download-btn:hover:not(:disabled) {
  background: #1e7e34;
}

.delete-btn {
  background: #dc3545;
  color: white;
}

.delete-btn:hover:not(:disabled) {
  background: #c82333;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .exercise-grid {
    grid-template-columns: 1fr;
  }

  .exercise-list {
    padding: 15px;
  }

  .card-actions {
    justify-content: center;
  }
}
</style>