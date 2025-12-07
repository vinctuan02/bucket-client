import { create } from 'zustand';
import { appConfigApi } from './app-config.api';
import { AppConfig } from './app-config.entity';

interface AppConfigState {
	config: AppConfig | null;
	loading: boolean;
	fetchConfig: () => Promise<void>;
	updateConfig: (data: Partial<AppConfig>) => Promise<void>;
}

export const useAppConfigStore = create<AppConfigState>((set) => ({
	config: null,
	loading: false,

	fetchConfig: async () => {
		set({ loading: true });
		try {
			const response = await appConfigApi.get();
			set({ config: response.data, loading: false });
		} catch (error) {
			console.error('Failed to fetch app config:', error);
			set({ loading: false });
		}
	},

	updateConfig: async (data: Partial<AppConfig>) => {
		set({ loading: true });
		try {
			const response = await appConfigApi.update(data);
			set({ config: response.data, loading: false });
		} catch (error) {
			console.error('Failed to update app config:', error);
			set({ loading: false });
			throw error;
		}
	},
}));
