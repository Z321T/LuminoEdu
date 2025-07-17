<!-- filepath: d:\git\LuminoEdu\frontend\frontend\src\components\home\TodoList.vue -->
<template>
  <div class="todo-list-card">
    <div class="card-header">
      <h3>待办事项</h3>
      <div class="header-actions">
        <span class="todo-count">{{ pendingCount }}/{{ todos.length }}</span>
      </div>
    </div>

    <div class="todos-container">
      <div
        v-if="todos.length === 0"
        class="empty-todos"
      >
        <div class="empty-icon">✅</div>
        <p>暂无待办事项</p>
        <button
          class="add-first-todo"
          @click="showAddForm = true"
        >
          添加第一个任务
        </button>
      </div>

      <div
        v-else
        class="todos-list"
      >
        <div
          v-for="todo in sortedTodos"
          :key="todo.id"
          class="todo-item"
          :class="{ 
            completed: todo.completed,
            priority: todo.priority === 'high',
            overdue: isOverdue(todo)
          }"
        >
          <label class="todo-checkbox-wrapper">
            <input
              :id="`todo-${todo.id}`"
              v-model="todo.completed"
              type="checkbox"
              class="todo-checkbox"
              @change="updateTodo(todo)"
            />
            <span class="checkbox-custom"></span>
          </label>

          <div
            class="todo-content"
            @click="toggleTodo(todo)"
          >
            <div class="todo-text">{{ todo.text }}</div>
            <div
              v-if="todo.dueDate"
              class="todo-due-date"
            >
              📅 {{ formatDueDate(todo.dueDate) }}
            </div>
            <div
              v-if="todo.priority"
              class="todo-priority"
            >
              <span :class="`priority-${todo.priority}`">
                {{ getPriorityLabel(todo.priority) }}
              </span>
            </div>
          </div>

          <div class="todo-actions">
            <button
              class="todo-action-btn edit"
              @click="editTodo(todo)"
              title="编辑"
            >
              ✏️
            </button>
            <button
              class="todo-action-btn delete"
              @click="deleteTodo(todo)"
              title="删除"
            >
              🗑️
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 添加任务表单 -->
    <div
      v-if="showAddForm"
      class="add-todo-form"
    >
      <div class="form-row">
        <input
          v-model="newTodo.text"
          type="text"
          class="add-todo-input"
          placeholder="输入新的待办事项..."
          @keyup.enter="addTodo"
          @keyup.escape="cancelAdd"
          ref="addInput"
        />
      </div>

      <div class="form-row">
        <select
          v-model="newTodo.priority"
          class="priority-select"
        >
          <option value="">普通</option>
          <option value="high">重要</option>
          <option value="medium">中等</option>
          <option value="low">较低</option>
        </select>

        <input
          v-model="newTodo.dueDate"
          type="date"
          class="due-date-input"
        />
      </div>

      <div class="form-actions">
        <button
          class="form-btn confirm"
          @click="addTodo"
          :disabled="!newTodo.text.trim()"
        >
          ✅ 添加
        </button>
        <button
          class="form-btn cancel"
          @click="cancelAdd"
        >
          ❌ 取消
        </button>
      </div>
    </div>

    <div
      v-else
      class="card-footer"
    >
      <button
        class="add-todo-btn"
        @click="showAddForm = true"
      >
        ➕ 添加待办事项
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, watch, onMounted, onUnmounted } from 'vue'

interface TodoItem {
  id: number
  text: string
  completed: boolean
  priority?: 'high' | 'medium' | 'low'
  dueDate?: string
  createdAt: string
}

interface Props {
  todos?: TodoItem[]
}

