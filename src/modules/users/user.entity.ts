// types/user.ts

import {
	BaseUserUUIDEntity,
	BaseUUIDEntity,
} from '../commons/entities/common.entity';
import { Role } from '../roles/role.entity';

export interface User extends BaseUUIDEntity {
	name: string;
	email: string;
	password?: string | null;
	avatar: string | null;
	// creator: User;
	// modifier: User;
	provider: string | null;
	providerId: string | null;
	userRoles?: UserRole[];
}

export interface UserRole extends BaseUserUUIDEntity {
	userId: string;
	roleId: string;
	user?: User;
	role?: Role;
}
