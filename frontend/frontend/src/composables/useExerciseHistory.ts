import { ref, reactive } from 'vue'
import {
  getExerciseHistory,
  deleteExerciseHistory,
  batchDeleteExerciseHistory,
  extractTitleFromFilename,
  extractIdFromFilename,
  validateFilename,
  type ExerciseHistoryItem,
} from '@/api/teacher/exercise_history'
import { downloadExerciseFile } from '@/api/teacher/exercise_generate'

export function useExerciseHistory() {
  // 响应式数据
  const loading = ref(true)
  const errorMessage = ref('')
  const historyItems = ref<ExerciseHistoryItem[]>([])
  const selectedItems = ref<string[]>([])
  const searchQuery = ref('')
  
  // 删除状态管理
  const deleteLoading = ref(false)
  const batchDeleteLoading = ref(false)
  
  // 查询参数
  const queryParams = reactive({
    limit: 50,
    title_filter: '',
  })

  // 加载历史记录
  const loadHistory = async () => {
    try {
      loading.value = true
      errorMessage.value = ''

      const params = {
        limit: queryParams.limit,
        title_filter: queryParams.title_filter || undefined,
      }

      console.log('🔄 开始加载历史记录，参数:', params)

      const response = await getExerciseHistory(params)

      // 处理响应格式
      let items: ExerciseHistoryItem[] = []

      if (response && Array.isArray(response.exercises)) {
        items = response.exercises.map((item) => ({
          ...item,
          title: extractTitleFromFilename(item.filename),
          id: extractIdFromFilename(item.filename),
          file_size: item.size_kb ? Math.round(item.size_kb * 1024) : undefined,
          status: 'completed' as const,
          content_preview: `生成于 ${formatDate(item.created_at)}`,
          exercise_types: ['选择题'],
          exercise_count: 5,
        }))
      }

      historyItems.value = items
      console.log('📋 处理后的历史记录数量:', items.length)
    } catch (error: any) {
      console.error('💥 加载历史记录失败:', error)
      errorMessage.value = error.message || '加载失败，请重试'
      historyItems.value = []
    } finally {
      loading.value = false
    }
  }

  // 搜索习题
  const searchExercises = () => {
    if (searchQuery.value.trim()) {
      queryParams.title_filter = searchQuery.value
      loadHistory()
    } else {
      queryParams.title_filter = ''
      loadHistory()
    }
  }

  // 重置筛选
  const resetFilters = () => {
    searchQuery.value = ''
    queryParams.title_filter = ''
    queryParams.limit = 50
    loadHistory()
  }

  // 删除单个记录
  const deleteItem = async (item: ExerciseHistoryItem) => {
    if (!validateFilename(item.filename)) {
      alert('文件名格式不正确，无法删除')
      return
    }

    const confirmMessage = `确定要删除习题"${
      item.title || item.filename
    }"吗？\n\n⚠️ 此操作不可撤销，文件将被永久删除！`
    
    if (!confirm(confirmMessage)) {
      return
    }

    try {
      deleteLoading.value = true
      const result = await deleteExerciseHistory(item.filename)
      await loadHistory()
      
      const successMessage = result.message || '删除成功'
      alert(`✅ ${successMessage}`)
    } catch (error: any) {
      console.error('💥 删除失败:', error)
      alert(`❌ ${error.message || '删除失败，请重试'}`)
    } finally {
      deleteLoading.value = false
    }
  }

  // 批量删除
  const batchDelete = async () => {
    if (selectedItems.value.length === 0) {
      alert('请先选择要删除的文件')
      return
    }

    const selectedFilenames = historyItems.value
      .filter((item) => selectedItems.value.includes(item.id || item.filename))
      .map((item) => item.filename)

    const invalidFiles = selectedFilenames.filter((filename) => !validateFilename(filename))
    if (invalidFiles.length > 0) {
      alert(`以下文件名格式不正确，无法删除：\n${invalidFiles.join('\n')}`)
      return
    }

    const confirmMessage = `确定要删除选中的 ${
      selectedItems.value.length
    } 个习题吗？\n\n⚠️ 此操作不可撤销，所有选中的文件将被永久删除！`

    if (!confirm(confirmMessage)) {
      return
    }

    try {
      batchDeleteLoading.value = true
      await batchDeleteExerciseHistory(selectedFilenames)
      
      selectedItems.value = []
      await loadHistory()
      alert(`✅ 成功删除 ${selectedFilenames.length} 个文件`)
    } catch (error: any) {
      console.error('💥 批量删除失败:', error)
      alert(`❌ ${error.message || '批量删除失败，请重试'}`)
    } finally {
      batchDeleteLoading.value = false
    }
  }

  // 下载习题
  const downloadExercise = async (item: ExerciseHistoryItem) => {
    try {
      await downloadExerciseFile(item.filename)
    } catch (error: any) {
      console.error('下载失败:', error)
      alert(error.message || '下载失败，请重试')
    }
  }

  // 清除选择
  const clearSelection = () => {
    selectedItems.value = []
  }

  // 格式化日期
  const formatDate = (dateString: string): string => {
    if (!dateString) return '未知时间'
    try {
      return new Date(dateString).toLocaleString('zh-CN')
    } catch (error) {
      return dateString
    }
  }

  return {
    loading,
    errorMessage,
    historyItems,
    selectedItems,
    searchQuery,
    queryParams,
    deleteLoading,
    batchDeleteLoading,
    loadHistory,
    searchExercises,
    resetFilters,
    deleteItem,
    batchDelete,
    clearSelection,
    downloadExercise
  }
}