import { ResponseSuccess } from '@/types/type.response';
import api from '../commons/const/common.const.api';

export interface FileNode {
	id: string;
	name: string;
	type: 'file' | 'folder';
	ownerId: string;
	createdAt: string;
	updatedAt: string;
	deletedAt?: string;
	isDelete: boolean;
	fileNodeParentId?: string;
	fileBucketId?: string;
	fileBucket?: {
		id: string;
		fileName: string;
		fileSize: number;
		contentType: string;
	};
}

export interface FileNodeListResponse {
	items: FileNode[];
	metadata: {
		totalItems: number;
		page: number;
		limit: number;
	};
}

const BASE_URL = '/file-manager';

export const fileManagerApi = {
	// List files
	getList: async (params?: any) => {
		const res = await api.get<ResponseSuccess<FileNodeListResponse>>(
			`${BASE_URL}`,
			{ params },
		);
		return res.data;
	},

	// Get home directory
	getHome: async (params?: any) => {
		const res = await api.get<ResponseSuccess<FileNodeListResponse>>(
			`${BASE_URL}/home`,
			{ params },
		);
		return res.data;
	},

	// Get trash (deleted files)
	getTrash: async (params?: any) => {
		const res = await api.get<ResponseSuccess<FileNodeListResponse>>(
			`${BASE_URL}`,
			{
				params: { ...params, isDelete: true },
			},
		);
		return res.data;
	},

	// Get file details
	getOne: async (id: string) => {
		const res = await api.get<ResponseSuccess<FileNode>>(
			`${BASE_URL}/${id}`,
		);
		return res.data;
	},

	// Get file with children
	getOneWithChildren: async (id: string) => {
		const res = await api.get<ResponseSuccess<FileNode>>(
			`${BASE_URL}/${id}/with-children`,
		);
		return res.data;
	},

	// Get breadcrumbs
	getBreadcrumbs: async (id: string) => {
		const res = await api.get<ResponseSuccess<FileNode[]>>(
			`${BASE_URL}/${id}/breadcrumbs`,
		);
		return res.data;
	},

	// Create folder
	createFolder: async (data: { name: string; fileNodeParentId?: string }) => {
		const res = await api.post<ResponseSuccess<FileNode>>(
			`${BASE_URL}/folder`,
			data,
		);
		return res.data;
	},

	// Create file
	createFile: async (data: any) => {
		const res = await api.post<
			ResponseSuccess<FileNode & { uploadUrl: string }>
		>(`${BASE_URL}/file`, data);
		return res.data;
	},

	// Delete (soft delete - move to trash)
	delete: async (id: string) => {
		const res = await api.delete(`${BASE_URL}/${id}`);
		return res.data;
	},

	// Permanent delete
	deletePermanent: async (id: string) => {
		const res = await api.delete(`${BASE_URL}/${id}/permanent`);
		return res.data;
	},

	// Restore from trash
	restore: async (id: string) => {
		const res = await api.put<ResponseSuccess<FileNode>>(
			`${BASE_URL}/${id}/restore`,
			{},
		);
		return res.data;
	},
};
