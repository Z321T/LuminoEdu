<!-- filepath: d:\git\LuminoEdu\frontend\frontend\src\components\exercise\ExerciseDetailModal.vue -->
<template>
  <div
    class="modal-overlay"
    @click="handleOverlayClick"
  >
    <div
      class="modal-content"
      @click.stop
    >
      <div class="modal-header">
        <h2>{{ exercise?.title || '习题详情' }}</h2>
        <button
          class="close-btn"
          @click="$emit('close')"
        >✕</button>
      </div>

      <div class="modal-body">
        <div class="detail-section">
          <h3>基本信息</h3>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="label">文件名：</span>
              <span class="value">{{ exercise?.filename || '未知' }}</span>
            </div>
            <div class="detail-item">
              <span class="label">创建时间：</span>
              <span class="value">{{ formatDate(exercise?.created_at) }}</span>
            </div>
            <div class="detail-item">
              <span class="label">文件大小：</span>
              <span
                class="value">{{ formatFileSize(exercise?.file_size || (exercise?.size_kb ? exercise?.size_kb * 1024 : 0)) }}</span>
            </div>
            <div
              class="detail-item"
              v-if="exercise?.exercise_types"
            >
              <span class="label">题目类型：</span>
              <span
                class="value">{{ formatExerciseTypes(exercise.exercise_types) }}</span>
            </div>
            <div
              class="detail-item"
              v-if="exercise?.exercise_count"
            >
              <span class="label">题目数量：</span>
              <span class="value">{{ exercise.exercise_count }}题</span>
            </div>
            <div class="detail-item">
              <span class="label">状态：</span>
              <span
                class="value"
                :class="'status-' + exercise?.status"
              >
                <span v-if="exercise?.status === 'completed'">✅ 已完成</span>
                <span v-else-if="exercise?.status === 'generating'">⏳ 生成中</span>
                <span v-else>❌ 失败</span>
              </span>
            </div>
          </div>
        </div>

        <div
          class="detail-section"
          v-if="exercise?.content_preview"
        >
          <h3>内容预览</h3>
          <div class="preview-content">
            <p>{{ exercise.content_preview }}</p>
          </div>
        </div>

        <div
          class="detail-section"
          v-if="exercise?.updated_at"
        >
          <h3>更新历史</h3>
          <div class="history-item">
            <span
              class="history-time">{{ formatDate(exercise.updated_at) }}</span>
            <span class="history-action">文件更新</span>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button
          class="btn btn-primary"
          @click="$emit('download', exercise)"
          :disabled="exercise?.status === 'generating'"
        >
          📄 下载文件
        </button>
        <button
          class="btn btn-secondary"
          @click="$emit('close')"
        >
          关闭
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 直接定义类型，避免导入问题
interface ExerciseHistoryItem {
  id?: string
  filename: string
  title?: string
  created_at: string
  updated_at?: string
  size_kb?: number
  file_size?: number
  status?: 'completed' | 'generating' | 'failed'
  exercise_types?: string[]
  exercise_count?: number
  content_preview?: string
}

interface Props {
  exercise: ExerciseHistoryItem | null
}

defineProps<Props>()

const emit = defineEmits<{
  close: []
  download: [item: ExerciseHistoryItem]
}>()

const handleOverlayClick = () => {
  emit('close')
}

// 格式化工具函数
const formatDate = (dateString?: string): string => {
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
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 700px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 30px;
  border-bottom: 1px solid #e1e8ed;
}

.modal-header h2 {
  margin: 0;
  color: #2c3e50;
  font-size: 20px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background 0.3s ease;
}

.close-btn:hover {
  background: #f1f3f4;
}

.modal-body {
  padding: 30px;
}

.detail-section {
  margin-bottom: 30px;
}

.detail-section:last-child {
  margin-bottom: 0;
}

.detail-section h3 {
  margin: 0 0 20px 0;
  color: #2c3e50;
  font-size: 16px;
  font-weight: 600;
  border-bottom: 2px solid #667eea;
  padding-bottom: 8px;
}

.detail-grid {
  display: grid;
  gap: 15px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f1f3f4;
}

.detail-item:last-child {
  border-bottom: none;
}

.label {
  font-weight: 500;
  color: #666;
  min-width: 100px;
}

.value {
  color: #333;
  text-align: right;
  flex: 1;
}

.status-completed {
  color: #28a745;
}

.status-generating {
  color: #ffc107;
}

.status-failed {
  color: #dc3545;
}

.preview-content {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  border-left: 4px solid #667eea;
}

.preview-content p {
  margin: 0;
  line-height: 1.6;
  color: #555;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f8f9fa;
  border-radius: 6px;
}

.history-time {
  color: #666;
  font-size: 14px;
}

.history-action {
  color: #333;
  font-weight: 500;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 30px;
  border-top: 1px solid #e1e8ed;
  background: #f8f9fa;
  border-radius: 0 0 12px 12px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #5a67d8;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #545b62;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .modal-content {
    margin: 0;
    border-radius: 0;
    height: 100vh;
    max-height: none;
  }

  .modal-header,
  .modal-body,
  .modal-footer {
    padding-left: 20px;
    padding-right: 20px;
  }

  .detail-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .value {
    text-align: left;
  }
}
</style>