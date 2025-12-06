# Session Invalid Fix

## Problem

User gets "Your session is invalid. Please log in again" error immediately after login or when accessing pages.

## Root Cause

The API response structure mismatch:

**Backend returns:**

```json
{
  "statusCode": 200,
  "message": "Success",
  "messageCode": "success",
  "data": {
    "id": "user-id",
    "name": "User Name",
    "email": "user@example.com",
    "userRoles": [...]
  }
}
```

**Frontend was doing:**

```typescript
const res = await api.get('/auth/me/detail');
return res.data; // ❌ Returns ResponseSuccess object, not User
```

**What frontend received:**

```typescript
{
  statusCode: 200,
  message: "Success",
  messageCode: "success",
  data: { user object }  // ❌ This is what we need
}
```

**Then in layout.tsx:**

```typescript
const res = await authApi.meDetails();
setUser(res.data!); // ❌ Sets user to ResponseSuccess object, not User
```

## Solution

### 1. Fix auth.api.ts

Extract the actual user data from the response:

```typescript
meDetails: async () => {
	try {
		const res = await api.get<ResponseSuccess<User>>('/auth/me/detail');
		// res.data is ResponseSuccess object, need to get the data field
		return {
			data: res.data?.data, // ✅ Extract user from data field
		};
	} catch (error) {
		try {
			const res = await api.get<ResponseSuccess<User>>('/auth/me');
			return {
				data: res.data?.data, // ✅ Extract user from data field
			};
		} catch (fallbackError) {
			console.error('Failed to fetch user details:', fallbackError);
			throw fallbackError;
		}
	}
};
```

### 2. Simplify layout.tsx

Now that auth.api.ts returns correct structure:

```typescript
useEffect(() => {
	const token = localStorage.getItem('access_token');
	if (!token) {
		router.replace('/login');
		return;
	}

	(async () => {
		try {
			const res = await authApi.meDetails();
			if (res?.data) {
				setUser(res.data); // ✅ Now res.data is User object
			} else {
				console.error('No user data returned from server');
				localStorage.removeItem('access_token');
				router.replace('/login');
			}
		} catch (error) {
			console.error('Failed to fetch user details:', error);
			localStorage.removeItem('access_token');
			router.replace('/login');
		}
	})();
}, [router, setUser]);
```

## Files Modified

1. **bucket-client/src/modules/auth/auth.api.ts**
    - Fixed `meDetails()` to extract user from response.data.data
    - Added fallback with same fix

2. **bucket-client/src/app/(main)/layout.tsx**
    - Simplified error handling
    - Removed unnecessary checks

## Testing

### Before Fix

- ❌ Login → "Your session is invalid" error
- ❌ User data not loaded
- ❌ Sidebar not rendering

### After Fix

- ✅ Login successful
- ✅ User data loaded correctly
- ✅ Sidebar renders with permissions
- ✅ Session stays valid

## How to Test

1. Clear browser storage:

    ```javascript
    localStorage.clear();
    sessionStorage.clear();
    ```

2. Login with test user
3. Should see sidebar with filtered items
4. No "session invalid" error
5. Check browser console for no errors

## API Response Structure Reference

### Axios Response

```typescript
{
  status: 200,
  statusText: 'OK',
  headers: {...},
  config: {...},
  data: ResponseSuccess<User>  // ← This is what we get
}
```

### ResponseSuccess Object

```typescript
{
  statusCode: 200,
  message: 'Success',
  messageCode: 'success',
  data: User  // ← This is what we need
}
```

### Correct Access Pattern

```typescript
const axiosResponse = await api.get('/auth/me/detail');
const responseSuccess = axiosResponse.data; // ResponseSuccess object
const user = responseSuccess.data; // User object
```

## Common Mistakes

1. ❌ `res.data` when you need `res.data.data`
2. ❌ Not checking if `data` field exists
3. ❌ Assuming response structure without checking
4. ❌ Not handling fallback properly

## Prevention

1. Always check API response structure
2. Use TypeScript types to catch mismatches
3. Log responses during development
4. Test with different API endpoints
5. Document API response format

## Related Issues

- Maximum update depth exceeded (fixed separately)
- Infinite loop in sidebar (fixed separately)
- Permission checks failing (fixed separately)

## Debugging Tips

### Check Response Structure

```typescript
const res = await authApi.meDetails();
console.log('Response:', res);
console.log('User data:', res?.data);
```

### Check User in Store

```typescript
const { user } = useAuthStore.getState();
console.log('User in store:', user);
console.log('User roles:', user?.userRoles);
```

### Check API Call

```typescript
// In browser DevTools Network tab
// Look at /auth/me/detail response
// Should have data field with user object
```

## Future Improvements

1. Create response wrapper utility
2. Add response validation
3. Add response logging middleware
4. Create type-safe API client
5. Add response transformation layer
