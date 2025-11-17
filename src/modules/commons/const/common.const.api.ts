// src/utils/api.ts
import { message } from 'antd';
import axios from 'axios';

const api = axios.create({
	baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
	headers: {
		'Content-Type': 'application/json',
	},
});

let isRefreshing = false;
let failedQueue: Array<{
	resolve: (value: any) => void;
	reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
	failedQueue.forEach((prom) => {
		if (error) {
			prom.reject(error);
		} else {
			prom.resolve(token);
		}
	});

	isRefreshing = false;
	failedQueue = [];
};

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
	async (error) => {
		const originalRequest = error.config;

		if (
			error.response?.status === 401 &&
			typeof window !== 'undefined' &&
			!originalRequest._retry
		) {
			if (isRefreshing) {
				return new Promise((resolve, reject) => {
					failedQueue.push({ resolve, reject });
				})
					.then((token) => {
						originalRequest.headers.Authorization = `Bearer ${token}`;
						return api(originalRequest);
					})
					.catch((err) => {
						return Promise.reject(err);
					});
			}

			originalRequest._retry = true;
			isRefreshing = true;

			try {
				const refreshToken = localStorage.getItem('refresh_token');

				if (!refreshToken) {
					throw new Error('No refresh token');
				}

				const response = await axios.post(
					`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/auth/refresh-token`,
					{ refreshToken },
				);

				const { data } = response.data;
				const newAccessToken = data.accessToken;

				localStorage.setItem('access_token', newAccessToken);
				api.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
				originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

				processQueue(null, newAccessToken);
				return api(originalRequest);
			} catch (err) {
				processQueue(err, null);
				localStorage.removeItem('access_token');
				localStorage.removeItem('refresh_token');
				window.location.href = '/login';
				return Promise.reject(err);
			}
		}

		if (error.response?.data?.message) {
			message.error(error.response.data.message);
		}

		return Promise.reject(error.response?.data || error);
	},
);

export default api;
