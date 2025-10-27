import { PageDto, ResponseSuccess } from '@/types/type.response';
import { User } from '@/types/type.user';
import api from '../commons/const/common.const.api';
import { CreateUserDto, GetListUserDto, UpdateUserDto } from './user.dto';

const BASE_URL = '/users';

export const userApi = {
	getList: async (params?: GetListUserDto) => {
		const res = await api.get<ResponseSuccess<PageDto<User>>>(BASE_URL, {
			params,
		});
		return res.data;
	},

	getOne: async (id: string) => {
		const res = await api.get<ResponseSuccess<User>>(`${BASE_URL}/${id}`);
		return res.data;
	},

	create: async (data: CreateUserDto) => {
		const res = await api.post<ResponseSuccess<User>>(BASE_URL, data);
		return res.data;
	},

	update: async (id: string, data: UpdateUserDto) => {
		const res = await api.patch<ResponseSuccess<User>>(
			`${BASE_URL}/${id}`,
			data,
		);
		return res.data;
	},

	delete: async (id: string) => {
		const res = await api.delete<ResponseSuccess<null>>(
			`${BASE_URL}/${id}`,
		);
		return res.data;
	},
};
