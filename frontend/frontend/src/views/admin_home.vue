<!-- filepath: src/views/admin_home.vue -->
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
        :title="pageTitle"
        :showMobileMenu="true"
        @toggleMobileMenu="toggleMobileMenu"
      >
        <template #actions>
          <!-- 快捷操作按钮组 -->
          <div class="quick-actions">
            <button
              @click="quickCreateTeacher"
              class="quick-btn teacher-btn"
              title="Excel批量创建教师"
            >
              <span class="btn-icon">📊</span>
              <span class="btn-text">Excel导入教师</span>
            </button>

            <button
              @click="quickCreateStudent"
              class="quick-btn student-btn"
              title="快速创建学生"
            >
              <span class="btn-icon">👨‍🎓</span>
              <span class="btn-text">创建学生</span>
            </button>
          </div>

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
        <!-- 直接显示日志管理页面 -->
        <div class="logs-management">
          <!-- 日志头部 -->
          <div class="logs-header">
            <div class="header-left">
              <h1>系统日志管理</h1>
              <p>查看和管理系统操作日志</p>
            </div>
            <div class="header-actions">
              <button
                @click="refreshLogs"
                class="action-btn refresh-btn"
                :disabled="loading"
              >
                <span class="btn-icon">🔄</span>
                <span>刷新</span>
              </button>

              <button
                @click="showLogFiles"
                class="action-btn files-btn"
                :disabled="!selectedService"
              >
                <span class="btn-icon">📁</span>
                <span>文件管理</span>
              </button>

              <button
                @click="exportLogs"
                class="action-btn export-btn"
              >
                <span class="btn-icon">📥</span>
                <span>导出</span>
              </button>

              <button
                @click="clearLogs"
                class="action-btn clear-btn"
              >
                <span class="btn-icon">🗑️</span>
                <span>清空</span>
              </button>

              <button
                @click="exportServiceAllLogs"
                class="export-all-btn"
                :disabled="!selectedService"
              >
                <span class="btn-icon">📦</span>
                <span>导出全部日志</span>
              </button>
            </div>
          </div>

          <!-- 筛选区域 -->
          <div class="filter-section">
            <div class="filter-row">
              <!-- 服务筛选 -->
              <div class="filter-group">
                <label>服务：</label>
                <select
                  v-model="selectedService"
                  @change="applyFilters"
                >
                  <option value="">全部服务</option>
                  <option
                    v-for="service in logServices"
                    :key="service.name"
                    :value="service.name"
                  >
                    {{service.description}} ({{service.name}})
                  </option>
                </select>
              </div>

              <!-- 日志级别筛选 -->
              <div class="filter-group">
                <label>日志级别：</label>
                <select
                  v-model="selectedLevel"
                  @change="applyFilters"
                >
                  <option value="">全部</option>
                  <option value="INFO">INFO</option>
                  <option value="WARNING">WARNING</option>
                  <option value="ERROR">ERROR</option>
                  <option value="DEBUG">DEBUG</option>
                </select>
              </div>

              <!-- 模块筛选 -->
              <div class="filter-group">
                <label>模块：</label>
                <select
                  v-model="selectedModule"
                  @change="applyFilters"
                >
                  <option value="">全部</option>
                  <option value="user_management">用户管理</option>
                  <option value="auth">认证</option>
                  <option value="api">API</option>
                  <option value="database">数据库</option>
                </select>
              </div>

              <!-- 时间范围 -->
              <div class="filter-group">
                <label>时间范围：</label>
                <select
                  v-model="timeRange"
                  @change="applyFilters"
                >
                  <option value="1h">最近1小时</option>
                  <option value="24h">最近24小时</option>
                  <option value="7d">最近7天</option>
                  <option value="30d">最近30天</option>
                  <option value="all">全部</option>
                </select>
              </div>

              <!-- 搜索框 -->
              <div class="search-group">
                <input
                  v-model="searchKeyword"
                  type="text"
                  placeholder="搜索日志内容..."
                  @input="handleSearch"
                  class="search-input"
                />
              </div>
            </div>
          </div>

          <!-- 日志统计 -->
          <div class="log-stats">
            <div class="stat-item info">
              <span class="stat-icon">ℹ️</span>
              <span class="stat-label">INFO</span>
              <span class="stat-count">{{logStats.info}}</span>
            </div>
            <div class="stat-item warning">
              <span class="stat-icon">⚠️</span>
              <span class="stat-label">WARNING</span>
              <span class="stat-count">{{logStats.warning}}</span>
            </div>
            <div class="stat-item error">
              <span class="stat-icon">❌</span>
              <span class="stat-label">ERROR</span>
              <span class="stat-count">{{logStats.error}}</span>
            </div>
            <div class="stat-item debug">
              <span class="stat-icon">🐛</span>
              <span class="stat-label">DEBUG</span>
              <span class="stat-count">{{logStats.debug}}</span>
            </div>
          </div>

          <!-- 日志列表 -->
          <div class="logs-table-card">
            <div class="table-header">
              <div class="table-title">
                <span class="table-icon">📄</span>
                <span>系统日志</span>
                <span class="log-count">(共 {{filteredLogs.length}} 条)</span>
              </div>

              <div class="auto-refresh">
                <label>
                  <input
                    type="checkbox"
                    v-model="autoRefresh"
                    @change="toggleAutoRefresh"
                  />
                  自动刷新 ({{refreshInterval}}s)
                </label>
              </div>
            </div>

            <!-- 日志表格 -->
            <div class="table-container">
              <table class="logs-table">
                <thead>
                  <tr>
                    <th width="180">时间</th>
                    <th width="80">级别</th>
                    <th width="120">模块</th>
                    <th width="120">用户</th>
                    <th>消息</th>
                    <th width="100">操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="loading">
                    <td
                      colspan="6"
                      class="loading-row"
                    >
                      <div class="loading-spinner">🔄</div>
                      加载中...
                    </td>
                  </tr>
                  <tr v-else-if="filteredLogs.length === 0">
                    <td
                      colspan="6"
                      class="no-data"
                    >暂无日志数据</td>
                  </tr>
                  <tr
                    v-for="log in paginatedLogs"
                    :key="log.id"
                    :class="['log-row', log.level.toLowerCase()]"
                  >
                    <td class="time-cell">
                      <div class="time-display">
                        <div class="date">{{formatDate(log.timestamp)}}</div>
                        <div class="time">{{formatTime(log.timestamp)}}</div>
                      </div>
                    </td>
                    <td class="level-cell">
                      <span :class="['level-badge', log.level.toLowerCase()]">
                        {{getLevelIcon(log.level)}} {{log.level}}
                      </span>
                    </td>
                    <td class="module-cell">{{log.module}}</td>
                    <td class="user-cell">{{log.user || '-'}}</td>
                    <td class="message-cell">
                      <div
                        class="message-content"
                        @click="showLogDetail(log)"
                      >
                        {{log.message}}
                      </div>
                    </td>
                    <td class="action-cell">
                      <button
                        @click="showLogDetail(log)"
                        class="detail-btn"
                      >
                        详情
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- 分页控件 -->
            <div class="pagination">
              <div class="pagination-info">
                显示 {{(currentPage - 1) * pageSize + 1}} -
                {{Math.min(currentPage * pageSize, filteredLogs.length)}}
                / 共 {{filteredLogs.length}} 条
              </div>
              <div class="pagination-controls">
                <button
                  :disabled="currentPage <= 1"
                  @click="handlePageChange(currentPage - 1)"
                  class="page-btn"
                >上一页</button>

                <span class="page-numbers">
                  <button
                    v-for="page in visiblePages"
                    :key="page"
                    @click="handlePageChange(page)"
                    :class="['page-number', { active: page === currentPage }]"
                  >
                    {{page}}
                  </button>
                </span>

                <button
                  :disabled="currentPage >= totalPages"
                  @click="handlePageChange(currentPage + 1)"
                  class="page-btn"
                >下一页</button>
              </div>
            </div>
          </div>
        </div>

        <!-- 日志详情弹窗 -->
        <div
          v-if="showDetailDialog"
          class="modal-overlay"
          @click="closeLogDetail"
        >
          <div
            class="log-detail-modal"
            @click.stop
          >
            <div class="modal-header">
              <h3>日志详情</h3>
              <button
                @click="closeLogDetail"
                class="close-btn"
              >✕</button>
            </div>
            <div class="modal-content">
              <div
                v-if="selectedLog"
                class="log-detail"
              >
                <div class="detail-grid">
                  <div class="detail-item">
                    <label>时间：</label>
                    <span>{{formatFullTime(selectedLog.timestamp)}}</span>
                  </div>
                  <div class="detail-item">
                    <label>级别：</label>
                    <span
                      :class="['level-badge', selectedLog.level.toLowerCase()]"
                    >
                      {{getLevelIcon(selectedLog.level)}} {{selectedLog.level}}
                    </span>
                  </div>
                  <div class="detail-item">
                    <label>模块：</label>
                    <span>{{selectedLog.module}}</span>
                  </div>
                  <div class="detail-item">
                    <label>用户：</label>
                    <span>{{selectedLog.user || '-'}}</span>
                  </div>
                  <div class="detail-item full-width">
                    <label>消息：</label>
                    <p class="message-text">{{selectedLog.message}}</p>
                  </div>
                  <div
                    v-if="selectedLog.details"
                    class="detail-item full-width"
                  >
                    <label>详细信息：</label>
                    <pre
                      class="details-text">{{JSON.stringify(selectedLog.details, null, 2)}}</pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 日志文件管理弹窗 -->
        <div
          v-if="showFileDialog"
          class="modal-overlay"
          @click="closeFileDialog"
        >
          <div
            class="log-file-modal"
            @click.stop
          >
            <div class="modal-header">
              <h3>日志文件管理</h3>
              <button
                @click="closeFileDialog"
                class="close-btn"
              >✕</button>
            </div>
            <div class="modal-content">
              <!-- 服务选择 -->
              <div class="service-select">
                <label>选择服务：</label>
                <select
                  v-model="selectedService"
                  @change="loadLogFiles"
                >
                  <option value="">请选择服务</option>
                  <option value="user_management">用户管理</option>
                  <option value="auth">认证</option>
                  <option value="api">API</option>
                  <option value="database">数据库</option>
                </select>
              </div>

              <!-- 日期范围选择 -->
              <div class="date-range">
                <label>日期范围：</label>
                <div class="date-fields">
                  <input
                    v-model="fileStartDate"
                    type="date"
                    @change="applyFileFilters"
                  />
                  <span>至</span>
                  <input
                    v-model="fileEndDate"
                    type="date"
                    @change="applyFileFilters"
                  />
                </div>
              </div>

              <!-- 文件列表 -->
              <div class="file-list">
                <div
                  class="file-item"
                  v-for="file in logFiles"
                  :key="file.name"
                >
                  <div class="file-info">
                    <span class="file-name">{{file.name}}</span>
                    <span
                      class="file-size">({{formatFileSize(file.size)}})</span>
                    <span class="file-date">上传于
                      {{formatFileDate(file.date)}}</span>
                  </div>
                  <div class="file-actions">
                    <button
                      @click="viewFileContent(file)"
                      class="view-btn"
                      :disabled="loadingFiles"
                    >
                      <span>👁️</span>
                      <span>查看</span>
                    </button>

                    <button
                      @click="downloadFile(file)"
                      class="download-btn"
                      :disabled="downloadingFile === file.name"
                    >
                      <span v-if="downloadingFile === file.name">⏳</span>
                      <span v-else>📥</span>
                      <span>{{downloadingFile === file.name ? '下载中...' : '下载'}}</span>
                    </button>
                  </div>
                </div>

                <!-- 加载状态 -->
                <div
                  v-if="loadingFiles"
                  class="loading-files"
                >
                  <span class="spinner">🔄</span> 加载中...
                </div>

                <!-- 无文件提示 -->
                <div
                  v-else-if="logFiles.length === 0"
                  class="no-files"
                >
                  暂无日志文件
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 文件内容查看弹窗 -->
        <div
          v-if="showFileContentDialog"
          class="modal-overlay"
          @click="closeFileContentDialog"
        >
          <div
            class="file-content-modal"
            @click.stop
          >
            <div class="modal-header">
              <div class="file-title">
                <h3>📄 {{currentFile?.name}}</h3>
                <div class="file-meta">
                  <span class="service-tag">{{selectedService}}</span>
                  <span
                    class="size-info">{{formatFileSize(currentFile?.size || '0')}}</span>
                </div>
              </div>
              <button
                @click="closeFileContentDialog"
                class="close-btn"
              >✕</button>
            </div>

            <!-- 文件分析摘要 -->
            <div
              v-if="fileAnalysis"
              class="file-analysis"
            >
              <div class="analysis-item">
                <span class="label">总行数:</span>
                <span class="value">{{fileAnalysis.totalLines}}</span>
              </div>
              <div
                class="analysis-item"
                v-if="fileAnalysis.timeRange.start"
              >
                <span class="label">时间范围:</span>
                <span class="value">
                  {{formatLogTime(fileAnalysis.timeRange.start)}} -
                  {{formatLogTime(fileAnalysis.timeRange.end)}}
                </span>
              </div>
              <div class="level-stats">
                <div
                  v-for="(count, level) in fileAnalysis.levelStats"
                  :key="level"
                  class="level-stat"
                  :class="level.toLowerCase()"
                >
                  {{level}}: {{count}}
                </div>
              </div>
            </div>

            <!-- 内容筛选区域 -->
            <div class="content-filters">
              <div class="filter-row">
                <div class="filter-group">
                  <label>级别:</label>
                  <select v-model="contentFilterLevel">
                    <option value="">全部</option>
                    <option value="INFO">INFO</option>
                    <option value="WARNING">WARNING</option>
                    <option value="ERROR">ERROR</option>
                    <option value="DEBUG">DEBUG</option>
                  </select>
                </div>

                <div class="filter-group">
                  <label>搜索:</label>
                  <input
                    type="text"
                    v-model="contentSearchKeyword"
                    placeholder="搜索关键词..."
                    @keyup.enter="searchFileContent"
                    class="search-input"
                  />
                  <label class="checkbox-label">
                    <input
                      type="checkbox"
                      v-model="caseSensitiveSearch"
                    />
                    区分大小写
                  </label>
                </div>

                <button
                  @click="searchFileContent"
                  class="search-btn"
                >搜索</button>
                <button
                  @click="exportFilteredContent"
                  class="export-btn"
                >导出筛选</button>
              </div>
            </div>

            <!-- 文件内容显示 -->
            <div class="content-display">
              <div
                v-if="contentLoading"
                class="loading-content"
              >
                <div class="loading-spinner">🔄</div>
                加载文件内容中...
              </div>

              <div
                v-else-if="!fileContent.length"
                class="no-content"
              >
                📄 文件为空
              </div>

              <div
                v-else
                class="content-container"
              >
                <!-- 内容统计 -->
                <div class="content-stats">
                  显示 {{(contentPage - 1) * contentPageSize + 1}} -
                  {{Math.min(contentPage * contentPageSize, filteredFileContent.length)}}
                  /
                  共 {{filteredFileContent.length}} 行
                  <span
                    v-if="filteredFileContent.length !== fileContent.length"
                    class="filter-info"
                  >
                    (从 {{fileContent.length}} 行中筛选)
                  </span>
                </div>

                <!-- 日志内容列表 -->
                <div class="log-content-list">
                  <div
                    v-for="(line, index) in paginatedFileContent"
                    :key="index"
                    class="log-line"
                    :class="getLogLineClass(line)"
                  >
                    <div class="line-number">
                      {{(contentPage - 1) * contentPageSize + index + 1}}
                    </div>
                    <div
                      class="line-content"
                      v-html="highlightText(line)"
                    ></div>
                  </div>
                </div>

                <!-- 内容分页 -->
                <div class="content-pagination">
                  <button
                    :disabled="contentPage <= 1"
                    @click="handleContentPageChange(contentPage - 1)"
                    class="page-btn"
                  >上一页</button>

                  <span class="page-info">
                    {{contentPage}} / {{contentTotalPages}}
                  </span>

                  <button
                    :disabled="contentPage >= contentTotalPages"
                    @click="handleContentPageChange(contentPage + 1)"
                    class="page-btn"
                  >下一页</button>
                </div>
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
  getLogServices,
  getLogs,
  getLogStats,
  exportLogs,
  clearLogs,
  getLogDetail,
  getLatestLogs,
  getLogFiles,
  downloadLogFile,
  getLogFileContent,
  searchLogFileContent,
  parseLogLine,
  filterLogContentByLevel,
  filterLogContentByTime,
  highlightKeywords,
  analyzeLogContent,
  formatLogLevel,
  getLogLevelColor,
  formatLogTime,
  formatFileSize,
  formatFileDate,
  triggerDownload
} from '@/api/admin_log'

