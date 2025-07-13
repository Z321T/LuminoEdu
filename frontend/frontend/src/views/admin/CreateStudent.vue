<template>
  <div class="admin-layout">
    <!-- 侧边栏 -->
    <SideBar
      :menuItems="adminMenuItems"
      :activeItem="$route.path"
      :class="{ 'mobile-open': mobileMenuOpen }"
      @menuClick="handleMenuClick"
    />

    <!-- 主要内容区域 -->
    <div class="main-layout">
      <!-- 页面头部 -->
      <PageHeader
        :title="'Excel导入学生'"
        :showMobileMenu="true"
        @toggleMobileMenu="toggleMobileMenu"
      >
        <template #actions>
          <!-- 返回按钮 -->
          <button
            @click="goBack"
            class="back-btn"
          >
            <span class="back-icon">←</span>
            <span>返回首页</span>
          </button>

          <!-- 用户信息和退出 -->
          <div class="user-actions">
            <div class="user-info">
              <span class="user-avatar">👤</span>
              <span class="username">{{ username }}</span>
            </div>
            <button
              @click="logout"
              class="logout-btn"
            >
              <span class="logout-icon">🚪</span>
              <span>退出</span>
            </button>
          </div>
        </template>
      </PageHeader>

      <!-- 内容区域 -->
      <main class="content-area">
        <!-- 创建学生内容 -->
        <div class="create-teacher">
          <!-- 调试面板 -->
          <div
            v-if="showDebug"
            class="debug-panel"
          >
            <div class="debug-header">
              <h3>🐛 调试信息</h3>
              <button
                @click="toggleDebug"
                class="toggle-debug-btn"
              >隐藏</button>
            </div>

            <div class="debug-sections">
              <div class="debug-section">
                <h4>📊 状态信息</h4>
                <pre>{{ debugState }}</pre>
              </div>

              <div class="debug-section">
                <h4>📁 文件信息</h4>
                <pre>{{ debugFileInfo }}</pre>
              </div>

              <div class="debug-section">
                <h4>📊 学生统计</h4>
                <pre>{{ debugTeacherStats }}</pre>
              </div>

              <div class="debug-section">
                <h4>🔗 API 调用记录</h4>
                <div
                  v-if="apiLogs.length === 0"
                  class="no-logs"
                >暂无API调用记录</div>
                <div
                  v-else
                  class="api-logs"
                >
                  <div
                    v-for="(log, index) in apiLogs.slice(0, 5)"
                    :key="index"
                    :class="['log-entry', log.type]"
                  >
                    <div class="log-header">
                      <span class="log-time">{{ log.timestamp }}</span>
                      <span class="log-method">{{ log.method }}</span>
                      <span class="log-url">{{ log.url }}</span>
                      <span
                        :class="['log-status', log.type]">{{ log.status }}</span>
                    </div>
                    <div
                      v-if="log.error"
                      class="log-error"
                    >❌ {{ log.error }}</div>
                    <div
                      v-if="log.data"
                      class="log-data"
                    >📊 {{ log.data }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 错误信息 -->
          <div
            v-if="errorMessage"
            class="error-message"
            @click="clearError"
          >
            <span class="error-icon">❌</span>
            <span class="error-text">{{ errorMessage }}</span>
            <span class="error-close">✖</span>
          </div>

          <!-- 成功信息 -->
          <transition name="success-fade">
            <div
              v-if="showSuccess"
              class="success-message"
            >
              <span class="success-icon">✅</span>
              <span class="success-text">{{ successMessage }}</span>
            </div>
          </transition>

          <!-- 主要内容区域 -->
          <div class="main-content">
            <!-- Excel 批量导入卡片 -->
            <div class="upload-card">
              <div class="card-header">
                <div class="header-content">
                  <h2 class="card-title">
                    <span class="title-icon">📊</span>
                    Excel 批量导入学生
                  </h2>
                  <p class="card-description">
                    支持 Excel (.xlsx, .xls) 和 CSV 文件格式，单次最多导入 1000 名学生
                  </p>
                </div>
              </div>

              <div class="card-body">
                <!-- 模板下载区域 -->
                <div class="template-section">
                  <h3 class="section-title">
                    <span class="section-icon">📋</span>
                    1. 下载并填写模板
                  </h3>
                  <div class="template-actions">
                    <button
                      @click="downloadTemplate"
                      class="template-btn primary"
                    >
                      <span class="btn-icon">📥</span>
                      <span class="btn-text">下载Excel模板</span>
                    </button>

                  </div>
                </div>

                <!-- 文件上传区域 -->
                <div class="upload-section">
                  <h3 class="section-title">
                    <span class="section-icon">📤</span>
                    2. 选择并上传文件
                  </h3>

                  <!-- 拖拽上传区域 -->
                  <div
                    :class="['upload-area', { 'drag-over': isDragOver, 'has-file': selectedFile }]"
                    @drop="handleDrop"
                    @dragover.prevent="handleDragOver"
                    @dragleave="handleDragLeave"
                    @dragenter.prevent="handleDragEnter"
                    @click="$refs.fileInput.click()"
                  >
                    <input
                      ref="fileInput"
                      type="file"
                      accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
                      @change="handleFileSelect"
                      style="display: none"
                    />

                    <div
                      v-if="!selectedFile"
                      class="upload-placeholder"
                    >
                      <div class="upload-icon">📁</div>
                      <div class="upload-text">
                        <div class="primary-text">点击选择文件或拖拽到此处</div>
                        <div class="secondary-text">支持 .xlsx, .xls, .csv 格式，最大
                          10MB</div>
                      </div>
                    </div>

                    <div
                      v-else
                      class="file-info"
                    >
                      <div class="file-details">
                        <div class="file-icon">📄</div>
                        <div class="file-meta">
                          <div class="file-name">{{ selectedFile.name }}</div>
                          <div class="file-size">
                            {{ formatFileSize(selectedFile.size) }}</div>
                          <div
                            :class="['file-status', { 'valid': isFileValid, 'invalid': !isFileValid }]"
                          >
                            {{ isFileValid ? '✅ 文件有效' : '❌ 文件无效' }}
                          </div>
                        </div>
                      </div>
                      <button
                        @click.stop="removeFile"
                        class="remove-file-btn"
                      >
                        <span class="remove-icon">🗑️</span>
                      </button>
                    </div>
                  </div>

                  <!-- 上传进度 -->
                  <div
                    v-if="isUploading"
                    class="upload-progress"
                  >
                    <div class="progress-bar">
                      <div
                        class="progress-fill"
                        :style="{ width: uploadProgress + '%' }"
                      ></div>
                    </div>
                    <div class="progress-text">上传中...
                      {{ uploadProgress.toFixed(0) }}%</div>
                  </div>

                  <!-- 操作按钮 -->
                  <div class="action-section">
                    <h3 class="section-title">
                      <span class="section-icon">🚀</span>
                      3. 开始导入
                    </h3>
                    <div class="action-buttons">
                      <button
                        @click="handleBatchUpload"
                        :disabled="!isFileValid || isUploading"
                        :class="['action-btn', 'primary', { 'loading': isUploading }]"
                      >
                        <span
                          v-if="!isUploading"
                          class="btn-icon"
                        >📤</span>
                        <span
                          v-else
                          class="btn-icon loading"
                        >⏳</span>
                        <span class="btn-text">
                          {{ isUploading ? '正在导入...' : '开始导入学生' }}
                        </span>
                      </button>

                      <button
                        @click="clearResults"
                        class="action-btn secondary"
                      >
                        <span class="btn-icon">🧹</span>
                        <span class="btn-text">清空结果</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 导入结果显示 -->
            <div
              v-if="uploadResult"
              class="result-card"
            >
              <div class="result-header">
                <h3 class="result-title">
                  <span class="result-icon">📊</span>
                  导入结果统计
                </h3>
              </div>

              <div class="result-stats">
                <div class="stat-item total">
                  <div class="stat-number">{{ uploadResult.total || 0 }}</div>
                  <div class="stat-label">总计</div>
                </div>
                <div class="stat-item success">
                  <div class="stat-number">{{ uploadResult.success_count || 0 }}
                  </div>
                  <div class="stat-label">成功</div>
                </div>
                <div class="stat-item failed">
                  <div class="stat-number">{{ uploadResult.failed_count || 0 }}
                  </div>
                  <div class="stat-label">失败</div>
                </div>
              </div>

              <!-- 失败记录详情 -->
              <div
                v-if="uploadResult.failed_count > 0 && uploadResult.failed_records && uploadResult.failed_records.length > 0"
                class="failed-records"
              >
                <h4 class="failed-title">失败记录详情：</h4>
                <div class="failed-list">
                  <div
                    v-for="(record, index) in uploadResult.failed_records"
                    :key="index"
                    class="failed-item"
                  >
                    <div class="failed-info">
                      <span
                        class="failed-name">{{ record.username || '未知用户' }}</span>
                      <span
                        class="failed-status">{{ record.success ? '✅' : '❌' }}</span>
                    </div>
                    <div class="failed-error">{{ record.error || '未知错误' }}</div>
                  </div>
                </div>
                <button
                  @click="downloadErrorReport"
                  class="download-error-btn"
                >
                  <span class="btn-icon">📋</span>
                  <span class="btn-text">下载错误报告</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- 移动端遮罩 -->
    <div
      v-if="mobileMenuOpen"
      class="mobile-overlay"
      @click="closeMobileMenu"
    />

    <!-- 快速提示 -->
    <transition name="tip-fade">
      <div
        v-if="showQuickTip"
        class="quick-tip"
      >
        <div class="tip-content">
          <span class="tip-icon">💡</span>
          <span>{{ quickTipMessage }}</span>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import PageHeader from '@/components/layout/PageHeader.vue';
import SideBar from '@/components/layout/SideBar.vue';
import {
  downloadStudentTemplate,
  createStudents
} from '@/api/user_management'

export default {
  name: 'CreateStudent',
  components: {
    PageHeader,
    SideBar
  },
  props: ['data'],

  data () {
    return {
      // 侧边栏相关
      mobileMenuOpen: false,
      showQuickTip: false,
      quickTipMessage: '',
      adminMenuItems: [
        { path: '/admin/log_management', icon: '📝', label: '日志管理' },
        { path: '/admin/teacher-management', icon: '👨‍🏫', label: '教师管理' },
        { path: '/admin/student-management', icon: '👨‍🎓', label: '学生管理' }
      ],

      // 文件上传相关
      selectedFile: null,
      isDragOver: false,
      uploadResult: null,
      uploadProgress: 0,
      isUploading: false,

      // 消息提示
      showSuccess: false,
      successMessage: '',
      errorMessage: '',

      // 数据相关
      uploadHistory: [],

      // 调试相关
      showDebug: false,
      apiLogs: [],
      debugMode: process.env.NODE_ENV === 'development',
      apiError: false,
      apiErrorMessage: ''
    };
  },

  computed: {
    username () {
      return localStorage.getItem('username') || '管理员';
    },

    isFileValid () {
      if (!this.selectedFile) return false;
      const validTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'text/csv'
      ];
      const isValidType = validTypes.includes(this.selectedFile.type);
      const isValidSize = this.selectedFile.size <= 10 * 1024 * 1024;
      return isValidType && isValidSize;
    },

    teacherCount () {
      const count = this.data?.teachers?.length || 0;
      return count;
    },

    subjectStats () {
      const teachersList = this.data?.teachers || [];
      const stats = {};
      teachersList.forEach(teacher => {
        const subject = teacher.subject;
        stats[subject] = (stats[subject] || 0) + 1;
      });
      return stats;
    },

    debugState () {
      return JSON.stringify({
        isUploading: this.isUploading,
        isDragOver: this.isDragOver,
        showSuccess: this.showSuccess,
        hasError: !!this.errorMessage,
        teacherCount: this.teacherCount,
        hasSelectedFile: !!this.selectedFile,
        isFileValid: this.isFileValid,
        hasUploadResult: !!this.uploadResult,
        uploadProgress: this.uploadProgress,
        mode: 'Excel批量导入模式'
      }, null, 2);
    },

    debugFileInfo () {
      if (!this.selectedFile) return 'null';
      return JSON.stringify({
        name: this.selectedFile.name,
        size: this.selectedFile.size,
        type: this.selectedFile.type,
        lastModified: new Date(this.selectedFile.lastModified).toISOString(),
        isValid: this.isFileValid
      }, null, 2);
    },

    debugTeacherStats () {
      return JSON.stringify({
        mode: 'Excel批量导入',
        dataSource: this.data?.teachers ? 'props' : 'local',
        totalCount: this.teacherCount,
        subjectDistribution: this.subjectStats,
        uploadHistoryCount: this.uploadHistory.length
      }, null, 2);
    }
  },

  mounted () {
    console.log('📊 CreateStudent组件已挂载');
    this.loadUploadHistory();
  },

  methods: {
    // 侧边栏相关方法
    handleMenuClick (item) {
      console.log('🔄 菜单点击:', item.label);
      if (item.path !== this.$route.path) {
        this.$router.push(item.path);
      }
      this.closeMobileMenu();
      this.showQuickTipMessage(`已切换到 ${item.label}`);
    },

    toggleMobileMenu () {
      this.mobileMenuOpen = !this.mobileMenuOpen;
      console.log('📱 切换移动端菜单:', this.mobileMenuOpen);
    },

    closeMobileMenu () {
      this.mobileMenuOpen = false;
    },

    showQuickTipMessage (message) {
      this.quickTipMessage = message;
      this.showQuickTip = true;
      setTimeout(() => {
        this.showQuickTip = false;
      }, 2000);
    },

    // 退出登录
    logout () {
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('userRole');
      localStorage.removeItem('username');
      localStorage.removeItem('authToken');
      this.$router.push('/admin/login');
      this.showQuickTipMessage('👋 已安全退出');
    },

    // 返回首页
    goBack () {
      this.$router.push('/admin');
    },

    // 调试相关
    toggleDebug () {
      this.showDebug = !this.showDebug;
    },

    logDebug (action, data = {}) {
      if (!this.debugMode) return;
      const timestamp = new Date().toISOString();
      console.log(`[CreateStudent Debug] ${timestamp} - ${action}:`, data);
    },

    // 文件处理方法
    handleFileSelect (event) {
      const files = event.target.files;
      if (files.length > 0) {
        this.selectedFile = files[0];

        // 🎯 添加调试信息
        console.log('📁 文件选择调试信息:', {
          name: this.selectedFile.name,
          size: this.selectedFile.size,
          type: this.selectedFile.type,
          lastModified: this.selectedFile.lastModified,
          extension: this.selectedFile.name.split('.').pop()?.toLowerCase(),
          // 🎯 添加更多调试信息
          constructor: this.selectedFile.constructor.name,
          toString: this.selectedFile.toString(),
          isFile: this.selectedFile instanceof File,
          isBlob: this.selectedFile instanceof Blob
        });

        this.logDebug('文件选择', {
          fileName: this.selectedFile.name,
          fileSize: this.selectedFile.size,
          fileType: this.selectedFile.type
        });

        // 🎯 清除之前的错误信息
        this.errorMessage = '';
      }
    },

    // 🎯 修复拖拽处理
    handleDrop (event) {
      event.preventDefault();
      this.isDragOver = false;
      const files = event.dataTransfer.files;
      if (files.length > 0) {
        this.selectedFile = files[0];

        // 🎯 添加调试信息
        console.log('📁 文件拖拽调试信息:', {
          name: this.selectedFile.name,
          size: this.selectedFile.size,
          type: this.selectedFile.type,
          lastModified: this.selectedFile.lastModified,
          extension: this.selectedFile.name.split('.').pop()?.toLowerCase()
        });

        this.logDebug('文件拖拽', {
          fileName: this.selectedFile.name,
          fileSize: this.selectedFile.size,
          fileType: this.selectedFile.type
        });

        // 🎯 清除之前的错误信息
        this.errorMessage = '';
      }
    },

    handleDragOver (event) {
      event.preventDefault();
      this.isDragOver = true;
    },

    handleDragLeave () {
      this.isDragOver = false;
    },

    handleDragEnter (event) {
      event.preventDefault();
      this.isDragOver = true;
    },

    removeFile () {
      this.selectedFile = null;
      this.logDebug('文件移除');
    },

    formatFileSize (bytes) {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },

    // 模板和上传相关
    async downloadTemplate () {
      try {
        // 使用学生模板下载函数
        const blob = await downloadStudentTemplate()
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = '学生导入模板.xlsx'
        link.click()
        window.URL.revokeObjectURL(url)

        this.successMessage = '📥 学生模板下载成功'
        this.showSuccess = true
        setTimeout(() => {
          this.showSuccess = false;
        }, 2000);
      } catch (error) {
        this.errorMessage = error.message || '模板下载失败'
      }
    },

    previewTemplate () {
      this.logDebug('预览模板');
      const element = document.querySelector('.template-preview');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    },

    // 🎯 批量上传方法
    async handleBatchUpload () {
      if (!this.selectedFile || !this.isFileValid) {
        this.errorMessage = '请选择有效的文件';
        return;
      }

      this.isUploading = true;
      this.uploadProgress = 0;
      this.errorMessage = '';

      // 在方法开始时声明 progressInterval
      let progressInterval = null;

      try {
        console.log('🎯 开始批量上传 - 文件验证:', {
          fileName: this.selectedFile.name,
          fileSize: this.selectedFile.size,
          fileType: this.selectedFile.type
        });

        this.logDebug('开始批量上传', { fileName: this.selectedFile.name });

        // 模拟上传进度
        progressInterval = setInterval(() => {
          if (this.uploadProgress < 90) {
            this.uploadProgress += Math.random() * 10;
          }
        }, 200);

        // 调用API
        const result = await createStudents(this.selectedFile);

        // 清除进度条
        if (progressInterval) {
          clearInterval(progressInterval);
          progressInterval = null;
        }

        this.uploadProgress = 100;

        // 处理结果
        this.uploadResult = {
          total: result.total || 0,
          success_count: result.success_count || 0,
          failed_count: result.failed_count || 0,
          failed_records: result.failed_records || []
        };

        this.logDebug('批量上传成功', this.uploadResult);

        // 显示成功消息
        if (this.uploadResult.failed_count === 0) {
          this.successMessage = `✅ 导入完成！成功导入 ${this.uploadResult.success_count} 名学生`;
        } else {
          this.successMessage = `⚠️ 导入完成！成功: ${this.uploadResult.success_count}，失败: ${this.uploadResult.failed_count}`;
        }

        this.showSuccess = true;
        setTimeout(() => {
          this.showSuccess = false;
        }, 3000);

        // 保存到历史记录
        this.saveUploadHistory({
          timestamp: new Date().toISOString(),
          filename: this.selectedFile.name,
          result: this.uploadResult
        });

        // 刷新数据
        this.$emit('dataUpdated');

      } catch (error) {
        // 在错误处理中也要清除进度条
        if (progressInterval) {
          clearInterval(progressInterval);
          progressInterval = null;
        }

        console.error('🎯 批量上传失败:', error);
        this.logDebug('批量上传失败', { error: error.message });
        this.errorMessage = error.message || '导入失败，请重试';

      } finally {
        // 确保进度条被清除
        if (progressInterval) {
          clearInterval(progressInterval);
        }
        this.isUploading = false;
      }
    },

    // 保存上传历史记录
    saveUploadHistory (record) {
      this.uploadHistory.unshift(record);
      // 只保留最近10条记录
      if (this.uploadHistory.length > 10) {
        this.uploadHistory = this.uploadHistory.slice(0, 10);
      }
      localStorage.setItem('studentUploadHistory', JSON.stringify(this.uploadHistory));
    },

    clearResults () {
      this.uploadResult = null;
      this.selectedFile = null;
      this.uploadProgress = 0;
      this.errorMessage = '';
      this.successMessage = '';
      this.logDebug('清空结果');
    },

    clearError () {
      this.errorMessage = '';
    },

    // 优化的错误报告下载方法
    async downloadErrorReport () {
      try {
        if (!this.uploadResult || !this.uploadResult.failed_records || this.uploadResult.failed_records.length === 0) {
          this.errorMessage = '没有错误记录可下载';
          return;
        }

        const errorData = this.uploadResult.failed_records.map((record, index) => ({
          序号: index + 1,
          学生姓名: record.username || '未知用户',
          状态: record.success ? '成功' : '失败',
          错误原因: record.error || '未知错误',
          时间: new Date().toLocaleString()
        }));

        const csvContent = this.convertToCSV(errorData);
        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `学生导入错误报告_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        window.URL.revokeObjectURL(url);

        this.logDebug('错误报告下载成功');
        this.successMessage = '📋 错误报告已下载';
        this.showSuccess = true;
        setTimeout(() => {
          this.showSuccess = false;
        }, 2000);
      } catch (error) {
        this.logDebug('错误报告下载失败', { error: error.message });
        this.errorMessage = '下载错误报告失败';
      }
    },

    convertToCSV (data) {
      if (!data || data.length === 0) return '';

      const headers = Object.keys(data[0]).join(',');
      const rows = data.map(row =>
        Object.values(row).map(value => `"${value}"`).join(',')
      );

      return [headers, ...rows].join('\n');
    },

    loadUploadHistory () {
      const history = localStorage.getItem('studentUploadHistory');
      if (history) {
        try {
          this.uploadHistory = JSON.parse(history);
        } catch (error) {
          this.uploadHistory = [];
        }
      }
    }
  }
};
</script>

<style scoped>
/* 基础布局样式 */
.admin-layout {
  width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 0;
  background: #f8fafc;
  overflow: hidden;
  position: relative;
}

.main-layout {
  margin-left: 280px;
  width: calc(100vw - 280px);
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f8fafc;
  position: relative;
}

.content-area {
  flex: 1;
  width: 100%;
  height: calc(100vh - 80px);
  margin: 0;
  padding: 0;
  background: #f8fafc;
  overflow: hidden;
  position: relative;
}

.create-teacher {
  flex: 1;
  width: 100%;
  height: 100%;
  padding: 0;
  overflow-y: auto;
  background: #f8fafc;
  display: flex;
  flex-direction: column;
}

/* 返回按钮样式 */
.back-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #667eea;
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  margin-right: 15px;
}

.back-btn:hover {
  background: #5a67d8;
  transform: translateY(-2px);
}

.back-icon {
  font-size: 16px;
}

/* 用户操作样式 */
.user-actions {
  display: flex;
  align-items: center;
  gap: 15px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  background: white;
  padding: 8px 12px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.user-avatar {
  font-size: 16px;
}

.username {
  font-weight: 500;
  color: #2d3748;
  font-size: 14px;
}

.logout-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #e53e3e;
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(229, 62, 62, 0.3);
}

.logout-btn:hover {
  background: #c53030;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(229, 62, 62, 0.4);
}

.logout-icon {
  font-size: 14px;
}

/* 调试面板样式 */
.debug-panel {
  background: #1a202c;
  color: #e2e8f0;
  padding: 20px;
  margin: 0 20px 20px 20px;
  border-radius: 8px;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 12px;
  flex-shrink: 0;
}

.debug-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  border-bottom: 1px solid #2d3748;
  padding-bottom: 10px;
}

.debug-header h3 {
  margin: 0;
  color: #f7fafc;
}

.toggle-debug-btn {
  background: #e53e3e;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 11px;
}

.debug-sections {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 15px;
}

.debug-section {
  background: #2d3748;
  padding: 15px;
  border-radius: 6px;
  border: 1px solid #4a5568;
}

.debug-section h4 {
  margin: 0 0 10px 0;
  color: #cbd5e0;
  font-size: 13px;
}

.debug-section pre {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
  color: #e2e8f0;
  font-size: 11px;
  line-height: 1.4;
}

.no-logs {
  color: #a0aec0;
  font-style: italic;
}

.api-logs {
  max-height: 200px;
  overflow-y: auto;
}

.log-entry {
  margin-bottom: 10px;
  padding: 8px;
  border-radius: 4px;
  border-left: 3px solid #4a5568;
}

.log-entry.success {
  border-left-color: #38a169;
  background: rgba(56, 161, 105, 0.1);
}

.log-entry.error {
  border-left-color: #e53e3e;
  background: rgba(229, 62, 62, 0.1);
}

.log-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
  font-size: 10px;
}

.log-time {
  color: #a0aec0;
}

.log-method {
  color: #4fd1c7;
  font-weight: bold;
}

.log-url {
  color: #90cdf4;
}

.log-status.success {
  color: #68d391;
}

.log-status.error {
  color: #fc8181;
}

.log-error {
  color: #fc8181;
  margin-top: 5px;
  font-size: 10px;
}

.log-data {
  color: #bee3f8;
  margin-top: 5px;
  font-size: 10px;
}

/* 错误和成功消息样式 */
.error-message {
  background: #fed7d7;
  color: #c53030;
  padding: 15px 20px;
  margin: 0 20px 10px 20px;
  border-radius: 8px;
  border-left: 4px solid #e53e3e;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.error-message:hover {
  background: #fbb6ce;
}

.error-icon {
  font-size: 18px;
  margin-right: 10px;
}

.error-text {
  flex: 1;
  font-weight: 500;
}

.error-close {
  opacity: 0.7;
  font-size: 14px;
}

.success-message {
  background: #c6f6d5;
  color: #2f855a;
  padding: 15px 20px;
  margin: 0 20px 10px 20px;
  border-radius: 8px;
  border-left: 4px solid #38a169;
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.success-icon {
  font-size: 18px;
}

.success-text {
  font-weight: 500;
}

/* 过渡动画 */
.success-fade-enter-active,
.success-fade-leave-active {
  transition: all 0.3s ease;
}

.success-fade-enter-from,
.success-fade-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

/* 主内容样式 */
.main-content {
  flex: 1;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 30px;
  min-height: 0;
  overflow-y: auto;
}

/* 上传卡片样式 */
.upload-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  flex-shrink: 0;
}

.card-header {
  background: linear-gradient(135deg, #667eea, #764ba2);
  padding: 30px;
  color: white;
}

.header-content {
  max-width: 100%;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0 0 10px 0;
  font-size: 28px;
  font-weight: 600;
}

.title-icon {
  font-size: 32px;
}

.card-description {
  margin: 0;
  font-size: 16px;
  opacity: 0.9;
  line-height: 1.5;
}

.card-body {
  padding: 30px;
}

/* 章节样式 */
.template-section,
.upload-section,
.action-section {
  margin-bottom: 40px;
  padding-bottom: 30px;
  border-bottom: 1px solid #e2e8f0;
}

.action-section {
  border-bottom: none;
  margin-bottom: 0;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 20px;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 20px;
}

.section-icon {
  font-size: 24px;
  color: #667eea;
}

/* 模板操作按钮 */
.template-actions {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.template-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  font-size: 14px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.template-btn.primary {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.template-btn.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.template-btn.secondary {
  background: #f7fafc;
  color: #4a5568;
  border: 2px solid #e2e8f0;
}

.template-btn.secondary:hover {
  background: #edf2f7;
  border-color: #cbd5e0;
  transform: translateY(-2px);
}

.btn-icon {
  font-size: 16px;
}

.btn-text {
  font-size: 14px;
}

/* 上传区域样式 */
.upload-area {
  border: 3px dashed #cbd5e0;
  border-radius: 12px;
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #f7fafc;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-area:hover {
  border-color: #667eea;
  background: #edf2f7;
}

.upload-area.drag-over {
  border-color: #667eea;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
  transform: scale(1.02);
}

.upload-area.has-file {
  border-color: #38a169;
  background: #f0fff4;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.upload-icon {
  font-size: 48px;
  color: #a0aec0;
}

.upload-text {
  text-align: center;
}

.primary-text {
  font-size: 18px;
  font-weight: 500;
  color: #2d3748;
  margin-bottom: 8px;
}

.secondary-text {
  font-size: 14px;
  color: #718096;
}

/* 文件信息样式 */
.file-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
}

.file-details {
  display: flex;
  align-items: center;
  gap: 16px;
}

.file-icon {
  font-size: 36px;
  color: #667eea;
}

.file-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.file-name {
  font-size: 16px;
  font-weight: 600;
  color: #2d3748;
}

.file-size {
  font-size: 14px;
  color: #718096;
}

.file-status {
  font-size: 14px;
  font-weight: 500;
}

.file-status.valid {
  color: #38a169;
}

.file-status.invalid {
  color: #e53e3e;
}

.remove-file-btn {
  background: #fed7d7;
  color: #c53030;
  border: none;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.remove-file-btn:hover {
  background: #fbb6ce;
  transform: scale(1.1);
}

.remove-icon {
  font-size: 16px;
}

/* 上传进度样式 */
.upload-progress {
  margin-top: 20px;
  padding: 20px;
  background: #f7fafc;
  border-radius: 8px;
  text-align: center;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 10px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 14px;
  color: #4a5568;
  font-weight: 500;
}

/* 操作按钮样式 */
.action-buttons {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 24px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  font-size: 14px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.action-btn.primary {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.action-btn.primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.action-btn.secondary {
  background: #f7fafc;
  color: #4a5568;
  border: 2px solid #e2e8f0;
}

.action-btn.secondary:hover {
  background: #edf2f7;
  border-color: #cbd5e0;
  transform: translateY(-2px);
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.action-btn.loading .btn-icon {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 优化的结果卡片样式 */
.result-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  margin-top: 20px;
}

.result-header {
  background: linear-gradient(135deg, #38a169, #2f855a);
  padding: 20px;
  color: white;
}

.result-title {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.result-icon {
  font-size: 24px;
}

.result-stats {
  display: flex;
  justify-content: space-around;
  padding: 30px;
  background: #f7fafc;
}

.stat-item {
  text-align: center;
  padding: 20px;
  border-radius: 8px;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  flex: 1;
  max-width: 200px;
}

.stat-item.total {
  border-left: 4px solid #667eea;
}

.stat-item.success {
  border-left: 4px solid #38a169;
}

.stat-item.failed {
  border-left: 4px solid #e53e3e;
}

.stat-number {
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 8px;
}

.stat-item.total .stat-number {
  color: #667eea;
}

.stat-item.success .stat-number {
  color: #38a169;
}

.stat-item.failed .stat-number {
  color: #e53e3e;
}

.stat-label {
  font-size: 14px;
  color: #718096;
  font-weight: 500;
}

/* 优化的失败记录样式 */
.failed-records {
  padding: 20px;
  border-top: 1px solid #e2e8f0;
}

.failed-title {
  font-size: 16px;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 15px;
}

.failed-list {
  max-height: 200px;
  overflow-y: auto;
  margin-bottom: 20px;
}

.failed-item {
  padding: 12px;
  background: #fed7d7;
  border-radius: 6px;
  margin-bottom: 8px;
  border-left: 4px solid #e53e3e;
}

.failed-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
}

.failed-name {
  font-weight: 500;
  color: #2d3748;
}

.failed-status {
  font-size: 16px;
}

.failed-error {
  font-size: 14px;
  color: #c53030;
  background: rgba(255, 255, 255, 0.5);
  padding: 5px 8px;
  border-radius: 4px;
}

.download-error-btn {
  background: #e53e3e;
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.download-error-btn:hover {
  background: #c53030;
  transform: translateY(-2px);
}

/* 模板预览样式 */
.template-preview {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  margin-top: 20px;
}

.preview-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 20px;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 20px;
}

.preview-icon {
  font-size: 24px;
  color: #667eea;
}

.template-notes {
  background: #f7fafc;
  padding: 20px;
  border-radius: 8px;
  border-left: 4px solid #667eea;
}

.template-notes h4 {
  margin: 0 0 15px 0;
  color: #2d3748;
  font-size: 16px;
}

.template-notes ul {
  margin: 0;
  padding-left: 20px;
}

.template-notes li {
  margin-bottom: 8px;
  color: #4a5568;
  line-height: 1.5;
}

.template-notes strong {
  color: #2d3748;
}

/* 移动端遮罩 */
.mobile-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  display: none;
}

/* 快速提示样式 */
.quick-tip {
  position: fixed;
  bottom: 30px;
  right: 30px;
  background: #667eea;
  color: white;
  padding: 15px 20px;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
  z-index: 1000;
  max-width: 300px;
}

.tip-content {
  display: flex;
  align-items: center;
  gap: 10px;
}

.tip-icon {
  font-size: 18px;
}

/* 过渡动画 */
.tip-fade-enter-active,
.tip-fade-leave-active {
  transition: all 0.3s ease;
}

.tip-fade-enter-from,
.tip-fade-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .main-layout {
    margin-left: 260px;
    width: calc(100vw - 260px);
  }
}

@media (max-width: 768px) {
  .main-layout {
    margin-left: 0;
    width: 100vw;
  }

  .mobile-overlay {
    display: block;
  }

  .template-actions,
  .action-buttons {
    flex-direction: column;
  }

  .template-btn,
  .action-btn {
    width: 100%;
    justify-content: center;
  }

  .result-stats {
    flex-direction: column;
    gap: 15px;
  }

  .stat-item {
    max-width: none;
  }

  .username {
    display: none;
  }

  .logout-btn span:last-child {
    display: none;
  }
}

@media (max-width: 480px) {
  .main-content {
    padding: 10px;
    gap: 20px;
  }

  .card-body {
    padding: 20px;
  }

  .user-actions {
    gap: 10px;
  }
}
</style>