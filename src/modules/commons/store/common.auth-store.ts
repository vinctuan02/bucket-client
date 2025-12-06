import {
	canAccessRouteByRoles,
	getAccessibleRoutesByRoles,
} from '@/config/route-config';
import { User } from '@/modules/users/user.entity';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
	user: User | null;
	isLoading: boolean;
	setUser: (u: User) => void;
	setIsLoading: (loading: boolean) => void;
	hasPermission: (action: string, resource: string) => boolean;
	hasRole: (roleName: string) => boolean;
	canAccessRoute: (path: string) => boolean;
	getAccessibleRoutes: () => string[];
	logout: () => void;
}

export const useAuthStore = create<AuthState>()(
	persist(
		(set, get) => ({
			user: null,
			isLoading: true,
			setUser: (u) => set({ user: u }),
			setIsLoading: (loading) => set({ isLoading: loading }),

			hasPermission: (action, resource) => {
				const user = get().user;
				if (!user) return false;

				return !!user.userRoles?.some((ur) =>
					ur.role?.rolePermissions?.some(
						(rp) =>
							rp.permission?.action === action &&
							rp.permission?.resource === resource,
					),
				);
			},

			hasRole: (roleName) => {
				const user = get().user;
				if (!user) return false;

				return !!user.userRoles?.some(
					(ur) => ur.role?.name === roleName,
				);
			},

			canAccessRoute: (path) => {
				const user = get().user;
				if (!user) return false;

				const userRoles =
					(user.userRoles
						?.map((ur) => ur.role?.name)
						.filter(Boolean) as string[]) || [];
				return canAccessRouteByRoles(path, userRoles);
			},

			getAccessibleRoutes: () => {
				const user = get().user;
				if (!user) return [];

				const userRoles =
					(user.userRoles
						?.map((ur) => ur.role?.name)
						.filter(Boolean) as string[]) || [];
				return getAccessibleRoutesByRoles(userRoles);
			},

			logout: () => set({ user: null }),
		}),
		{ name: 'auth-storage' },
	),
);
