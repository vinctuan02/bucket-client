# RBAC Button Implementation Guide

## Overview

Triển khai RBAC ở mức button cho phép ẩn/hiện các nút hành động (Create, Edit, Delete) dựa trên quyền của user.

## Components & Hooks

### 1. `usePermission()` Hook

Hook để check permission của user hiện tại.

```typescript
import { usePermission } from '@/hooks/usePermission';
import { PermissionAction, Resource } from '@/modules/permissions/permisson.enum';

export function MyComponent() {
  const { canCreate, canUpdate, canDelete, can } = usePermission();

  // Cách 1: Sử dụng helper methods
  const canCreateUser = canCreate(Resource.USER);
  const canDeleteFile = canDelete(Resource.FILE_NODE);

  // Cách 2: Sử dụng method chung
  const canManagePlan = can(PermissionAction.MANAGE, Resource.PLAN);

  return (
    <>
      {canCreateUser && <button>Create User</button>}
      {canDeleteFile && <button>Delete File</button>}
    </>
  );
}
```

### 2. `PermissionGuard` Component

Component wrapper để ẩn/hiện content dựa trên permission.

```typescript
import { PermissionGuard } from '@/components/commons/permission-guard';
import { PermissionAction, Resource } from '@/modules/permissions/permisson.enum';

export function MyComponent() {
  return (
    <PermissionGuard
      action={PermissionAction.CREATE}
      resource={Resource.USER}
    >
      <button>Create User</button>
    </PermissionGuard>
  );
}
```

## Usage Examples

### Example 1: User Management Page

```typescript
'use client';

import { usePermission } from '@/hooks/usePermission';
import { PermissionGuard } from '@/components/commons/permission-guard';
import { PermissionAction, Resource } from '@/modules/permissions/permisson.enum';

export function UserManagementPage() {
  const { canCreate, canUpdate, canDelete } = usePermission();

  return (
    <div>
      <h1>Users</h1>

      {/* Create Button */}
      <PermissionGuard
        action={PermissionAction.CREATE}
        resource={Resource.USER}
      >
        <button className="btn btn-primary">+ Create User</button>
      </PermissionGuard>

      {/* Users Table */}
      <table>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>
                {/* Edit Button */}
                <PermissionGuard
                  action={PermissionAction.UPDATE}
                  resource={Resource.USER}
                >
                  <button className="btn btn-sm btn-info">Edit</button>
                </PermissionGuard>

                {/* Delete Button */}
                <PermissionGuard
                  action={PermissionAction.DELETE}
                  resource={Resource.USER}
                >
                  <button className="btn btn-sm btn-danger">Delete</button>
                </PermissionGuard>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

### Example 2: File Manager Page

```typescript
'use client';

import { usePermission } from '@/hooks/usePermission';
import { PermissionGuard } from '@/components/commons/permission-guard';
import { PermissionAction, Resource } from '@/modules/permissions/permisson.enum';

