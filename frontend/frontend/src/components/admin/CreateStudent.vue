<!-- filepath: src/components/admin/CreateStudent.vue -->
<template>
  <div class="create-student">
    <div class="content-wrapper">
      <!-- 表单区域 -->
      <div class="form-section">
        <div class="section-header">
          <h2>创建学生账户</h2>
          <p>填写学生基本信息</p>
        </div>

        <form
          @submit.prevent="createStudent"
          class="student-form"
        >
          <div class="form-grid">
            <div class="form-group">
              <label>学生姓名</label>
              <input
                v-model="name"
                type="text"
                placeholder="请输入学生姓名"
                required
              />
            </div>

            <div class="form-group">
              <label>年级</label>
              <select
                v-model="grade"
                required
              >
                <option value="">请选择年级</option>
                <option value="一年级">一年级</option>
                <option value="二年级">二年级</option>
                <option value="三年级">三年级</option>
                <option value="四年级">四年级</option>
                <option value="五年级">五年级</option>
                <option value="六年级">六年级</option>
                <option value="初一">初一</option>
                <option value="初二">初二</option>
                <option value="初三">初三</option>
                <option value="高一">高一</option>
                <option value="高二">高二</option>
                <option value="高三">高三</option>
              </select>
            </div>

            <div class="form-group">
              <label>班级</label>
              <input
                v-model="className"
                type="text"
                placeholder="如：1班、2班"
                required
              />
            </div>

            <div class="form-group">
              <label>学号</label>
              <input
                v-model="studentId"
                type="text"
                placeholder="请输入学号"
                required
              />
            </div>

            <div class="form-group">
              <label>邮箱地址</label>
              <input
                v-model="email"
                type="email"
                placeholder="请输入邮箱地址"
              />
            </div>

            <div class="form-group">
              <label>家长联系电话</label>
              <input
                v-model="parentPhone"
                type="tel"
                placeholder="请输入家长电话"
                required
              />
            </div>
          </div>

          <div class="form-actions">
            <button
              type="button"
              @click="resetForm"
              class="btn-reset"
            >重置表单</button>
            <button
              type="submit"
              class="btn-submit"
              :disabled="!isFormValid"
            >创建学生</button>
          </div>
        </form>
      </div>

      <!-- 分隔线 -->
      <div class="divider"></div>

      <!-- 预览和统计区域 -->
      <div class="info-section">
        <!-- 统计卡片 -->
        <div class="stats-cards">
          <div class="stat-card">
            <div class="stat-number">{{ data.students?.length || 0 }}</div>
            <div class="stat-label">总学生数</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ Object.keys(gradeStats).length }}</div>
            <div class="stat-label">年级数量</div>
          </div>
        </div>

        <!-- 实时预览 -->
        <div
          class="preview-area"
          v-if="name || grade"
        >
          <h3>实时预览</h3>
          <div class="preview-card">
            <div class="preview-avatar">{{ name ? name.charAt(0) : '?' }}</div>
            <div class="preview-info">
              <h4>{{ name || '学生姓名' }}</h4>
              <p>{{ grade || '年级' }} {{ className || '班级' }}</p>
              <div class="preview-details">
                <span v-if="studentId">学号: {{ studentId }}</span>
                <span v-if="email">邮箱: {{ email }}</span>
                <span v-if="parentPhone">电话: {{ parentPhone }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 年级分布 -->
        <div
          class="grade-stats"
          v-if="Object.keys(gradeStats).length > 0"
        >
          <h3>年级分布</h3>
          <div class="grade-list">
            <div
              v-for="(count, grade) in gradeStats"
              :key="grade"
              class="grade-item"
            >
              <span class="grade-name">{{ grade }}</span>
              <div class="grade-bar">
                <div
                  class="grade-progress"
                  :style="{ width: getGradePercentage(count) + '%' }"
                ></div>
              </div>
              <span class="grade-count">{{ count }}人</span>
            </div>
          </div>
        </div>

        <!-- 操作提示 -->
        <div class="tips-area">
          <h3>操作提示</h3>
          <ul class="tips-list">
            <li>学生姓名应为真实姓名</li>
            <li>学号需要保持唯一性</li>
            <li>家长电话用于紧急联系</li>
            <li>创建后可在学生列表中查看和管理</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- 成功提示 -->
    <div
      v-if="showSuccess"
      class="success-toast"
    >
      <div class="toast-icon">✓</div>
      <span>学生 {{ lastCreatedName }} 创建成功！</span>
    </div>
  </div>
</template>

<script>
export default {
  props: ['data'],
  data () {
    return {
      name: '',
      grade: '',
      className: '',
      studentId: '',
      email: '',
      parentPhone: '',
      showSuccess: false,
      lastCreatedName: ''
    };
  },
  computed: {
    isFormValid () {
      return this.name && this.grade && this.className && this.studentId && this.parentPhone;
    },

    gradeStats () {
      if (!this.data?.students) return {};

      const stats = {};
      this.data.students.forEach(student => {
        const grade = student.grade;
        stats[grade] = (stats[grade] || 0) + 1;
      });
      return stats;
    }
  },
  methods: {
    createStudent () {
      const student = {
        name: this.name,
        grade: this.grade,
        className: this.className,
        studentId: this.studentId,
        email: this.email,
        parentPhone: this.parentPhone,
        createdAt: new Date().toLocaleDateString()
      };

      this.$emit('updateData', 'students', student);
      this.lastCreatedName = this.name;
      this.resetForm();
      this.showSuccessMessage();
    },

    resetForm () {
      this.name = '';
      this.grade = '';
      this.className = '';
      this.studentId = '';
      this.email = '';
      this.parentPhone = '';
    },

    showSuccessMessage () {
      this.showSuccess = true;
      setTimeout(() => {
        this.showSuccess = false;
      }, 3000);
    },

    getGradePercentage (count) {
      const total = this.data?.students?.length || 1;
      return Math.round((count / total) * 100);
    }
  }
};
</script>

<style scoped>
.create-student {
  width: 100%;
  height: 100%;
  padding: 0;
  margin: 0;
  background: #f8fafc;
}

.content-wrapper {
  display: grid;
  grid-template-columns: 1fr 1px 1fr;
  gap: 0;
  width: 100%;
  height: 100%;
  min-height: calc(100vh - 120px);
  padding: 0;
  margin: 0;
}

.form-section {
  padding: 30px;
  background: white;
  display: flex;
  flex-direction: column;
}

.info-section {
  padding: 30px;
  background: #f8fafc;
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.divider {
  background: linear-gradient(to bottom, #e2e8f0, #cbd5e0, #e2e8f0);
  width: 1px;
}

.section-header {
  margin-bottom: 30px;
  text-align: left;
}

.section-header h2 {
  color: #1a202c;
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 8px;
}

.section-header p {
  color: #718096;
  font-size: 18px;
  margin: 0;
}

.student-form {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 25px;
  margin-bottom: 40px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 10px;
  font-size: 16px;
}

.form-group input,
.form-group select {
  padding: 16px 20px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 16px;
  transition: all 0.3s ease;
  background: white;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #3182ce;
  box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.1);
}

.form-actions {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 20px;
  margin-top: auto;
}

.btn-reset,
.btn-submit {
  padding: 16px 24px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-reset {
  background: #f7fafc;
  color: #4a5568;
  border: 2px solid #e2e8f0;
}

.btn-reset:hover {
  background: #edf2f7;
  border-color: #cbd5e0;
}

.btn-submit {
  background: linear-gradient(135deg, #3182ce, #2c5282);
  color: white;
  border: none;
}

.btn-submit:hover:not(:disabled) {
  background: linear-gradient(135deg, #2c5282, #2a4365);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(49, 130, 206, 0.3);
}

.btn-submit:disabled {
  background: #a0aec0;
  cursor: not-allowed;
}

.stats-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.stat-card {
  background: white;
  padding: 25px;
  border-radius: 16px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border-left: 4px solid #3182ce;
}

.stat-number {
  font-size: 48px;
  font-weight: 700;
  color: #3182ce;
  line-height: 1;
  margin-bottom: 8px;
}

.stat-label {
  color: #718096;
  font-size: 16px;
  font-weight: 500;
}

.preview-area,
.grade-stats,
.tips-area {
  background: white;
  padding: 25px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.preview-area h3,
.grade-stats h3,
.tips-area h3 {
  color: #1a202c;
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 20px;
  border-bottom: 2px solid #f7fafc;
  padding-bottom: 12px;
}

.preview-card {
  display: flex;
  gap: 20px;
  align-items: center;
}

.preview-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3182ce, #2c5282);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  font-weight: bold;
}

.preview-info h4 {
  color: #1a202c;
  font-size: 24px;
  margin-bottom: 8px;
}

.preview-info p {
  color: #3182ce;
  font-size: 18px;
  font-weight: 500;
  margin-bottom: 12px;
}

.preview-details {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.preview-details span {
  color: #718096;
  font-size: 14px;
}

.grade-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.grade-item {
  display: grid;
  grid-template-columns: 80px 1fr 60px;
  gap: 15px;
  align-items: center;
}

.grade-name {
  font-weight: 600;
  color: #2d3748;
  font-size: 14px;
}

.grade-bar {
  background: #f7fafc;
  height: 12px;
  border-radius: 6px;
  overflow: hidden;
}

.grade-progress {
  height: 100%;
  background: linear-gradient(90deg, #3182ce, #4299e1);
  border-radius: 6px;
  transition: width 0.5s ease;
}

.grade-count {
  text-align: right;
  font-weight: 600;
  color: #3182ce;
  font-size: 14px;
}

.tips-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.tips-list li {
  padding: 12px 0;
  color: #4a5568;
  border-bottom: 1px solid #f7fafc;
  position: relative;
  padding-left: 20px;
}

.tips-list li:before {
  content: '•';
  color: #3182ce;
  font-weight: bold;
  position: absolute;
  left: 0;
}

.tips-list li:last-child {
  border-bottom: none;
}

.success-toast {
  position: fixed;
  top: 30px;
  right: 30px;
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  border-left: 4px solid #48bb78;
  display: flex;
  align-items: center;
  gap: 15px;
  z-index: 1000;
  animation: slideIn 0.3s ease;
}

.toast-icon {
  width: 32px;
  height: 32px;
  background: #48bb78;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@media (max-width: 1200px) {
  .content-wrapper {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto;
    gap: 0;
  }

  .divider {
    display: none;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .form-actions {
    grid-template-columns: 1fr;
  }

  .stats-cards {
    grid-template-columns: 1fr;
  }
}
</style>