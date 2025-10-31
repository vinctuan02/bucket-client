export enum PermissionFieldMapping {
	NAME = 'permission.name',
	ACTION = 'permission.action',
	RESOURCE = 'permission.resource',
	DESCRIPTION = 'permission.description',
	CREATED_AT = 'permission.createdAt',
	UPDATED_AT = 'permission.updatedAt',
}

export enum PermissionAction {
	READ = 'read',
	CREATE = 'create',
	UPDATE = 'update',
	DELETE = 'delete',
	APPROVE = 'approve',
	EXPORT = 'export',
	MANAGE = 'manage',
}
