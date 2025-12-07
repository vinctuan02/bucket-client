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
	'/': {
		path: '/',
		requiredRoles: [], // No role requirement for root, it will redirect
	},
	'/home': {
		path: '/home',
		requiredRoles: ['Admin', 'User'],
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
		requiredRoles: ['Admin', 'Sale', 'User'],
		redirectTo: '/home',
	},
	'/payment': {
		path: '/payment',
		requiredRoles: ['Admin', 'User', 'Sale'],
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
		requiredRoles: ['Admin', 'User'],
	},
};

/**
 * Get default redirect path based on user roles
 * Returns the first accessible route for the user
 */
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

/**
 * Get all accessible routes for given roles
 * Returns routes in priority order
 */
export function getAccessibleRoutesByRoles(roles: string[]): string[] {
	// Define route priority order
	const routePriority = [
		'/home',
		'/plans',
		'/payment',
		'/users',
		'/roles',
		'/permissions',
		'/my-profile',
		'/storage',
		'/trash',
		'/app-config',
		'/share-with-me',
	];

	return routePriority.filter((route) => {
		const config = ROUTE_CONFIGS[route];
		if (!config) return false;

		if (!config.requiredRoles || config.requiredRoles.length === 0) {
			return true;
		}

		return roles.some((role) => config.requiredRoles?.includes(role));
	});
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
