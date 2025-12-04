# Design Document - Role-Based Access Control (RBAC) Frontend

## Overview

This design document outlines the implementation of role-based access control (RBAC) for the frontend application. The system will enforce authorization rules based on user roles (Admin, Sale, User) to control page access and feature visibility. The implementation leverages the existing auth store and permission system from the backend.

## Architecture

### High-Level Flow

```
User Login → Backend Auth → User + Roles + Permissions → Auth Store
                                                              ↓
                                                    Route Protection Middleware
                                                              ↓
                                                    Check User Permissions
                                                              ↓
                                    Grant Access / Redirect to Appropriate Page
```

### Key Components

1. **Auth Store Enhancement** - Extend existing `useAuthStore` with role checking
2. **Route Protection Middleware** - Middleware to check permissions before rendering pages
3. **Protected Route Component** - Wrapper component for protected pages
4. **Sidebar Filter** - Filter sidebar menu items based on user permissions
5. **Route Configuration** - Centralized configuration defining role-to-page mappings

## Components and Interfaces

### 1. Route Configuration

A centralized configuration file that defines which roles can access which routes.

```typescript
interface RouteConfig {
	path: string;
	requiredPermissions?: Array<{ action: string; resource: string }>;
	requiredRoles?: string[];
	redirectTo?: string;
}

const routeConfigs: Record<string, RouteConfig> = {
	'/home': { requiredRoles: ['Admin', 'User', 'Sale'] },
	'/users': { requiredRoles: ['Admin'] },
	'/roles': { requiredRoles: ['Admin'] },
	'/permissions': { requiredRoles: ['Admin'] },
	'/plans': { requiredRoles: ['Admin', 'Sale'] },
	'/profile': { requiredRoles: ['Admin', 'User', 'Sale'] },
	'/storage': { requiredRoles: ['Admin', 'User'] },
	'/trash': { requiredRoles: ['Admin', 'User'] },
	'/app-config': { requiredRoles: ['Admin'] },
};
```

### 2. Auth Store Enhancement

Extend the existing auth store with methods to check roles and get user's accessible routes.

```typescript
interface AuthState {
	user: User | null;
	setUser: (u: User) => void;
	hasPermission: (action: string, resource: string) => boolean;
	hasRole: (roleName: string) => boolean;
	canAccessRoute: (path: string) => boolean;
	getAccessibleRoutes: () => string[];
	logout: () => void;
}
```

### 3. Protected Route Component

A wrapper component that checks permissions and redirects if unauthorized.

```typescript
interface ProtectedRouteProps {
	children: React.ReactNode;
	requiredRoles?: string[];
	requiredPermissions?: Array<{ action: string; resource: string }>;
	fallbackPath?: string;
}

export function ProtectedRoute({
	children,
	requiredRoles,
	requiredPermissions,
	fallbackPath = '/home',
}: ProtectedRouteProps) {
	// Check permissions and render or redirect
}
```

### 4. Route Middleware

Middleware to intercept route changes and validate permissions.

```typescript
export function useRouteProtection() {
	const router = useRouter();
	const pathname = usePathname();
	const { canAccessRoute } = useAuthStore();

	useEffect(() => {
		if (!canAccessRoute(pathname)) {
			router.push(getDefaultRedirectPath());
		}
	}, [pathname]);
}
```

### 5. Sidebar Menu Filter

Filter sidebar items based on user permissions.

```typescript
interface SidebarItem {
	display: string;
	icon: React.ReactNode;
	to: string;
	section: string;
	requiredRoles?: string[];
	requiredPermissions?: Array<{ action: string; resource: string }>;
}
```

## Data Models

### User with Roles and Permissions

```typescript
interface User {
	id: string;
	name: string;
	email: string;
	avatar: string | null;
	userRoles?: UserRole[];
}

interface UserRole {
	id: string;
	userId: string;
	roleId: string;
	role?: Role;
}

interface Role {
	id: string;
	name: string;
	description?: string;
	rolePermissions?: RolePermission[];
}

interface RolePermission {
	id: string;
	roleId: string;
	permissionId: string;
	permission?: Permission;
}

interface Permission {
	id: string;
	name: string;
	action: string;
	resource: string;
	description?: string;
}
```

## Correctness Properties

A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.

### Property 1: Admin Access Universality

_For any_ page in the application and any admin user, the admin user should be able to access that page without redirection.

**Validates: Requirements 1.1, 1.2, 1.3**

### Property 2: Sale Role Restriction

_For any_ sale user and any page, if the page is not in the allowed pages for Sale role (Plans, Home), the user should be redirected to an appropriate default page.

**Validates: Requirements 2.2, 2.3**

### Property 3: User Role Restriction

_For any_ regular user and any admin-only page (Users, Roles, Permissions, App Config), the user should be redirected to the Home page.

**Validates: Requirements 3.2, 3.3**

### Property 4: Permission-Based Access

_For any_ user and any protected route, if the user has the required permissions for that route, access should be granted; otherwise, the user should be redirected.

**Validates: Requirements 4.1**

### Property 5: Invalid Session Handling

_For any_ user with an invalid or expired session, attempting to access any protected route should result in redirection to the login page.

**Validates: Requirements 4.2, 4.3**

### Property 6: Centralized Configuration Consistency

_For any_ route configuration change, all instances of that route's access control should reflect the change consistently across the application.

**Validates: Requirements 5.1, 5.2, 5.3**

### Property 7: Sidebar Menu Consistency

_For any_ user, the sidebar menu items displayed should exactly match the pages the user can access based on their roles and permissions.

**Validates: Requirements 1.1, 2.1, 3.1**

## Error Handling

### Unauthorized Access

- When a user attempts to access a page they don't have permission for, the system should:
    1. Log the unauthorized access attempt
    2. Redirect to an appropriate page based on user role
    3. Optionally show a toast notification informing the user

### Invalid Session

- When a user's session is invalid or expired:
    1. Clear the auth store
    2. Redirect to login page
    3. Show a message indicating session expiration

### Missing Permissions

- When permissions data is missing or incomplete:
    1. Default to denying access (fail-safe approach)
    2. Log the error for debugging
    3. Redirect to a safe default page

## Testing Strategy

### Unit Testing

- Test `hasRole()` method with various role combinations
- Test `canAccessRoute()` with different route configurations
- Test `getAccessibleRoutes()` returns correct routes for each role
- Test sidebar filtering logic with different user roles
- Test redirect logic for unauthorized access

### Property-Based Testing

- **Property 1**: Generate random admin users and random pages, verify admin can access all pages
- **Property 2**: Generate random sale users and random pages, verify they can only access allowed pages
- **Property 3**: Generate random regular users and admin-only pages, verify redirection to Home
- **Property 4**: Generate random users with various permissions and routes, verify access control
- **Property 5**: Generate users with invalid sessions, verify redirection to login
- **Property 6**: Generate route configuration changes, verify consistency across application
- **Property 7**: Generate users with various roles, verify sidebar matches accessible pages

### Testing Framework

- Use **fast-check** for property-based testing (already available in the project)
- Use **Jest** for unit tests
- Minimum 100 iterations per property-based test
- Each test should be tagged with the property it validates

### Test Coverage Goals

- Auth store methods: 100% coverage
- Route protection logic: 100% coverage
- Permission checking: 100% coverage
- Sidebar filtering: 95% coverage (UI-specific logic)
