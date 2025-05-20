import type { AxiosInstance ,AxiosResponse } from 'axios';
import axios from 'axios';
export interface LoginData {
    username: string; // 修改字段名为 username
    password: string;
    role: string; // 添加 role 字段
}

export interface LoginResponse {
     message: string;
    access_token: string;
    token_type: string;
    user_id: number;
    role: string;
    username: string;
}


export function login(data: LoginData, axiosInstance: AxiosInstance): Promise<LoginResponse> {
    return axiosInstance.post('/auth/login/', data)
        .then((response: AxiosResponse<LoginResponse>) => {
            const { data } = response;
            return data;
        })
        .catch((error) => {
            // 根据需要处理错误，例如记录日志、显示错误消息等
            console.error('Login failed:', error);
            throw new Error('Login failed');
        });
}