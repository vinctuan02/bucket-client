# RBAC Root Redirect Fix

## Problem

Khi user vào `localhost:3000` (root path `/`), logic cũ mặc định redirect về `/home`. Nhưng nếu role của user không có quyền vào `/home`, sẽ throw lỗi.

**Ví dụ:**

- Admin: Có quyền vào `/home` ✅
- Sale: Không có quyền vào `/home` ❌ → Throw lỗi
- User: Có quyền vào `/home` ✅

## Solution

Thay vì mặc định redirect về `/home`, hệ thống sẽ:

1. Lấy danh sách tất cả route mà user có quyền truy cập
2. Redirect đến route đầu tiên trong danh sách
3. Nếu user không có quyền vào route nào, redirect về `/login`

## Changes Made

### 1. Root Page (`src/app/page.tsx`)

**Trước:**

```typescript
import { redirect } from 'next/navigation';

export default function Home() {
	redirect('/home');
}
```

**Sau:**

```typescript
'use client';

import { useAuthStore } from '@/modules/commons/store/common.auth-store';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
	const router = useRouter();
	const { user, isLoading, getAccessibleRoutes } = useAuthStore();

	useEffect(() => {
		// Skip if still loading user data
		if (isLoading) {
			return;
		}

		// If not authenticated, redirect to login
		if (!user) {
			router.push('/login');
			return;
		}

		// Get all accessible routes for user
		const accessibleRoutes = getAccessibleRoutes();

		// If user has no accessible routes, redirect to login
		if (accessibleRoutes.length === 0) {
			router.push('/login');
			return;
		}

		// Redirect to first accessible route
		router.push(accessibleRoutes[0]);
	}, [user, isLoading, getAccessibleRoutes, router]);

	// Show nothing while redirecting
	return null;
}
```

### 2. Route Config (`src/config/route-config.ts`)

**Trước:**

```typescript
export function getDefaultRedirectPath(userRoles?: string[]): string {
	if (!userRoles || userRoles.length === 0) {
		return '/login';
	}

	// Admin can go anywhere, default to home
	if (userRoles.includes('Admin')) {
		return '/home';
	}

	// Sale can access plans or home
	if (userRoles.includes('Sale')) {
		return '/plans';
	}

	// User defaults to home
	return '/home';
}
```

**Sau:**

```typescript
export function getDefaultRedirectPath(userRoles?: string[]): string {
	if (!userRoles || userRoles.length === 0) {
		return '/login';
	}

	// Get all accessible routes for user
	const accessibleRoutes = getAccessibleRoutesByRoles(userRoles);

	// If user has accessible routes, return the first one
	if (accessibleRoutes.length > 0) {
		return accessibleRoutes[0];
	}

	// Fallback to login if no accessible routes
	return '/login';
}
```

## How It Works

### Flow Diagram

```
User vào localhost:3000
        ↓
Root page (src/app/page.tsx)
        ↓
useAuthStore.getAccessibleRoutes()
        ↓
Lấy danh sách route mà user có quyền
        ↓
Redirect đến route đầu tiên
```

### Example Scenarios

#### Scenario 1: Admin User

```
Admin roles: ['Admin']
Accessible routes: ['/home', '/users', '/roles', '/permissions', '/plans', '/storage', '/trash', '/app-config', '/my-profile', '/share-with-me']
Redirect to: /home (route đầu tiên)
```

#### Scenario 2: Sale User

```
Sale roles: ['Sale']
Accessible routes: ['/home', '/plans', '/my-profile', '/share-with-me']
Redirect to: /home (route đầu tiên)
```

#### Scenario 3: Regular User

```
User roles: ['User']
Accessible routes: ['/home', '/my-profile', '/storage', '/trash', '/share-with-me']
Redirect to: /home (route đầu tiên)
```

#### Scenario 4: User with No Accessible Routes

```
User roles: ['UnknownRole']
Accessible routes: []
Redirect to: /login (fallback)
```

## Route Configuration

Các route được định nghĩa trong `ROUTE_CONFIGS`:

```typescript
export const ROUTE_CONFIGS: Record<string, RouteConfig> = {
	'/home': {
		path: '/home',
		requiredRoles: ['Admin', 'User', 'Sale'],
	},
	'/users': {
		path: '/users',
		requiredRoles: ['Admin'],
		redirectTo: '/home',
	},
	'/roles': {
		path: '/roles',
		requiredRoles: ['Admin'],
		redirectTo: '/home',
	},
	'/permissions': {
		path: '/permissions',
		requiredRoles: ['Admin'],
		redirectTo: '/home',
	},
	'/plans': {
		path: '/plans',
		requiredRoles: ['Admin', 'Sale'],
		redirectTo: '/home',
	},
	'/my-profile': {
		path: '/my-profile',
		requiredRoles: ['Admin', 'User', 'Sale'],
	},
	'/storage': {
		path: '/storage',
		requiredRoles: ['Admin', 'User'],
		redirectTo: '/home',
	},
	'/trash': {
		path: '/trash',
		requiredRoles: ['Admin', 'User'],
		redirectTo: '/home',
	},
	'/app-config': {
		path: '/app-config',
		requiredRoles: ['Admin'],
		redirectTo: '/home',
	},
	'/share-with-me': {
		path: '/share-with-me',
		requiredRoles: ['Admin', 'User', 'Sale'],
	},
};
```

## How to Add New Routes

Khi thêm route mới, thêm vào `ROUTE_CONFIGS`:

```typescript
'/new-page': {
	path: '/new-page',
	requiredRoles: ['Admin', 'User'],
	redirectTo: '/home',
},
```

Thì user sẽ tự động có quyền truy cập nếu có role phù hợp.

## Testing

### Test Case 1: Admin User

1. Login với Admin account
2. Vào `localhost:3000`
3. **Expected:** Redirect đến `/home`

### Test Case 2: Sale User

1. Login với Sale account
2. Vào `localhost:3000`
3. **Expected:** Redirect đến `/home` (route đầu tiên mà Sale có quyền)

### Test Case 3: Regular User

1. Login với Regular User account
2. Vào `localhost:3000`
3. **Expected:** Redirect đến `/home` (route đầu tiên mà User có quyền)

### Test Case 4: Not Authenticated

1. Logout
2. Vào `localhost:3000`
3. **Expected:** Redirect đến `/login`

## Benefits

1. **Dynamic redirect** - Tự động redirect đến route phù hợp với role
2. **No hardcoded paths** - Không cần hardcode redirect path cho từng role
3. **Scalable** - Khi thêm role mới, không cần update logic redirect
4. **Safe** - Nếu user không có quyền vào route nào, redirect về login
5. **Consistent** - Sử dụng cùng logic ở root page và unauthorized redirect

## Files Modified

- `src/app/page.tsx` - Update root page redirect logic
- `src/config/route-config.ts` - Update getDefaultRedirectPath function
