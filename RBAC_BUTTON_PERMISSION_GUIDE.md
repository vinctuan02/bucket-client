# RBAC Button Permission - Implementation Guide

## Overview

Triển khai RBAC ở mức button bằng cách check permission trước khi truyền callback vào Table component. Giao diện không thay đổi, chỉ thêm logic ẩn/hiện button.

## How It Works

### Logic Flow

```
Plan Page
├── usePermission() hook
│   └── can(action, resource) → boolean
│
├── Check permission trước khi truyền callback
│   ├── onCreate: Nếu có CREATE permission → truyền callback, ngược lại → undefined
│   ├── onEdit: Nếu có UPDATE permission → truyền callback, ngược lại → undefined
│   └── onDelete: Nếu có DELETE permission → truyền callback, ngược lại → undefined
│
└── Table Component
    ├── Nếu onCreate === undefined → button CREATE ẩn
    ├── Nếu onEdit === undefined → button EDIT ẩn
    └── Nếu onDelete === undefined → button DELETE ẩn
```

### Permission Mapping

```typescript
// CREATE button
can(PermissionAction.CREATE, Resource.PLAN);

// EDIT button (trong table)
can(PermissionAction.UPDATE, Resource.PLAN);

// DELETE button (trong table)
can(PermissionAction.DELETE, Resource.PLAN);
```

## Implementation Example

### Plan Page (`src/app/(main)/plans/page.tsx`)

```typescript
'use client';

import { usePermission } from '@/hooks/usePermission';
import { PermissionAction, Resource } from '@/modules/permissions/permisson.enum';

export default function PlansPage() {
	const { can } = usePermission();

	return (
		<Page title="Plans" isShowTitle={false}>
			<Table
				data={plans}
				columns={createPlansConfigColumnTable(handleToggleActive)}
				// CREATE button: Chỉ hiển thị nếu user có CREATE permission
				onCreate={
					can(PermissionAction.CREATE, Resource.PLAN)
						? () => setShowModal(true)
						: undefined
				}
				// EDIT button: Chỉ hiển thị nếu user có UPDATE permission
				onEdit={
					can(PermissionAction.UPDATE, Resource.PLAN)
						? handleEdit
						: undefined
				}
				// DELETE button: Chỉ hiển thị nếu user có DELETE permission
				onDelete={
					can(PermissionAction.DELETE, Resource.PLAN)
						? handleDelete
						: undefined
				}
				onSearch={handleSearch}
				pagination={pagination}
				onPageChange={handlePageChange}
				onSortChange={handleSortChange}
				loading={loading}
			/>
		</Page>
	);
}
```

## APP_PERMISSIONS

Các permission đã được thêm vào `APP_PERMISSIONS`:

```typescript
// --- PLAN (Quản lý Gói) ---
CREATE_PLAN: {
	name: 'Create Plan',
	action: PermissionAction.CREATE,
	resource: Resource.PLAN,
	description: 'Allow creating new storage plans',
},
UPDATE_PLAN: {
	name: 'Update Plan',
	action: PermissionAction.UPDATE,
	resource: Resource.PLAN,
	description: 'Allow editing storage plans',
},
DELETE_PLAN: {
	name: 'Delete Plan',
	action: PermissionAction.DELETE,
	resource: Resource.PLAN,
	description: 'Allow deleting storage plans',
},
MANAGE_PLAN: {
	name: 'Manage Plan',
	action: PermissionAction.MANAGE,
	resource: Resource.PLAN,
	description: 'Allow managing storage plans',
},
```

## How to Test

### Test Case 1: Admin User (Có tất cả permission)

1. Login với Admin account
2. Vào Plan page
3. **Expected:**
    - ✅ CREATE button hiển thị
    - ✅ EDIT button hiển thị trong table
    - ✅ DELETE button hiển thị trong table

### Test Case 2: Sale User (Có MANAGE permission)

