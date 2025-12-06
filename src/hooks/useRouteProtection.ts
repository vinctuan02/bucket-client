'use client';

import { getDefaultRedirectPath } from '@/config/route-config';
import { useAuthStore } from '@/modules/commons/store/common.auth-store';
import {
	logUnauthorizedAccess,
	showUnauthorizedNotification,
	UnauthorizedReason,
} from '@/utils/rbac-error-handler';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Hook to protect routes based on user roles and permissions
 * Redirects unauthorized users to appropriate pages
 * Handles invalid/expired sessions by redirecting to login
 */
export function useRouteProtection() {
	const router = useRouter();
	const pathname = usePathname();
	const { user, isLoading, canAccessRoute } = useAuthStore();

	useEffect(() => {
		// Skip protection for public routes
		const publicRoutes = ['/login', '/register', '/forgot-password'];
		if (publicRoutes.includes(pathname)) {
			return;
		}

		// Skip if still loading user data
		if (isLoading) {
			return;
		}

		// Check if user is authenticated
		if (!user) {
			logUnauthorizedAccess(
				UnauthorizedReason.INVALID_SESSION,
				pathname,
				'/login',
			);
			showUnauthorizedNotification(UnauthorizedReason.INVALID_SESSION);
			router.push('/login');
			return;
		}

		// Check if user has any roles
		const userRoles = user.userRoles
			?.map((ur) => ur.role?.name)
			.filter(Boolean) as string[];

		if (!userRoles || userRoles.length === 0) {
			logUnauthorizedAccess(
				UnauthorizedReason.NO_ROLE,
				pathname,
				'/login',
				userRoles,
			);
			showUnauthorizedNotification(UnauthorizedReason.NO_ROLE);
			router.push('/login');
			return;
		}

		// Check if user can access the current route
		if (!canAccessRoute(pathname)) {
			const redirectPath = getDefaultRedirectPath(userRoles);
			logUnauthorizedAccess(
				UnauthorizedReason.INSUFFICIENT_PERMISSION,
				pathname,
				redirectPath,
				userRoles,
			);
			showUnauthorizedNotification(
				UnauthorizedReason.INSUFFICIENT_PERMISSION,
			);
			router.push(redirectPath);
		}
	}, [pathname, user, isLoading, canAccessRoute, router]);
}
