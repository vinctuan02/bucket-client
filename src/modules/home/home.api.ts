import { PageDto, ResponseSuccess } from '@/types/type.response';
import api from '../commons/const/common.const.api';
import {
	BulkUpdateFileNodePermissionDto,
	CreateFileDto,
	CreateFolderDto,
	GetListFileNodeDto,
} from './home.dto';
import { FileNode, FileNodePermission } from './home.entity';

const BASE_URL = '/file-manager';

export const fileNodeManagerApi = {
	getList: async (params?: GetListFileNodeDto) => {
		const res = await api.get<ResponseSuccess<PageDto<FileNode>>>(
			BASE_URL,
			{ params },
		);
		return res.data;
	},

	getHome: async (params?: GetListFileNodeDto) => {
		const res = await api.get<ResponseSuccess<PageDto<FileNode>>>(
			`${BASE_URL}/home`,
			{ params },
		);
		return res.data;
	},

	getListWithChildren: async (params?: GetListFileNodeDto) => {
		const res = await api.get<ResponseSuccess<PageDto<FileNode>>>(
			`${BASE_URL}/with-children`,
			{ params },
		);
		return res.data;
	},

	getListFullTree: async (params?: GetListFileNodeDto) => {
		const res = await api.get<ResponseSuccess<PageDto<FileNode>>>(
			`${BASE_URL}/full-tree`,
			{ params },
		);
		return res.data;
	},

	getOne: async (id: string) => await api.get(`${BASE_URL}/${id}`),

	getOneWithChildren: async (id: string) =>
		await api.get(`${BASE_URL}/${id}/with-children`),

	getPermissions: async (id: string): Promise<FileNodePermission[]> => {
		const res = await api.get<ResponseSuccess<FileNodePermission[]>>(
			`${BASE_URL}/${id}/permissions`,
		);

		// Trả về data bên trong res.data.data
		return res.data.data ?? [];
	},

	getOneFullTree: async (id: string) =>
		await api.get(`${BASE_URL}/${id}/full-tree`),

	getChildren: async (id: string, params: GetListFileNodeDto) => {
		const res = await api.get(`${BASE_URL}/${id}/children`, { params });
		return res.data;
	},

	getBreadcrumbs: async (id: string) => {
		const data = await api.get<ResponseSuccess<FileNode[]>>(
			`${BASE_URL}/${id}/breadcrumbs`,
		);
		return data.data;
	},

	readFile: async (id: string) => {
		const res = await api.get<
			ResponseSuccess<{
				id: string;
				fileBucket: {
					id: string;
					contentType: string;
					readUrl: string;
					fileName: string;
				};
			}>
		>(`${BASE_URL}/${id}/read`);
		return res.data;
	},

	createFolder: async (data: CreateFolderDto) =>
		await api.post(`${BASE_URL}/folder`, data),

	createFile: async (data: CreateFileDto) =>
		await api.post(`${BASE_URL}/file`, data),

	bulkUpdatePermissions: async (
		id: string,
		dto: BulkUpdateFileNodePermissionDto,
	) => {
		const res = await api.put(`${BASE_URL}/${id}/bulk/permission`, dto);
		return res.data;
	},

	// updateFolder: async (id: string, data: UpdateFolderDto) =>
	// 	await api.patch(`${BASE_URL}/${id}`, data),

	delete: async (id: string) => await api.delete(`${BASE_URL}/${id}`),
};
