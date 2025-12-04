'use client';

import { getDefaultRedirectPath } from '@/config/route-config';
import { useAuthStore } from '@/modules/commons/store/common.auth-store';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface ProtectedRouteProps {
	children: React.ReactNode;
	requiredRoles?: string[];
	requiredPermissions?: Array<{ action: string; resource: string }>;
	fallbackPath?: string;
}

/**
 * ProtectedRoute component that wraps pages requiring authorization
 * Checks user permissions before rendering children
 * Redirects to appropriate page if user lacks permissions
 */
export function ProtectedRoute({
	children,
	requiredRoles,
	requiredPermissions,
	fallbackPath,
}: ProtectedRouteProps) {
	const router = useRouter();
	const { user, hasRole, hasPermission } = useAuthStore();
	const [isAuthorized, setIsAuthorized] = useState(false);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		// Check if user is authenticated
		if (!user) {
			router.push('/login');
			return;
		}

		// Check role-based access
		if (requiredRoles && requiredRoles.length > 0) {
			const hasRequiredRole = requiredRoles.some((role) => hasRole(role));
			if (!hasRequiredRole) {
				const redirectPath =
					fallbackPath ||
					getDefaultRedirectPath(
						user.userRoles
							?.map((ur) => ur.role?.name)
							.filter(Boolean) as string[],
					);
				router.push(redirectPath);
				return;
			}
		}

		// Check permission-based access
		if (requiredPermissions && requiredPermissions.length > 0) {
			const hasAllPermissions = requiredPermissions.every((perm) =>
				hasPermission(perm.action, perm.resource),
			);
			if (!hasAllPermissions) {
				const redirectPath =
					fallbackPath ||
					getDefaultRedirectPath(
						user.userRoles
							?.map((ur) => ur.role?.name)
							.filter(Boolean) as string[],
					);
				router.push(redirectPath);
				return;
			}
		}

		setIsAuthorized(true);
		setIsLoading(false);
	}, [
		user,
		requiredRoles,
		requiredPermissions,
		hasRole,
		hasPermission,
		router,
		fallbackPath,
	]);

	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				Loading...
			</div>
		);
	}

	if (!isAuthorized) {
		return null;
	}

	return <>{children}</>;
}
