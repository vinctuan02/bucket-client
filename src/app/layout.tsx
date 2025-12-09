'use client';

import DynamicFavicon from '@/components/DynamicFavicon';
import { authApi } from '@/modules/auth/auth.api';
import { useAuthStore } from '@/modules/commons/store/common.auth-store';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const pathname = usePathname();
	const setUser = useAuthStore((s) => s.setUser);
	const setIsLoading = useAuthStore((s) => s.setIsLoading);
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	useEffect(() => {
		// Skip auth check for public routes
		const publicRoutes = [
			'/login',
			'/register',
			'/forgot-password',
			'/verify-email',
		];
		if (publicRoutes.some((route) => pathname.startsWith(route))) {
			setIsLoading(false);
			return;
		}

		const token = localStorage.getItem('access_token');
		if (!token) {
			setIsLoading(false);
			return;
		}

		(async () => {
			try {
				const res = await authApi.meDetails();
				if (res?.data) {
					setUser(res.data);
				} else {
					localStorage.removeItem('access_token');
				}
			} catch (error) {
				console.error('Failed to fetch user details:', error);
				localStorage.removeItem('access_token');
			} finally {
				setIsLoading(false);
			}
		})();
	}, [pathname, setUser, setIsLoading]);

	return (
		<html lang="en">
			<body className="root-layout">
				{mounted && <DynamicFavicon />}
				{children}
			</body>
		</html>
	);
}
