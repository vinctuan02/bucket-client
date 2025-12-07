# RBAC Logic Explanation - Chi tiết hoạt động

## 1. Data Structure (Cấu trúc dữ liệu)

### Mối quan hệ giữa các entity:

```
User
  ├── userRoles[] (User có nhiều Role)
  │   └── UserRole
  │       ├── userId
  │       ├── roleId
  │       └── role: Role
  │           ├── name (e.g., "Admin", "Sale", "User")
  │           └── rolePermissions[] (Role có nhiều Permission)
  │               └── RolePermission
  │                   ├── roleId
  │                   ├── permissionId
  │                   └── permission: Permission
  │                       ├── action (e.g., "CREATE", "READ", "UPDATE", "DELETE")
  │                       └── resource (e.g., "USER", "FILE_NODE", "ROLE")
```

### Ví dụ dữ liệu thực tế:

```typescript
// User object khi login
const user = {
	id: 'user-123',
	name: 'John Doe',
	email: 'john@example.com',
	userRoles: [
		{
			userId: 'user-123',
			roleId: 'role-admin',
			role: {
				id: 'role-admin',
				name: 'Admin',
				rolePermissions: [
					{
						roleId: 'role-admin',
						permissionId: 'perm-create-user',
						permission: {
							id: 'perm-create-user',
							action: 'CREATE',
							resource: 'USER',
							name: 'Create User',
						},
					},
					{
						roleId: 'role-admin',
						permissionId: 'perm-delete-user',
						permission: {
							id: 'perm-delete-user',
							action: 'DELETE',
							resource: 'USER',
							name: 'Delete User',
						},
					},
					// ... more permissions
				],
			},
		},
	],
};
```

## 2. Auth Store - `hasPermission()` Logic

### Code:

```typescript
hasPermission: (action, resource) => {
	const user = get().user;
	if (!user) return false;

	return !!user.userRoles?.some((ur) =>
		ur.role?.rolePermissions?.some(
			(rp) =>
				rp.permission?.action === action &&
				rp.permission?.resource === resource,
		),
	);
};
```

### Step-by-step execution:

**Bước 1:** Lấy user từ store

```typescript
const user = get().user;
if (!user) return false; // Nếu không có user, return false
```

**Bước 2:** Duyệt qua tất cả role của user

```typescript
user.userRoles?.some((ur) => {
	// ur = UserRole object
	// ur.role = Role object
});
```

**Bước 3:** Với mỗi role, duyệt qua tất cả permission của role

```typescript
ur.role?.rolePermissions?.some((rp) => {
	// rp = RolePermission object
	// rp.permission = Permission object
});
```

**Bước 4:** Check xem permission có match với action + resource không

```typescript
rp.permission?.action === action && rp.permission?.resource === resource;
```

### Ví dụ thực tế:

```typescript
// Gọi function
hasPermission('CREATE', 'USER');

// Execution flow:
// 1. user = { id: "user-123", userRoles: [...] }
// 2. Duyệt userRoles[0] (Admin role)
// 3. Duyệt rolePermissions[0]
//    - permission.action = "CREATE"
//    - permission.resource = "USER"
//    - Match! Return true
```

## 3. usePermission Hook - Wrapper methods

### Code:

```typescript
export function usePermission() {
	const { hasPermission, hasRole } = useAuthStore();

	const can = (action: PermissionAction, resource: Resource): boolean => {
		return hasPermission(action, resource);
	};

	const canCreate = (resource: Resource): boolean => {
		return hasPermission(PermissionAction.CREATE, resource);
	};

	const canDelete = (resource: Resource): boolean => {
		return hasPermission(PermissionAction.DELETE, resource);
	};

	return {
		can,
		canCreate,
		canDelete,
		canUpdate,
		canRead,
		canManage,
		hasRole,
	};
}
```

### Ví dụ sử dụng:

```typescript
const { canCreate, canDelete } = usePermission();

// Cách 1: Sử dụng helper method
canCreate(Resource.USER); // Gọi hasPermission("CREATE", "USER")

// Cách 2: Sử dụng method chung
can(PermissionAction.DELETE, Resource.USER); // Gọi hasPermission("DELETE", "USER")
```

## 4. PermissionGuard Component - Conditional Rendering

### Code:

```typescript
export function PermissionGuard({
	action,
	resource,
	children,
	fallback = null,
}: PermissionGuardProps) {
	const { can } = usePermission();

	if (!can(action, resource)) {
		return fallback; // Render fallback (default: null = ẩn)
	}

	return children; // Render button/content
}
```

### Ví dụ sử dụng:

```typescript
<PermissionGuard
  action={PermissionAction.CREATE}
  resource={Resource.USER}
>
  <button>Create User</button>
</PermissionGuard>

// Execution:
// 1. Gọi can(PermissionAction.CREATE, Resource.USER)
// 2. can() gọi hasPermission("CREATE", "USER")
// 3. hasPermission() duyệt user.userRoles[].role.rolePermissions[]
// 4. Nếu tìm thấy permission match -> return true -> render button
// 5. Nếu không tìm thấy -> return false -> render fallback (null = ẩn)
```

