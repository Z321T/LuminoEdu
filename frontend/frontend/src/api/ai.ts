import axios from 'axios'

// 创建 axios 实例
const api = axios.create({
  baseURL: 'http://localhost:8000',
  timeout: 60000,
})

// 添加请求拦截器
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AIRequestParams {
  messages: AIMessage[];
  max_tokens: number;
  temperature: number;
  stream: boolean;
}

// 添加请求响应类型
export interface AIResponse {
  status: string;
  message: string;
  data?: string;
}
export const sendAIMessage = async (
  params: AIRequestParams,
  onChunk?: (chunk: string) => void
): Promise<string> => {
  const token = localStorage.getItem('token')
  const requestData = {
    messages: params.messages,
    max_tokens: params.max_tokens ?? 4096,
    temperature: params.temperature ?? 0.7,
    stream: params.stream ?? true
  }

  if (requestData.stream && onChunk) {
    // 用 fetch 处理流式 SSE
    const response = await fetch('http://localhost:8000/chat/stream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify(requestData)
    })

    if (!response.body) throw new Error('无响应流')
    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let result = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      const chunk = decoder.decode(value)
      // 处理 SSE 格式
      const lines = chunk.split('\n')
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6)
          if (data === '[DONE]') continue
          try {
            const parsed = JSON.parse(data)
            if (parsed.content) {
              result += parsed.content
              onChunk(parsed.content)
            }
          } catch {
            // 非 JSON 片段
            result += data
            onChunk(data)
          }
        }
      }
    }
    return result
  } else {
    // 非流式用 axios
    const res = await api.post('/chat/stream', requestData)
    return res.data?.data || ''
  }
}