1. Login với Sale account
2. Vào Plan page
3. **Expected:**
    - ✅ CREATE button hiển thị (vì MANAGE bao gồm CREATE)
    - ✅ EDIT button hiển thị (vì MANAGE bao gồm UPDATE)
    - ✅ DELETE button hiển thị (vì MANAGE bao gồm DELETE)

### Test Case 3: Regular User (Không có permission)

1. Login với Regular User account
2. Vào Plan page
3. **Expected:**
    - ❌ CREATE button ẩn
    - ❌ EDIT button ẩn
    - ❌ DELETE button ẩn

## How Permission Check Works

### usePermission Hook

```typescript
export function usePermission() {
	const { hasPermission } = useAuthStore();

	const can = (action: PermissionAction, resource: Resource): boolean => {
		return hasPermission(action, resource);
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
```

### hasPermission in Auth Store

```typescript
hasPermission: (action, resource) => {
	const user = get().user;
	if (!user) return false;

	// Duyệt qua tất cả role của user
	return !!user.userRoles?.some((ur) =>
		// Duyệt qua tất cả permission của role
		ur.role?.rolePermissions?.some(
			(rp) =>
				rp.permission?.action === action &&
				rp.permission?.resource === resource,
		),
	);
};
```

## How to Apply to Other Pages

Áp dụng cách này vào các page khác:

### 1. User Management Page

```typescript
const { can } = usePermission();

<Table
	onCreate={
		can(PermissionAction.CREATE, Resource.USER)
			? () => setShowModal(true)
			: undefined
	}
	onEdit={
		can(PermissionAction.UPDATE, Resource.USER)
			? handleEdit
			: undefined
	}
	onDelete={
		can(PermissionAction.DELETE, Resource.USER)
			? handleDelete
			: undefined
	}
	// ...
/>
```

### 2. Role Management Page

```typescript
const { can } = usePermission();

<Table
	onCreate={
		can(PermissionAction.CREATE, Resource.ROLE)
			? () => setShowModal(true)
			: undefined
	}
	onEdit={
		can(PermissionAction.UPDATE, Resource.ROLE)
			? handleEdit
			: undefined
	}
	onDelete={
		can(PermissionAction.DELETE, Resource.ROLE)
			? handleDelete
			: undefined
	}
	// ...
/>
```

### 3. File Manager Page

```typescript
const { can } = usePermission();

<Table
	onCreate={
		can(PermissionAction.CREATE, Resource.FILE_NODE)
			? () => setShowModal(true)
			: undefined
	}
	onEdit={
		can(PermissionAction.UPDATE, Resource.FILE_NODE)
			? handleEdit
			: undefined
	}
	onDelete={
		can(PermissionAction.DELETE, Resource.FILE_NODE)
			? handleDelete
			: undefined
	}
	// ...
/>
```

## Files Modified

- `src/app/(main)/plans/page.tsx` - Thêm permission check
- `src/modules/permissions/permission.constant.ts` - Thêm CREATE_PLAN, UPDATE_PLAN, DELETE_PLAN

## Key Points

1. **Giao diện không thay đổi** - Chỉ thêm logic ẩn/hiện button
2. **Callback = undefined** - Khi user không có permission, callback được set thành undefined
3. **Table component tự động ẩn button** - Nếu callback === undefined, button sẽ ẩn
4. **Backend validation** - Frontend check chỉ là UX, backend phải validate lại
5. **Reusable pattern** - Áp dụng cách này cho tất cả page

## Troubleshooting

### Button vẫn hiển thị dù không có permission

1. Check xem user có permission không
    - Vào Admin > Roles > Chọn role
    - Kiểm tra rolePermissions

2. Check xem permission được assign đúng không
    - Permission phải có action = "CREATE"/"UPDATE"/"DELETE"
    - Permission phải có resource = "PLAN"

3. Check xem user có role không
    - Vào Admin > Users > Chọn user
    - Kiểm tra userRoles

### Button ẩn nhưng action vẫn work

- Có thể backend không validate permission
- Thêm permission check ở backend API
