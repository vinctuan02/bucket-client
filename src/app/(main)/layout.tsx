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
			router.replace('/login');
		}

		(async () => {
			try {
				const res = await authApi.meDetails();
				setUser(res.data!);
			} catch {
				localStorage.removeItem('access_token');
				router.replace('/login');
			}
		})();
	}, [router, setUser]);

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
