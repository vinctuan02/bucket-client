import { User } from '@/modules/users/user.entity';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
	user: User | null;
	setUser: (u: User) => void;
	hasPermission: (action: string, resource: string) => boolean;
	logout: () => void;
}

export const useAuthStore = create<AuthState>()(
	persist(
		(set, get) => ({
			user: null,
			setUser: (u) => set({ user: u }),

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

			logout: () => set({ user: null }),
		}),
		{ name: 'auth-storage' },
	),
);
