import axios from 'axios';
import { message } from 'antd';

const request = axios.create({
  baseURL: '/api', // 这里的 /api 会触发 vite.config.ts 里的代理
  timeout: 10000,
});

// 请求拦截器：自动带上 Token
request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// 响应拦截器：统一处理错误
request.interceptors.response.use(
  (response) => {
    // 假设后端返回格式: { code: 200, data: ..., msg: '...' }
    // 如果后端直接返回数据，这里可以直接 return response.data
    return response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      message.error('登录已过期，请重新登录');
      localStorage.removeItem('token');
      window.location.href = '/login';
    } else {
      message.error(error.message || '请求失败');
    }
    return Promise.reject(error);
  },
);

export default request;