export default {
  name: 'AdminHome',

  components: {
    PageHeader,
    SideBar,
  },

  data () {
    return {
      mobileMenuOpen: false,
      showQuickTip: false,
      quickTipMessage: '',
      data: {
        teachers: JSON.parse(localStorage.getItem('teachers')) || [],
        students: JSON.parse(localStorage.getItem('students')) || [],
      },

      // 日志相关数据
      logs: [],
      filteredLogs: [],
      loading: false,

      // 分页相关
      currentPage: 1,
      pageSize: 50,

      // 筛选相关
      selectedLevel: '',
      selectedModule: '',
      timeRange: '24h',
      searchKeyword: '',
      searchTimer: null,

      // 自动刷新
      autoRefresh: false,
      refreshInterval: 30,
      refreshTimer: null,

      // 弹窗相关
      showDetailDialog: false,
      selectedLog: null,

      // 日志文件相关数据
      logFiles: [],
      selectedService: '',
      fileStartDate: '',
      fileEndDate: '',
      showFileDialog: false,
      loadingFiles: false,
      downloadingFile: null,

      // 文件内容相关数据
      showFileContentDialog: false,
      fileContent: [],
      currentFile: null,
      contentLoading: false,

      // 文件内容筛选和搜索
      contentSearchKeyword: '',
      contentFilterLevel: '',
      contentStartTime: '',
      contentEndTime: '',
      caseSensitiveSearch: false,

      // 分页相关
      contentPage: 1,
      contentPageSize: 100,

      // 文件分析结果
      fileAnalysis: null,

      adminMenuItems: [
        { path: '/admin', icon: '📄', label: '系统日志' }, // 首页就是日志
        { path: '/admin/create-teacher', icon: '📊', label: 'Excel导入教师' },
        { path: '/admin/create-student', icon: '👨‍🎓', label: '创建学生' },
        { path: '/admin/teacher-management', icon: '📋', label: '教师管理' },
        { path: '/admin/student-management', icon: '📝', label: '学生管理' },
      ],
    };
  },

  computed: {
    username () {
      return localStorage.getItem('username') || '管理员';
    },

    pageTitle () {
      const titles = {
        '/admin': '系统日志',
        '/admin/create-teacher': 'Excel导入教师',
        '/admin/create-student': '创建学生',
        '/admin/teacher-management': '教师管理',
        '/admin/student-management': '学生管理'
      };
      return titles[this.$route.path] || '系统日志';
    },

    // 过滤后的文件内容
    filteredFileContent () {
      let content = [...this.fileContent]

      // 按级别过滤
      if (this.contentFilterLevel) {
        content = filterLogContentByLevel(content, this.contentFilterLevel)
      }

      // 按时间过滤
      if (this.contentStartTime || this.contentEndTime) {
        content = filterLogContentByTime(content, this.contentStartTime, this.contentEndTime)
      }

      // 按关键词过滤
      if (this.contentSearchKeyword.trim()) {
        const keyword = this.caseSensitiveSearch
          ? this.contentSearchKeyword
          : this.contentSearchKeyword.toLowerCase()

        content = content.filter(line => {
          const searchLine = this.caseSensitiveSearch ? line : line.toLowerCase()
          return searchLine.includes(keyword)
        })
      }

      return content
    },

    // 分页后的内容
    paginatedFileContent () {
      const start = (this.contentPage - 1) * this.contentPageSize
      const end = start + this.contentPageSize
      return this.filteredFileContent.slice(start, end)
    },

    // 内容总页数
    contentTotalPages () {
      return Math.ceil(this.filteredFileContent.length / this.contentPageSize)
    },

    totalPages () {
      return Math.ceil(this.totalCount / this.pageSize)
    },

    visiblePages () {
      const pages = []
      const total = this.totalPages
      const current = this.currentPage

      for (let i = Math.max(1, current - 2); i <= Math.min(total, current + 2); i++) {
        pages.push(i)
      }
      return pages
    },

    logStats () {
      const stats = { info: 0, warning: 0, error: 0, debug: 0 }
      this.filteredLogs.forEach(log => {
        const level = log.level.toLowerCase()
        if (stats.hasOwnProperty(level)) {
          stats[level]++
        }
      })
      return stats
    },
  },

  mounted () {
    console.log('🏠 AdminHome组件已挂载');
    console.log('🛤️ 当前路由:', this.$route.path);
    // 初始化数据
    this.loadData();
    this.loadLogs();
    this.loadLogServices();
  },

  beforeUnmount () {
    this.stopAutoRefresh();
  },

  methods: {
    handleMenuClick (item) {
      console.log('🔄 菜单点击:', item.label);

      if (item.path !== this.$route.path) {
        this.$router.push(item.path);
      }

      this.closeMobileMenu();
      this.showQuickTipMessage(`已切换到 ${item.label}`);
    },

    quickCreateTeacher () {
      console.log('🎯 Excel批量导入教师');
      this.$router.push('/admin/create-teacher');
      this.closeMobileMenu();
      this.showQuickTipMessage('📊 进入Excel批量导入教师页面');
    },

    quickCreateStudent () {
      console.log('🎯 快速创建学生');
      this.$router.push('/admin/create-student');
      this.closeMobileMenu();
      this.showQuickTipMessage('🚀 开始创建学生');
    },

    viewTeachers () {
      this.$router.push('/admin/teachers');
      this.showQuickTipMessage('📋 查看教师列表');
    },

    viewStudents () {
      this.$router.push('/admin/students');
      this.showQuickTipMessage('📝 查看学生列表');
    },

    toggleMobileMenu () {
      this.mobileMenuOpen = !this.mobileMenuOpen;
      console.log('📱 切换移动端菜单:', this.mobileMenuOpen);
    },

    closeMobileMenu () {
      this.mobileMenuOpen = false;
      console.log('📱 关闭移动端菜单');
    },

    showQuickTipMessage (message) {
      this.quickTipMessage = message;
      this.showQuickTip = true;
      console.log('💡 显示提示:', message);

      setTimeout(() => {
        this.showQuickTip = false;
      }, 2000);
    },

    // 获取科目数量
    getSubjectCount () {
      const subjects = new Set();
      this.data.teachers.forEach(teacher => {
        if (teacher.subject) {
          subjects.add(teacher.subject);
        }
      });
      return subjects.size;
    },

    // 获取活跃班级数量
    getActiveClassCount () {
      const classes = new Set();
      this.data.students.forEach(student => {
        if (student.className) {
          classes.add(student.className);
        }
      });
      return classes.size;
    },

    // 加载数据
    loadData () {
      try {
        const teachers = JSON.parse(localStorage.getItem('teachers')) || [];
        const students = JSON.parse(localStorage.getItem('students')) || [];

        this.data = {
          teachers,
          students
        };

        console.log('📊 数据加载完成:', {
          teachers: teachers.length,
          students: students.length
        });
      } catch (error) {
        console.error('❌ 数据加载失败:', error);
        this.data = {
          teachers: [],
          students: []
        };
      }
    },

    // 日志相关方法
    async loadLogs () {
      try {
        this.loading = true
        // 使用API获取真实日志数据而非模拟数据
        const response = await getLogs(
          this.currentPage,
          this.pageSize,
          {
            service: this.selectedService,
            level: this.selectedLevel,
            module: this.selectedModule,
            start_time: this.getTimeRangeDate(this.timeRange),
            search: this.searchKeyword || undefined
          }
        )
        this.logs = response.logs || []
        this.totalCount = response.total || 0

        // 无需手动过滤，已由后端API完成
        this.filteredLogs = this.logs
      } catch (error) {
        console.error('加载日志失败:', error)
        this.showQuickTipMessage('❌ 加载日志失败: ' + error.message)
        this.logs = []
        this.filteredLogs = []
      } finally {
        this.loading = false
      }
    },

    // 添加时间范围转换方法
    getTimeRangeDate (range) {
      if (range === 'all') return undefined

      const now = new Date()
      let startTime

      switch (range) {
        case '1h':
          startTime = new Date(now.getTime() - 60 * 60 * 1000)
          break
        case '24h':
          startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000)
          break
        case '7d':
          startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case '30d':
          startTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          break
        default:
          return undefined
      }

      return startTime.toISOString()
    },

    // 修改 applyFilters 方法，使用API进行筛选
    async applyFilters () {
      try {
        this.loading = true
        await this.loadLogs() // 重新加载数据，传递筛选参数
      } catch (error) {
        console.error('应用筛选失败:', error)
        this.showQuickTipMessage('❌ 筛选失败: ' + error.message)
      } finally {
        this.loading = false
      }
    },

    handleSearch () {
      if (this.searchTimer) {
        clearTimeout(this.searchTimer)
      }

      this.searchTimer = setTimeout(() => {
        this.applyFilters()
      }, 300)
    },

    // 修改handlePageChange方法
    async handlePageChange (page) {
      this.currentPage = page
      await this.loadLogs() // 重新加载当前页数据
    },

    async refreshLogs () {
      await this.loadLogs()
      this.showQuickTipMessage('🔄 日志已刷新')
    },

    toggleAutoRefresh () {
      if (this.autoRefresh) {
        this.startAutoRefresh()
      } else {
        this.stopAutoRefresh()
      }
    },

    startAutoRefresh () {
      this.refreshTimer = setInterval(() => {
        this.loadLogs()
      }, this.refreshInterval * 1000)
    },

    stopAutoRefresh () {
      if (this.refreshTimer) {
        clearInterval(this.refreshTimer)
        this.refreshTimer = null
      }
    },

    showLogDetail (log) {
      this.selectedLog = log
      this.showDetailDialog = true
    },

    closeLogDetail () {
      this.showDetailDialog = false
      this.selectedLog = null
    },

    exportLogs () {
      const csvContent = this.generateCSV()
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `logs_${new Date().toISOString().split('T')[0]}.csv`
      link.click()
      this.showQuickTipMessage('📥 日志导出成功')
    },

    generateCSV () {
      const headers = ['时间', '级别', '模块', '用户', '消息']
      const rows = this.filteredLogs.map(log => [
        this.formatFullTime(log.timestamp),
        log.level,
        log.module,
        log.user || '',
        log.message.replace(/,/g, ';')
      ])

      return [headers, ...rows].map(row => row.join(',')).join('\n')
    },

    clearLogs () {
      if (confirm('确定要清空所有日志吗？此操作不可撤销！')) {
        this.logs = []
        this.filteredLogs = []
        this.showQuickTipMessage('🗑️ 日志已清空')
      }
    },

    formatDate (timestamp) {
      return new Date(timestamp).toLocaleDateString('zh-CN')
    },

    formatTime (timestamp) {
      return new Date(timestamp).toLocaleTimeString('zh-CN')
    },

    formatFullTime (timestamp) {
      return new Date(timestamp).toLocaleString('zh-CN')
    },

    getLevelIcon (level) {
      const icons = {
        INFO: 'ℹ️',
        WARNING: '⚠️',
        ERROR: '❌',
        DEBUG: '🐛'
      }
      return icons[level] || '📝'
    },

    // 显示日志文件管理弹窗
    async showLogFiles () {
      if (!this.selectedService) {
        this.showQuickTipMessage('❌ 请先选择一个服务')
        return
      }

      this.showFileDialog = true
      await this.loadLogFiles()
    },

    // 加载日志文件列表
    async loadLogFiles () {
      if (!this.selectedService) return
      console.log('📁 加载日志文件:', this.selectedService);

      try {
        this.loadingFiles = true

        const params = {
          service_name: this.selectedService.name,
          start_date: this.fileStartDate || undefined,
          end_date: this.fileEndDate || undefined
        }

        const response = await getLogFiles(params)
        this.logFiles = response.files

        console.log('📁 加载日志文件成功:', response)

      } catch (error) {
        console.error('加载日志文件失败:', error)
        this.showQuickTipMessage('❌ 加载日志文件失败: ' + error.message)
        this.logFiles = []
      } finally {
        this.loadingFiles = false
      }
    },

    // 下载日志文件
    async downloadFile (file) {
      if (!this.selectedService) return

      try {
        this.downloadingFile = file.name

        const blob = await downloadLogFile(this.selectedService, file.name)
        triggerDownload(blob, file.name)

        this.showQuickTipMessage('📥 文件下载成功: ' + file.name)

      } catch (error) {
        console.error('下载文件失败:', error)
        this.showQuickTipMessage('❌ 下载失败: ' + error.message)
      } finally {
        this.downloadingFile = null
      }
    },

    // 关闭文件管理弹窗
    closeFileDialog () {
      this.showFileDialog = false
      this.logFiles = []
      this.fileStartDate = ''
      this.fileEndDate = ''
    },

    // 应用文件筛选
    async applyFileFilters () {
      await this.loadLogFiles()
    },

    // 格式化文件大小
    formatFileSize (size) {
      return formatFileSize(size)
    },

    // 格式化文件日期
    formatFileDate (date) {
      return formatFileDate(date)
    },

    // 计算文件总大小
    calculateTotalSize () {
      try {
        let totalBytes = 0

        this.logFiles.forEach(file => {
          const size = parseFloat(file.size)
          if (!isNaN(size)) {
            totalBytes += size
          }
        })

        return this.formatFileSize(totalBytes.toString())
      } catch (error) {
        return '计算中...'
      }
    },

    // 查看文件内容
    async viewFileContent (file) {
      if (!this.selectedService) return

      try {
        this.contentLoading = true
        this.currentFile = file
        this.showFileContentDialog = true

        const response = await getLogFileContent({
          service_name: this.selectedService,
          file_name: file.name
        })

        this.fileContent = response.content
        this.fileAnalysis = analyzeLogContent(this.fileContent)

        // 重置筛选条件
        this.contentPage = 1
        this.contentSearchKeyword = ''
        this.contentFilterLevel = ''
        this.contentStartTime = ''
        this.contentEndTime = ''

        this.showQuickTipMessage('📄 文件内容加载成功')

      } catch (error) {
        console.error('查看文件内容失败:', error)
        this.showQuickTipMessage('❌ 加载文件内容失败: ' + error.message)
        this.closeFileContentDialog()
      } finally {
        this.contentLoading = false
      }
    },

    // 关闭文件内容弹窗
    closeFileContentDialog () {
      this.showFileContentDialog = false
      this.fileContent = []
      this.currentFile = null
      this.fileAnalysis = null
      this.contentSearchKeyword = ''
      this.contentFilterLevel = ''
      this.contentStartTime = ''
      this.contentEndTime = ''
      this.contentPage = 1
    },

    // 搜索文件内容
    async searchFileContent () {
      if (!this.contentSearchKeyword.trim()) {
        this.contentPage = 1
        return
      }

      try {
        const results = await searchLogFileContent(
          this.selectedService,
          this.currentFile.name,
          this.contentSearchKeyword,
          this.caseSensitiveSearch
        )

        this.showQuickTipMessage(
          `🔍 找到 ${results.lines.length} 行，共 ${results.totalMatches} 个匹配`
        )

        this.contentPage = 1

      } catch (error) {
        console.error('搜索文件内容失败:', error)
        this.showQuickTipMessage('❌ 搜索失败: ' + error.message)
      }
    },

    // 高亮显示文本
    highlightText (text) {
      if (!this.contentSearchKeyword.trim()) return text

      return highlightKeywords(
        text,
        [this.contentSearchKeyword],
        this.caseSensitiveSearch
      )
    },

    // 解析日志行
    parseLogLine (line) {
      return parseLogLine(line)
    },

    // 内容分页处理
    handleContentPageChange (page) {
      this.contentPage = page
    },

    // 导出筛选后的内容
    exportFilteredContent () {
      if (!this.filteredFileContent.length) {
        this.showQuickTipMessage('❌ 没有可导出的内容')
        return
      }

      const content = this.filteredFileContent.join('\n')
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })

      const timestamp = new Date().toISOString().split('T')[0]
      const filename = `${this.currentFile.name}_filtered_${timestamp}.log`

      triggerDownload(blob, filename)
      this.showQuickTipMessage('📥 筛选内容导出成功')
    },

    // 加载服务列表
    async loadLogServices () {
      try {
        const response = await getLogServices();
        if (response && response.services && response.services.length > 0) {
          this.logServices = response.services;
          // 默认选择第一个服务
          this.selectedService = this.logServices[0].name;
          console.log('📋 服务列表加载成功:', this.logServices);
        } else {
          console.warn('📋 服务列表为空');
        }
      } catch (error) {
        console.error('❌ 加载服务列表失败:', error);
      }
    },
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
  gap: 8px;
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.teacher-btn {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.student-btn {
  background: linear-gradient(135deg, #f093fb, #f5576c);
  color: white;
}

.quick-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.btn-icon {
  font-size: 16px;
}

.btn-text {
  font-weight: 500;
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

/* 内容区域样式 */
.content-area {
  flex: 1;
  width: 100%;
  height: calc(100vh - 80px);
  margin: 0;
  padding: 0;
  background: #f8fafc;
  overflow: hidden;
  position: relative;
  display: flex; /* 添加flex布局 */
  flex-direction: column;
}

/* 日志管理容器 */
.logs-management {
  width: 100%;
  height: 100%;
  padding: 16px; /* 从24px减少到16px */
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px; /* 从20px减少到16px */
}

/* 日志头部样式 */
.logs-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 4px; /* 从8px减少到4px */
}

.header-left h1 {
  font-size: 28px; /* 从32px减少到28px */
  font-weight: 700;
  color: #1a202c;
  margin: 0 0 4px 0; /* 从8px减少到4px */
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.header-left p {
  color: #718096;
  margin: 0;
  font-size: 14px; /* 从16px减少到14px */
  font-weight: 400;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.refresh-btn {
  background: linear-gradient(135deg, #4299e1, #3182ce);
  color: white;
}

.files-btn {
  background: linear-gradient(135deg, #68d391, #48bb78);
  color: white;
}

.export-btn {
  background: linear-gradient(135deg, #48bb78, #38a169);
  color: white;
}

.clear-btn {
  background: linear-gradient(135deg, #f56565, #e53e3e);
  color: white;
}

.action-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* 筛选区域样式 */
.filter-section {
  background: white;
  padding: 16px; /* 从24px减少到16px */
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e2e8f0;
  flex-shrink: 0; /* 防止筛选区域被压缩 */
}

.filter-row {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  align-items: center;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-group label {
  font-weight: 500;
  color: #4a5568;
  white-space: nowrap;
  font-size: 14px;
}

.filter-group select {
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
  min-width: 120px;
  background: white;
  color: #4a5568;
  transition: all 0.3s ease;
}

.filter-group select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.search-group {
  flex: 1;
  min-width: 280px;
}

.search-input {
  width: 100%;
  padding: 10px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s ease;
  background: white;
}

.search-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.search-input::placeholder {
  color: #a0aec0;
}

/* 日志统计样式 */
.log-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); /* 从200px减少到180px */
  gap: 12px; /* 从16px减少到12px */
  flex-shrink: 0; /* 防止统计区域被压缩 */
}

.stat-item {
  background: white;
  padding: 16px; /* 从20px减少到16px */
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 12px; /* 从16px减少到12px */
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e2e8f0;
  position: relative;
  overflow: hidden;
}

.stat-icon {
  font-size: 24px; /* 从28px减少到24px */
  opacity: 0.8;
}

.stat-count {
  font-weight: 700;
  font-size: 20px; /* 从24px减少到20px */
  color: #1a202c;
  margin-left: auto;
}

/* 日志表格卡片样式 - 这是关键部分，让它占据剩余的所有空间 */
.logs-table-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e2e8f0;
  flex: 1; /* 占据剩余所有空间 */
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 400px; /* 设置最小高度 */
  height: 0; /* 配合flex: 1使用 */
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px; /* 从20px 24px减少到16px 20px */
  border-bottom: 1px solid #e2e8f0;
  background: #f7fafc;
  flex-shrink: 0; /* 防止头部被压缩 */
}

/* 表格容器样式 - 让它占据卡片内的主要空间 */
.table-container {
  flex: 1;
  overflow: auto;
  min-height: 0; /* 重要：允许容器收缩 */
  height: 0; /* 配合flex: 1使用 */
}

/* 日志表格样式 - 优化行高 */
.logs-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.logs-table th,
.logs-table td {
  padding: 12px 10px; /* 从16px 12px减少到12px 10px */
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
  vertical-align: top; /* 确保内容顶部对齐 */
}

.logs-table th {
  background: #f7fafc;
  color: #2d3748;
  font-weight: 600;
  position: sticky;
  top: 0;
  z-index: 10;
  font-size: 12px; /* 从13px减少到12px */
  text-transform: uppercase;
  letter-spacing: 0.5px;
  height: 40px; /* 固定表头高度 */
}

/* 时间单元格样式优化 */
.time-cell {
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 11px; /* 从12px减少到11px */
  min-width: 140px; /* 从160px减少到140px */
}

.time-display .date {
  color: #4a5568;
  font-weight: 500;
  line-height: 1.2;
}

.time-display .time {
  color: #718096;
  margin-top: 1px; /* 从2px减少到1px */
  line-height: 1.2;
}

/* 级别徽章优化 */
.level-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 8px; /* 从6px 10px减少到4px 8px */
  border-radius: 12px; /* 从16px减少到12px */
  font-size: 10px; /* 从11px减少到10px */
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  gap: 3px; /* 从4px减少到3px */
}

/* 消息内容优化 */
.message-content {
  cursor: pointer;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2; /* 允许显示2行 */
  -webkit-box-orient: vertical;
  white-space: normal; /* 改为允许换行 */
  color: #4a5568;
  transition: all 0.2s ease;
  padding: 4px 6px; /* 从4px 8px减少到4px 6px */
  border-radius: 4px;
  line-height: 1.3;
  max-height: 2.6em; /* 限制最大高度为2行 */
}

/* 分页样式优化 */
.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px; /* 从16px 24px减少到12px 20px */
  border-top: 1px solid #e2e8f0;
  background: #f7fafc;
  flex-shrink: 0; /* 防止分页区域被压缩 */
  min-height: 50px; /* 设置最小高度 */
}

/* 操作按钮优化 */
.detail-btn {
  padding: 4px 10px; /* 从6px 12px减少到4px 10px */
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 4px; /* 从6px减少到4px */
  cursor: pointer;
  font-size: 11px; /* 从12px减少到11px */
  font-weight: 500;
  transition: all 0.3s ease;
}

/* 响应式优化 - 移动端进一步压缩 */
@media (max-width: 768px) {
  .logs-management {
    padding: 12px; /* 进一步减少 */
    gap: 12px;
  }

  .logs-header {
    flex-direction: column;
    gap: 12px; /* 从16px减少到12px */
    align-items: stretch;
  }

  .header-left h1 {
    font-size: 22px; /* 从24px减少到22px */
  }

  .filter-section {
    padding: 12px; /* 从16px减少到12px */
  }

  .log-stats {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px; /* 从12px减少到8px */
  }

  .stat-item {
    padding: 12px; /* 从16px减少到12px */
  }

  .logs-table th,
  .logs-table td {
    padding: 8px 6px; /* 从12px 8px减少到8px 6px */
  }

  .time-cell {
    min-width: 100px; /* 从120px减少到100px */
  }

  .message-cell {
    max-width: 150px; /* 从200px减少到150px */
  }

  .pagination {
    padding: 8px 12px; /* 进一步减少 */
    flex-direction: column;
    gap: 8px; /* 从12px减少到8px */
  }
}

/* 添加表格行高度限制 */
.logs-table tbody tr {
  transition: all 0.2s ease;
  height: 60px; /* 固定行高 */
}

.logs-table tbody tr:hover {
  background: #f0f7ff;
}

/* 确保内容区域使用所有可用空间 */
.content-area {
  flex: 1;
  width: 100%;
  height: calc(100vh - 80px);
  margin: 0;
  padding: 0;
  background: #f8fafc;
  overflow: hidden;
  position: relative;
  display: flex; /* 添加flex布局 */
  flex-direction: column;
}

/* 加载和无数据状态优化 */
.loading-row,
.no-data {
  text-align: center;
  padding: 60px 20px; /* 增加padding让状态更明显 */
  color: #718096;
}

.loading-spinner {
  display: inline-block;
  font-size: 24px; /* 增大加载图标 */
  animation: spin 1s linear infinite;
  margin-right: 12px;
}

.no-data {
  color: #a0aec0;
  font-style: italic;
  font-size: 18px; /* 增大无数据提示 */
}

/* 文件管理按钮样式 */
.files-btn {
  background: linear-gradient(135deg, #9f7aea, #805ad5);
  color: white;
}

.files-btn:disabled {
  background: #cbd5e0;
  color: #a0aec0;
}

/* 文件管理弹窗样式 */
.file-dialog-modal {
  background: white;
  width: 90%;
  max-width: 900px;
  max-height: 80vh;
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: modalSlideUp 0.3s ease;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e2e8f0;
  background: #f7fafc;
}

.service-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.service-name {
  background: #667eea;
  color: white;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
}

/* 文件筛选样式 */
.file-filters {
  padding: 16px 24px;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
}

.date-input {
  padding: 6px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
  min-width: 140px;
}

.date-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
}

.filter-btn {
  padding: 6px 16px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
}

.filter-btn:hover:not(:disabled) {
  background: #5a67d8;
}

.filter-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 文件列表容器 */
.file-list-container {
  flex: 1;
  overflow-y: auto;
  min-height: 300px;
}

.loading-files,
.no-files {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #718096;
}

.no-files-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

/* 文件列表样式 */
.file-list {
  display: flex;
  flex-direction: column;
}

.file-list-header {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 16px;
  padding: 16px 24px;
  background: #f7fafc;
  border-bottom: 2px solid #e2e8f0;
  font-weight: 600;
  color: #4a5568;
  font-size: 14px;
}

.file-item {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 16px;
  padding: 16px 24px;
  border-bottom: 1px solid #e2e8f0;
  transition: all 0.2s ease;
  align-items: center;
}

.file-item:hover {
  background: #f0f7ff;
}

.file-info.name {
  display: flex;
  align-items: center;
  gap: 8px;
}

.file-icon {
  font-size: 16px;
}

.file-name {
  font-weight: 500;
  color: #2d3748;
  word-break: break-all;
}

.file-info.date,
.file-info.size {
  color: #4a5568;
  font-size: 14px;
}

.download-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: linear-gradient(135deg, #48bb78, #38a169);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.3s ease;
  min-width: 80px;
}

.download-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #38a169, #2f855a);
  transform: translateY(-1px);
}

.download-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

/* 文件统计样式 */
.file-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: #f7fafc;
  border-top: 1px solid #e2e8f0;
  font-size: 14px;
  color: #4a5568;
}

/* 响应式优化 */
@media (max-width: 768px) {
  .file-dialog-modal {
    width: 95%;
    max-height: 90vh;
  }

  .file-list-header,
  .file-item {
    grid-template-columns: 1fr;
    gap: 8px;
    padding: 12px 16px;
  }

  .file-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .file-info.name {
    font-weight: 600;
    color: #2d3748;
  }

  .file-stats {
    flex-direction: column;
    gap: 8px;
    align-items: flex-start;
  }
}

/* 查看按钮样式 */
.view-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.3s ease;
  min-width: 70px;
  margin-right: 8px;
}

.view-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #5a67d8, #6b46c1);
  transform: translateY(-1px);
}

