'use client';

import { useRouteProtection } from '@/hooks/useRouteProtection';
import { useAuthStore } from '@/modules/commons/store/common.auth-store';
import { ReactNode } from 'react';

interface ProtectedLayoutProps {
	children: ReactNode;
}

/**
 * ProtectedLayout component that wraps the main layout
 * Applies route protection to all pages in the main layout
 * Ensures route protection runs on every page navigation
 * Handles loading states while checking permissions
 */
export function ProtectedLayout({ children }: ProtectedLayoutProps) {
	// Apply route protection middleware
	useRouteProtection();

	const { user } = useAuthStore();

	// Show loading state while user data is being loaded
	if (!user) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
					<p className="text-gray-600">Loading...</p>
				</div>
			</div>
		);
	}

	return <>{children}</>;
}
