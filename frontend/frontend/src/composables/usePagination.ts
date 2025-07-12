import { ref, computed, watch } from 'vue'

interface PaginationOptions {
  initialPage?: number
  initialPageSize?: number
  pageSizeOptions?: number[]
  total?: number
  autoScroll?: boolean
  scrollTarget?: string
}

export function usePagination(options: PaginationOptions = {}) {
  const {
    initialPage = 1,
    initialPageSize = 10,
    pageSizeOptions = [10, 20, 50, 100],
    total: initialTotal = 0,
    autoScroll = true,
    scrollTarget = 'body'
  } = options
  
  // 响应式状态
  const currentPage = ref(initialPage)
  const pageSize = ref(initialPageSize)
  const total = ref(initialTotal)
  const loading = ref(false)
  
  // 计算属性
  const totalPages = computed(() => Math.ceil(total.value / pageSize.value))
  
  const startIndex = computed(() => (currentPage.value - 1) * pageSize.value)
  const endIndex = computed(() => Math.min(startIndex.value + pageSize.value, total.value))
  
  const hasPrevPage = computed(() => currentPage.value > 1)
  const hasNextPage = computed(() => currentPage.value < totalPages.value)
  
  const pageInfo = computed(() => ({
    current: currentPage.value,
    size: pageSize.value,
    total: total.value,
    totalPages: totalPages.value,
    startIndex: startIndex.value + 1,
    endIndex: endIndex.value,
    hasPrev: hasPrevPage.value,
    hasNext: hasNextPage.value
  }))
  
  // 页码范围（用于显示页码按钮）
  const pageRange = computed(() => {
    const range: number[] = []
    const current = currentPage.value
    const totalPageCount = totalPages.value
    
    // 计算显示的页码范围
    let start = Math.max(1, current - 2)
    let end = Math.min(totalPageCount, current + 2)
    
    // 确保显示5个页码（如果可能）
    if (end - start < 4) {
      if (start === 1) {
        end = Math.min(totalPageCount, start + 4)
      } else if (end === totalPageCount) {
        start = Math.max(1, end - 4)
      }
    }
    
    for (let i = start; i <= end; i++) {
      range.push(i)
    }
    
    return range
  })
  
  // 跳转到指定页
  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages.value || page === currentPage.value) {
      return
    }
    
    currentPage.value = page
    
    // 自动滚动到顶部
    if (autoScroll) {
      scrollToTop()
    }
  }
  
  // 上一页
  const prevPage = () => {
    if (hasPrevPage.value) {
      goToPage(currentPage.value - 1)
    }
  }
  
  // 下一页
  const nextPage = () => {
    if (hasNextPage.value) {
      goToPage(currentPage.value + 1)
    }
  }
  
  // 第一页
  const firstPage = () => {
    goToPage(1)
  }
  
  // 最后一页
  const lastPage = () => {
    goToPage(totalPages.value)
  }
  
  // 改变每页显示数量
  const changePageSize = (size: number) => {
    if (size === pageSize.value || !pageSizeOptions.includes(size)) {
      return
    }
    
    // 计算新的页码，保持当前数据位置
    const currentIndex = startIndex.value
    pageSize.value = size
    currentPage.value = Math.floor(currentIndex / size) + 1
    
    if (autoScroll) {
      scrollToTop()
    }
  }
  
  // 设置总数
  const setTotal = (newTotal: number) => {
    total.value = newTotal
    
    // 如果当前页超出范围，跳转到最后一页
    if (currentPage.value > totalPages.value && totalPages.value > 0) {
      goToPage(totalPages.value)
    }
  }
  
  // 重置分页
  const reset = (options: Partial<PaginationOptions> = {}) => {
    currentPage.value = options.initialPage || 1
    pageSize.value = options.initialPageSize || initialPageSize
    total.value = options.total || 0
  }
  
  // 滚动到顶部
  const scrollToTop = () => {
    const target = scrollTarget === 'body' 
      ? document.body 
      : document.querySelector(scrollTarget)
    
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }
  
  // 获取当前页数据切片（用于前端分页）
  const getPageData = <T>(data: T[]): T[] => {
    const start = startIndex.value
    const end = endIndex.value
    return data.slice(start, end)
  }
  
  // 构建查询参数（用于API请求）
  const getQueryParams = () => ({
    page: currentPage.value,
    pageSize: pageSize.value,
    offset: startIndex.value,
    limit: pageSize.value
  })
  
  // 监听页码变化
  const onPageChange = (callback: (page: number) => void) => {
    watch(currentPage, callback, { immediate: true })
  }
  
  // 监听页面大小变化
  const onPageSizeChange = (callback: (size: number) => void) => {
    watch(pageSize, callback, { immediate: true })
  }
  
  return {
    // 状态
    currentPage: readonly(currentPage),
    pageSize: readonly(pageSize),
    total: readonly(total),
    loading,
    
    // 计算属性
    totalPages,
    pageInfo,
    pageRange,
    pageSizeOptions,
    
    // 方法
    goToPage,
    prevPage,
    nextPage,
    firstPage,
    lastPage,
    changePageSize,
    setTotal,
    reset,
    getPageData,
    getQueryParams,
    onPageChange,
    onPageSizeChange
  }
}

// 分页组件的 Props 类型
export interface PaginationProps {
  currentPage: number
  pageSize: number
  total: number
  pageSizeOptions?: number[]
  showSizeChanger?: boolean
  showQuickJumper?: boolean
  showTotal?: boolean
  simple?: boolean
  disabled?: boolean
}

// 分页组件的 Emits 类型
export interface PaginationEmits {
  'update:currentPage': [page: number]
  'update:pageSize': [size: number]
  'change': [page: number, size: number]
}