## 5. Complete Flow Example

### Scenario: User click "Create User" button

```
┌─────────────────────────────────────────────────────────────┐
│ 1. User Component renders                                   │
│    <PermissionGuard action="CREATE" resource="USER">        │
│      <button>Create User</button>                           │
│    </PermissionGuard>                                       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. PermissionGuard calls can(CREATE, USER)                  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. can() calls hasPermission("CREATE", "USER")              │
│    from useAuthStore                                        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. hasPermission() checks:                                  │
│    - Get user from store                                    │
│    - Loop user.userRoles                                    │
│    - For each role, loop role.rolePermissions               │
│    - Check if permission.action === "CREATE" &&            │
│           permission.resource === "USER"                    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. Return true/false                                        │
│    - true: render <button>Create User</button>              │
│    - false: render fallback (null = ẩn button)              │
└─────────────────────────────────────────────────────────────┘
```

## 6. Permission Check Scenarios

### Scenario 1: Admin user (có tất cả permission)

```typescript
// User data
user = {
	userRoles: [
		{
			role: {
				name: 'Admin',
				rolePermissions: [
					{ permission: { action: 'CREATE', resource: 'USER' } },
					{ permission: { action: 'READ', resource: 'USER' } },
					{ permission: { action: 'UPDATE', resource: 'USER' } },
					{ permission: { action: 'DELETE', resource: 'USER' } },
					// ... tất cả permission khác
				],
			},
		},
	],
};

// Check permission
hasPermission('CREATE', 'USER'); // ✅ true - button hiển thị
hasPermission('DELETE', 'USER'); // ✅ true - button hiển thị
hasPermission('DELETE', 'ROLE'); // ✅ true - button hiển thị
```

### Scenario 2: Sale user (chỉ có permission cho PLAN)

```typescript
// User data
user = {
	userRoles: [
		{
			role: {
				name: 'Sale',
				rolePermissions: [
					{ permission: { action: 'READ', resource: 'PLAN' } },
					{ permission: { action: 'MANAGE', resource: 'PLAN' } },
				],
			},
		},
	],
};

// Check permission
hasPermission('CREATE', 'USER'); // ❌ false - button ẩn
hasPermission('DELETE', 'USER'); // ❌ false - button ẩn
hasPermission('READ', 'PLAN'); // ✅ true - button hiển thị
hasPermission('MANAGE', 'PLAN'); // ✅ true - button hiển thị
```

### Scenario 3: Regular user (chỉ có permission cho FILE_NODE)

```typescript
// User data
user = {
	userRoles: [
		{
			role: {
				name: 'User',
				rolePermissions: [
					{ permission: { action: 'CREATE', resource: 'FILE_NODE' } },
					{ permission: { action: 'READ', resource: 'FILE_NODE' } },
					{ permission: { action: 'UPDATE', resource: 'FILE_NODE' } },
					{ permission: { action: 'DELETE', resource: 'FILE_NODE' } },
					{ permission: { action: 'READ', resource: 'PROFILE' } },
					{ permission: { action: 'UPDATE', resource: 'PROFILE' } },
				],
			},
		},
	],
};

// Check permission
hasPermission('CREATE', 'FILE_NODE'); // ✅ true - button hiển thị
hasPermission('DELETE', 'FILE_NODE'); // ✅ true - button hiển thị
hasPermission('CREATE', 'USER'); // ❌ false - button ẩn
hasPermission('DELETE', 'USER'); // ❌ false - button ẩn
```

## 7. Key Points

1. **Permission check là recursive**: Duyệt qua tất cả role của user, rồi duyệt qua tất cả permission của mỗi role
2. **Sử dụng `.some()`**: Chỉ cần tìm thấy 1 permission match là return true
3. **Frontend check chỉ là UX**: Backend phải validate lại, không tin frontend
4. **Fallback UI**: Có thể ẩn button hoặc hiển thị disabled button với tooltip
5. **Performance**: Nếu user có nhiều role/permission, có thể cache kết quả

## 8. Optimization Tips

### Caching permission check:

```typescript
// Tạo memo để cache kết quả
const canCreateUser = useMemo(
  () => canCreate(Resource.USER),
  [canCreate]
);

// Sử dụng
{canCreateUser && <button>Create User</button>}
```

### Batch permission check:

```typescript
// Check nhiều permission cùng lúc
const permissions = {
  canCreate: canCreate(Resource.USER),
  canUpdate: canUpdate(Resource.USER),
  canDelete: canDelete(Resource.USER),
};

// Sử dụng
{permissions.canCreate && <button>Create</button>}
{permissions.canUpdate && <button>Edit</button>}
{permissions.canDelete && <button>Delete</button>}
```
