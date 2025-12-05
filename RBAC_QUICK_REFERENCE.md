# RBAC Quick Reference

## Permission Constants

```typescript
import { APP_PERMISSIONS } from '@/modules/permissions/permission.constant';
import {
	PermissionAction,
	Resource,
} from '@/modules/permissions/permisson.enum';
```

### Actions

- `PermissionAction.READ` - View data
- `PermissionAction.CREATE` - Create new items
- `PermissionAction.UPDATE` - Edit items
- `PermissionAction.DELETE` - Delete items
- `PermissionAction.MANAGE` - Full control
- `PermissionAction.SHARE` - Share items
- `PermissionAction.VIEW` - Access page

### Resources

- `Resource.USER` - User management
- `Resource.ROLE` - Role management
- `Resource.PERMISSION` - Permission management
- `Resource.FILE_NODE` - Files/Folders
- `Resource.STORAGE` - Storage info
- `Resource.TRASH` - Trash management
- `Resource.PLAN` - Plans/Subscriptions
- `Resource.PROFILE` - User profile
- `Resource.APP_CONFIG` - App configuration
- `Resource.SUBSCRIPTION` - Subscriptions

## Using Permissions

### 1. Check Permission in Component

```typescript
import { useAuthStore } from '@/modules/commons/store/common.auth-store';
import { PermissionAction, Resource } from '@/modules/permissions/permisson.enum';

export function MyComponent() {
  const { hasPermission } = useAuthStore();

  if (hasPermission(PermissionAction.READ, Resource.USER)) {
    return <UserList />;
  }

  return <div>No permission</div>;
}
```

### 2. Use Permission Guard

```typescript
import { PermissionGuard } from '@/components/commons/c.permission-guard';

export function MyComponent() {
  return (
    <PermissionGuard
      action={PermissionAction.READ}
      resource={Resource.USER}
      fallback={<div>Access Denied</div>}
    >
      <UserList />
    </PermissionGuard>
  );
}
```

### 3. Use Role Guard

```typescript
import { RoleGuard } from '@/components/commons/c.permission-guard';

export function AdminPanel() {
  return (
    <RoleGuard role="admin" fallback={<div>Admin only</div>}>
      <AdminDashboard />
    </RoleGuard>
  );
}
```

### 4. Use Permission Hook

```typescript
import { usePermission } from '@/hooks/usePermission';

export function MyComponent() {
  const { canRead, canCreate, canUpdate, canDelete, hasRole } = usePermission();

  return (
    <div>
      {canRead(Resource.USER) && <button>View Users</button>}
      {canCreate(Resource.USER) && <button>Create User</button>}
      {canUpdate(Resource.USER) && <button>Edit User</button>}
      {canDelete(Resource.USER) && <button>Delete User</button>}
      {hasRole('admin') && <button>Admin Panel</button>}
    </div>
  );
}
```

## Sidebar Items

| Item           | Permission      | Always Show |
| -------------- | --------------- | ----------- |
| Home           | READ FILE_NODE  | ❌          |
| Users          | READ USER       | ❌          |
| Roles          | READ ROLE       | ❌          |
| Permissions    | READ PERMISSION | ❌          |
| App Config     | READ APP_CONFIG | ❌          |
| Profile        | None            | ✅          |
| Plans          | None            | ✅          |
| Shared With Me | None            | ✅          |
| Storage        | READ STORAGE    | ❌          |
| Trash          | READ TRASH      | ❌          |

## Common Patterns

### Check Multiple Permissions

```typescript
const canManageUsers =
	hasPermission(PermissionAction.READ, Resource.USER) &&
	hasPermission(PermissionAction.UPDATE, Resource.USER);
```

### Conditional Button

```typescript
<button
  disabled={!hasPermission(PermissionAction.DELETE, Resource.USER)}
  onClick={handleDelete}
>
  Delete
</button>
```

### Conditional Form Fields

