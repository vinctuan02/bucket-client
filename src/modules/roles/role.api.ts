import { PageDto, ResponseSuccess } from '@/types/type.response';
import { Role } from '@/types/type.user';
import api from '../commons/const/common.const.api';
import { CreateRoleDto, GetListRoleDto, UpdateRoleDto } from './role.dto';

const BASE_URL = '/roles';

export const rolesApi = {
	getList: async (params?: GetListRoleDto) => {
		const res = await api.get<ResponseSuccess<PageDto<Role>>>(BASE_URL, {
			params,
		});
		return res.data;
	},

	getOne: async (id: string) => await api.get(`${BASE_URL}/${id}`),

	create: async (data: CreateRoleDto) => await api.post(BASE_URL, data),

	update: async (id: string, data: UpdateRoleDto) =>
		await api.patch(`${BASE_URL}/${id}`, data),

	delete: async (id: string) => await api.delete(`${BASE_URL}/${id}`),
};
