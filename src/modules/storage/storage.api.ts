import { ResponseSuccess } from '@/types/type.response';
import api from '../commons/const/common.const.api';

export interface StorageInfo {
	baseLimit: number;
	bonusLimit: number;
	totalLimit: number;
	used: number;
	available: number;
	percentage: number;
}

const BASE_URL = '/user-storage';

export const storageApi = {
	getMyStorage: async () => {
		const res = await api.get<ResponseSuccess<StorageInfo>>(
			`${BASE_URL}/me`,
		);
		return res.data;
	},
};
