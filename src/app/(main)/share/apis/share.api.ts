import api from '@/modules/commons/const/common.const.api';

export const shareLinkApi = {
	async getByToken(token: string) {
		return api.get(`/public-share/${token}`);
	},

	async getChildren(token: string, folderId: string) {
		return api.get(`/file-node/${folderId}/children`, {
			params: { token },
		});
	},

	async create(payload: {
		fileNodeId: string;
		canView?: boolean;
		canEdit?: boolean;
		canDownload?: boolean;
	}) {
		return api.post('/share-links', payload);
	},

	async delete(id: string) {
		return api.delete(`/share-links/${id}`);
	},
};
