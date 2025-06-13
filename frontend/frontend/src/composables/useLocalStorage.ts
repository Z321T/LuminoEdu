import { ref, watch, Ref } from 'vue'

export function useLocalStorage<T>(
  key: string,
  defaultValue: T,
  options: {
    serializer?: {
      read: (value: string) => T
      write: (value: T) => string
    }
  } = {}
): [Ref<T>, (value: T) => void, () => void] {
  const {
    serializer = {
      read: JSON.parse,
      write: JSON.stringify
    }
  } = options

  // 从 localStorage 读取初始值
  const read = (): T => {
    try {
      const item = localStorage.getItem(key)
      if (item === null) return defaultValue
      return serializer.read(item)
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error)
      return defaultValue
    }
  }

  // 写入 localStorage
  const write = (value: T): void => {
    try {
      localStorage.setItem(key, serializer.write(value))
    } catch (error) {
      console.error(`Error writing localStorage key "${key}":`, error)
    }
  }

  // 删除 localStorage 项
  const remove = (): void => {
    try {
      localStorage.removeItem(key)
      storedValue.value = defaultValue
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error)
    }
  }

  const storedValue = ref<T>(read())

  // 监听值变化并自动保存
  watch(
    storedValue,
    (newValue) => {
      write(newValue)
    },
    { deep: true }
  )

  return [storedValue, (value: T) => { storedValue.value = value }, remove]
}

// 常用的 localStorage hooks
export function useLocalStorageString(key: string, defaultValue = '') {
  return useLocalStorage(key, defaultValue, {
    serializer: {
      read: (v: string) => v,
      write: (v: string) => v
    }
  })
}

export function useLocalStorageBoolean(key: string, defaultValue = false) {
  return useLocalStorage(key, defaultValue, {
    serializer: {
      read: (v: string) => v === 'true',
      write: (v: boolean) => String(v)
    }
  })
}