/* 文件内容弹窗样式 */
.file-content-modal {
  background: white;
  width: 95%;
  max-width: 1200px;
  height: 90vh;
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: modalSlideUp 0.3s ease;
}

.file-title {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.file-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.service-tag {
  background: #667eea;
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
}

.size-info {
  color: #718096;
  font-size: 12px;
}

/* 文件分析摘要样式 */
.file-analysis {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 12px 24px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  font-size: 14px;
  flex-wrap: wrap;
}

.analysis-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.analysis-item .label {
  color: #4a5568;
  font-weight: 500;
}

.analysis-item .value {
  color: #2d3748;
  font-weight: 600;
}

.level-stats {
  display: flex;
  gap: 12px;
  margin-left: auto;
}

.level-stat {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.level-stat.info {
  background: #bee3f8;
  color: #2c5282;
}

.level-stat.warning {
  background: #faf089;
  color: #744210;
}

.level-stat.error {
  background: #fed7d7;
  color: #742a2a;
}

.level-stat.debug {
  background: #e9d8fd;
  color: #553c9a;
}

/* 内容筛选样式 */
.content-filters {
  padding: 16px 24px;
  border-bottom: 1px solid #e2e8f0;
  background: white;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: 8px;
  font-size: 12px;
  color: #4a5568;
  cursor: pointer;
}

.search-btn,
.export-btn {
  padding: 6px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.search-btn {
  background: #667eea;
  color: white;
}

.export-btn {
  background: #48bb78;
  color: white;
  margin-left: 8px;
}

.search-btn:hover {
  background: #5a67d8;
}

.export-btn:hover {
  background: #38a169;
}

/* 内容显示区域 */
.content-display {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.loading-content,
.no-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  color: #718096;
  font-size: 16px;
}

.content-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.content-stats {
  padding: 12px 24px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  font-size: 14px;
  color: #4a5568;
}

.filter-info {
  color: #805ad5;
  font-style: italic;
}

/* 日志内容列表 */
.log-content-list {
  flex: 1;
  overflow-y: auto;
  font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
  font-size: 13px;
  line-height: 1.4;
}

.log-line {
  display: flex;
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.2s ease;
}

.log-line:hover {
  background: #f8fafc;
}

.log-line.error {
  background: rgba(254, 215, 215, 0.2);
}

.log-line.warning {
  background: rgba(255, 252, 191, 0.2);
}

.line-number {
  width: 60px;
  padding: 8px 12px;
  background: #f7fafc;
  color: #718096;
  text-align: right;
  border-right: 1px solid #e2e8f0;
  font-size: 12px;
  user-select: none;
  flex-shrink: 0;
}

.line-content {
  flex: 1;
  padding: 8px 16px;
  white-space: pre-wrap;
  word-break: break-all;
  color: #2d3748;
}

/* 关键词高亮样式 */
.line-content :deep(.log-highlight) {
  background: #fef08a;
  color: #92400e;
  padding: 1px 2px;
  border-radius: 2px;
  font-weight: 600;
}

/* 内容分页样式 */
.content-pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border-top: 1px solid #e2e8f0;
  background: #f8fafc;
}

.page-info {
  font-size: 14px;
  color: #4a5568;
  font-weight: 500;
}

/* 响应式优化 */
@media (max-width: 768px) {
  .file-content-modal {
    width: 98%;
    height: 95vh;
  }

  .file-analysis {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .level-stats {
    margin-left: 0;
  }

  .content-filters .filter-row {
    flex-direction: column;
    gap: 12px;
  }

  .line-number {
    width: 50px;
    padding: 6px 8px;
  }

  .line-content {
    padding: 6px 12px;
    font-size: 12px;
  }

  .log-content-list {
    font-size: 12px;
  }
}
</style>