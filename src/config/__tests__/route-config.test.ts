/**
 * Property-based tests for route configuration system
 * Tests hierarchical route inheritance and permission logic
 */

import fc from 'fast-check';
import { canAccessRouteByRoles, ROUTE_CONFIGS } from '../route-config';

describe('Route Configuration Property Tests', () => {
	/**
	 * **Feature: payment-routes-permission-fix, Property 1: Sub-route permission inheritance**
	 * For any parent route with defined permissions and any sub-route under that parent,
	 * if a user has access to the parent route, then the user should also have access to the sub-route
	 */
	test('sub-route permission inheritance', () => {
		fc.assert(
			fc.property(
				// Generate parent routes that exist in config
				fc.constantFrom(...Object.keys(ROUTE_CONFIGS)),
				// Generate sub-path segments
				fc.array(
					fc.stringOf(
						fc.char().filter((c) => c !== '/'),
						{ minLength: 1, maxLength: 10 },
					),
					{ minLength: 1, maxLength: 3 },
				),
				// Generate user roles
				fc.array(fc.constantFrom('Admin', 'User', 'Sale'), {
					minLength: 1,
					maxLength: 3,
				}),
				(parentRoute, subPathSegments, userRoles) => {
					// Skip root route as it has special handling
					if (parentRoute === '/') return true;

					// Create sub-route by appending segments
					const subRoute =
						parentRoute + '/' + subPathSegments.join('/');

					// If user can access parent route, they should access sub-route
					const canAccessParent = canAccessRouteByRoles(
						parentRoute,
						userRoles,
					);
					const canAccessSub = canAccessRouteByRoles(
						subRoute,
						userRoles,
					);

					// If parent is accessible, sub-route should be accessible too
					return !canAccessParent || canAccessSub;
				},
			),
			{ numRuns: 100 },
		);
	});

	/**
	 * **Feature: payment-routes-permission-fix, Property 2: Permission denial inheritance**
	 * For any parent route with defined permissions and any sub-route under that parent,
	 * if a user does not have access to the parent route, then the user should also not have access to the sub-route
	 */
	test('permission denial inheritance', () => {
		fc.assert(
			fc.property(
				// Generate parent routes that exist in config
				fc.constantFrom(
					...Object.keys(ROUTE_CONFIGS).filter(
						(route) => route !== '/',
					),
				),
				// Generate sub-path segments
				fc.array(
					fc.stringOf(
						fc.char().filter((c) => c !== '/'),
						{ minLength: 1, maxLength: 10 },
					),
					{ minLength: 1, maxLength: 3 },
				),
				// Generate user roles that might not have access
				fc.array(fc.constantFrom('Guest', 'Viewer', 'Limited'), {
					minLength: 1,
					maxLength: 2,
				}),
				(parentRoute, subPathSegments, userRoles) => {
					// Create sub-route by appending segments
					const subRoute =
						parentRoute + '/' + subPathSegments.join('/');

					// Check access for both routes
					const canAccessParent = canAccessRouteByRoles(
						parentRoute,
						userRoles,
					);
					const canAccessSub = canAccessRouteByRoles(
						subRoute,
						userRoles,
					);

					// If parent is not accessible, sub-route should not be accessible either
					return canAccessParent || !canAccessSub;
				},
			),
			{ numRuns: 100 },
		);
	});

	/**
	 * **Feature: payment-routes-permission-fix, Property 3: Exact match precedence over inheritance**
	 * For any route that has both an exact configuration and a parent route configuration,
	 * the exact configuration should take precedence over the inherited parent configuration
	 */
	test('exact match precedence over inheritance', () => {
		fc.assert(
			fc.property(
				// Generate roles for testing
				fc.array(fc.constantFrom('Admin', 'User', 'Sale'), {
					minLength: 1,
					maxLength: 3,
				}),
				(userRoles) => {
					// Test with payment sub-routes that have explicit configs
					const explicitRoutes = [
						'/payment/success',
						'/payment/error',
						'/payment/cancel',
					];

					return explicitRoutes.every((route) => {
						// These routes have explicit configs, so they should use exact match logic
						const hasAccess = canAccessRouteByRoles(
							route,
							userRoles,
						);
						const expectedAccess = userRoles.some((role) =>
							['Admin', 'User', 'Sale'].includes(role),
						);

						return hasAccess === expectedAccess;
					});
				},
			),
			{ numRuns: 100 },
		);
	});
});

