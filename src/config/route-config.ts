/**
 * Centralized route configuration for RBAC
 * Defines which roles can access which routes
 */

export interface RouteConfig {
	path: string;
	requiredRoles?: string[];
	requiredPermissions?: Array<{ action: string; resource: string }>;
	redirectTo?: string;
}

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

/**
 * Get default redirect path based on user roles
 */
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

/**
 * Get all accessible routes for given roles
 */
export function getAccessibleRoutesByRoles(roles: string[]): string[] {
	return Object.values(ROUTE_CONFIGS)
		.filter((config) => {
			if (!config.requiredRoles || config.requiredRoles.length === 0) {
				return true;
			}
			return roles.some((role) => config.requiredRoles?.includes(role));
		})
		.map((config) => config.path);
}

/**
 * Check if user can access a specific route
 */
export function canAccessRouteByRoles(path: string, roles: string[]): boolean {
	const config = ROUTE_CONFIGS[path];

	if (!config) {
		// Route not configured, deny access by default
		return false;
	}

	if (!config.requiredRoles || config.requiredRoles.length === 0) {
		// No role requirement, allow access
		return true;
	}

	// Check if user has any of the required roles
	return roles.some((role) => config.requiredRoles?.includes(role));
}
