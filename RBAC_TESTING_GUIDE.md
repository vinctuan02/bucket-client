# RBAC Testing Guide

## Overview

This guide explains how to test the RBAC sidebar implementation with different user roles and permissions.

## Prerequisites

1. Backend running with RBAC implemented
2. Database seeded with roles and permissions
3. Frontend running locally
4. Test users created with different roles

## Test Scenarios

### Scenario 1: Admin User (All Permissions)

**Setup:**

- Create user: `admin@example.com`
- Assign role: `Admin`
- Admin role has all permissions

**Expected Sidebar Items:**

- ✅ Home
- ✅ Users
- ✅ Roles
- ✅ Permissions
- ✅ App Config
- ✅ Profile
- ✅ Plans
- ✅ Shared With Me
- ✅ Storage
- ✅ Trash

**Test Steps:**

1. Login with `admin@example.com`
2. Verify all sidebar items are visible
3. Click each item and verify page loads
4. Check browser console for no errors

### Scenario 2: User Manager (User/Role/Permission Permissions)

**Setup:**

- Create user: `manager@example.com`
- Assign role: `User Manager`
- User Manager role has:
    - READ USER
    - CREATE USER
    - UPDATE USER
    - DELETE USER
    - READ ROLE
    - READ PERMISSION

**Expected Sidebar Items:**

- ✅ Home (READ FILE_NODE)
- ✅ Users (READ USER)
- ✅ Roles (READ ROLE)
- ✅ Permissions (READ PERMISSION)
- ❌ App Config (READ APP_CONFIG)
- ✅ Profile
- ✅ Plans
- ✅ Shared With Me
- ❌ Storage (READ STORAGE)
- ❌ Trash (READ TRASH)

**Test Steps:**

1. Login with `manager@example.com`
2. Verify only expected items are visible
3. Try accessing `/app-config` directly - should be blocked
4. Try accessing `/storage` directly - should be blocked
5. Verify Users, Roles, Permissions pages work

### Scenario 3: Regular User (Basic Permissions)

**Setup:**

- Create user: `user@example.com`
- Assign role: `User`
- User role has:
    - READ FILE_NODE
    - READ STORAGE
    - READ TRASH

**Expected Sidebar Items:**

- ✅ Home (READ FILE_NODE)
- ❌ Users (READ USER)
- ❌ Roles (READ ROLE)
- ❌ Permissions (READ PERMISSION)
- ❌ App Config (READ APP_CONFIG)
- ✅ Profile
- ✅ Plans
- ✅ Shared With Me
- ✅ Storage (READ STORAGE)
- ✅ Trash (READ TRASH)

**Test Steps:**

1. Login with `user@example.com`
2. Verify only expected items are visible
3. Try accessing `/users` directly - should be blocked
4. Try accessing `/roles` directly - should be blocked
5. Verify Home, Storage, Trash pages work

### Scenario 4: Guest User (No Permissions)

**Setup:**

- Create user: `guest@example.com`
- Assign role: `Guest`
- Guest role has no permissions

**Expected Sidebar Items:**

- ❌ Home (READ FILE_NODE)
- ❌ Users (READ USER)
- ❌ Roles (READ ROLE)
- ❌ Permissions (READ PERMISSION)
- ❌ App Config (READ APP_CONFIG)
- ✅ Profile
- ✅ Plans
- ✅ Shared With Me
- ❌ Storage (READ STORAGE)
- ❌ Trash (READ TRASH)

**Test Steps:**

1. Login with `guest@example.com`
2. Verify only Profile, Plans, Shared With Me are visible
3. Try accessing any protected page - should be blocked
4. Verify profile page works

## Manual Testing Checklist

### Sidebar Visibility

- [ ] Admin sees all items
- [ ] Manager sees only assigned items
- [ ] User sees only basic items
- [ ] Guest sees only public items
- [ ] Sidebar updates after role change (if applicable)

### Permission Checks

- [ ] Can't access protected pages without permission
- [ ] Can access allowed pages
- [ ] API calls return 403 for unauthorized access
- [ ] Error messages display correctly

### UI/UX

- [ ] Sidebar items animate smoothly
- [ ] Active indicator shows current page
- [ ] No console errors
- [ ] Page loads correctly for each item

### Edge Cases

- [ ] User with no roles
- [ ] User with multiple roles
- [ ] Permission added/removed dynamically
- [ ] Role changed while logged in

## Automated Testing

### Test usePermission Hook

```typescript
import { renderHook } from '@testing-library/react';
import { usePermission } from '@/hooks/usePermission';
import { useAuthStore } from '@/modules/commons/store/common.auth-store';

describe('usePermission', () => {
	it('should return true for allowed permission', () => {
		// Mock user with permission
		useAuthStore.setState({
			user: {
				id: '1',
				userRoles: [
					{
						role: {
							rolePermissions: [
								{
									permission: {
										action: 'READ',
										resource: 'USER',
									},
								},
							],
						},
					},
				],
			},
		});

		const { result } = renderHook(() => usePermission());
		expect(result.current.canRead('USER')).toBe(true);
	});

	it('should return false for denied permission', () => {
		// Mock user without permission
		useAuthStore.setState({
			user: {
				id: '1',
				userRoles: [],
			},
		});

		const { result } = renderHook(() => usePermission());
		expect(result.current.canRead('USER')).toBe(false);
	});
});
```

### Test Sidebar Filtering

