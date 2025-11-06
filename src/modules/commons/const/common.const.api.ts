// src/utils/api.ts
import { message } from 'antd';
import axios from 'axios';

const api = axios.create({
	baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
	headers: {
		'Content-Type': 'application/json',
	},
});

api.interceptors.request.use(
	(config) => {
		if (typeof window !== 'undefined') {
			const token = localStorage.getItem('access_token');
			if (token) {
				config.headers.Authorization = `Bearer ${token}`;
			}
		}
		return config;
	},
	(error) => Promise.reject(error),
);

api.interceptors.response.use(
	(response) => {
		return response;
	},
	(error) => {
		if (error.response?.status === 401 && typeof window !== 'undefined') {
			localStorage.removeItem('access_token');
			window.location.href = '/login';
		}

		message.error(error.response.data.message);
		return Promise.reject(error.response?.data || error);
	},
);

export default api;
