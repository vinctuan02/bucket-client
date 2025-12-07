import { ResponseSuccess } from '@/types/type.response';
import api from '../commons/const/common.const.api';
import { UpdateAppConfigDto } from './app-config.dto';
import { AppConfig } from './app-config.entity';

const BASE_URL = '/app-config';

export const appConfigApi = {
	get: async () => {
		const res = await api.get<ResponseSuccess<AppConfig>>(BASE_URL);
		return res.data;
	},

	update: async (data: UpdateAppConfigDto) => {
		const res = await api.put<ResponseSuccess<AppConfig>>(BASE_URL, data);
		return res.data;
	},
};
