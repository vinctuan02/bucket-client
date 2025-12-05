# RBAC Usage Examples

## 1. Using usePermission Hook

### Basic Permission Check

```typescript
import { usePermission } from '@/hooks/usePermission';
import { PermissionAction, Resource } from '@/modules/permissions/permisson.enum';

export function UserManagement() {
  const { can, canRead, canCreate, canUpdate, canDelete } = usePermission();

  return (
    <div>
      {canRead(Resource.USER) && <UserList />}
      {canCreate(Resource.USER) && <CreateUserButton />}
      {canUpdate(Resource.USER) && <EditUserButton />}
      {canDelete(Resource.USER) && <DeleteUserButton />}
    </div>
  );
}
```

### Using can() Method

```typescript
export function FileManager() {
  const { can } = usePermission();

  const handleUpload = () => {
    if (!can(PermissionAction.CREATE, Resource.FILE_NODE)) {
      alert('You do not have permission to upload files');
      return;
    }
    // Handle upload
  };

  return <button onClick={handleUpload}>Upload File</button>;
}
```

## 2. Using PermissionGuard Component

### Conditional Rendering

```typescript
import { PermissionGuard } from '@/components/commons/c.permission-guard';
import { PermissionAction, Resource } from '@/modules/permissions/permisson.enum';

export function Dashboard() {
  return (
    <div>
      <PermissionGuard
        action={PermissionAction.READ}
        resource={Resource.USER}
      >
        <UserManagementPanel />
      </PermissionGuard>

      <PermissionGuard
        action={PermissionAction.READ}
        resource={Resource.ROLE}
      >
        <RoleManagementPanel />
      </PermissionGuard>
    </div>
  );
}
```

### With Fallback

```typescript
<PermissionGuard
  action={PermissionAction.READ}
  resource={Resource.APP_CONFIG}
  fallback={<div>You do not have permission to view app configuration</div>}
>
  <AppConfigPanel />
</PermissionGuard>
```

## 3. Using RoleGuard Component

```typescript
import { RoleGuard } from '@/components/commons/c.permission-guard';

export function AdminPanel() {
  return (
    <RoleGuard role="admin" fallback={<div>Admin access required</div>}>
      <AdminDashboard />
    </RoleGuard>
  );
}
```

## 4. Using useAuthStore Directly

```typescript
import { useAuthStore } from '@/modules/commons/store/common.auth-store';

export function Navigation() {
  const { hasPermission, hasRole, canAccessRoute } = useAuthStore();

  return (
    <nav>
      {hasPermission('READ', 'USER') && <Link href="/users">Users</Link>}
      {hasPermission('READ', 'ROLE') && <Link href="/roles">Roles</Link>}
      {hasRole('admin') && <Link href="/admin">Admin</Link>}
    </nav>
  );
}
```

## 5. Protecting Routes

```typescript
import { useRouteProtection } from '@/hooks/useRouteProtection';

export function ProtectedPage() {
  useRouteProtection(); // Automatically checks permissions

  return <div>Protected content</div>;
}
```

## 6. Sidebar Item with Permission

```typescript
const sidebarNavItems: SidebarItem[] = [
  {
    display: 'Users',
    icon: <Users size={18} strokeWidth={2.5} />,
    to: '/users',
    section: 'users',
    requiredPermission: {
      action: PermissionAction.READ,
      resource: Resource.USER,
    },
  },
  // Items without requiredPermission are always shown
  {
    display: 'Profile',
    icon: <CircleUserRound size={18} strokeWidth={2.5} />,
    to: '/my-profile',
    section: 'my-profile',
  },
];
```

## 7. Complex Permission Logic

```typescript
export function FileActions() {
  const { can } = usePermission();

  const canManageFile =
    can(PermissionAction.READ, Resource.FILE_NODE) &&
    can(PermissionAction.UPDATE, Resource.FILE_NODE);

  const canDeleteFile =
    can(PermissionAction.DELETE, Resource.FILE_NODE);

  return (
    <div>
      {canManageFile && <EditButton />}
      {canDeleteFile && <DeleteButton />}
    </div>
  );
}
```