describe('Route Configuration Unit Tests', () => {
	describe('Payment sub-route configurations', () => {
		test('payment success page allows access for authorized roles', () => {
			expect(canAccessRouteByRoles('/payment/success', ['User'])).toBe(
				true,
			);
			expect(canAccessRouteByRoles('/payment/success', ['Admin'])).toBe(
				true,
			);
			expect(canAccessRouteByRoles('/payment/success', ['Sale'])).toBe(
				true,
			);
		});

		test('payment error page allows access for authorized roles', () => {
			expect(canAccessRouteByRoles('/payment/error', ['User'])).toBe(
				true,
			);
			expect(canAccessRouteByRoles('/payment/error', ['Admin'])).toBe(
				true,
			);
			expect(canAccessRouteByRoles('/payment/error', ['Sale'])).toBe(
				true,
			);
		});

		test('payment cancel page allows access for authorized roles', () => {
			expect(canAccessRouteByRoles('/payment/cancel', ['User'])).toBe(
				true,
			);
			expect(canAccessRouteByRoles('/payment/cancel', ['Admin'])).toBe(
				true,
			);
			expect(canAccessRouteByRoles('/payment/cancel', ['Sale'])).toBe(
				true,
			);
		});

		test('payment result page allows access for authorized roles', () => {
			expect(canAccessRouteByRoles('/payment/result', ['User'])).toBe(
				true,
			);
			expect(canAccessRouteByRoles('/payment/result', ['Admin'])).toBe(
				true,
			);
			expect(canAccessRouteByRoles('/payment/result', ['Sale'])).toBe(
				true,
			);
		});

		test('payment checkout page allows access for authorized roles', () => {
			expect(canAccessRouteByRoles('/payment/checkout', ['User'])).toBe(
				true,
			);
			expect(canAccessRouteByRoles('/payment/checkout', ['Admin'])).toBe(
				true,
			);
			expect(canAccessRouteByRoles('/payment/checkout', ['Sale'])).toBe(
				true,
			);
		});

		test('payment demo page allows access for authorized roles', () => {
			expect(canAccessRouteByRoles('/payment/demo', ['User'])).toBe(true);
			expect(canAccessRouteByRoles('/payment/demo', ['Admin'])).toBe(
				true,
			);
			expect(canAccessRouteByRoles('/payment/demo', ['Sale'])).toBe(true);
		});

		test('payment sub-routes deny access for unauthorized roles', () => {
			const unauthorizedRoles = ['Guest', 'Viewer'];
			const paymentRoutes = [
				'/payment/success',
				'/payment/error',
				'/payment/cancel',
				'/payment/result',
				'/payment/checkout',
				'/payment/demo',
			];

			paymentRoutes.forEach((route) => {
				unauthorizedRoles.forEach((role) => {
					expect(canAccessRouteByRoles(route, [role])).toBe(false);
				});
			});
		});
	});

	describe('Backward compatibility', () => {
		test('existing routes still work as before', () => {
			expect(canAccessRouteByRoles('/home', ['User'])).toBe(true);
			expect(canAccessRouteByRoles('/users', ['Admin'])).toBe(true);
			expect(canAccessRouteByRoles('/users', ['User'])).toBe(false);
			expect(canAccessRouteByRoles('/storage', ['User'])).toBe(true);
			expect(canAccessRouteByRoles('/storage', ['Guest'])).toBe(false);
		});
	});

	describe('Edge cases', () => {
		test('handles malformed paths gracefully', () => {
			expect(canAccessRouteByRoles('', ['User'])).toBe(false);
			expect(
				canAccessRouteByRoles('//payment//success//', ['User']),
			).toBe(true);
			expect(canAccessRouteByRoles('/payment/success/', ['User'])).toBe(
				true,
			);
		});

		test('handles empty roles array', () => {
			expect(canAccessRouteByRoles('/payment/success', [])).toBe(false);
			expect(canAccessRouteByRoles('/home', [])).toBe(false);
		});

		test('handles non-existent routes with parent inheritance', () => {
			// Should inherit from /payment parent route
			expect(
				canAccessRouteByRoles('/payment/unknown-page', ['User']),
			).toBe(true);
			expect(
				canAccessRouteByRoles('/payment/unknown-page', ['Guest']),
			).toBe(false);
		});
	});
});
