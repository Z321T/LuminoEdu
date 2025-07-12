import type { AxiosInstance, AxiosResponse } from 'axios';

export interface LoginData {
  user_id: string;
  password: string;
}

export interface LoginResponse {
    detail?: any; // 兼容字符串或数组
    access_token?: string;
    token_type?: string;
    user_id?: string;
    role?: string;
    username?: string;
}


export function login(data: LoginData, axiosInstance: AxiosInstance): Promise<LoginResponse> {
    return axiosInstance.post('/auth/login/', data)
        .then((response: AxiosResponse<LoginResponse>) => {
            if (response.status === 200 && response.data.access_token) {
                return response.data;
            } else {
                // 兼容后端返回的 detail 结构
                return Promise.reject(response.data);
            }
        })
        .catch((error) => {
            // 兼容后端返回的 detail 结构
            let detail = error?.response?.data?.detail || error?.detail || error?.message || '未知错误';
            return Promise.reject({ detail });
        });
}