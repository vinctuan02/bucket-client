import {
	canAccessRouteByRoles,
	getAccessibleRoutesByRoles,
	getDefaultRedirectPath,
	ROUTE_CONFIGS,
} from './route-config';

describe('route-config', () => {
	describe('ROUTE_CONFIGS', () => {
		it('should have all required routes defined', () => {
			expect(ROUTE_CONFIGS['/home']).toBeDefined();
			expect(ROUTE_CONFIGS['/users']).toBeDefined();
			expect(ROUTE_CONFIGS['/roles']).toBeDefined();
			expect(ROUTE_CONFIGS['/permissions']).toBeDefined();
			expect(ROUTE_CONFIGS['/plans']).toBeDefined();
			expect(ROUTE_CONFIGS['/my-profile']).toBeDefined();
			expect(ROUTE_CONFIGS['/storage']).toBeDefined();
			expect(ROUTE_CONFIGS['/trash']).toBeDefined();
			expect(ROUTE_CONFIGS['/app-config']).toBeDefined();
		});

		it('should have correct role mappings for admin routes', () => {
			expect(ROUTE_CONFIGS['/users'].requiredRoles).toEqual(['Admin']);
			expect(ROUTE_CONFIGS['/roles'].requiredRoles).toEqual(['Admin']);
			expect(ROUTE_CONFIGS['/permissions'].requiredRoles).toEqual([
				'Admin',
			]);
			expect(ROUTE_CONFIGS['/app-config'].requiredRoles).toEqual([
				'Admin',
			]);
		});

		it('should have correct role mappings for user routes', () => {
			expect(ROUTE_CONFIGS['/storage'].requiredRoles).toEqual([
				'Admin',
				'User',
			]);
			expect(ROUTE_CONFIGS['/trash'].requiredRoles).toEqual([
				'Admin',
				'User',
			]);
		});

		it('should have correct role mappings for sale routes', () => {
			expect(ROUTE_CONFIGS['/plans'].requiredRoles).toEqual([
				'Admin',
				'Sale',
			]);
		});

		it('should have correct role mappings for common routes', () => {
			expect(ROUTE_CONFIGS['/home'].requiredRoles).toEqual([
				'Admin',
				'User',
				'Sale',
			]);
			expect(ROUTE_CONFIGS['/my-profile'].requiredRoles).toEqual([
				'Admin',
				'User',
				'Sale',
			]);
		});
	});

	describe('canAccessRouteByRoles', () => {
		it('should return true when admin accesses any route', () => {
			expect(canAccessRouteByRoles('/home', ['Admin'])).toBe(true);
			expect(canAccessRouteByRoles('/users', ['Admin'])).toBe(true);
			expect(canAccessRouteByRoles('/roles', ['Admin'])).toBe(true);
			expect(canAccessRouteByRoles('/permissions', ['Admin'])).toBe(true);
			expect(canAccessRouteByRoles('/plans', ['Admin'])).toBe(true);
			expect(canAccessRouteByRoles('/storage', ['Admin'])).toBe(true);
			expect(canAccessRouteByRoles('/trash', ['Admin'])).toBe(true);
			expect(canAccessRouteByRoles('/app-config', ['Admin'])).toBe(true);
		});

		it('should return true when user accesses allowed routes', () => {
			expect(canAccessRouteByRoles('/home', ['User'])).toBe(true);
			expect(canAccessRouteByRoles('/my-profile', ['User'])).toBe(true);
			expect(canAccessRouteByRoles('/storage', ['User'])).toBe(true);
			expect(canAccessRouteByRoles('/trash', ['User'])).toBe(true);
		});

		it('should return false when user accesses restricted routes', () => {
			expect(canAccessRouteByRoles('/users', ['User'])).toBe(false);
			expect(canAccessRouteByRoles('/roles', ['User'])).toBe(false);
			expect(canAccessRouteByRoles('/permissions', ['User'])).toBe(false);
			expect(canAccessRouteByRoles('/app-config', ['User'])).toBe(false);
		});

		it('should return true when sale accesses allowed routes', () => {
			expect(canAccessRouteByRoles('/home', ['Sale'])).toBe(true);
			expect(canAccessRouteByRoles('/plans', ['Sale'])).toBe(true);
		});

		it('should return false when sale accesses restricted routes', () => {
			expect(canAccessRouteByRoles('/users', ['Sale'])).toBe(false);
			expect(canAccessRouteByRoles('/storage', ['Sale'])).toBe(false);
			expect(canAccessRouteByRoles('/trash', ['Sale'])).toBe(false);
		});

		it('should return false for undefined routes', () => {
			expect(canAccessRouteByRoles('/undefined', ['Admin'])).toBe(false);
		});

		it('should return true when user has multiple roles and one is allowed', () => {
			expect(canAccessRouteByRoles('/users', ['User', 'Admin'])).toBe(
				true,
			);
			expect(canAccessRouteByRoles('/storage', ['Sale', 'User'])).toBe(
				true,
			);
		});

		it('should return false when user has multiple roles but none are allowed', () => {
			expect(canAccessRouteByRoles('/users', ['User', 'Sale'])).toBe(
				false,
			);
		});
	});

	describe('getAccessibleRoutesByRoles', () => {
		it('should return all routes for admin', () => {
			const routes = getAccessibleRoutesByRoles(['Admin']);
			expect(routes).toContain('/home');
			expect(routes).toContain('/users');
			expect(routes).toContain('/roles');
			expect(routes).toContain('/permissions');
			expect(routes).toContain('/plans');
			expect(routes).toContain('/storage');
			expect(routes).toContain('/trash');
			expect(routes).toContain('/app-config');
		});

		it('should return only user-allowed routes for user', () => {
			const routes = getAccessibleRoutesByRoles(['User']);
			expect(routes).toContain('/home');
			expect(routes).toContain('/my-profile');
			expect(routes).toContain('/storage');
			expect(routes).toContain('/trash');
			expect(routes).not.toContain('/users');
			expect(routes).not.toContain('/roles');
			expect(routes).not.toContain('/permissions');
			expect(routes).not.toContain('/app-config');
		});

		it('should return only sale-allowed routes for sale', () => {
			const routes = getAccessibleRoutesByRoles(['Sale']);
			expect(routes).toContain('/home');
			expect(routes).toContain('/plans');
			expect(routes).not.toContain('/users');
			expect(routes).not.toContain('/storage');
			expect(routes).not.toContain('/trash');
		});

		it('should return combined routes for multiple roles', () => {
			const routes = getAccessibleRoutesByRoles(['User', 'Sale']);
			expect(routes).toContain('/home');
			expect(routes).toContain('/my-profile');
			expect(routes).toContain('/storage');
			expect(routes).toContain('/trash');
			expect(routes).toContain('/plans');
			expect(routes).not.toContain('/users');
			expect(routes).not.toContain('/roles');
		});

		it('should return empty array for empty roles', () => {
			const routes = getAccessibleRoutesByRoles([]);
			expect(routes).toEqual([]);
		});
	});

	describe('getDefaultRedirectPath', () => {
		it('should return login for no roles', () => {
			expect(getDefaultRedirectPath()).toBe('/login');
			expect(getDefaultRedirectPath([])).toBe('/login');
		});

		it('should return home for admin', () => {
			expect(getDefaultRedirectPath(['Admin'])).toBe('/home');
		});

		it('should return plans for sale', () => {
			expect(getDefaultRedirectPath(['Sale'])).toBe('/plans');
		});

		it('should return home for user', () => {
			expect(getDefaultRedirectPath(['User'])).toBe('/home');
		});

		it('should return home for admin when multiple roles', () => {
			expect(getDefaultRedirectPath(['Admin', 'User'])).toBe('/home');
		});

		it('should return plans for sale when multiple roles without admin', () => {
			expect(getDefaultRedirectPath(['Sale', 'User'])).toBe('/plans');
		});
	});
});
