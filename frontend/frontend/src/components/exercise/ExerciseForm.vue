<!-- filepath: d:\git\LuminoEdu\frontend\frontend\src\components\exercise\ExerciseForm.vue -->
<template>
  <div class="form-panel">
    <div class="panel-header">
      <h2>习题生成设置</h2>
      <p>请填写以下信息来生成习题</p>
    </div>

    <div class="generate-form">
      <!-- 标题输入 -->
      <div class="form-group">
        <label
          for="title"
          class="form-label"
        >题目标题</label>
        <input
          id="title"
          v-model="formData.title"
          type="text"
          class="form-input"
          placeholder="请输入题目标题，如：数据结构-二叉树"
          required
        />
      </div>

      <!-- 题目数量 -->
      <div class="form-group">
        <label
          for="quantity"
          class="form-label"
        >生成数量</label>
        <input
          id="quantity"
          v-model.number="formData.quantity"
          type="number"
          class="form-input"
          placeholder="请输入题目数量"
          min="1"
          max="50"
          required
        />
      </div>

      <!-- 题目内容描述 -->
      <div class="form-group">
        <label
          for="content"
          class="form-label"
        >题目内容描述</label>
        <textarea
          id="content"
          v-model="formData.content"
          class="form-textarea"
          placeholder="请描述题目的具体要求和内容范围，如：关于二叉树的遍历算法，难度为中等"
          rows="4"
          required
        ></textarea>
      </div>

      <!-- 题目类型选择 -->
      <div class="form-group">
        <label class="form-label">题目类型</label>
        <div class="radio-group">
          <label class="radio-item">
            <input
              v-model="formData.type"
              type="radio"
              value="choice"
              class="radio-input"
            />
            <span class="radio-custom"></span>
            <span class="radio-label">选择题</span>
          </label>
          <label class="radio-item">
            <input
              v-model="formData.type"
              type="radio"
              value="fill"
              class="radio-input"
            />
            <span class="radio-custom"></span>
            <span class="radio-label">填空题</span>
          </label>
          <label class="radio-item">
            <input
              v-model="formData.type"
              type="radio"
              value="essay"
              class="radio-input"
            />
            <span class="radio-custom"></span>
            <span class="radio-label">简答题</span>
          </label>
        </div>
      </div>

      <!-- 生成按钮区域 -->
      <div class="form-actions">
        <!-- 第一步：生成习题按钮 -->
        <button
          type="button"
          class="generate-btn step-btn"
          :disabled="isGenerating || !formData.title || !formData.content"
          @click="$emit('generateFile')"
        >
          <span v-if="generationStep !== 'generating'">🎯 第一步：生成习题文件</span>
          <span v-else>⏳ 正在生成...</span>
        </button>

        <!-- 第二步：获取习题内容按钮 -->
        <button
          type="button"
          class="fetch-btn step-btn"
          :disabled="!fileName || isGenerating"
          @click="$emit('fetchContent')"
        >
          <span v-if="generationStep !== 'fetching'">📄 第二步：获取习题内容</span>
          <span v-else>⏳ 正在获取...</span>
        </button>

        <!-- 一键生成按钮 -->
        <button
          type="button"
          class="generate-btn primary"
          :disabled="isGenerating || !formData.title || !formData.content"
          @click="$emit('oneClickGenerate')"
        >
          <span v-if="!isGenerating">🚀 一键生成习题</span>
          <span v-else>⏳ 生成中...</span>
        </button>

        <button
          type="button"
          class="reset-btn"
          @click="$emit('reset')"
        >
          🔄 重置表单
        </button>
      </div>

      <!-- 步骤提示 -->
      <StepIndicator
        :file-name="fileName"
        :has-content="!!$attrs.markdownContent"
      />

      <!-- 文件名显示 -->
      <div
        v-if="fileName"
        class="file-path-display"
      >
        <h4>生成的文件名：</h4>
        <code>{{ fileName }}</code>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import StepIndicator from './StepIndicator.vue'

interface FormData {
  title: string
  quantity: number
  content: string
  type: string
}

interface Props {
  formData: FormData
  isGenerating: boolean
  generationStep: string
  fileName: string
}

defineProps<Props>()

defineEmits<{
  generateFile: []
  fetchContent: []
  oneClickGenerate: []
  reset: []
}>()
</script>

<style scoped>
.form-panel {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  height: fit-content;
  min-height: 500px;
}

.panel-header {
  padding: 20px 24px;
  border-bottom: 1px solid #e9ecef;
  background: #f8f9fa;
  border-radius: 12px 12px 0 0;
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

.generate-form {
  padding: 24px;
  flex: 1;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  font-weight: 600;
  color: #2d3a4b;
  margin-bottom: 8px;
  font-size: 14px;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.3s ease;
  box-sizing: border-box;
  font-family: inherit;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #3498db;
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.radio-group {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.radio-item {
  display: flex;
  align-items: center;
  cursor: pointer;
  gap: 8px;
}

.radio-input {
  display: none;
}

.radio-custom {
  width: 18px;
  height: 18px;
  border: 2px solid #ddd;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.radio-input:checked + .radio-custom {
  border-color: #3498db;
  background: #3498db;
}

.radio-input:checked + .radio-custom::after {
  content: '';
  width: 8px;
  height: 8px;
  background: white;
  border-radius: 50%;
}

.radio-label {
  font-size: 14px;
  color: #2d3a4b;
}

.form-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 20px;
}

.generate-btn,
.reset-btn,
.fetch-btn,
.step-btn {
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.generate-btn {
  background: #3498db;
  color: white;
}

.generate-btn:hover:not(:disabled) {
  background: #2980b9;
  transform: translateY(-2px);
}

.generate-btn:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}

.fetch-btn {
  background: #27ae60;
  color: white;
}

.fetch-btn:hover:not(:disabled) {
  background: #229954;
  transform: translateY(-2px);
}

.fetch-btn:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}

.reset-btn {
  background: #f8f9fa;
  color: #666;
  border: 2px solid #e9ecef;
  grid-column: 1 / -1;
}

.reset-btn:hover {
  background: #e9ecef;
}

.primary {
  background: #e74c3c !important;
  grid-column: 1 / -1;
  padding: 16px 20px;
  font-size: 16px;
  margin-bottom: 12px;
}

.primary:hover:not(:disabled) {
  background: #c0392b !important;
}

.file-path-display {
  margin-top: 16px;
  padding: 12px;
  background: #e8f5e8;
  border-radius: 8px;
  border-left: 4px solid #27ae60;
}

.file-path-display h4 {
  margin-bottom: 8px;
  color: #27ae60;
  font-size: 14px;
}

.file-path-display code {
  background: #fff;
  padding: 8px 12px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  word-break: break-all;
  display: block;
}

@media (max-width: 768px) {
  .radio-group {
    flex-direction: column;
    gap: 12px;
  }

  .form-actions {
    grid-template-columns: 1fr;
  }
}
</style>