```typescript
<form>
  <input name="name" />

  {hasPermission(PermissionAction.UPDATE, Resource.USER) && (
    <input name="email" />
  )}

  {hasPermission(PermissionAction.MANAGE, Resource.USER) && (
    <select name="role">
      <option>Select Role</option>
    </select>
  )}
</form>
```

### API Call with Permission Check

```typescript
useEffect(() => {
	if (!hasPermission(PermissionAction.READ, Resource.USER)) {
		return;
	}

	userApi.getList().then(setUsers);
}, [hasPermission]);
```

## Error Handling

### Handle 403 Forbidden

```typescript
try {
	const data = await api.get('/users');
} catch (error) {
	if (error.response?.status === 403) {
		// User doesn't have permission
		showError('You do not have permission to access this resource');
	}
}
```

### Show Permission Error

```typescript
<PermissionGuard
  action={PermissionAction.READ}
  resource={Resource.USER}
  fallback={
    <Alert type="error">
      You do not have permission to view users.
      Contact your administrator for access.
    </Alert>
  }
>
  <UserList />
</PermissionGuard>
```

## Debugging

### Check User Permissions

```typescript
// In browser console
const { user } = useAuthStore.getState();
console.log(user.userRoles);
```

### Check Permission Result

```typescript
const { hasPermission } = useAuthStore.getState();
console.log(hasPermission(PermissionAction.READ, Resource.USER));
```

### Check All Accessible Routes

```typescript
const { getAccessibleRoutes } = useAuthStore.getState();
console.log(getAccessibleRoutes());
```

## Best Practices

1. ✅ Always check permissions before rendering sensitive content
2. ✅ Use permission guards for entire sections
3. ✅ Provide meaningful fallback messages
4. ✅ Combine permissions logically
5. ✅ Test with different roles
6. ✅ Never trust frontend checks for security
7. ✅ Always validate on backend
8. ✅ Use permission constants, not hardcoded strings

## Common Mistakes

1. ❌ Forgetting to check permissions

    ```typescript
    // Bad
    return <UserList />;

    // Good
    if (hasPermission(PermissionAction.READ, Resource.USER)) {
      return <UserList />;
    }
    ```

2. ❌ Using hardcoded strings

    ```typescript
    // Bad
    if (hasPermission('read', 'user')) {
    }

    // Good
    if (hasPermission(PermissionAction.READ, Resource.USER)) {
    }
    ```

3. ❌ Forgetting fallback UI

    ```typescript
    // Bad
    <PermissionGuard action={...} resource={...}>
      <Content />
    </PermissionGuard>

    // Good
    <PermissionGuard
      action={...}
      resource={...}
      fallback={<div>Access Denied</div>}
    >
      <Content />
    </PermissionGuard>
    ```

4. ❌ Adding function to dependency array

    ```typescript
    // Bad
    const { can } = usePermission();
    useEffect(() => {
    	// ...
    }, [can]); // ❌ causes infinite loop

    // Good
    const { hasPermission } = useAuthStore();
    useEffect(() => {
    	// ...
    }, [user]); // ✅ stable reference
    ```

## Files Reference

- **Hooks**: `src/hooks/usePermission.ts`
- **Components**: `src/components/commons/c.permission-guard.tsx`
- **Store**: `src/modules/commons/store/common.auth-store.ts`
- **Constants**: `src/modules/permissions/permission.constant.ts`
- **Enums**: `src/modules/permissions/permisson.enum.ts`
- **Sidebar**: `src/components/commons/c.sidebar.tsx`

## Documentation

- `RBAC_SIDEBAR_GUIDE.md` - Architecture overview
- `RBAC_USAGE_EXAMPLES.md` - Detailed examples
- `RBAC_TESTING_GUIDE.md` - Testing guide
- `RBAC_FIXES.md` - Bug fixes
- `RBAC_CHECKLIST.md` - Implementation checklist
