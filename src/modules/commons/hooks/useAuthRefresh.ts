import { authApi } from '@/modules/auth/auth.api';
import { useEffect } from 'react';

export const useAuthRefresh = () => {
	useEffect(() => {
		const checkTokenExpiry = async () => {
			const accessToken = localStorage.getItem('access_token');
			const refreshToken = localStorage.getItem('refresh_token');

			if (!accessToken || !refreshToken) {
				return;
			}

			try {
				const decoded = JSON.parse(atob(accessToken.split('.')[1]));
				const expiresIn = decoded.exp * 1000;
				const now = Date.now();
				const timeUntilExpiry = expiresIn - now;

				// Refresh token 5 minutes before expiry
				if (timeUntilExpiry < 5 * 60 * 1000 && timeUntilExpiry > 0) {
					const res = await authApi.refreshToken({ refreshToken });
					const newAccessToken = res.data?.access_token;

					if (newAccessToken) {
						localStorage.setItem('access_token', newAccessToken);
					}
				}
			} catch (error) {
				console.error('Error checking token expiry:', error);
			}
		};

		// Check token expiry every minute
		const interval = setInterval(checkTokenExpiry, 60 * 1000);

		return () => clearInterval(interval);
	}, []);
};
