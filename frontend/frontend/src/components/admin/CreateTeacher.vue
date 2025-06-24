<!-- filepath: src/components/admin/CreateTeacher.vue -->
<template>
  <div class="create-teacher">
    <!-- 左侧：表单区域 -->
    <div class="form-section">
      <div class="page-header">
        <h2>创建教师账户</h2>
        <p>添加新的教师到系统中</p>
      </div>

      <div class="form-container">
        <form
          @submit.prevent="createTeacher"
          class="teacher-form"
        >
          <div class="form-group">
            <label for="teacherName">教师姓名</label>
            <input
              id="teacherName"
              v-model="name"
              type="text"
              placeholder="请输入教师姓名"
              required
            />
          </div>

          <div class="form-group">
            <label for="teacherSubject">任教科目</label>
            <select
              id="teacherSubject"
              v-model="subject"
              required
            >
              <option value="">请选择科目</option>
              <option value="语文">语文</option>
              <option value="数学">数学</option>
              <option value="英语">英语</option>
              <option value="物理">物理</option>
              <option value="化学">化学</option>
              <option value="生物">生物</option>
              <option value="历史">历史</option>
              <option value="地理">地理</option>
              <option value="政治">政治</option>
            </select>
          </div>

          <div class="form-group">
            <label for="teacherEmail">邮箱地址</label>
            <input
              id="teacherEmail"
              v-model="email"
              type="email"
              placeholder="请输入邮箱地址"
              required
            />
          </div>

          <div class="form-group">
            <label for="teacherPhone">联系电话</label>
            <input
              id="teacherPhone"
              v-model="phone"
              type="tel"
              placeholder="请输入联系电话"
              required
            />
          </div>

          <div class="form-actions">
            <button
              type="button"
              @click="resetForm"
              class="btn-secondary"
            >
              重置表单
            </button>
            <button
              type="submit"
              class="btn-primary"
              :disabled="!isFormValid"
            >
              <span class="btn-icon">✓</span>
              创建教师
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- 右侧：预览和统计区域 -->
    <div class="preview-section">
      <div class="stats-card">
        <h3>教师统计</h3>
        <div class="stat-item">
          <span class="stat-number">{{ data.teachers?.length || 0 }}</span>
          <span class="stat-label">总教师数</span>
        </div>
        <div class="subject-stats">
          <h4>学科分布</h4>
          <div class="subject-list">
            <div
              v-for="(count, subject) in subjectStats"
              :key="subject"
              class="subject-item"
            >
              <span class="subject-name">{{ subject }}</span>
              <span class="subject-count">{{ count }}人</span>
            </div>
          </div>
        </div>
      </div>

      <div
        class="preview-card"
        v-if="name || subject"
      >
        <h3>预览信息</h3>
        <div class="teacher-preview">
          <div class="preview-avatar">
            {{ name ? name.charAt(0) : '?' }}
          </div>
          <div class="preview-info">
            <h4>{{ name || '教师姓名' }}</h4>
            <p class="preview-subject">{{ subject || '任教科目' }}</p>
            <div class="preview-details">
              <div
                class="preview-detail"
                v-if="email"
              >
                <span class="detail-label">邮箱:</span>
                <span>{{ email }}</span>
              </div>
              <div
                class="preview-detail"
                v-if="phone"
              >
                <span class="detail-label">电话:</span>
                <span>{{ phone }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="tips-card">
        <h3>创建提示</h3>
        <ul class="tips-list">
          <li>✓ 教师姓名应为真实姓名</li>
          <li>✓ 选择正确的任教科目</li>
          <li>✓ 邮箱地址用于系统通知</li>
          <li>✓ 联系电话便于沟通协调</li>
          <li>✓ 创建后可分配课程和班级</li>
        </ul>
      </div>
    </div>

    <!-- 成功提示 -->
    <div
      v-if="showSuccess"
      class="success-message"
    >
      <div class="success-icon">✓</div>
      <div class="success-text">
        <h3>创建成功！</h3>
        <p>教师 {{ lastCreatedName }} 已成功添加到系统</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ['data'],
  data () {
    return {
      name: '',
      subject: '',
      email: '',
      phone: '',
      showSuccess: false,
      lastCreatedName: ''
    };
  },
  computed: {
    isFormValid () {
      return this.name && this.subject && this.email && this.phone;
    },

    subjectStats () {
      if (!this.data?.teachers) return {};

      const stats = {};
      this.data.teachers.forEach(teacher => {
        const subject = teacher.subject;
        stats[subject] = (stats[subject] || 0) + 1;
      });
      return stats;
    }
  },
  methods: {
    createTeacher () {
      const teacher = {
        name: this.name,
        subject: this.subject,
        email: this.email,
        phone: this.phone,
        createdAt: new Date().toLocaleDateString()
      };

      this.$emit('updateData', 'teachers', teacher);
      this.lastCreatedName = this.name;
      this.resetForm();
      this.showSuccessMessage();
    },

    resetForm () {
      this.name = '';
      this.subject = '';
      this.email = '';
      this.phone = '';
    },

    showSuccessMessage () {
      this.showSuccess = true;
      setTimeout(() => {
        this.showSuccess = false;
      }, 3000);
    }
  }
};
</script>

