<!-- filepath: d:\git\LuminoEdu\frontend\frontend\src\components\home\QuickActions.vue -->
<template>
  <div class="quick-actions-card">
    <div class="card-header">
      <h3>快速操作</h3>
      <p>选择下面的操作快速开始</p>
    </div>

    <div class="actions-content">
      <div
        v-for="section in actionSections"
        :key="section.title"
        class="actions-section"
      >
        <h4>{{ section.title }}</h4>
        <div class="actions-grid">
          <button
            v-for="action in section.actions"
            :key="action.label"
            class="action-btn"
            :class="action.variant || 'default'"
            @click="action.action"
            :disabled="action.disabled"
          >
            <span class="action-icon">{{ action.icon }}</span>
            <div class="action-text">
              <span class="action-label">{{ action.label }}</span>
              <span
                v-if="action.description"
                class="action-description"
              >
                {{ action.description }}
              </span>
            </div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface ActionItem {
  icon: string
  label: string
  description?: string
  action: () => void
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'default'
  disabled?: boolean
}

interface ActionSection {
  title: string
  actions: ActionItem[]
}

interface Props {
  actionSections?: ActionSection[]
}

const props = withDefaults(defineProps<Props>(), {
  actionSections: () => [
    {
      title: '教学相关',
      actions: [
        {
          icon: '📝',
          label: '生成习题',
          description: '快速生成练习题',
          action: () => console.log('生成习题'),
          variant: 'primary',
        },
        {
          icon: '📊',
          label: '查看统计',
          description: '查看教学数据',
          action: () => console.log('查看统计'),
          variant: 'secondary',
        },
        {
          icon: '👥',
          label: '学生管理',
          description: '管理班级学生',
          action: () => console.log('学生管理'),
          variant: 'default',
        },
      ],
    },
    {
      title: '课程管理',
      actions: [
        {
          icon: '➕',
          label: '新建课程',
          description: '创建新的课程',
          action: () => console.log('新建课程'),
          variant: 'success',
        },
        {
          icon: '📚',
          label: '课程资料',
          description: '管理教学资料',
          action: () => console.log('课程资料'),
          variant: 'default',
        },
        {
          icon: '⚙️',
          label: '课程设置',
          description: '配置课程参数',
          action: () => console.log('课程设置'),
          variant: 'default',
        },
      ],
    },
  ],
})
</script>

<style scoped>
.quick-actions-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.card-header {
  padding: 24px 24px 16px 24px;
  border-bottom: 1px solid #f0f0f0;
}

.card-header h3 {
  margin: 0 0 8px 0;
  color: #2c3e50;
  font-size: 18px;
  font-weight: 600;
}

.card-header p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.actions-content {
  padding: 24px;
}

.actions-section {
  margin-bottom: 32px;
}

.actions-section:last-child {
  margin-bottom: 0;
}

.actions-section h4 {
  margin: 0 0 16px 0;
  color: #666;
  font-size: 14px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  position: relative;
  padding-left: 12px;
}

.actions-section h4::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 16px;
  background: #3498db;
  border-radius: 2px;
}

.actions-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: 1fr;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  background: #f8f9fa;
  border: 2px solid transparent;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
  width: 100%;
}

.action-btn:hover:not(:disabled) {
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-btn.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.action-btn.primary:hover:not(:disabled) {
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
}

.action-btn.secondary {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

.action-btn.success {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
}

.action-btn.warning {
  background: linear-gradient(135deg, #ffd89b 0%, #19547b 100%);
  color: white;
}

.action-btn.danger {
  background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
  color: #721c24;
}

.action-btn.default:hover:not(:disabled) {
  background: #e9ecef;
  border-color: #dee2e6;
}

.action-icon {
  font-size: 24px;
  width: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.action-text {
  flex: 1;
}

.action-label {
  display: block;
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
}

.action-description {
  display: block;
  font-size: 13px;
  opacity: 0.8;
  line-height: 1.3;
}

@media (max-width: 768px) {
  .actions-content {
    padding: 20px;
  }

  .action-btn {
    padding: 14px 16px;
    gap: 12px;
  }

  .action-icon {
    font-size: 20px;
    width: 32px;
  }

  .action-label {
    font-size: 14px;
  }

  .action-description {
    font-size: 12px;
  }
}
</style>