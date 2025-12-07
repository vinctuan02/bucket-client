'use client';

import { canAccessRouteByRoles } from '@/config/route-config';
import { useAuthStore } from '@/modules/commons/store/common.auth-store';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Home() {
	const router = useRouter();
	const { user, isLoading } = useAuthStore();
	const [hasRedirected, setHasRedirected] = useState(false);

	useEffect(() => {
		// Prevent multiple redirects
		if (hasRedirected) return;

		// Wait for auth to load
		if (isLoading) return;

		// If not authenticated, redirect to login
		if (!user) {
			setHasRedirected(true);
			router.replace('/login');
			return;
		}

		// Get user roles
		const userRoles =
			(user.userRoles
				?.map((ur) => ur.role?.name)
				.filter(Boolean) as string[]) || [];

		// If no roles, redirect to login
		if (userRoles.length === 0) {
			setHasRedirected(true);
			router.replace('/login');
			return;
		}

		// Route priority order
		const routePriority = [
			'/home',
			'/plans',
			'/users',
			'/roles',
			'/permissions',
			'/my-profile',
			'/storage',
			'/trash',
			'/app-config',
			'/share-with-me',
		];

		// Find first accessible route
		for (const route of routePriority) {
			if (canAccessRouteByRoles(route, userRoles)) {
				setHasRedirected(true);
				router.replace(route);
				return;
			}
		}

		// No accessible routes, redirect to login
		setHasRedirected(true);
		router.replace('/login');
	}, [user, isLoading, hasRedirected, router]);

	// Show loading while checking auth
	return null;
}
