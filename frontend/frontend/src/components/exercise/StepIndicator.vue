<!-- filepath: d:\git\LuminoEdu\frontend\frontend\src\components\exercise\StepIndicator.vue -->
<template>
  <div class="step-indicator">
    <div
      class="step-item"
      :class="{ active: fileName, completed: fileName }"
    >
      <span class="step-number">1</span>
      <span class="step-text">生成习题文件</span>
    </div>
    <div class="step-arrow">→</div>
    <div
      class="step-item"
      :class="{ active: hasContent, completed: hasContent }"
    >
      <span class="step-number">2</span>
      <span class="step-text">获取习题内容</span>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  fileName: string
  hasContent: boolean
}

defineProps<Props>()
</script>

<style scoped>
.step-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 20px 0;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.step-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  opacity: 0.5;
  transition: all 0.3s ease;
}

.step-item.active {
  opacity: 1;
  color: #3498db;
}

.step-item.completed {
  opacity: 1;
  color: #27ae60;
}

.step-number {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  transition: all 0.3s ease;
  font-size: 14px;
}

.step-item.active .step-number {
  background: #3498db;
  color: white;
}

.step-item.completed .step-number {
  background: #27ae60;
  color: white;
}

.step-text {
  font-size: 12px;
  text-align: center;
}

.step-arrow {
  margin: 0 16px;
  font-size: 16px;
  color: #ddd;
}
</style>