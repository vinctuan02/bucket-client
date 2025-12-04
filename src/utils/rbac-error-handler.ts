/**
 * RBAC Error Handler Utility
 * Handles unauthorized access attempts and provides user feedback
 */

import { message } from 'antd';

export enum UnauthorizedReason {
	NO_ROLE = 'NO_ROLE',
	INSUFFICIENT_PERMISSION = 'INSUFFICIENT_PERMISSION',
	SESSION_EXPIRED = 'SESSION_EXPIRED',
	INVALID_SESSION = 'INVALID_SESSION',
	UNKNOWN = 'UNKNOWN',
}

interface UnauthorizedAccessLog {
	timestamp: Date;
	reason: UnauthorizedReason;
	attemptedPath: string;
	userRoles?: string[];
	redirectedTo: string;
}

// Store unauthorized access attempts for debugging
const unauthorizedAccessLogs: UnauthorizedAccessLog[] = [];

/**
 * Log unauthorized access attempt
 */
export function logUnauthorizedAccess(
	reason: UnauthorizedReason,
	attemptedPath: string,
	redirectedTo: string,
	userRoles?: string[],
) {
	const log: UnauthorizedAccessLog = {
		timestamp: new Date(),
		reason,
		attemptedPath,
		userRoles,
		redirectedTo,
	};

	unauthorizedAccessLogs.push(log);

	// Keep only last 100 logs
	if (unauthorizedAccessLogs.length > 100) {
		unauthorizedAccessLogs.shift();
	}

	// Log to console in development
	if (process.env.NODE_ENV === 'development') {
		console.warn('[RBAC] Unauthorized Access:', log);
	}
}

/**
 * Get all unauthorized access logs
 */
export function getUnauthorizedAccessLogs(): UnauthorizedAccessLog[] {
	return [...unauthorizedAccessLogs];
}

/**
 * Clear unauthorized access logs
 */
export function clearUnauthorizedAccessLogs() {
	unauthorizedAccessLogs.length = 0;
}

/**
 * Show unauthorized access notification
 */
export function showUnauthorizedNotification(reason: UnauthorizedReason) {
	const messages: Record<UnauthorizedReason, string> = {
		[UnauthorizedReason.NO_ROLE]:
			'You do not have a role assigned. Please contact administrator.',
		[UnauthorizedReason.INSUFFICIENT_PERMISSION]:
			'You do not have permission to access this page.',
		[UnauthorizedReason.SESSION_EXPIRED]:
			'Your session has expired. Please log in again.',
		[UnauthorizedReason.INVALID_SESSION]:
			'Your session is invalid. Please log in again.',
		[UnauthorizedReason.UNKNOWN]:
			'Access denied. Please try again or contact support.',
	};

	const notificationMessage =
		messages[reason] || messages[UnauthorizedReason.UNKNOWN];

	message.error(notificationMessage);
}

/**
 * Get redirect path based on unauthorized reason
 */
export function getRedirectPathForReason(
	reason: UnauthorizedReason,
	userRoles?: string[],
): string {
	switch (reason) {
		case UnauthorizedReason.SESSION_EXPIRED:
		case UnauthorizedReason.INVALID_SESSION:
		case UnauthorizedReason.NO_ROLE:
			return '/login';

		case UnauthorizedReason.INSUFFICIENT_PERMISSION:
			// Redirect based on user roles
			if (!userRoles || userRoles.length === 0) {
				return '/login';
			}
			if (userRoles.includes('Admin')) {
				return '/home';
			}
			if (userRoles.includes('Sale')) {
				return '/plans';
			}
			return '/home';

		default:
			return '/home';
	}
}
