<!-- filepath: d:\git\LuminoEdu\frontend\frontend\src\components\exercise\MarkdownViewer.vue -->
<template>
  <div class="markdown-viewer">
    <div
      class="content-viewer"
      v-html="renderedMarkdown"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { marked } from 'marked'

interface Props {
  content: string
}

const props = defineProps<Props>()

const renderedMarkdown = computed(() => {
  if (!props.content) return ''
  return marked(props.content)
})
</script>

<style scoped>
.markdown-viewer {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.content-viewer {
  flex: 1;
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  overflow-y: auto;
  max-height: 400px;
}

/* 自定义滚动条样式 */
.content-viewer::-webkit-scrollbar {
  width: 8px;
}

.content-viewer::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.content-viewer::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.content-viewer::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Markdown 样式 */
.content-viewer :deep(h1),
.content-viewer :deep(h2),
.content-viewer :deep(h3),
.content-viewer :deep(h4) {
  color: #2d3a4b;
  margin: 16px 0 8px 0;
  font-size: 16px;
}

.content-viewer :deep(h1) {
  font-size: 18px;
}

.content-viewer :deep(p) {
  line-height: 1.6;
  margin-bottom: 12px;
  color: #333;
  font-size: 14px;
}

.content-viewer :deep(ol),
.content-viewer :deep(ul) {
  margin: 12px 0;
  padding-left: 20px;
}

.content-viewer :deep(li) {
  margin-bottom: 6px;
  line-height: 1.5;
  font-size: 14px;
}

.content-viewer :deep(code) {
  background: #e9ecef;
  padding: 2px 4px;
  border-radius: 3px;
  font-family: 'Courier New', monospace;
  font-size: 12px;
}

.content-viewer :deep(pre) {
  background: #2d3a4b;
  color: #fff;
  padding: 12px;
  border-radius: 6px;
  overflow-x: auto;
  margin: 12px 0;
  font-size: 12px;
}

.content-viewer :deep(blockquote) {
  border-left: 3px solid #3498db;
  margin: 12px 0;
  padding-left: 12px;
  color: #666;
  font-style: italic;
}
</style>