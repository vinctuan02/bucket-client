import { BaseUserUUIDEntity } from '../commons/entities/common.entity';
import { Permission } from '../permissions/permission.entity';
import { UserRole } from '../users/user.entity';

export interface Role extends BaseUserUUIDEntity {
	name: string;
	description?: string | null;
	userRoles?: UserRole[];
	rolePermissions?: RolePermission[];
}

// ===== RolePermission =====
export interface RolePermission extends BaseUserUUIDEntity {
	roleId: string;
	permissionId: string;
	role?: Role;
	permission?: Permission;
}
