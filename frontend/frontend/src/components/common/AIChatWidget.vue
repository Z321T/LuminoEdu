<template>
  <div
    class="ai-chat-widget"
    :class="{ 'is-expanded': isExpanded }"
  >
    <!-- 悬浮按钮 -->
    <div
      class="widget-trigger"
      @click="toggleExpand"
    >
      <el-badge
        :value="unreadCount"
        :hidden="unreadCount === 0"
      >
        <el-button
          circle
          type="primary"
          size="large"
          class="ai-fab"
        >
          <i class="fas fa-robot"></i>
          <span class="ai-fab-text">AI</span>
        </el-button>
      </el-badge>
    </div>

    <!-- 聊天窗口 -->
    <div
      v-show="isExpanded"
      class="chat-window"
    >
      <div class="chat-header">
        <div class="ai-header">
          <img
            src="https://cdn.jsdelivr.net/gh/element-plus/element-plus@2.3.7/docs/public/robot.svg"
            class="ai-avatar"
          />
          <span class="ai-title">AI 问答助手</span>
          <span class="ai-badge">AI</span>
        </div>
        <el-button
          circle
          @click="toggleExpand"
        >
          <i class="fas fa-times"></i>
        </el-button>
      </div>

      <div
        class="chat-messages"
        ref="messageContainer"
      >
        <div
          v-for="(message, index) in messages"
          :key="index"
          class="message"
          :class="message.role"
        >
          <div
            class="message-meta"
            v-if="message.role === 'assistant'"
          >
            <span class="ai-badge">AI</span>
          </div>
          <div
            class="message-content"
            :class="{ 'streaming': message === messages[messages.length-1] && isSending }"
          >
            {{ message.content }}
          </div>
          <div class="message-time">{{ message.time }}</div>
        </div>
      </div>

      <div class="chat-input">
        <el-input
          v-model="inputMessage"
          placeholder="向 AI 助手提问..."
          :disabled="isSending"
          @keyup.enter="sendMessage"
        >
          <template #prepend>
            <i class="fas fa-robot ai-input-icon"></i>
          </template>
          <template #append>
            <el-button
              @click="sendMessage"
              :loading="isSending"
            >
              发送
            </el-button>
          </template>
        </el-input>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { sendAIMessage } from '@/api/ai'
import type { AIMessage } from '@/api/ai'

const isExpanded = ref(false)
const unreadCount = ref(0)
const inputMessage = ref('')
const isSending = ref(false)
const messages = ref<Array<AIMessage & { time: string }>>([])
const streamingMessage = ref<string>('')

const messageContainer = ref<HTMLElement | null>(null)

const toggleExpand = () => {
  isExpanded.value = !isExpanded.value
  if (isExpanded.value) {
    unreadCount.value = 0
  }
}

const scrollToBottom = async () => {
  await nextTick()
  if (messageContainer.value) {
    messageContainer.value.scrollTop = messageContainer.value.scrollHeight
  }
}

const sendMessage = async () => {
  if (!inputMessage.value.trim() || isSending.value) return

  const token = localStorage.getItem('token')
  if (!token) {
    ElMessage.error('请先登录')
    return
  }

  const userMessage = inputMessage.value
  inputMessage.value = ''

  // 构造消息对象
  const userMsg: AIMessage & { time: string } = {
    role: 'user',
    content: userMessage,
    time: new Date().toLocaleTimeString(),
  }
  messages.value.push(userMsg)

  await scrollToBottom()

  isSending.value = true
  try {
    let aiMessage: AIMessage & { time: string } = {
      role: 'teacher|student|admin',
      content: '',
      time: new Date().toLocaleTimeString(),
    }
    messages.value.push(aiMessage)

    await sendAIMessage(
      {
        messages: messages.value.map(({ role, content }) => ({
          role: role === 'user' ? 'user' : 'assistant',
          content,
        })),
        max_tokens: 4096,
        temperature: 0.7,
        stream: true,
      },
      (chunk) => {
        aiMessage.content += chunk
        scrollToBottom()
      }
    )
  } catch (error: any) {
    console.error('AI 对话请求失败:', error)
    if (error.response?.status === 422) {
      ElMessage.error('请求格式错误：' + (error.response.data?.detail?.[0]?.msg || '未知错误'))
    } else if (error.response?.status === 401) {
      ElMessage.error('登录已过期，请重新登录')
    } else {
      ElMessage.error(error.message || 'AI 服务异常')
    }
    messages.value.pop()
  } finally {
    isSending.value = false
  }
}

// 修改初始消息
onMounted(() => {
  messages.value.push({
    role: 'assistant',
    content: '你好！我是您的 AI 助手，有什么可以帮您的吗？',
    time: new Date().toLocaleTimeString(),
  })
})
</script>

<style scoped>
.ai-chat-widget {
  position: fixed;
  right: 20px;
  bottom: 20px;
  z-index: 1000;
}

.widget-trigger {
  cursor: pointer;
}

.chat-window {
  position: absolute;
  right: 0;
  bottom: 70px;
  width: 360px;
  height: 500px;
  background: #f8fafc;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0, 128, 255, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 2px solid #409eff;
}

.chat-header {
  padding: 10px 16px;
  background: #409eff;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.ai-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.ai-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #fff;
  border: 2px solid #fff;
}

.ai-title {
  font-weight: bold;
  font-size: 18px;
  letter-spacing: 1px;
}

.ai-badge {
  background: #fff;
  color: #409eff;
  font-size: 12px;
  font-weight: bold;
  border-radius: 8px;
  padding: 2px 8px;
  margin-left: 4px;
  border: 1px solid #409eff;
}

.chat-messages {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  background: #f5f7fa;
}

.message {
  margin-bottom: 16px;
  max-width: 80%;
  display: flex;
  flex-direction: column;
}

.message.user {
  margin-left: auto;
  align-items: flex-end;
}

.message.assistant {
  margin-right: auto;
  align-items: flex-start;
}

.message-meta {
  margin-bottom: 2px;
}

.message-content {
  padding: 10px 14px;
  border-radius: 12px;
  word-break: break-word;
  font-size: 15px;
  box-shadow: 0 1px 4px rgba(64, 158, 255, 0.07);
}

.user .message-content {
  background: #409eff;
  color: white;
}

.assistant .message-content {
  background: #fff;
  color: #222;
  border: 1px solid #dcdfe6;
}

.message-content.streaming {
  position: relative;
}

.message-content.streaming::after {
  content: '▋';
  display: inline-block;
  animation: blink 1s infinite;
  margin-left: 2px;
}

@keyframes blink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
}

.message-time {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
  text-align: right;
}

.chat-input {
  padding: 12px;
  background: #f8fafc;
  border-top: 1px solid #dcdfe6;
}

.ai-input-icon {
  color: #409eff;
  font-size: 18px;
}

.is-expanded {
  animation: bounce 0.3s ease;
}

@keyframes bounce {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

.ai-fab {
  position: relative;
  font-size: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: box-shadow 0.2s;
  box-shadow: 0 2px 12px rgba(64, 158, 255, 0.18);
}
.ai-fab-text {
  font-size: 14px;
  font-weight: bold;
  margin-left: 6px;
  color: #fff;
  letter-spacing: 1px;
  text-shadow: 0 1px 4px rgba(64, 158, 255, 0.18);
}
.ai-fab:hover {
  box-shadow: 0 4px 24px rgba(64, 158, 255, 0.25);
  background: linear-gradient(90deg, #409eff 60%, #53c0ff 100%);
}
</style>