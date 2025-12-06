# Session Invalid Error - Fix V2 (Race Condition)

## Problem

User still gets "Your session is invalid" error even after fixing API response structure.

## Root Cause - Race Condition

The issue was a race condition between:

1. `layout.tsx` - Async loading user data via `meDetails()`
2. `useRouteProtection` - Checking if user exists
3. `ProtectedLayout` - Showing loading state

**Timeline:**

```
1. Layout renders
2. ProtectedLayout renders → shows loading (user is null)
3. useRouteProtection runs → user is null → redirects to login
4. meDetails() finishes → setUser() → but already redirected
```

## Solution - Add Loading State

### 1. Update Auth Store

Add `isLoading` flag to track when user data is being fetched:

```typescript
interface AuthState {
  user: User | null;
  isLoading: boolean;  // ← NEW
  setUser: (u: User) => void;
  setIsLoading: (loading: boolean) => void;  // ← NEW
  // ... rest of methods
}

// In store creation:
{
  user: null,
  isLoading: true,  // ← Start as loading
  setUser: (u) => set({ user: u }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  // ...
}
```

### 2. Update useRouteProtection

Skip route protection while loading:

```typescript
export function useRouteProtection() {
	const { user, isLoading, canAccessRoute } = useAuthStore(); // ← Get isLoading

	useEffect(() => {
		// Skip if still loading user data
		if (isLoading) {
			return; // ← Don't redirect while loading
		}

		// ... rest of checks
	}, [pathname, user, isLoading, canAccessRoute, router]); // ← Add isLoading
}
```

### 3. Update Layout

Set loading state during fetch:

```typescript
const setIsLoading = useAuthStore((s) => s.setIsLoading);

useEffect(() => {
	const token = localStorage.getItem('access_token');
	if (!token) {
		setIsLoading(false); // ← Not loading
		router.replace('/login');
		return;
	}

	(async () => {
		try {
			const res = await authApi.meDetails();
			if (res?.data) {
				setUser(res.data);
			} else {
				// ...
			}
		} catch (error) {
			// ...
		} finally {
			setIsLoading(false); // ← Done loading
		}
	})();
}, [router, setUser, setIsLoading]);
```

## New Flow

```
1. Layout renders
2. ProtectedLayout renders → shows loading (isLoading = true)
3. useRouteProtection runs → isLoading = true → skips checks
4. meDetails() finishes → setUser() + setIsLoading(false)
5. ProtectedLayout re-renders → user exists → shows content
6. useRouteProtection runs again → isLoading = false → checks permissions
```

## Files Modified

1. **bucket-client/src/modules/commons/store/common.auth-store.ts**
    - Added `isLoading: boolean` field
    - Added `setIsLoading(loading: boolean)` method

2. **bucket-client/src/hooks/useRouteProtection.ts**
    - Get `isLoading` from store
    - Skip checks if `isLoading` is true
    - Add `isLoading` to dependency array

3. **bucket-client/src/app/(main)/layout.tsx**
    - Get `setIsLoading` from store
    - Set `isLoading(false)` when no token
    - Set `isLoading(false)` in finally block

## Testing

### Before Fix

- ❌ Login → "Your session is invalid" error
- ❌ Infinite redirect loop

### After Fix

- ✅ Login successful
- ✅ Loading state shown while fetching user
- ✅ User data loaded
- ✅ Sidebar renders with permissions
- ✅ No redirect loop

## How to Test

1. Clear browser storage:

    ```javascript
    localStorage.clear();
    sessionStorage.clear();
    ```

2. Login with test user
3. Should see loading spinner briefly
4. Then sidebar with filtered items
5. No "session invalid" error

## Key Insight

The problem wasn't the API response structure (that was fixed in V1), but the timing of when route protection checks run vs when user data is loaded.

By adding an `isLoading` flag, we tell `useRouteProtection` to wait until user data is fully loaded before checking permissions.

## Related Issues

- Maximum update depth exceeded (fixed in V1)
- API response structure mismatch (fixed in V1)
- Race condition between async load and route protection (fixed in V2)

## Prevention

1. Always track loading states for async operations
2. Skip permission checks while loading
3. Use loading flags in dependency arrays
4. Test with network throttling to catch race conditions
