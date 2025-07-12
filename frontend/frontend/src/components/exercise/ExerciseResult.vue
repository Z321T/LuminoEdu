<!-- filepath: d:\git\LuminoEdu\frontend\frontend\src\components\exercise\ExerciseResult.vue -->
<template>
  <div class="result-panel">
    <div class="panel-header">
      <h2>生成结果</h2>
      <p v-if="!markdownContent && !errorMessage">习题生成后将在此处显示</p>
      <p v-else-if="markdownContent">习题已生成完成</p>
    </div>

    <!-- 错误状态 -->
    <div
      v-if="errorMessage"
      class="error-state"
    >
      <div class="error-icon">❌</div>
      <h3>生成失败</h3>
      <p>{{ errorMessage }}</p>
      <button
        class="retry-btn"
        @click="$emit('retry')"
      >
        重试
      </button>
    </div>

    <!-- 空状态 -->
    <div
      v-else-if="!markdownContent && !isGenerating"
      class="empty-state"
    >
      <div class="empty-icon">📝</div>
      <h3>暂无习题</h3>
      <p>请在左侧填写信息并点击生成按钮</p>
    </div>

    <!-- 加载状态 -->
    <LoadingState
      v-if="isGenerating"
      type="spinner"
      :message="loadingMessage"
    />

    <!-- markdown 内容展示 -->
    <div
      v-if="markdownContent"
      class="markdown-content"
    >
      <MarkdownViewer :content="markdownContent" />

      <!-- 操作按钮 -->
      <div class="result-actions">
        <button
          class="action-btn primary"
          @click="$emit('download')"
        >
          📄 下载习题
        </button>
        <button
          class="action-btn"
          @click="$emit('clear')"
        >
          🗑️ 清空结果
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import LoadingState from '@/components/common/LoadingState.vue'
import MarkdownViewer from './MarkdownViewer.vue'

interface Props {
  markdownContent: string
  isGenerating: boolean
  generationStep: string
  errorMessage: string
}

const props = defineProps<Props>()

defineEmits<{
  download: []
  clear: []
  retry: []
}>()

const loadingMessage = computed(() => {
  if (props.generationStep === 'generating') {
    return 'AI正在生成习题文件...'
  } else if (props.generationStep === 'fetching') {
    return '正在获取习题内容...'
  }
  return '正在处理，请稍候...'
})
</script>

<style scoped>
.result-panel {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  height: fit-content;
  min-height: 500px;
  position: relative;
}

.panel-header {
  padding: 20px 24px;
  border-bottom: 1px solid #e9ecef;
  background: #f8f9fa;
  border-radius: 12px 12px 0 0;
  flex-shrink: 0;
}

.panel-header h2 {
  color: #2d3a4b;
  margin-bottom: 8px;
  font-size: 18px;
}

.panel-header p {
  color: #666;
  font-size: 14px;
  margin: 0;
}

.empty-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  text-align: center;
  padding: 32px;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-state h3 {
  color: #666;
  margin-bottom: 12px;
}

.empty-state p {
  color: #999;
  margin: 0;
}

.error-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.error-state h3 {
  color: #e74c3c;
  margin-bottom: 12px;
}

.error-state p {
  color: #666;
  margin-bottom: 20px;
}

.retry-btn {
  background: #e74c3c;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.3s ease;
  font-weight: 500;
}

.retry-btn:hover {
  background: #c0392b;
}

.markdown-content {
  padding: 24px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.result-actions {
  display: flex;
  gap: 12px;
  padding: 16px 0;
  border-top: 1px solid #e9ecef;
  justify-content: center;
  flex-shrink: 0;
}

.action-btn {
  padding: 12px 24px;
  border: 2px solid #e9ecef;
  background: white;
  color: #666;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-btn:hover {
  background: #f8f9fa;
  border-color: #ddd;
  transform: translateY(-2px);
}

.action-btn.primary {
  background: #3498db;
  color: white;
  border-color: #3498db;
}

.action-btn.primary:hover {
  background: #2980b9;
  border-color: #2980b9;
}

@media (max-width: 600px) {
  .result-actions {
    flex-direction: column;
  }

  .action-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>