const props = withDefaults(defineProps<Props>(), {
  todos: () => [
    {
      id: 1,
      text: '准备下周的课程材料',
      completed: false,
      priority: 'high',
      dueDate: '2024-01-20',
      createdAt: '2024-01-15T10:00:00',
    },
    {
      id: 2,
      text: '批改学生作业',
      completed: false,
      priority: 'medium',
      dueDate: '2024-01-18',
      createdAt: '2024-01-15T11:00:00',
    },
    {
      id: 3,
      text: '更新课程大纲',
      completed: true,
      priority: 'low',
      createdAt: '2024-01-14T15:30:00',
    },
  ],
})

const showAddForm = ref(false)
const addInput = ref<HTMLInputElement>()

const newTodo = ref({
  text: '',
  priority: '' as 'high' | 'medium' | 'low' | '',
  dueDate: '',
})

const pendingCount = computed(() => props.todos.filter((todo) => !todo.completed).length)

const sortedTodos = computed(() => {
  return [...props.todos].sort((a, b) => {
    // 未完成的排在前面
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1
    }

    // 按优先级排序
    const priorityOrder = { high: 3, medium: 2, low: 1 }
    const aPriority = priorityOrder[a.priority || 'low'] || 0
    const bPriority = priorityOrder[b.priority || 'low'] || 0

    if (aPriority !== bPriority) {
      return bPriority - aPriority
    }

    // 按截止日期排序
    if (a.dueDate && b.dueDate) {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    }
    if (a.dueDate) return -1
    if (b.dueDate) return 1

    // 最后按创建时间排序
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })
})

const updateTodo = (todo: TodoItem) => {
  console.log('更新待办事项:', todo)
  // 这里可以发送API请求更新
}

const toggleTodo = (todo: TodoItem) => {
  todo.completed = !todo.completed
  updateTodo(todo)
}

const addTodo = async () => {
  if (!newTodo.value.text.trim()) return

  const todo: TodoItem = {
    id: Date.now(),
    text: newTodo.value.text.trim(),
    completed: false,
    priority: newTodo.value.priority || undefined,
    dueDate: newTodo.value.dueDate || undefined,
    createdAt: new Date().toISOString(),
  }

  props.todos.push(todo)

  // 重置表单
  newTodo.value = {
    text: '',
    priority: '',
    dueDate: '',
  }

  showAddForm.value = false

  console.log('添加待办事项:', todo)
}

const cancelAdd = () => {
  newTodo.value = {
    text: '',
    priority: '',
    dueDate: '',
  }
  showAddForm.value = false
}

const editTodo = (todo: TodoItem) => {
  // 简单的编辑实现
  const newText = prompt('编辑待办事项:', todo.text)
  if (newText && newText.trim()) {
    todo.text = newText.trim()
    updateTodo(todo)
  }
}

const deleteTodo = (todo: TodoItem) => {
  if (confirm('确定要删除这个待办事项吗？')) {
    const index = props.todos.indexOf(todo)
    if (index > -1) {
      props.todos.splice(index, 1)
    }
    console.log('删除待办事项:', todo.id)
  }
}

const isOverdue = (todo: TodoItem): boolean => {
  if (!todo.dueDate || todo.completed) return false
  return new Date(todo.dueDate) < new Date()
}

const formatDueDate = (dateString: string): string => {
  const date = new Date(dateString)
  const today = new Date()
  const diffDays = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return '今天'
  if (diffDays === 1) return '明天'
  if (diffDays === -1) return '昨天'
  if (diffDays > 0) return `${diffDays}天后`
  return `逾期${Math.abs(diffDays)}天`
}

const getPriorityLabel = (priority: string): string => {
  const labels = {
    high: '🔴 重要',
    medium: '🟡 中等',
    low: '🟢 较低',
  }
  return labels[priority as keyof typeof labels] || priority
}

// 当显示添加表单时，自动聚焦输入框
watch(showAddForm, async (show) => {
  if (show) {
    await nextTick()
    addInput.value?.focus()
  }
})
</script>

