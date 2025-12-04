import { useAuthStore } from '@/modules/commons/store/common.auth-store';
import { User } from '@/modules/users/user.entity';
import { render, screen, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from './ProtectedRoute';

// Mock next/navigation
jest.mock('next/navigation', () => ({
	useRouter: jest.fn(),
}));

describe('ProtectedRoute', () => {
	const mockPush = jest.fn();

	beforeEach(() => {
		jest.clearAllMocks();
		(useRouter as jest.Mock).mockReturnValue({
			push: mockPush,
		});
		// Reset auth store
		const store = useAuthStore.getState();
		store.logout();
	});

	it('should redirect to login when user is not authenticated', async () => {
		render(
			<ProtectedRoute>
				<div>Protected Content</div>
			</ProtectedRoute>,
		);

		await waitFor(() => {
			expect(mockPush).toHaveBeenCalledWith('/login');
		});
	});

	it('should render children when user has required role', async () => {
		const adminUser: User = {
			id: '1',
			name: 'Admin',
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
		store.setUser(adminUser);

		render(
			<ProtectedRoute requiredRoles={['Admin']}>
				<div>Protected Content</div>
			</ProtectedRoute>,
		);

		await waitFor(() => {
			expect(screen.getByText('Protected Content')).toBeInTheDocument();
		});
	});

	it('should redirect when user does not have required role', async () => {
		const regularUser: User = {
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
		store.setUser(regularUser);

		render(
			<ProtectedRoute requiredRoles={['Admin']}>
				<div>Protected Content</div>
			</ProtectedRoute>,
		);

		await waitFor(() => {
			expect(mockPush).toHaveBeenCalledWith('/home');
		});
	});

	it('should render children when user has one of multiple required roles', async () => {
		const saleUser: User = {
			id: '1',
			name: 'Sale',
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
		store.setUser(saleUser);

		render(
			<ProtectedRoute requiredRoles={['Admin', 'Sale']}>
				<div>Protected Content</div>
			</ProtectedRoute>,
		);

		await waitFor(() => {
			expect(screen.getByText('Protected Content')).toBeInTheDocument();
		});
	});

	it('should use custom fallback path when provided', async () => {
		const regularUser: User = {
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
		store.setUser(regularUser);

		render(
			<ProtectedRoute
				requiredRoles={['Admin']}
				fallbackPath="/custom-fallback"
			>
				<div>Protected Content</div>
			</ProtectedRoute>,
		);

		await waitFor(() => {
			expect(mockPush).toHaveBeenCalledWith('/custom-fallback');
		});
	});

	it('should render children when user has required permission', async () => {
		const userWithPermission: User = {
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
		store.setUser(userWithPermission);

		render(
			<ProtectedRoute
				requiredPermissions={[{ action: 'read', resource: 'file' }]}
			>
				<div>Protected Content</div>
			</ProtectedRoute>,
		);

		await waitFor(() => {
			expect(screen.getByText('Protected Content')).toBeInTheDocument();
		});
	});

	it('should redirect when user does not have required permission', async () => {
		const userWithoutPermission: User = {
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
		store.setUser(userWithoutPermission);

		render(
			<ProtectedRoute
				requiredPermissions={[{ action: 'delete', resource: 'file' }]}
			>
				<div>Protected Content</div>
			</ProtectedRoute>,
		);

		await waitFor(() => {
			expect(mockPush).toHaveBeenCalledWith('/home');
		});
	});

	it('should show loading state initially', () => {
		const adminUser: User = {
			id: '1',
			name: 'Admin',
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
		store.setUser(adminUser);

		render(
			<ProtectedRoute requiredRoles={['Admin']}>
				<div>Protected Content</div>
			</ProtectedRoute>,
		);

		// Loading state should be shown briefly
		expect(screen.getByText('Loading...')).toBeInTheDocument();
	});
});
