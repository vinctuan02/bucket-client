# RBAC Sidebar Implementation Guide

## Overview

Sidebar hiện tại đã được cập nhật để sử dụng Role-Based Access Control (RBAC) dựa trên permissions thay vì hardcoded roles.

## Architecture

### 1. Permission System

- **PermissionAction**: Các hành động có thể thực hiện (READ, CREATE, UPDATE, DELETE, VIEW, MANAGE, SHARE)
- **Resource**: Các tài nguyên được bảo vệ (USER, ROLE, PERMISSION, FILE_NODE, STORAGE, TRASH, etc.)
- **Permission**: Kết hợp của Action + Resource

### 2. Role-Permission Mapping

```
User -> UserRole -> Role -> RolePermission -> Permission
```

### 3. Sidebar Item Structure

Mỗi item trong sidebar có thể có một `requiredPermission`:

```typescript
interface SidebarItem {
	display: string;
	icon: React.ReactNode;
	to: string;
	section: string;
	requiredPermission?: {
		action: PermissionAction;
		resource: Resource;
	};
}
```

## Usage

### Adding a New Sidebar Item with Permission Check

```typescript
{
  display: 'Users',
  icon: <Users size={18} strokeWidth={2.5} />,
  to: '/users',
  section: 'users',
  requiredPermission: {
    action: PermissionAction.READ,
    resource: Resource.USER,
  },
}
```

### Using usePermission Hook

```typescript
import { usePermission } from '@/hooks/usePermission';

export function MyComponent() {
	const {
		can,
		canRead,
		canCreate,
		canUpdate,
		canDelete,
		canManage,
		hasRole,
	} = usePermission();

	// Check specific permission
	if (can(PermissionAction.READ, Resource.USER)) {
		// User can read users
	}

	// Use convenience methods
	if (canRead(Resource.USER)) {
		// User can read users
	}

	if (canCreate(Resource.FILE_NODE)) {
		// User can create files/folders
	}

	if (hasRole('admin')) {
		// User has admin role
	}
}
```

### Using useAuthStore Directly

```typescript
import { useAuthStore } from '@/modules/commons/store/common.auth-store';

export function MyComponent() {
	const { hasPermission, hasRole, canAccessRoute } = useAuthStore();

	if (hasPermission(PermissionAction.READ, Resource.USER)) {
		// User can read users
	}

	if (hasRole('admin')) {
		// User has admin role
	}

	if (canAccessRoute('/users')) {
		// User can access /users route
	}
}
```

## Current Sidebar Items

| Item           | Permission | Action | Resource   |
| -------------- | ---------- | ------ | ---------- |
| Home           | Required   | READ   | FILE_NODE  |
| Users          | Required   | READ   | USER       |
| Roles          | Required   | READ   | ROLE       |
| Permissions    | Required   | READ   | PERMISSION |
| App Config     | Required   | READ   | APP_CONFIG |
| Profile        | None       | -      | -          |
| Plans          | None       | -      | -          |
| Shared With Me | None       | -      | -          |
| Storage        | Required   | READ   | STORAGE    |
| Trash          | Required   | READ   | TRASH      |

## How It Works

1. **User Login**: User data is fetched with their roles and permissions
2. **Permission Check**: When sidebar renders, each item is filtered based on user permissions
3. **Dynamic Visibility**: Only items the user has permission for are shown
4. **Indicator Animation**: The active indicator smoothly animates to the current page

## Adding Permissions to Backend

When adding a new permission to the backend:

1. Create the permission in the database
2. Assign it to appropriate roles
3. Update the `APP_PERMISSIONS` constant in `permission.constant.ts`
4. Add the permission check to sidebar items

## Best Practices

1. **Always use permission constants** from `APP_PERMISSIONS` when available
2. **Use the usePermission hook** for cleaner code in components
3. **Combine permissions logically** - don't require both READ and MANAGE for the same resource
4. **Document required permissions** in component comments
5. **Test with different roles** to ensure proper filtering

## Troubleshooting

### Sidebar items not showing

- Check if user has the required permission
- Verify the permission exists in the backend
- Check browser console for errors

### Permission check always returns false

- Ensure user data is loaded (check useAuthStore)
- Verify the permission is assigned to user's role
- Check the action and resource names match exactly

### Items showing when they shouldn't

- Remove or update the `requiredPermission` field
- Verify the permission is not assigned to the user's role
