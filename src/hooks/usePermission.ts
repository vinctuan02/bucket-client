import { useAuthStore } from '@/modules/commons/store/common.auth-store';
import {
	PermissionAction,
	Resource,
} from '@/modules/permissions/permisson.enum';

export function usePermission() {
	const { hasPermission, hasRole } = useAuthStore();

	const can = (action: PermissionAction, resource: Resource): boolean => {
		return hasPermission(action, resource);
	};

	const canRead = (resource: Resource): boolean => {
		return hasPermission(PermissionAction.READ, resource);
	};

	const canCreate = (resource: Resource): boolean => {
		return hasPermission(PermissionAction.CREATE, resource);
	};

	const canUpdate = (resource: Resource): boolean => {
		return hasPermission(PermissionAction.UPDATE, resource);
	};

	const canDelete = (resource: Resource): boolean => {
		return hasPermission(PermissionAction.DELETE, resource);
	};

	const canManage = (resource: Resource): boolean => {
		return hasPermission(PermissionAction.MANAGE, resource);
	};

	return {
		can,
		canRead,
		canCreate,
		canUpdate,
		canDelete,
		canManage,
		hasRole,
	};
}
