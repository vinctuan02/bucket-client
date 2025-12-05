'use client';

import { usePermission } from '@/hooks/usePermission';
import {
	PermissionAction,
	Resource,
} from '@/modules/permissions/permisson.enum';
import { ReactNode } from 'react';

interface PermissionGuardProps {
	action: PermissionAction;
	resource: Resource;
	children: ReactNode;
	fallback?: ReactNode;
}

/**
 * PermissionGuard component to conditionally render content based on user permissions
 *
 * @example
 * <PermissionGuard action={PermissionAction.READ} resource={Resource.USER}>
 *   <UserList />
 * </PermissionGuard>
 */
export function PermissionGuard({
	action,
	resource,
	children,
	fallback = null,
}: PermissionGuardProps) {
	const { can } = usePermission();

	if (!can(action, resource)) {
		return fallback;
	}

	return children;
}

interface RoleGuardProps {
	role: string;
	children: ReactNode;
	fallback?: ReactNode;
}

/**
 * RoleGuard component to conditionally render content based on user role
 *
 * @example
 * <RoleGuard role="admin">
 *   <AdminPanel />
 * </RoleGuard>
 */
export function RoleGuard({ role, children, fallback = null }: RoleGuardProps) {
	const { hasRole } = usePermission();

	if (!hasRole(role)) {
		return fallback;
	}

	return children;
}
