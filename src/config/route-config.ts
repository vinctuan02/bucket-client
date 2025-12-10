/**
 * Centralized route configuration for RBAC
 * Defines which roles can access which routes
 *
 * Hierarchical Route Matching:
 * - Routes are first matched exactly against ROUTE_CONFIGS
 * - If no exact match is found, the system looks for parent route configurations
 * - Parent routes are found by progressively removing path segments
 * - Example: /payment/success/details -> /payment/success -> /payment
 * - The first matching parent route's permissions are inherited
 * - If no parent route is found, access is denied by default
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
	'/payment/success': {
		path: '/payment/success',
		requiredRoles: ['Admin', 'User', 'Sale'],
		redirectTo: '/home',
	},
	'/payment/error': {
		path: '/payment/error',
		requiredRoles: ['Admin', 'User', 'Sale'],
		redirectTo: '/home',
	},
	'/payment/cancel': {
		path: '/payment/cancel',
		requiredRoles: ['Admin', 'User', 'Sale'],
		redirectTo: '/home',
	},
	'/payment/result': {
		path: '/payment/result',
		requiredRoles: ['Admin', 'User', 'Sale'],
		redirectTo: '/home',
	},
	'/payment/checkout': {
		path: '/payment/checkout',
		requiredRoles: ['Admin', 'User', 'Sale'],
		redirectTo: '/home',
	},
	'/payment/demo': {
		path: '/payment/demo',
		requiredRoles: ['Admin', 'User', 'Sale'],
		redirectTo: '/home',
	},
	'/payment/history': {
		path: '/payment/history',
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
 * Find parent route configuration by progressively removing path segments
 */
function findParentRouteConfig(path: string): RouteConfig | null {
	// Sanitize path - remove trailing slash and ensure it starts with /
	const sanitizedPath = path.replace(/\/+$/, '') || '/';

	// Split path into segments
	const segments = sanitizedPath.split('/').filter(Boolean);

	// Try progressively shorter paths
	for (let i = segments.length - 1; i >= 0; i--) {
		const parentPath = '/' + segments.slice(0, i).join('/');
		const normalizedParentPath = parentPath === '/' ? '/' : parentPath;

		if (ROUTE_CONFIGS[normalizedParentPath]) {
			return ROUTE_CONFIGS[normalizedParentPath];
		}
	}

	return null;
}

/**
 * Check if user can access a specific route with hierarchical inheritance
 */
export function canAccessRouteByRoles(path: string, roles: string[]): boolean {
	// Sanitize path
	const sanitizedPath = path.replace(/\/+$/, '') || '/';

	// First try exact match
	let config: RouteConfig | undefined = ROUTE_CONFIGS[sanitizedPath];

	// If no exact match, try to find parent route configuration
	if (!config) {
		config = findParentRouteConfig(sanitizedPath) || undefined;
	}

	if (!config) {
		// No route configuration found (exact or parent), deny access by default
		return false;
	}

	if (!config.requiredRoles || config.requiredRoles.length === 0) {
		// No role requirement, allow access
		return true;
	}

	// Check if user has any of the required roles
	return roles.some((role) => config!.requiredRoles?.includes(role));
}
