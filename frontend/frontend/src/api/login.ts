import type { AxiosPromise } from 'axios';
import http from './axios'

export interface LoginData {
    ID: string
    password: string
}

export interface LoginResponse {
    message: string
}

// export function login(data: LoginData): AxiosPromise<LoginResponse> {
//       return http.post('/api/login/', data)
// }

// 模拟登录请求
export function login(data: LoginData): Promise<LoginResponse> {
  return new Promise((resolve) => {
      // 模拟登录成功
      setTimeout(() => {
          resolve({
              message: "Login successful",
          });
      }, 1000); // 模拟网络延迟
  });
}