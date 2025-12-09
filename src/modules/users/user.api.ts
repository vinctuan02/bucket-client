import { User } from '@/modules/users/user.entity';
import { PageDto, ResponseSuccess } from '@/types/type.response';
import api from '../commons/const/common.const.api';
import {
	CreateUserDto,
	GetListUserDto,
	UpdateProfileDto,
	UpdateUserDto,
} from './user.dto';

const BASE_URL = '/users';

export const userApi = {
	getList: async (params?: GetListUserDto) => {
		const res = await api.get<ResponseSuccess<PageDto<User>>>(BASE_URL, {
			params,
		});
		return res.data;
	},

	getListSimple: async (params?: GetListUserDto) => {
		const res = await api.get<ResponseSuccess<PageDto<User>>>(
			`${BASE_URL}/simple`,
			{
				params,
			},
		);
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

	getProfile: async () => {
		const res = await api.get<ResponseSuccess<User>>(
			`${BASE_URL}/profile/me`,
		);
		return res.data;
	},

	updateProfile: async (data: UpdateProfileDto) => {
		const res = await api.patch<ResponseSuccess<User>>(
			`${BASE_URL}/profile/me`,
			data,
		);
		return res.data;
	},

	getAvatarUploadUrl: async (fileMetadata: {
		fileName: string;
		fileSize: number;
		contentType: string;
	}) => {
		const res = await api.post<
			ResponseSuccess<{ uploadUrl: string; avatarUrl: string }>
		>(`${BASE_URL}/profile/avatar-upload-url`, fileMetadata);
		return res.data;
	},
};
