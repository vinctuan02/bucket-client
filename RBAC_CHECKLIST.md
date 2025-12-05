# RBAC Frontend Implementation Checklist

## ✅ Completed Tasks

### Core Implementation

- [x] Create `usePermission` hook for permission checking
- [x] Create `PermissionGuard` and `RoleGuard` components
- [x] Update sidebar to use permission-based filtering
- [x] Define sidebar items with required permissions
- [x] Integrate with existing `useAuthStore`

### Sidebar Items

- [x] Home - READ FILE_NODE
- [x] Users - READ USER
- [x] Roles - READ ROLE
- [x] Permissions - READ PERMISSION
- [x] App Config - READ APP_CONFIG
- [x] Profile - No permission required
- [x] Plans - No permission required
- [x] Shared With Me - No permission required
- [x] Storage - READ STORAGE
- [x] Trash - READ TRASH

### Documentation

- [x] RBAC_SIDEBAR_GUIDE.md - Architecture and usage guide
- [x] RBAC_USAGE_EXAMPLES.md - 10+ usage examples
- [x] RBAC_IMPLEMENTATION_SUMMARY.md - Summary of changes
- [x] RBAC_CHECKLIST.md - This checklist

## 🔄 In Progress / To Do

### Frontend Components

- [ ] Apply permission guards to user management pages
- [ ] Apply permission guards to role management pages
- [ ] Apply permission guards to permission management pages
- [ ] Apply permission guards to app config pages
- [ ] Add permission checks to action buttons
- [ ] Add permission checks to form fields

### API Integration

- [ ] Verify backend returns user with roles and permissions
- [ ] Test permission checks with different user roles
- [ ] Handle 403 Forbidden responses
- [ ] Add error messages for unauthorized access

### Testing

- [ ] Test with admin role (all permissions)
- [ ] Test with user manager role (user/role/permission permissions)
- [ ] Test with regular user role (basic permissions)
- [ ] Test with no permissions
- [ ] Test sidebar visibility with different roles
- [ ] Test permission guard components

### Security

- [ ] Verify backend validates all permissions
- [ ] Add audit logging for permission checks
- [ ] Test API endpoints with unauthorized users
- [ ] Verify 403 responses are handled correctly

## 📋 Files Overview

### New Files

```
bucket-client/
├── src/
│   ├── hooks/
│   │   └── usePermission.ts (NEW)
│   └── components/
│       └── commons/
│           └── c.permission-guard.tsx (NEW)
├── RBAC_SIDEBAR_GUIDE.md (NEW)
├── RBAC_USAGE_EXAMPLES.md (NEW)
├── RBAC_IMPLEMENTATION_SUMMARY.md (NEW)
└── RBAC_CHECKLIST.md (NEW - this file)
```

### Modified Files

```
bucket-client/
└── src/
    └── components/
        └── commons/
            └── c.sidebar.tsx (MODIFIED)
```

## 🚀 Quick Start

### For Developers

1. Read `RBAC_SIDEBAR_GUIDE.md` for architecture overview
2. Check `RBAC_USAGE_EXAMPLES.md` for implementation patterns
3. Use `usePermission` hook in components
4. Wrap sensitive content with `<PermissionGuard>`

### For Testing

1. Create test users with different roles
2. Assign permissions to roles in backend
3. Login with each user
4. Verify sidebar items appear/disappear correctly

### For Adding New Features

1. Define required permission in sidebar item
2. Use `usePermission` hook to check permissions
3. Wrap components with `<PermissionGuard>`
4. Test with different user roles

## 📝 Permission Constants

All permissions are defined in `APP_PERMISSIONS`:

```typescript
// User Management
APP_PERMISSIONS.READ_USER;
APP_PERMISSIONS.CREATE_USER;
APP_PERMISSIONS.UPDATE_USER;
APP_PERMISSIONS.DELETE_USER;

// Role Management
APP_PERMISSIONS.READ_ROLE;
APP_PERMISSIONS.CREATE_ROLE;
APP_PERMISSIONS.UPDATE_ROLE;
APP_PERMISSIONS.DELETE_ROLE;

// Permission Management
APP_PERMISSIONS.READ_PERMISSION;
APP_PERMISSIONS.CREATE_PERMISSION;
APP_PERMISSIONS.UPDATE_PERMISSION;
APP_PERMISSIONS.DELETE_PERMISSION;

// File Management
APP_PERMISSIONS.READ_FILE_NODE;
APP_PERMISSIONS.CREATE_FILE_NODE;
APP_PERMISSIONS.UPDATE_FILE_NODE;
APP_PERMISSIONS.DELETE_FILE_NODE;

// Storage & Trash
APP_PERMISSIONS.READ_STORAGE;
APP_PERMISSIONS.READ_TRASH;
APP_PERMISSIONS.DELETE_TRASH;

// Plans & Config
APP_PERMISSIONS.READ_PLAN;
APP_PERMISSIONS.MANAGE_PLAN;
APP_PERMISSIONS.READ_CONFIG;
APP_PERMISSIONS.UPDATE_CONFIG;
```

## 🔗 Related Files

- Backend RBAC: `bucket-server/src/file-node-permission/`
- Auth Store: `bucket-client/src/modules/commons/store/common.auth-store.ts`
- Permission Constants: `bucket-client/src/modules/permissions/permission.constant.ts`
- Permission Enums: `bucket-client/src/modules/permissions/permisson.enum.ts`

## 💡 Tips

1. **Always check permissions before rendering**: Use `usePermission` hook
2. **Provide fallback UI**: Use `fallback` prop in `PermissionGuard`
3. **Combine permissions logically**: Don't require both READ and MANAGE
4. **Test with different roles**: Ensure proper filtering
5. **Document required permissions**: Add comments in code

## ❓ FAQ

**Q: Why use permission-based instead of role-based?**
A: Permissions are more flexible and scalable. Roles can change, but permissions define what users can actually do.

**Q: What if user doesn't have permission?**
A: The sidebar item won't show. Use `fallback` in `PermissionGuard` to show alternative UI.

**Q: Is frontend permission check enough?**
A: No! Backend must always validate permissions. Frontend checks are for UX only.

**Q: How to add a new permission?**
A: 1) Create in backend, 2) Assign to roles, 3) Update `APP_PERMISSIONS`, 4) Use in components.

**Q: Can I combine multiple permissions?**
A: Yes! Use logical operators: `can(A, B) && can(C, D)`

## 📞 Support

For questions or issues:

1. Check `RBAC_USAGE_EXAMPLES.md` for examples
2. Review `RBAC_SIDEBAR_GUIDE.md` for architecture
3. Check browser console for errors
4. Verify backend permissions are assigned correctly
