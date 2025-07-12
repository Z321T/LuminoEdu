<<template>
  <div class="admin-layout">
    <!-- 侧边栏 -->
    <Sidebar :menu-items="adminMenuItems" />

    <!-- 主体内容 -->
    <div class="main">
      <!-- 顶部栏，添加退出按钮 -->
      <PageHeader title="管理系统">
        <template #actions>
          <div class="header-user">
            <span>欢迎，{{ username }}</span>
            <button class="logout-btn" @click="handleLogout">退出登录</button>
          </div>
        </template>
      </PageHeader>
      <section class="content">
        <div class="logs-management">
          <h1>日志文件管理</h1>
          <!-- 服务选择 -->
          <div class="filter-group">
            <label>选择服务：</label>
            <select v-model="selectedService" @change="loadLogFiles">
              <option v-for="service in logServices" :key="service.name" :value="service.name">
                {{ service.description }} ({{ service.name }})
              </option>
            </select>
          </div>
          <!-- 日期筛选 -->
          <div class="filter-group">
            <label>开始日期：</label>
            <input type="date" v-model="fileStartDate" @change="loadLogFiles" />
            <label>结束日期：</label>
            <input type="date" v-model="fileEndDate" @change="loadLogFiles" />
          </div>
          <!-- 文件列表 -->
          <div class="file-list">
            <div v-if="loadingFiles">加载中...</div>
            <div v-else-if="logFiles.length === 0">暂无日志文件</div>
            <ul v-else>
              <li v-for="file in logFiles" :key="file.name" class="file-item">
                <span class="file-name">{{ file.name }}</span>
                <span class="file-date">{{ formatFileDate(file.date) }}</span>
                <span class="file-size">{{ formatFileSize(file.size) }}</span>
                <button @click="downloadFile(file)" class="download-btn">下载</button>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Sidebar from '@/components/layout/Sidebar.vue'
import PageHeader from '@/components/layout/PageHeader.vue'
import {
  getLogServices,
  getLogFiles,
  downloadLogFile,
  formatFileDate,
  formatFileSize
} from '@/api/admin/admin_log'

const router = useRouter()
const username = ref(localStorage.getItem('username') || '管理员')

const adminMenuItems = [
  { path: '/admin/log_management', icon: '📝', label: '日志管理' }
]

const logServices = ref<{ name: string; description: string }[]>([])
const selectedService = ref('')
const fileStartDate = ref('')
const fileEndDate = ref('')
const logFiles = ref<any[]>([])
const loadingFiles = ref(false)

const handleLogout = () => {
  if (confirm('确定要退出登录吗？')) {
    localStorage.removeItem('token')
    router.push('/login')
  }
}

const loadLogServices = async () => {
  try {
    const res = await getLogServices()
    logServices.value = res.services
    if (res.services.length > 0) selectedService.value = res.services[0].name
  } catch {
    logServices.value = []
  }
}

const loadLogFiles = async () => {
  if (!selectedService.value) return
  loadingFiles.value = true
  try {
    const params = {
      service_name: selectedService.value,
      start_date: fileStartDate.value || undefined,
      end_date: fileEndDate.value || undefined,
    }
    const res = await getLogFiles(params)
    logFiles.value = res.files
  } catch {
    logFiles.value = []
  } finally {
    loadingFiles.value = false
  }
}

const downloadFile = async (file: any) => {
  try {
    const blob = await downloadLogFile(selectedService.value, file.name)
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = file.name
    link.click()
    URL.revokeObjectURL(link.href)
  } catch {
    alert('下载失败')
  }
}

onMounted(async () => {
  await loadLogServices()
  await loadLogFiles()
})
</script>

<style scoped>

.header-user {
  position: absolute;
  top: 24px;
  right: 48px;
  display: flex;
  align-items: center;
  gap: 16px;
  z-index: 10;
}

.logout-btn {
  background: #e74c3c;
  color: #fff;
  border: none;
  padding: 8px 20px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.3s;
  font-weight: 500;
}

.logout-btn:hover {
  background: #c0392b;
}

.admin-layout {
  display: flex;
  height: 100vh;
  width: 100vw;
  background: #f5f6fa;
  overflow: hidden;
}
.main {
  position: relative;
  flex: 1;
  margin-left: 240px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.content {
  flex: 1;
  padding: 32px;
  overflow-y: auto;
  width: 100%;
  box-sizing: border-box;
}
.logs-management {
  width: 100%;
  background: #fff;
  border-radius: 8px;
  padding: 32px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  box-sizing: border-box;
  min-height: 400px;
  display: flex;
  flex-direction: column;
}
.filter-group {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
}
.file-list {
  margin-top: 24px;
}
.file-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}
.file-name {
  flex: 1;
  font-weight: 500;
}
.file-date, .file-size {
  color: #718096;
  font-size: 13px;
  min-width: 120px;
}
.download-btn {
  background: #3182ce;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 4px 14px;
  cursor: pointer;
  font-size: 14px;
}
.download-btn:hover {
  background: #2563eb;
}
@media (max-width: 900px) {
  .main {
    margin-left: 60px;
  }
  .content {
    padding: 12px;
  }
  .logs-management {
    padding: 12px;
  }
}
</style>