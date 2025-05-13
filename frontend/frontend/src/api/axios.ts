import axios from 'axios'

const http = axios.create({
  // baseURL: 'http://127.0.0.1:8000', // 假设这是您的API服务器地址
  //   timeout: 10000, // 设置超时时间（毫秒）
  //   headers: { 'Content-Type': 'application/json' }, // 设置默认的请求头
})

// 请求拦截器
http.interceptors.request.use(
  (config) => {
      // 在发送请求之前做些什么，例如添加认证令牌
      const token = localStorage.getItem('token')
      if (token) {
          config.headers.Authorization = `Bearer ${token}`
      }
      return config
  },
  (error) => {
      // 对请求错误做些什么
      return Promise.reject(error)
  }
)

// 响应拦截器
http.interceptors.response.use(
  (response) => {
      // 对响应数据做些什么
      return response
  },
  (error) => {
      // 对响应错误做些什么
      return Promise.reject(error)
  }
)

export default http