<style scoped>
.create-teacher {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  width: 100%;
  height: 100%;
  min-height: calc(100vh - 200px);
  padding: 0;
  margin: 0;
  background: #f8fafc;
}

/* 样式与CreateStudent基本相同，只是颜色主题不同 */
.form-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.page-header {
  text-align: center;
  padding: 25px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
}

.page-header h2 {
  color: #2c3e50;
  font-size: 28px;
  margin-bottom: 8px;
}

.page-header p {
  color: #7f8c8d;
  font-size: 16px;
  margin: 0;
}

.form-container {
  flex: 1;
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.teacher-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-weight: 600;
  color: #34495e;
  margin-bottom: 8px;
  font-size: 15px;
}

.form-group input,
.form-group select {
  padding: 12px 16px;
  border: 2px solid #e1e8ed;
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.3s ease;
  background: #f8f9fa;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #3498db;
  background: white;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
}

.form-actions {
  display: flex;
  gap: 15px;
  margin-top: 20px;
}

.btn-primary,
.btn-secondary {
  flex: 1;
  padding: 12px 20px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-primary {
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: white;
  border: none;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(52, 152, 219, 0.4);
}

.btn-primary:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}

.btn-secondary {
  background: white;
  color: #7f8c8d;
  border: 2px solid #e1e8ed;
}

.btn-secondary:hover {
  background: #f8f9fa;
}

/* 右侧预览区域 */
.preview-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.stats-card,
.preview-card,
.tips-card {
  background: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.stats-card h3,
.preview-card h3,
.tips-card h3 {
  color: #2c3e50;
  font-size: 20px;
  margin-bottom: 20px;
  border-bottom: 2px solid #e1e8ed;
  padding-bottom: 10px;
}

.stat-item {
  text-align: center;
  margin-bottom: 20px;
}

.stat-number {
  display: block;
  font-size: 48px;
  font-weight: 700;
  color: #3498db;
  line-height: 1;
}

.stat-label {
  font-size: 16px;
  color: #7f8c8d;
  font-weight: 500;
}

.subject-stats h4 {
  color: #34495e;
  margin-bottom: 15px;
  font-size: 16px;
}

.subject-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.subject-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 6px;
}

.subject-name {
  color: #34495e;
  font-weight: 500;
}

.subject-count {
  color: #3498db;
  font-weight: 600;
}

.teacher-preview {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

.preview-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
  flex-shrink: 0;
}

.preview-info h4 {
  color: #2c3e50;
  margin-bottom: 5px;
  font-size: 18px;
}

.preview-subject {
  color: #3498db;
  font-weight: 500;
  margin-bottom: 15px;
}

.preview-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.preview-detail {
  display: flex;
  gap: 8px;
  font-size: 14px;
}

.detail-label {
  color: #7f8c8d;
  font-weight: 500;
  min-width: 50px;
}

.tips-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.tips-list li {
  padding: 10px 0;
  color: #34495e;
  border-bottom: 1px solid #f1f2f6;
  font-size: 14px;
}

.tips-list li:last-child {
  border-bottom: none;
}

.success-message {
  position: fixed;
  top: 20px;
  right: 20px;
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  border-left: 4px solid #27ae60;
  display: flex;
  align-items: center;
  gap: 15px;
  max-width: 400px;
  z-index: 1000;
  animation: slideIn 0.3s ease;
}

.success-icon {
  width: 40px;
  height: 40px;
  background: #27ae60;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
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
  .create-teacher {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}

@media (max-width: 768px) {
  .form-actions {
    flex-direction: column;
  }

  .teacher-preview {
    flex-direction: column;
    text-align: center;
  }
}
</style>