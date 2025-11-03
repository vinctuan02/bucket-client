import { BaseUserUUIDEntity } from '../commons/entities/common.entity';
import { RolePermission } from '../roles/role.entity';

export interface Permission extends BaseUserUUIDEntity {
	name: string;
	action: string;
	resource: string;
	description: string;
	rolePermissions?: RolePermission[];
}