<style scoped>
.todo-list-card {
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

.todo-count {
  background: #3498db;
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.todos-container {
  flex: 1;
  overflow-y: auto;
  min-height: 200px;
}

.empty-todos {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #666;
  text-align: center;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.add-first-todo {
  background: #3498db;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  margin-top: 16px;
  transition: background 0.3s ease;
}

.add-first-todo:hover {
  background: #2980b9;
}

.todos-list {
  padding: 16px 0;
}

.todo-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 24px;
  transition: all 0.3s ease;
  border-left: 3px solid transparent;
}

.todo-item:hover {
  background: #f8f9fa;
}

.todo-item.completed {
  opacity: 0.6;
}

.todo-item.priority {
  border-left-color: #e74c3c;
}

.todo-item.overdue {
  background: #fff5f5;
  border-left-color: #e74c3c;
}

.todo-checkbox-wrapper {
  display: flex;
  align-items: center;
  cursor: pointer;
  margin-top: 2px;
}

.todo-checkbox {
  display: none;
}

.checkbox-custom {
  width: 18px;
  height: 18px;
  border: 2px solid #ddd;
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  position: relative;
}

.todo-checkbox:checked + .checkbox-custom {
  background: #3498db;
  border-color: #3498db;
}

.todo-checkbox:checked + .checkbox-custom::after {
  content: '✓';
  color: white;
  font-size: 12px;
  font-weight: bold;
}

.todo-content {
  flex: 1;
  cursor: pointer;
}

.todo-text {
  font-size: 14px;
  color: #2c3e50;
  line-height: 1.4;
  margin-bottom: 4px;
}

.todo-item.completed .todo-text {
  text-decoration: line-through;
  color: #999;
}

.todo-due-date {
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}

.todo-item.overdue .todo-due-date {
  color: #e74c3c;
  font-weight: 500;
}

.todo-priority span {
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 3px;
  font-weight: 500;
}

.priority-high {
  background: #ffebee;
  color: #c62828;
}

.priority-medium {
  background: #fff8e1;
  color: #f57c00;
}

.priority-low {
  background: #e8f5e8;
  color: #2e7d32;
}

.todo-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.todo-item:hover .todo-actions {
  opacity: 1;
}

.todo-action-btn {
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  border-radius: 3px;
  font-size: 12px;
  transition: background 0.3s ease;
}

.todo-action-btn:hover {
  background: #f0f0f0;
}

.add-todo-form {
  padding: 20px 24px;
  border-top: 1px solid #f0f0f0;
  background: #f8f9fa;
}

.form-row {
  margin-bottom: 12px;
  display: flex;
  gap: 8px;
}

.add-todo-input {
  flex: 1;
  padding: 10px 12px;
  border: 2px solid #e1e8ed;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.3s ease;
}

.add-todo-input:focus {
  outline: none;
  border-color: #3498db;
}

.priority-select,
.due-date-input {
  padding: 8px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 13px;
}

.form-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.form-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.form-btn.confirm {
  background: #28a745;
  color: white;
}

.form-btn.confirm:hover:not(:disabled) {
  background: #218838;
}

.form-btn.confirm:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.form-btn.cancel {
  background: #6c757d;
  color: white;
}

.form-btn.cancel:hover {
  background: #545b62;
}

.card-footer {
  padding: 16px 24px;
  border-top: 1px solid #f0f0f0;
}

.add-todo-btn {
  background: #3498db;
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background 0.3s ease;
  width: 100%;
}

.add-todo-btn:hover {
  background: #2980b9;
}

.todos-container::-webkit-scrollbar {
  width: 4px;
}

.todos-container::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.todos-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 2px;
}

.todos-container::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

@media (max-width: 768px) {
  .card-header,
  .card-footer,
  .add-todo-form {
    padding-left: 20px;
    padding-right: 20px;
  }

  .todo-item {
    padding-left: 20px;
    padding-right: 20px;
  }

  .form-row {
    flex-direction: column;
  }

  .form-actions {
    justify-content: stretch;
  }

  .form-btn {
    flex: 1;
  }
}
</style>