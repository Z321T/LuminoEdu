<!-- filepath: d:\git\LuminoEdu\frontend\frontend\src\components\home\RecentMessages.vue -->
<template>
  <div class="recent-messages-card">
    <div class="card-header">
      <h3>最新消息</h3>
      <div class="header-actions">
        <button
          class="mark-all-read"
          @click="markAllAsRead"
        >
          全部已读
        </button>
      </div>
    </div>

    <div class="messages-container">
      <div
        v-if="messages.length === 0"
        class="empty-messages"
      >
        <div class="empty-icon">📭</div>
        <p>暂无新消息</p>
      </div>

      <div
        v-else
        class="messages-list"
      >
        <div
          v-for="message in messages"
          :key="message.id"
          class="message-item"
          :class="{ unread: !message.read }"
          @click="markAsRead(message)"
        >
          <div class="message-avatar">
            <span>{{ getAvatarText(message.sender) }}</span>
          </div>

          <div class="message-content">
            <div class="message-header">
              <h4>{{ message.title }}</h4>
              <span class="message-time">
                {{ formatTime(message.time) }}
              </span>
            </div>

            <p class="message-text">{{ message.content }}</p>

            <div class="message-meta">
              <span class="message-sender">来自: {{ message.sender }}</span>
              <span
                v-if="message.type"
                class="message-type"
                :class="`type-${message.type}`"
              >
                {{ getTypeLabel(message.type) }}
              </span>
            </div>
          </div>

          <div
            v-if="!message.read"
            class="unread-indicator"
          ></div>
        </div>
      </div>
    </div>

    <div class="card-footer">
      <button
        class="view-all-btn"
        @click="$emit('viewAll')"
      >
        查看所有消息
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

interface MessageItem {
  id: number
  title: string
  content: string
  sender: string
  time: string
  read: boolean
  type?: 'system' | 'student' | 'admin' | 'notification'
}

interface Props {
  messages?: MessageItem[]
}

const props = withDefaults(defineProps<Props>(), {
  messages: () => [
    {
      id: 1,
      title: '新的作业提交',
      content: '学生张三提交了数学作业第三章练习题',
      sender: '张三',
      time: '2024-01-15T10:30:00',
      read: false,
      type: 'student',
    },
    {
      id: 2,
      title: '系统维护通知',
      content: '系统将于今晚22:00-24:00进行维护升级，请提前保存工作',
      sender: '系统管理员',
      time: '2024-01-15T09:15:00',
      read: false,
      type: 'system',
    },
    {
      id: 3,
      title: '课程评价反馈',
      content: '您的《高等数学》课程收到了新的学生评价',
      sender: '教务系统',
      time: '2024-01-14T16:45:00',
      read: true,
      type: 'notification',
    },
  ],
})

defineEmits<{
  viewAll: []
  markAsRead: [message: MessageItem]
  markAllAsRead: []
}>()

const markAsRead = (message: MessageItem) => {
  if (!message.read) {
    message.read = true
    // 这里可以发送API请求标记为已读
    console.log('标记消息为已读:', message.id)
  }
}

const markAllAsRead = () => {
  props.messages.forEach((message) => {
    message.read = true
  })
  console.log('标记所有消息为已读')
}

const getAvatarText = (sender: string): string => {
  // 添加空值检查和类型检查
  if (!sender || typeof sender !== 'string' || sender.length === 0) {
    return '?'
  }
  return sender.charAt(0).toUpperCase()
}

const formatTime = (timeString: string): string => {
  // 添加空值检查
  if (!timeString) return '未知时间'

  try {
    const time = new Date(timeString)
    // 检查日期是否有效
    if (isNaN(time.getTime())) {
      return '未知时间'
    }

    const now = new Date()
    const diffMs = now.getTime() - time.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 1) return '刚刚'
    if (diffMins < 60) return `${diffMins}分钟前`
    if (diffHours < 24) return `${diffHours}小时前`
    if (diffDays < 7) return `${diffDays}天前`

    return time.toLocaleDateString('zh-CN')
  } catch (error) {
    console.error('时间格式化错误:', error)
    return '未知时间'
  }
}

const getTypeLabel = (type: string): string => {
  const typeMap: Record<string, string> = {
    system: '系统',
    student: '学生',
    admin: '管理员',
    notification: '通知',
  }
  return typeMap[type] || type
}

// 点击外部关闭菜单
const handleClickOutside = (event: Event) => {
  // 这里可以添加其他需要处理的点击外部事件
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.recent-messages-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  height: fit-content;
  max-height: 600px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 24px 16px 24px;
  border-bottom: 1px solid #f0f0f0;
}

.card-header h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 18px;
  font-weight: 600;
}

.mark-all-read {
  background: none;
  border: 1px solid #3498db;
  color: #3498db;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.3s ease;
}

.mark-all-read:hover {
  background: #3498db;
  color: white;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  min-height: 200px;
}

.empty-messages {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #666;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.messages-list {
  padding: 16px 0;
}

.message-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px 24px;
  cursor: pointer;
  transition: background 0.3s ease;
  position: relative;
}

.message-item:hover {
  background: #f8f9fa;
}

.message-item.unread {
  background: #f0f8ff;
  border-left: 3px solid #3498db;
}

.message-avatar {
  width: 40px;
  height: 40px;
  background: #3498db;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 14px;
  flex-shrink: 0;
}

.message-content {
  flex: 1;
  min-width: 0;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
  gap: 12px;
}

.message-header h4 {
  margin: 0;
  color: #2c3e50;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.3;
  flex: 1;
}

.message-time {
  color: #999;
  font-size: 12px;
  white-space: nowrap;
  flex-shrink: 0;
}

.message-text {
  margin: 0 0 8px 0;
  color: #666;
  font-size: 13px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.message-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.message-sender {
  color: #999;
  font-size: 12px;
}

.message-type {
  background: #e9ecef;
  color: #6c757d;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 10px;
  font-weight: 500;
  text-transform: uppercase;
}

.message-type.type-system {
  background: #d1ecf1;
  color: #0c5460;
}

.message-type.type-student {
  background: #d4edda;
  color: #155724;
}

.message-type.type-admin {
  background: #f8d7da;
  color: #721c24;
}

.message-type.type-notification {
  background: #fff3cd;
  color: #856404;
}

.unread-indicator {
  width: 8px;
  height: 8px;
  background: #3498db;
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 4px;
}

.card-footer {
  padding: 16px 24px;
  border-top: 1px solid #f0f0f0;
  text-align: center;
}

.view-all-btn {
  background: none;
  border: 1px solid #667eea;
  color: #667eea;
  padding: 8px 24px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  width: 100%;
}

.view-all-btn:hover {
  background: #667eea;
  color: white;
}

.messages-container::-webkit-scrollbar {
  width: 4px;
}

.messages-container::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.messages-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 2px;
}

.messages-container::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

@media (max-width: 768px) {
  .card-header,
  .card-footer {
    padding-left: 20px;
    padding-right: 20px;
  }

  .message-item {
    padding-left: 20px;
    padding-right: 20px;
  }

  .message-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .message-time {
    align-self: flex-end;
  }
}
</style>