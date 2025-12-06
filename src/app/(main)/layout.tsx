'use client';

import Header from '@/components/commons/c.header';
import Sidebar from '@/components/commons/c.sidebar';
import { ProtectedLayout } from '@/components/layout/ProtectedLayout';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { useEffect, useState } from 'react';
import './globals.css';
import './layout.scss';

import { authApi } from '@/modules/auth/auth.api';
import { useAuthRefresh } from '@/modules/commons/hooks/useAuthRefresh';
import { useAuthStore } from '@/modules/commons/store/common.auth-store';
import GlobalUploadProgress from '@/modules/home/components/upload-progress-global.c';
import { UploadProvider } from '@/modules/home/contexts/upload.context';
import { useRouter } from 'next/navigation';

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const [headerVisible, setHeaderVisible] = useState(true);
	const [lastScrollY, setLastScrollY] = useState(0);
	const router = useRouter();
	const setUser = useAuthStore((s) => s.setUser);
	const setIsLoading = useAuthStore((s) => s.setIsLoading);

	useAuthRefresh();

	useEffect(() => {
		const handleScroll = () => {
			const currentScrollY = window.scrollY;
			if (currentScrollY > 50 && currentScrollY > lastScrollY) {
				setHeaderVisible(false);
			} else {
				setHeaderVisible(true);
			}
			setLastScrollY(currentScrollY);
		};
		window.addEventListener('scroll', handleScroll);
		return () => window.removeEventListener('scroll', handleScroll);
	}, [lastScrollY]);

	useEffect(() => {
		const token = localStorage.getItem('access_token');
		if (!token) {
			setIsLoading(false);
			router.replace('/login');
			return;
		}

		(async () => {
			try {
				const res = await authApi.meDetails();
				console.log('Layout meDetails response:', res);
				console.log('Layout res.data:', res?.data);

				// res is ResponseSuccess object with data field
				if (res?.data) {
					console.log('Setting user:', res.data);
					setUser(res.data);
				} else {
					console.error('No user data returned from server:', res);
					localStorage.removeItem('access_token');
					router.replace('/login');
				}
			} catch (error) {
				console.error('Failed to fetch user details:', error);
				localStorage.removeItem('access_token');
				router.replace('/login');
			} finally {
				setIsLoading(false);
			}
		})();
	}, [router, setUser, setIsLoading]);

	return (
		<html lang="en">
			<body className="root-layout">
				<AntdRegistry>
					<ProtectedLayout>
						<UploadProvider>
							<Sidebar />
							<div className="layout-main">
								<div
									className={`layout-header ${headerVisible ? '' : 'hidden'}`}
								>
									<div className="header-wrapper">
										<Header />
									</div>
								</div>

								<div className="layout-header-space" />
								<main className="layout-content">
									{children}
								</main>
							</div>
							<GlobalUploadProgress />
						</UploadProvider>
					</ProtectedLayout>
				</AntdRegistry>
			</body>
		</html>
	);
}