## 8. Permission-Based Button Styling

```typescript
export function ActionButtons() {
  const { can } = usePermission();

  return (
    <div>
      <button
        disabled={!can(PermissionAction.CREATE, Resource.FILE_NODE)}
        className={can(PermissionAction.CREATE, Resource.FILE_NODE) ? '' : 'opacity-50 cursor-not-allowed'}
      >
        Create File
      </button>
    </div>
  );
}
```

## 9. API Call with Permission Check

```typescript
export function UserList() {
  const { can } = usePermission();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (!can(PermissionAction.READ, Resource.USER)) {
      return;
    }

    userApi.getList().then(res => setUsers(res.data));
  }, [can]);

  return <div>{/* Render users */}</div>;
}
```

## 10. Form with Permission-Based Fields

```typescript
export function UserForm() {
  const { can } = usePermission();

  return (
    <form>
      <input type="text" placeholder="Name" />

      {can(PermissionAction.UPDATE, Resource.USER) && (
        <>
          <input type="email" placeholder="Email" />
          <select>
            <option>Select Role</option>
          </select>
        </>
      )}

      {can(PermissionAction.DELETE, Resource.USER) && (
        <button type="button">Delete User</button>
      )}

      <button type="submit">Save</button>
    </form>
  );
}
```

## Permission Constants Reference

```typescript
// From APP_PERMISSIONS
APP_PERMISSIONS.READ_USER;
APP_PERMISSIONS.CREATE_USER;
APP_PERMISSIONS.UPDATE_USER;
APP_PERMISSIONS.DELETE_USER;

APP_PERMISSIONS.READ_ROLE;
APP_PERMISSIONS.CREATE_ROLE;
APP_PERMISSIONS.UPDATE_ROLE;
APP_PERMISSIONS.DELETE_ROLE;

APP_PERMISSIONS.READ_PERMISSION;
APP_PERMISSIONS.CREATE_PERMISSION;
APP_PERMISSIONS.UPDATE_PERMISSION;
APP_PERMISSIONS.DELETE_PERMISSION;

APP_PERMISSIONS.READ_FILE_NODE;
APP_PERMISSIONS.CREATE_FILE_NODE;
APP_PERMISSIONS.UPDATE_FILE_NODE;
APP_PERMISSIONS.DELETE_FILE_NODE;

APP_PERMISSIONS.READ_STORAGE;
APP_PERMISSIONS.READ_TRASH;
APP_PERMISSIONS.DELETE_TRASH;

APP_PERMISSIONS.READ_PLAN;
APP_PERMISSIONS.MANAGE_PLAN;

APP_PERMISSIONS.READ_CONFIG;
APP_PERMISSIONS.UPDATE_CONFIG;
```

## Best Practices

1. **Always check permissions before rendering sensitive content**

    ```typescript
    {can(PermissionAction.READ, Resource.USER) && <UserPanel />}
    ```

2. **Use permission guards for entire sections**

    ```typescript
    <PermissionGuard action={PermissionAction.READ} resource={Resource.USER}>
      <UserManagementSection />
    </PermissionGuard>
    ```

3. **Provide meaningful fallback messages**

    ```typescript
    <PermissionGuard
      action={PermissionAction.READ}
      resource={Resource.APP_CONFIG}
      fallback={<Alert>You don't have permission to view this section</Alert>}
    >
      <AppConfig />
    </PermissionGuard>
    ```

4. **Combine with API error handling**

    ```typescript
    try {
    	const data = await api.get('/users');
    } catch (error) {
    	if (error.status === 403) {
    		// Handle permission denied
    	}
    }
    ```

5. **Test with different roles**
    - Create test users with different roles
    - Verify UI changes based on permissions
    - Check that API calls are blocked for unauthorized users
