<template>
  <div class="ppt-generate">
    <div class="page-header">
      <h1>
        <i class="icon-presentation"></i>
        教学PPT生成助手
      </h1>
      <p class="subtitle">根据教学内容自动生成PPT大纲，提高备课效率</p>
    </div>

    <!-- 主要内容区域 -->
    <div class="content-area">
      <!-- 表单区域 -->
      <div
        class="form-card"
        :class="{ 'loading': isLoading }"
      >
        <div class="card-header">
          <h2>第一步：填写PPT基本信息</h2>
        </div>

        <div class="card-body">
          <div class="form-group">
            <label for="title">PPT标题 <span class="required">*</span></label>
            <input
              type="text"
              id="title"
              v-model="formData.title"
              class="form-control"
              placeholder="例如：光合作用原理与过程"
              maxlength="100"
              :disabled="isLoading"
            />
            <small class="form-hint">清晰简洁的标题将帮助生成更精准的内容</small>
          </div>

          <div class="form-group">
            <label for="subject">学科 <span class="required">*</span></label>
            <select
              id="subject"
              v-model="formData.subject"
              class="form-control"
              :disabled="isLoading"
            >
              <option
                value=""
                disabled
              >请选择学科</option>
              <option
                v-for="subject in subjects"
                :key="subject"
                :value="subject"
              >
                {{ subject }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label for="target_grade">目标年级 <span
                class="required">*</span></label>
            <select
              id="target_grade"
              v-model="formData.target_grade"
              class="form-control"
              :disabled="isLoading"
            >
              <option
                value=""
                disabled
              >请选择年级</option>
              <option
                v-for="grade in grades"
                :key="grade"
                :value="grade"
              >
                {{ grade }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label for="teaching_target">教学目标 <span
                class="required">*</span></label>
            <textarea
              id="teaching_target"
              v-model="formData.teaching_target"
              class="form-control textarea"
              placeholder="描述这节课的教学目标，例如：理解光合作用的原理和过程，掌握影响光合作用的因素"
              rows="3"
              maxlength="500"
              :disabled="isLoading"
            ></textarea>
            <small class="form-hint">明确的教学目标能够生成更有针对性的PPT</small>
          </div>

          <div class="form-group">
            <label>教学重点 <span class="required">*</span></label>
            <div class="key-points-container">
              <div
                v-for="(point, index) in formData.key_points"
                :key="index"
                class="key-point-item"
              >
                <input
                  type="text"
                  v-model="formData.key_points[index]"
                  class="form-control"
                  :placeholder="`重点${index+1}`"
                  :disabled="isLoading"
                />
                <button
                  type="button"
                  @click="removeKeyPoint(index)"
                  class="remove-btn"
                  :disabled="isLoading"
                >
                  <i class="icon-delete"></i>
                </button>
              </div>
              <button
                type="button"
                @click="addKeyPoint"
                class="add-btn"
                :disabled="isLoading || formData.key_points.length >= 10"
              >
                <i class="icon-plus"></i> 添加重点
              </button>
            </div>
          </div>

          <div class="form-group">
            <label for="slide_count">幻灯片数量 <span
                class="required">*</span></label>
            <div class="slide-count-container">
              <input
                type="range"
                id="slide_count"
                v-model.number="formData.slide_count"
                min="5"
                max="30"
                step="1"
                class="range-slider"
                :disabled="isLoading"
              />
              <span class="slide-count-value">{{ formData.slide_count }}
                张</span>
            </div>
            <small class="form-hint">建议根据课程时长和内容复杂度选择合适的幻灯片数量</small>
          </div>

          <div class="form-group">
            <label for="additional_info">附加信息 (可选)</label>
            <textarea
              id="additional_info"
              v-model="formData.additional_info"
              class="form-control textarea"
              placeholder="添加其他要求或说明，例如：希望包含实验步骤演示、需要添加案例分析等"
              rows="2"
              maxlength="500"
              :disabled="isLoading"
            ></textarea>
          </div>

          <div class="form-actions">
            <button
              type="button"
              @click="resetForm"
              class="secondary-btn"
              :disabled="isLoading"
            >
              <i class="icon-refresh"></i> 重置
            </button>
            <button
              type="button"
              @click="generateOutline"
              class="primary-btn"
              :disabled="!isFormValid || isLoading"
            >
              <span
                v-if="isLoading"
                class="loading-spinner"
              ></span>
              <span v-else><i class="icon-generate"></i></span>
              {{ isLoading ? '正在生成...' : '生成PPT大纲' }}
            </button>
          </div>
        </div>
      </div>

      <!-- 结果展示区域 -->
      <div
        v-if="outlineResult"
        class="result-card"
      >
        <div class="card-header">
          <h2>第二步：PPT大纲预览</h2>
        </div>

        <div class="card-body">
          <div class="outline-header">
            <h3>{{ outlineResult.title }}</h3>
            <div class="outline-actions">
              <button
                @click="copyOutline"
                class="action-btn"
              >
                <i class="icon-copy"></i> 复制大纲
              </button>
              <button
                @click="downloadOutline"
                class="action-btn"
              >
                <i class="icon-download"></i> 下载 Markdown
              </button>
            </div>
          </div>

          <div class="outline-content">
            <div
              v-html="renderedOutline"
              class="markdown-content"
            ></div>
          </div>

          <div class="outline-footer">
            <p>
              <i class="icon-info"></i>
              您可以复制此大纲用于进一步编辑和完善，也可以下载 Markdown 格式文件保存到本地
            </p>
          </div>
        </div>
      </div>

      <!-- 错误提示 -->
      <div
        v-if="errorMessage"
        class="error-message"
      >
        <i class="icon-error"></i>
        <span>{{ errorMessage }}</span>
        <button
          @click="clearError"
          class="close-btn"
        >&times;</button>
      </div>

      <!-- 成功提示 -->
      <div
        v-if="showSuccess"
        class="success-message"
      >
        <i class="icon-success"></i>
        <span>{{ successMessage }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue';
import { generatePPTOutline, getSubjectList, getGradeList } from '@/api/teacher/PPT_gernerate';
import { marked } from 'marked';

export default {
  name: 'PPTGenerate',

  setup () {
    // 表单数据
    const formData = reactive({
      title: '',
      subject: '',
      teaching_target: '',
      key_points: [''],
      target_grade: '',
      slide_count: 10,
      additional_info: ''
    });

    // 状态管理
    const isLoading = ref(false);
    const errorMessage = ref('');
    const showSuccess = ref(false);
    const successMessage = ref('');
    const outlineResult = ref(null);

    // 下拉选项
    const subjects = ref([]);
    const grades = ref([]);

    // 表单验证
    const isFormValid = computed(() => {
      return (
        formData.title.trim() !== '' &&
        formData.subject !== '' &&
        formData.teaching_target.trim() !== '' &&
        formData.key_points.length > 0 &&
        formData.key_points.every(point => point.trim() !== '') &&
        formData.target_grade !== ''
      );
    });

    // Markdown 渲染
    const renderedOutline = computed(() => {
      if (!outlineResult.value || !outlineResult.value.outline_md) {
        return '';
      }
      return marked(outlineResult.value.outline_md);
    });

    // 添加教学重点
    const addKeyPoint = () => {
      if (formData.key_points.length < 10) {
        formData.key_points.push('');
      }
    };

    // 删除教学重点
    const removeKeyPoint = (index) => {
      if (formData.key_points.length > 1) {
        formData.key_points.splice(index, 1);
      }
    };

    // 生成PPT大纲
    const generateOutline = async () => {
      if (!isFormValid.value) {
        errorMessage.value = '请填写所有必填项';
        return;
      }

      clearError();
      isLoading.value = true;
      outlineResult.value = null;

      try {
        // 准备请求数据，过滤空字符串
        const requestData = {
          ...formData,
          key_points: formData.key_points.filter(point => point.trim() !== ''),
        };

        const result = await generatePPTOutline(requestData);
        outlineResult.value = result;

        // 显示成功消息
        successMessage.value = 'PPT大纲生成成功！';
        showSuccess.value = true;
        setTimeout(() => { showSuccess.value = false; }, 3000);

        // 滚动到结果区域
        setTimeout(() => {
          const resultCard = document.querySelector('.result-card');
          if (resultCard) {
            resultCard.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);

      } catch (error) {
        errorMessage.value = error.message || '生成PPT大纲失败，请稍后重试';
        console.error('生成PPT大纲错误:', error);
      } finally {
        isLoading.value = false;
      }
    };

    // 复制大纲内容
    const copyOutline = () => {
      if (!outlineResult.value) return;

      try {
        navigator.clipboard.writeText(outlineResult.value.outline_md);
        successMessage.value = '大纲内容已复制到剪贴板';
        showSuccess.value = true;
        setTimeout(() => { showSuccess.value = false; }, 2000);
      } catch (error) {
        errorMessage.value = '复制失败，请手动复制';
      }
    };

    // 下载Markdown文件
    const downloadOutline = () => {
      if (!outlineResult.value) return;

      try {
        const fileName = `${outlineResult.value.title.replace(/[^\w\s]/gi, '')}_大纲.md`;
        const blob = new Blob([outlineResult.value.outline_md], { type: 'text/markdown;charset=utf-8' });

        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = fileName;
        link.click();
        URL.revokeObjectURL(link.href);

        successMessage.value = 'Markdown文件下载成功';
        showSuccess.value = true;
        setTimeout(() => { showSuccess.value = false; }, 2000);
      } catch (error) {
        errorMessage.value = '下载失败，请稍后重试';
      }
    };

    // 重置表单
    const resetForm = () => {
      formData.title = '';
      formData.subject = '';
      formData.teaching_target = '';
      formData.key_points = [''];
      formData.target_grade = '';
      formData.slide_count = 10;
      formData.additional_info = '';
      outlineResult.value = null;
      clearError();
    };

    // 清除错误信息
    const clearError = () => {
      errorMessage.value = '';
    };

    // 页面加载时获取下拉选项数据
    onMounted(async () => {
      try {
        // 获取学科列表
        const subjectList = await getSubjectList();
        subjects.value = subjectList.length > 0 ? subjectList : ['语文', '数学', '英语', '物理', '化学', '生物', '历史', '地理', '政治', '信息技术'];

        // 获取年级列表
        const gradeList = await getGradeList();
        grades.value = gradeList.length > 0 ? gradeList : ['小学一年级', '小学二年级', '小学三年级', '小学四年级', '小学五年级', '小学六年级', '初中一年级', '初中二年级', '初中三年级', '高中一年级', '高中二年级', '高中三年级'];
      } catch (error) {
        console.error('获取下拉选项失败:', error);
      }
    });

    return {
      formData,
      isLoading,
      errorMessage,
      showSuccess,
      successMessage,
      outlineResult,
      subjects,
      grades,
      isFormValid,
      renderedOutline,
      addKeyPoint,
      removeKeyPoint,
      generateOutline,
      copyOutline,
      downloadOutline,
      resetForm,
      clearError
    };
  }
}
</script>

<style scoped>
.ppt-generate {
  padding: 30px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 30px;
  text-align: center;
}

.page-header h1 {
  font-size: 28px;
  color: #2d3748;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.page-header .icon-presentation {
  font-size: 32px;
  color: #667eea;
}

.subtitle {
  font-size: 16px;
  color: #718096;
  margin-top: 0;
}

.content-area {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.form-card,
.result-card {
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.card-header {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  padding: 20px 30px;
}

.card-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.card-body {
  padding: 30px;
}

/* 表单样式 */
.form-group {
  margin-bottom: 24px;
}

label {
  display: block;
  font-weight: 600;
  color: #4a5568;
  margin-bottom: 8px;
}

.required {
  color: #e53e3e;
  margin-left: 4px;
}

.form-control {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #cbd5e0;
  border-radius: 6px;
  font-size: 16px;
  color: #2d3748;
  transition: all 0.3s ease;
  background: #f7fafc;
}

.form-control:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.25);
}

.form-control:disabled {
  background: #edf2f7;
  cursor: not-allowed;
  opacity: 0.7;
}

.form-control.textarea {
  resize: vertical;
  min-height: 80px;
}

.form-hint {
  display: block;
  margin-top: 6px;
  color: #718096;
  font-size: 14px;
}

/* 重点项样式 */
.key-points-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.key-point-item {
  display: flex;
  gap: 10px;
  align-items: center;
}

.remove-btn {
  background: #fed7d7;
  color: #e53e3e;
  border: none;
  border-radius: 4px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.remove-btn:hover {
  background: #feb2b2;
}

.remove-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.add-btn {
  background: #e6fffa;
  color: #319795;
  border: 1px dashed #4fd1c5;
  border-radius: 6px;
  padding: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  margin-top: 5px;
  transition: all 0.2s ease;
}

.add-btn:hover {
  background: #b2f5ea;
}

.add-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 滑动条样式 */
.slide-count-container {
  display: flex;
  align-items: center;
  gap: 20px;
}

.range-slider {
  flex: 1;
  -webkit-appearance: none;
  width: 100%;
  height: 8px;
  border-radius: 4px;
  background: #e2e8f0;
  outline: none;
}

.range-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #667eea;
  cursor: pointer;
  transition: all 0.2s ease;
}

.range-slider::-webkit-slider-thumb:hover {
  transform: scale(1.2);
}

.slide-count-value {
  background: #edf2f7;
  padding: 8px 12px;
  border-radius: 6px;
  font-weight: 600;
  color: #4a5568;
  min-width: 70px;
  text-align: center;
}

/* 按钮样式 */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  margin-top: 30px;
}

.primary-btn,
.secondary-btn {
  padding: 12px 24px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.primary-btn {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.primary-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.secondary-btn {
  background: #edf2f7;
  color: #4a5568;
}

.secondary-btn:hover:not(:disabled) {
  background: #e2e8f0;
  color: #2d3748;
}

.primary-btn:disabled,
.secondary-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* 加载状态 */
.loading {
  position: relative;
}

.loading::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.7);
  z-index: 10;
  border-radius: 10px;
}

.loading-spinner {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 结果区域样式 */
.outline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e2e8f0;
}

.outline-header h3 {
  margin: 0;
  font-size: 20px;
  color: #2d3748;
}

.outline-actions {
  display: flex;
  gap: 12px;
}

.action-btn {
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  background: #edf2f7;
  color: #4a5568;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: #e2e8f0;
  color: #2d3748;
}

.outline-content {
  background: #f7fafc;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 20px;
  max-height: 600px;
  overflow-y: auto;
  border: 1px solid #e2e8f0;
}

.markdown-content {
  line-height: 1.6;
  color: #2d3748;
}

.markdown-content h1 {
  font-size: 24px;
  margin-top: 0;
  color: #2d3748;
}

.markdown-content h2 {
  font-size: 20px;
  margin-top: 24px;
  color: #2d3748;
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 8px;
}

.markdown-content h3 {
  font-size: 18px;
  margin-top: 20px;
  color: #2d3748;
}

.markdown-content ul {
  padding-left: 24px;
}

.markdown-content li {
  margin-bottom: 6px;
}

.outline-footer {
  background: #f0fff4;
  padding: 16px;
  border-radius: 8px;
  border-left: 4px solid #38a169;
}

.outline-footer p {
  margin: 0;
  color: #2f855a;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 错误和成功消息样式 */
.error-message,
.success-message {
  padding: 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 20px;
}

.error-message {
  background: #fff5f5;
  color: #c53030;
  border-left: 4px solid #e53e3e;
}

.success-message {
  background: #f0fff4;
  color: #2f855a;
  border-left: 4px solid #38a169;
}

.close-btn {
  margin-left: auto;
  background: none;
  border: none;
  font-size: 20px;
  color: inherit;
  cursor: pointer;
  opacity: 0.7;
  padding: 0;
}

.close-btn:hover {
  opacity: 1;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .ppt-generate {
    padding: 20px 15px;
  }

  .outline-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }

  .outline-actions {
    width: 100%;
  }

  .action-btn {
    flex: 1;
    justify-content: center;
  }

  .form-actions {
    flex-direction: column;
  }

  .primary-btn,
  .secondary-btn {
    width: 100%;
    justify-content: center;
  }
}

/* 图标 */
.icon-presentation:before {
  content: '🖥️';
}

.icon-delete:before {
  content: '🗑️';
}

.icon-plus:before {
  content: '➕';
}

.icon-refresh:before {
  content: '🔄';
}

.icon-generate:before {
  content: '✨';
}

.icon-copy:before {
  content: '📋';
}

.icon-download:before {
  content: '📥';
}

.icon-error:before {
  content: '❌';
}

.icon-success:before {
  content: '✅';
}

.icon-info:before {
  content: 'ℹ️';
}
</style>