export function FileManagerPage() {
  return (
    <div>
      <h1>Files</h1>

      {/* Create Folder Button */}
      <PermissionGuard
        action={PermissionAction.CREATE}
        resource={Resource.FILE_NODE}
      >
        <button className="btn btn-primary">+ New Folder</button>
      </PermissionGuard>

      {/* Upload File Button */}
      <PermissionGuard
        action={PermissionAction.CREATE}
        resource={Resource.FILE_NODE}
      >
        <button className="btn btn-primary">+ Upload File</button>
      </PermissionGuard>

      {/* File List */}
      <div className="file-list">
        {files.map((file) => (
          <div key={file.id} className="file-item">
            <span>{file.name}</span>

            {/* Rename Button */}
            <PermissionGuard
              action={PermissionAction.UPDATE}
              resource={Resource.FILE_NODE}
            >
              <button className="btn btn-sm">Rename</button>
            </PermissionGuard>

            {/* Delete Button */}
            <PermissionGuard
              action={PermissionAction.DELETE}
              resource={Resource.FILE_NODE}
            >
              <button className="btn btn-sm btn-danger">Delete</button>
            </PermissionGuard>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Example 3: Role Management Page

```typescript
'use client';

import { usePermission } from '@/hooks/usePermission';
import { PermissionGuard } from '@/components/commons/permission-guard';
import { PermissionAction, Resource } from '@/modules/permissions/permisson.enum';

export function RoleManagementPage() {
  return (
    <div>
      <h1>Roles</h1>

      {/* Create Role Button */}
      <PermissionGuard
        action={PermissionAction.CREATE}
        resource={Resource.ROLE}
      >
        <button className="btn btn-primary">+ Create Role</button>
      </PermissionGuard>

      {/* Roles Table */}
      <table>
        <tbody>
          {roles.map((role) => (
            <tr key={role.id}>
              <td>{role.name}</td>
              <td>
                {/* Edit Button */}
                <PermissionGuard
                  action={PermissionAction.UPDATE}
                  resource={Resource.ROLE}
                >
                  <button className="btn btn-sm btn-info">Edit</button>
                </PermissionGuard>

                {/* Delete Button */}
                <PermissionGuard
                  action={PermissionAction.DELETE}
                  resource={Resource.ROLE}
                >
                  <button className="btn btn-sm btn-danger">Delete</button>
                </PermissionGuard>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

## Permission Mapping

### User Management

- **Create**: `PermissionAction.CREATE` + `Resource.USER`
- **Read**: `PermissionAction.READ` + `Resource.USER`
- **Update**: `PermissionAction.UPDATE` + `Resource.USER`
- **Delete**: `PermissionAction.DELETE` + `Resource.USER`

### File/Folder Management

- **Create**: `PermissionAction.CREATE` + `Resource.FILE_NODE`
- **Read**: `PermissionAction.READ` + `Resource.FILE_NODE`
- **Update**: `PermissionAction.UPDATE` + `Resource.FILE_NODE`
- **Delete**: `PermissionAction.DELETE` + `Resource.FILE_NODE`

### Role Management

- **Create**: `PermissionAction.CREATE` + `Resource.ROLE`
- **Read**: `PermissionAction.READ` + `Resource.ROLE`
- **Update**: `PermissionAction.UPDATE` + `Resource.ROLE`
- **Delete**: `PermissionAction.DELETE` + `Resource.ROLE`

### Permission Management

- **Create**: `PermissionAction.CREATE` + `Resource.PERMISSION`
- **Read**: `PermissionAction.READ` + `Resource.PERMISSION`
- **Update**: `PermissionAction.UPDATE` + `Resource.PERMISSION`
- **Delete**: `PermissionAction.DELETE` + `Resource.PERMISSION`

### Profile Management

- **Read**: `PermissionAction.READ` + `Resource.PROFILE`
- **Update**: `PermissionAction.UPDATE` + `Resource.PROFILE`

### Storage Management

- **Read**: `PermissionAction.READ` + `Resource.STORAGE`

### Trash Management

- **Read**: `PermissionAction.READ` + `Resource.TRASH`
- **Delete**: `PermissionAction.DELETE` + `Resource.TRASH`

### Plan Management

- **Read**: `PermissionAction.READ` + `Resource.PLAN`
- **Manage**: `PermissionAction.MANAGE` + `Resource.PLAN`

### Subscription Management

- **Create**: `PermissionAction.CREATE` + `Resource.SUBSCRIPTION`
- **Read**: `PermissionAction.READ` + `Resource.SUBSCRIPTION`
- **Update**: `PermissionAction.UPDATE` + `Resource.SUBSCRIPTION`

## Best Practices

1. **Use PermissionGuard for UI elements**: Ẩn button/menu item nếu user không có quyền
2. **Always validate on backend**: Frontend check chỉ là UX, backend phải validate
3. **Consistent naming**: Sử dụng enum `PermissionAction` và `Resource` để tránh typo
4. **Fallback content**: Có thể cung cấp fallback UI (disabled button, tooltip, etc.)

## Fallback Example

```typescript
<PermissionGuard
  action={PermissionAction.DELETE}
  resource={Resource.USER}
  fallback={
    <button disabled title="You don't have permission to delete users">
      Delete
    </button>
  }
>
  <button className="btn btn-danger">Delete</button>
</PermissionGuard>
```

## Implementation Checklist

- [ ] Import `usePermission` hook hoặc `PermissionGuard` component
- [ ] Wrap buttons/actions với permission check
- [ ] Test với các role khác nhau
- [ ] Verify backend validation
- [ ] Add fallback UI nếu cần
