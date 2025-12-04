import { User } from '@/modules/users/user.entity';
import { useAuthStore } from './common.auth-store';

describe('useAuthStore', () => {
	beforeEach(() => {
		// Reset store before each test
		const store = useAuthStore.getState();
		store.logout();
	});

	describe('hasRole', () => {
		it('should return false when user is not set', () => {
			const store = useAuthStore.getState();
			expect(store.hasRole('Admin')).toBe(false);
		});

		it('should return true when user has the specified role', () => {
			const user: User = {
				id: '1',
				name: 'Admin User',
				email: 'admin@test.com',
				avatar: null,
				provider: null,
				providerId: null,
				userRoles: [
					{
						id: '1',
						userId: '1',
						roleId: '1',
						role: {
							id: '1',
							name: 'Admin',
							description: 'Admin role',
							rolePermissions: [],
						},
					},
				],
			};

			const store = useAuthStore.getState();
			store.setUser(user);

			expect(store.hasRole('Admin')).toBe(true);
		});

		it('should return false when user does not have the specified role', () => {
			const user: User = {
				id: '1',
				name: 'User',
				email: 'user@test.com',
				avatar: null,
				provider: null,
				providerId: null,
				userRoles: [
					{
						id: '1',
						userId: '1',
						roleId: '1',
						role: {
							id: '1',
							name: 'User',
							description: 'User role',
							rolePermissions: [],
						},
					},
				],
			};

			const store = useAuthStore.getState();
			store.setUser(user);

			expect(store.hasRole('Admin')).toBe(false);
		});

		it('should return true when user has multiple roles and one matches', () => {
			const user: User = {
				id: '1',
				name: 'Multi Role User',
				email: 'multi@test.com',
				avatar: null,
				provider: null,
				providerId: null,
				userRoles: [
					{
						id: '1',
						userId: '1',
						roleId: '1',
						role: {
							id: '1',
							name: 'Admin',
							description: 'Admin role',
							rolePermissions: [],
						},
					},
					{
						id: '2',
						userId: '1',
						roleId: '2',
						role: {
							id: '2',
							name: 'Sale',
							description: 'Sale role',
							rolePermissions: [],
						},
					},
				],
			};

			const store = useAuthStore.getState();
			store.setUser(user);

			expect(store.hasRole('Admin')).toBe(true);
			expect(store.hasRole('Sale')).toBe(true);
			expect(store.hasRole('User')).toBe(false);
		});
	});

	describe('canAccessRoute', () => {
		it('should return false when user is not set', () => {
			const store = useAuthStore.getState();
			expect(store.canAccessRoute('/home')).toBe(false);
		});

		it('should return true when admin user accesses any route', () => {
			const user: User = {
				id: '1',
				name: 'Admin User',
				email: 'admin@test.com',
				avatar: null,
				provider: null,
				providerId: null,
				userRoles: [
					{
						id: '1',
						userId: '1',
						roleId: '1',
						role: {
							id: '1',
							name: 'Admin',
							description: 'Admin role',
							rolePermissions: [],
						},
					},
				],
			};

			const store = useAuthStore.getState();
			store.setUser(user);

			expect(store.canAccessRoute('/home')).toBe(true);
			expect(store.canAccessRoute('/users')).toBe(true);
			expect(store.canAccessRoute('/roles')).toBe(true);
			expect(store.canAccessRoute('/permissions')).toBe(true);
			expect(store.canAccessRoute('/plans')).toBe(true);
			expect(store.canAccessRoute('/storage')).toBe(true);
			expect(store.canAccessRoute('/trash')).toBe(true);
		});

		it('should return true when user accesses allowed routes', () => {
			const user: User = {
				id: '1',
				name: 'Regular User',
				email: 'user@test.com',
				avatar: null,
				provider: null,
				providerId: null,
				userRoles: [
					{
						id: '1',
						userId: '1',
						roleId: '1',
						role: {
							id: '1',
							name: 'User',
							description: 'User role',
							rolePermissions: [],
						},
					},
				],
			};

			const store = useAuthStore.getState();
			store.setUser(user);

			expect(store.canAccessRoute('/home')).toBe(true);
			expect(store.canAccessRoute('/my-profile')).toBe(true);
			expect(store.canAccessRoute('/storage')).toBe(true);
			expect(store.canAccessRoute('/trash')).toBe(true);
		});

		it('should return false when user accesses restricted routes', () => {
			const user: User = {
				id: '1',
				name: 'Regular User',
				email: 'user@test.com',
				avatar: null,
				provider: null,
				providerId: null,
				userRoles: [
					{
						id: '1',
						userId: '1',
						roleId: '1',
						role: {
							id: '1',
							name: 'User',
							description: 'User role',
							rolePermissions: [],
						},
					},
				],
			};

			const store = useAuthStore.getState();
			store.setUser(user);

			expect(store.canAccessRoute('/users')).toBe(false);
			expect(store.canAccessRoute('/roles')).toBe(false);
			expect(store.canAccessRoute('/permissions')).toBe(false);
			expect(store.canAccessRoute('/app-config')).toBe(false);
		});

		it('should return true when sale user accesses allowed routes', () => {
			const user: User = {
				id: '1',
				name: 'Sale User',
				email: 'sale@test.com',
				avatar: null,
				provider: null,
				providerId: null,
				userRoles: [
					{
						id: '1',
						userId: '1',
						roleId: '1',
						role: {
							id: '1',
							name: 'Sale',
							description: 'Sale role',
							rolePermissions: [],
						},
					},
				],
			};

			const store = useAuthStore.getState();
			store.setUser(user);

			expect(store.canAccessRoute('/home')).toBe(true);
			expect(store.canAccessRoute('/plans')).toBe(true);
		});

		it('should return false when sale user accesses restricted routes', () => {
			const user: User = {
				id: '1',
				name: 'Sale User',
				email: 'sale@test.com',
				avatar: null,
				provider: null,
				providerId: null,
				userRoles: [
					{
						id: '1',
						userId: '1',
						roleId: '1',
						role: {
							id: '1',
							name: 'Sale',
							description: 'Sale role',
							rolePermissions: [],
						},
					},
				],
			};

			const store = useAuthStore.getState();
			store.setUser(user);

			expect(store.canAccessRoute('/users')).toBe(false);
			expect(store.canAccessRoute('/storage')).toBe(false);
			expect(store.canAccessRoute('/trash')).toBe(false);
		});
	});

	describe('getAccessibleRoutes', () => {
		it('should return empty array when user is not set', () => {
			const store = useAuthStore.getState();
			expect(store.getAccessibleRoutes()).toEqual([]);
		});

		it('should return all routes for admin user', () => {
			const user: User = {
				id: '1',
				name: 'Admin User',
				email: 'admin@test.com',
				avatar: null,
				provider: null,
				providerId: null,
				userRoles: [
					{
						id: '1',
						userId: '1',
						roleId: '1',
						role: {
							id: '1',
							name: 'Admin',
							description: 'Admin role',
							rolePermissions: [],
						},
					},
				],
			};

			const store = useAuthStore.getState();
			store.setUser(user);

			const routes = store.getAccessibleRoutes();
			expect(routes).toContain('/home');
			expect(routes).toContain('/users');
			expect(routes).toContain('/roles');
			expect(routes).toContain('/permissions');
			expect(routes).toContain('/plans');
			expect(routes).toContain('/storage');
			expect(routes).toContain('/trash');
		});

		it('should return only user-allowed routes for regular user', () => {
			const user: User = {
				id: '1',
				name: 'Regular User',
				email: 'user@test.com',
				avatar: null,
				provider: null,
				providerId: null,
				userRoles: [
					{
						id: '1',
						userId: '1',
						roleId: '1',
						role: {
							id: '1',
							name: 'User',
							description: 'User role',
							rolePermissions: [],
						},
					},
				],
			};

			const store = useAuthStore.getState();
			store.setUser(user);

			const routes = store.getAccessibleRoutes();
			expect(routes).toContain('/home');
			expect(routes).toContain('/my-profile');
			expect(routes).toContain('/storage');
			expect(routes).toContain('/trash');
			expect(routes).not.toContain('/users');
			expect(routes).not.toContain('/roles');
			expect(routes).not.toContain('/permissions');
		});

		it('should return only sale-allowed routes for sale user', () => {
			const user: User = {
				id: '1',
				name: 'Sale User',
				email: 'sale@test.com',
				avatar: null,
				provider: null,
				providerId: null,
				userRoles: [
					{
						id: '1',
						userId: '1',
						roleId: '1',
						role: {
							id: '1',
							name: 'Sale',
							description: 'Sale role',
							rolePermissions: [],
						},
					},
				],
			};

			const store = useAuthStore.getState();
			store.setUser(user);

			const routes = store.getAccessibleRoutes();
			expect(routes).toContain('/home');
			expect(routes).toContain('/plans');
			expect(routes).not.toContain('/users');
			expect(routes).not.toContain('/storage');
			expect(routes).not.toContain('/trash');
		});
	});

	describe('hasPermission', () => {
		it('should return false when user is not set', () => {
			const store = useAuthStore.getState();
			expect(store.hasPermission('read', 'file')).toBe(false);
		});

		it('should return true when user has the permission', () => {
			const user: User = {
				id: '1',
				name: 'User',
				email: 'user@test.com',
				avatar: null,
				provider: null,
				providerId: null,
				userRoles: [
					{
						id: '1',
						userId: '1',
						roleId: '1',
						role: {
							id: '1',
							name: 'User',
							description: 'User role',
							rolePermissions: [
								{
									id: '1',
									roleId: '1',
									permissionId: '1',
									permission: {
										id: '1',
										name: 'Read File',
										action: 'read',
										resource: 'file',
										description: 'Allow reading files',
									},
								},
							],
						},
					},
				],
			};

			const store = useAuthStore.getState();
			store.setUser(user);

			expect(store.hasPermission('read', 'file')).toBe(true);
		});

		it('should return false when user does not have the permission', () => {
			const user: User = {
				id: '1',
				name: 'User',
				email: 'user@test.com',
				avatar: null,
				provider: null,
				providerId: null,
				userRoles: [
					{
						id: '1',
						userId: '1',
						roleId: '1',
						role: {
							id: '1',
							name: 'User',
							description: 'User role',
							rolePermissions: [
								{
									id: '1',
									roleId: '1',
									permissionId: '1',
									permission: {
										id: '1',
										name: 'Read File',
										action: 'read',
										resource: 'file',
										description: 'Allow reading files',
									},
								},
							],
						},
					},
				],
			};

			const store = useAuthStore.getState();
			store.setUser(user);

			expect(store.hasPermission('delete', 'file')).toBe(false);
		});
	});

	describe('logout', () => {
		it('should clear user data', () => {
			const user: User = {
				id: '1',
				name: 'User',
				email: 'user@test.com',
				avatar: null,
				provider: null,
				providerId: null,
				userRoles: [],
			};

			const store = useAuthStore.getState();
			store.setUser(user);
			expect(store.user).not.toBeNull();

			store.logout();
			expect(store.user).toBeNull();
		});
	});
});
