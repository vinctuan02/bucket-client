import { PageDto, ResponseSuccess } from '@/types/type.response';
import api from '../commons/const/common.const.api';
import { CreateFileDto, CreateFolderDto, GetlistFileNodeDto } from './home.dto';
import { FileNode } from './home.entity';

const BASE_URL = '/file-manager';

export const fileNodeManagerApi = {
	getList: async (params?: GetlistFileNodeDto) => {
		const res = await api.get<ResponseSuccess<PageDto<FileNode>>>(
			BASE_URL,
			{ params },
		);
		return res.data;
	},

	getHome: async (params?: GetlistFileNodeDto) => {
		const res = await api.get<ResponseSuccess<PageDto<FileNode>>>(
			`${BASE_URL}/home`,
			{ params },
		);
		return res.data;
	},

	getListWithChildrens: async (params?: GetlistFileNodeDto) => {
		const res = await api.get<ResponseSuccess<PageDto<FileNode>>>(
			`${BASE_URL}/with-childrens`,
			{ params },
		);
		return res.data;
	},

	getListFullTree: async (params?: GetlistFileNodeDto) => {
		const res = await api.get<ResponseSuccess<PageDto<FileNode>>>(
			`${BASE_URL}/full-tree`,
			{ params },
		);
		return res.data;
	},

	getOne: async (id: string) => await api.get(`${BASE_URL}/${id}`),

	getOneWithChildrens: async (id: string) =>
		await api.get(`${BASE_URL}/${id}/with-childrens`),

	getOneFullTree: async (id: string) =>
		await api.get(`${BASE_URL}/${id}/full-tree`),

	createFolder: async (data: CreateFolderDto) =>
		await api.post(`${BASE_URL}/folder`, data),

	createFile: async (data: CreateFileDto) =>
		await api.post(`${BASE_URL}/file`, data),

	// updateFolder: async (id: string, data: UpdateFolderDto) =>
	// 	await api.patch(`${BASE_URL}/${id}`, data),

	delete: async (id: string) => await api.delete(`${BASE_URL}/${id}`),
};
