import { PageDto, ResponseSuccess } from '@/types/type.response';
import { Permission } from '@/types/type.user';
import api from '../commons/const/common.const.api';
import { GetListPermissionDto } from './permission.dto';

const BASE_URL = '/permissions';

export const permissionApi = {
	getList: async (params?: GetListPermissionDto) => {
		const res = await api.get<ResponseSuccess<PageDto<Permission>>>(
			`${BASE_URL}`,
			{
				params,
			},
		);

		return res.data;
	},

	getOne: (id: string) => api.get(`${BASE_URL}/${id}`),

	create: (data: Partial<Permission>) => api.post(`${BASE_URL}`, data),

	update: (id: string, data: Partial<Permission>) =>
		api.patch(`${BASE_URL}/${id}`, data),

	delete: (id: string) => api.delete(`${BASE_URL}/${id}`),
};
