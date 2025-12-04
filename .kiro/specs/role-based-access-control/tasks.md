# Implementation Plan - Role-Based Access Control (RBAC) Frontend

## Overview

This implementation plan converts the RBAC design into actionable coding tasks. Each task builds incrementally on previous tasks to implement a complete role-based access control system for the frontend.

---

## Tasks

- [x]   1. Enhance Auth Store with Role and Route Checking Methods
    - Extend `useAuthStore` with `hasRole()` method to check if user has a specific role
    - Add `canAccessRoute()` method to check if user can access a specific route
    - Add `getAccessibleRoutes()` method to return all accessible routes for the user
    - Update auth store to properly load user roles and permissions from backend
    - _Requirements: 5.1, 5.3_

- [ ]\* 1.1 Write property tests for Auth Store role checking
    - **Property 1: Admin Access Universality**
    - **Validates: Requirements 1.1, 1.2, 1.3**

- [ ]\* 1.2 Write property tests for Auth Store route access
    - **Property 4: Permission-Based Access**
    - **Validates: Requirements 4.1**

- [x]   2. Create Centralized Route Configuration
    - Create `route-config.ts` file with route definitions and required roles/permissions
    - Define routes for: home, users, roles, permissions, plans, profile, storage, trash, app-config
    - Map each route to required roles (Admin, Sale, User)
    - Export route configuration for use in protection middleware
    - _Requirements: 5.1, 5.2_

- [ ]\* 2.1 Write unit tests for route configuration
    - Test that all routes are properly defined
    - Test that role mappings are correct for each route
    - _Requirements: 5.1_

- [x]   3. Create Protected Route Component
    - Create `ProtectedRoute.tsx` component that wraps pages requiring authorization
    - Component should check user permissions before rendering children
    - Redirect to appropriate page if user lacks permissions
    - Support both role-based and permission-based access control
    - _Requirements: 4.1, 5.3_

- [ ]\* 3.1 Write unit tests for ProtectedRoute component
    - Test rendering when user has required role
    - Test redirection when user lacks required role
    - Test with different role combinations
    - _Requirements: 4.1_

- [x]   4. Implement Route Protection Middleware
    - Create middleware hook `useRouteProtection()` to check route access on navigation
    - Integrate with Next.js routing to intercept unauthorized access
    - Redirect to appropriate fallback page based on user role
    - Handle invalid/expired sessions by redirecting to login
    - _Requirements: 4.1, 4.2, 4.3_

- [ ]\* 4.1 Write property tests for route protection
    - **Property 2: Sale Role Restriction**
    - **Validates: Requirements 2.2, 2.3**

- [ ]\* 4.2 Write property tests for user role restriction
    - **Property 3: User Role Restriction**
    - **Validates: Requirements 3.2, 3.3**

- [ ]\* 4.3 Write property tests for invalid session handling
    - **Property 5: Invalid Session Handling**
    - **Validates: Requirements 4.2, 4.3**

- [x]   5. Update Sidebar Component with Permission Filtering
    - Uncomment and activate the permission checking logic in `c.sidebar.tsx`
    - Filter sidebar items based on user roles and permissions
    - Only display menu items the user has access to
    - Update sidebar items configuration to include required roles/permissions
    - _Requirements: 1.1, 2.1, 3.1_

- [ ]\* 5.1 Write property tests for sidebar filtering
    - **Property 7: Sidebar Menu Consistency**
    - **Validates: Requirements 1.1, 2.1, 3.1**

- [x]   6. Create Layout Wrapper with Route Protection
    - Create `ProtectedLayout.tsx` component that wraps the main layout
    - Apply route protection to all pages in the main layout
    - Ensure route protection runs on every page navigation
    - Handle loading states while checking permissions
    - _Requirements: 4.1, 5.3_

- [ ]\* 6.1 Write unit tests for ProtectedLayout
    - Test that protection is applied to all routes
    - Test loading state handling
    - _Requirements: 4.1_

- [x]   7. Update Page Components to Use Protected Routes
    - Wrap admin-only pages (Users, Roles, Permissions, App Config) with ProtectedRoute
    - Wrap user-only pages (Home, Profile, Storage, Trash) with ProtectedRoute
    - Wrap sale-only pages (Plans) with ProtectedRoute
    - Ensure all pages have appropriate role requirements
    - _Requirements: 1.1, 2.1, 3.1_

- [ ]\* 7.1 Write integration tests for page access
    - Test admin can access all pages
    - Test sale user can only access Plans and Home
    - Test regular user can only access Home, Profile, Storage, Trash
    - _Requirements: 1.1, 2.1, 3.1_

- [x]   8. Add Error Handling and User Feedback
    - Add toast notifications for unauthorized access attempts
    - Log unauthorized access attempts for debugging
    - Display appropriate error messages based on redirect reason
    - Handle edge cases (missing permissions, invalid roles)
    - _Requirements: 4.1, 4.2, 4.3_

- [ ]\* 8.1 Write unit tests for error handling
    - Test unauthorized access notifications
    - Test error logging
    - _Requirements: 4.1_

- [x]   9. Checkpoint - Ensure all tests pass
    - Ensure all tests pass, ask the user if questions arise.

- [ ]   10. Test RBAC Implementation End-to-End
    - Test admin user can access all pages without redirection
    - Test sale user can access Plans and Home, redirects from other pages
    - Test regular user can access Home, Profile, Storage, Trash, redirects from admin pages
    - Test invalid session redirects to login
    - Test sidebar shows correct menu items for each role
    - _Requirements: 1.1, 2.1, 3.1, 4.1, 5.1_

- [ ]   11. Final Checkpoint - Verify all requirements met
    - Ensure all tests pass, ask the user if questions arise.
