// types/user.ts

export interface BaseUserUUIDEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
  creatorId: string;
  modifierId: string;
  creator?: User | null;
  modifier?: User | null;
}

// ===== User =====
export interface User extends BaseUserUUIDEntity {
  name: string;
  email: string;
  password?: string;
  creator: User;
  modifier: User;
  userRoles?: UserRole[];
}

// ===== Permission =====
export interface Permission extends BaseUserUUIDEntity {
  name: string;
  action: string;
  resource: string;
  description: string;
  rolePermissions?: RolePermission[];
}

// ===== Role =====
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

// ===== UserRole =====
export interface UserRole extends BaseUserUUIDEntity {
  userId: string;
  roleId: string;
  user?: User;
  role?: Role;
}