```typescript
import { render, screen } from '@testing-library/react';
import Sidebar from '@/components/commons/c.sidebar';
import { useAuthStore } from '@/modules/commons/store/common.auth-store';

describe('Sidebar', () => {
  it('should show only permitted items', () => {
    // Mock admin user
    useAuthStore.setState({
      user: {
        id: '1',
        userRoles: [
          {
            role: {
              name: 'admin',
              rolePermissions: [
                // All permissions
              ],
            },
          },
        ],
      },
    });

    render(<Sidebar />);

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Users')).toBeInTheDocument();
    expect(screen.getByText('Roles')).toBeInTheDocument();
  });

  it('should hide unpermitted items', () => {
    // Mock regular user
    useAuthStore.setState({
      user: {
        id: '1',
        userRoles: [
          {
            role: {
              name: 'user',
              rolePermissions: [
                // Limited permissions
              ],
            },
          },
        ],
      },
    });

    render(<Sidebar />);

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.queryByText('Users')).not.toBeInTheDocument();
    expect(screen.queryByText('Roles')).not.toBeInTheDocument();
  });
});
```

### Test PermissionGuard Component

```typescript
import { render, screen } from '@testing-library/react';
import { PermissionGuard } from '@/components/commons/c.permission-guard';
import { useAuthStore } from '@/modules/commons/store/common.auth-store';
import { PermissionAction, Resource } from '@/modules/permissions/permisson.enum';

describe('PermissionGuard', () => {
  it('should render children when permission is granted', () => {
    useAuthStore.setState({
      user: {
        id: '1',
        userRoles: [
          {
            role: {
              rolePermissions: [
                {
                  permission: {
                    action: PermissionAction.READ,
                    resource: Resource.USER,
                  },
                },
              ],
            },
          },
        ],
      },
    });

    render(
      <PermissionGuard
        action={PermissionAction.READ}
        resource={Resource.USER}
      >
        <div>Protected Content</div>
      </PermissionGuard>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('should render fallback when permission is denied', () => {
    useAuthStore.setState({
      user: {
        id: '1',
        userRoles: [],
      },
    });

    render(
      <PermissionGuard
        action={PermissionAction.READ}
        resource={Resource.USER}
        fallback={<div>Access Denied</div>}
      >
        <div>Protected Content</div>
      </PermissionGuard>
    );

    expect(screen.getByText('Access Denied')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });
});
```

## Performance Testing

### Sidebar Rendering Performance

1. Login with admin user (all permissions)
2. Open DevTools Performance tab
3. Record sidebar render
4. Check render time (should be < 100ms)
5. Verify no unnecessary re-renders

### Permission Check Performance

1. Create component with many permission checks
2. Measure permission check time
3. Verify no performance degradation
4. Check for memory leaks

## Browser Testing

### Chrome DevTools

1. Open DevTools
2. Go to Application tab
3. Check localStorage for auth-storage
4. Verify user data is stored correctly
5. Check for any console errors

### Network Tab

1. Open Network tab
2. Login and observe API calls
3. Verify user endpoint returns roles and permissions
4. Check for any failed requests

## Troubleshooting

### Sidebar items not showing

1. Check browser console for errors
2. Verify user data in localStorage
3. Check if permissions are assigned to role
4. Verify permission names match exactly

### Permission always returns false

1. Check if user is loaded
2. Verify role is assigned to user
3. Check if permission is assigned to role
4. Verify action and resource names

### Page loads but shows 403

1. Check backend permission validation
2. Verify API endpoint checks permissions
3. Check if user has required permission
4. Review backend logs for errors

## Test Data Setup

### SQL Queries for Test Data

```sql
-- Create test roles
INSERT INTO roles (id, name, description, created_at, updated_at) VALUES
('admin-role', 'Admin', 'Administrator role', NOW(), NOW()),
('manager-role', 'User Manager', 'User manager role', NOW(), NOW()),
('user-role', 'User', 'Regular user role', NOW(), NOW()),
('guest-role', 'Guest', 'Guest role', NOW(), NOW());

-- Create test users
INSERT INTO users (id, name, email, password, provider, created_at, updated_at) VALUES
('admin-user', 'Admin User', 'admin@example.com', 'hashed_password', 'local', NOW(), NOW()),
('manager-user', 'Manager User', 'manager@example.com', 'hashed_password', 'local', NOW(), NOW()),
('user-user', 'Regular User', 'user@example.com', 'hashed_password', 'local', NOW(), NOW()),
('guest-user', 'Guest User', 'guest@example.com', 'hashed_password', 'local', NOW(), NOW());

-- Assign roles to users
INSERT INTO user_roles (id, user_id, role_id, created_at, updated_at) VALUES
('admin-ur', 'admin-user', 'admin-role', NOW(), NOW()),
('manager-ur', 'manager-user', 'manager-role', NOW(), NOW()),
('user-ur', 'user-user', 'user-role', NOW(), NOW()),
('guest-ur', 'guest-user', 'guest-role', NOW(), NOW());
```

## Continuous Testing

### Pre-deployment Checklist

- [ ] All test scenarios pass
- [ ] No console errors
- [ ] Performance acceptable
- [ ] No memory leaks
- [ ] API responses correct
- [ ] Error handling works
- [ ] Fallback UI displays correctly

### Post-deployment Monitoring

- [ ] Monitor error logs
- [ ] Check user feedback
- [ ] Verify permission denials
- [ ] Monitor performance metrics
- [ ] Check for security issues
