import { BaseQueryDto } from '../commons/dto/common.dto';
import { FileNodeFM, ShareType } from './home.enum';

export interface FileMetadata {
	fileName: string;
	fileSize: number;
	contentType: string;
	extension: string;
}

export interface CreateFolderDto {
	name: string;
	fileNodeParentId?: string;
}

export interface UpdateFolderDto extends CreateFolderDto {}

export interface CreateFileDto {
	name: string;
	fileNodeParentId?: string;
	fileMetadata: FileMetadata;
}

export class GetlistFileNodeDto extends BaseQueryDto {
	fileNodeParentId?: string;

	fieldOrder: FileNodeFM = FileNodeFM.name;

	constructor(init?: Partial<GetlistFileNodeDto>) {
		super();
		Object.assign(this, init);
	}
}

export interface UpsertFileNodePermissionDto {
	fileNodeId?: string;
	userId?: string | null;
	canView?: boolean;
	canEdit?: boolean;
	canDelete?: boolean;
	canUpload?: boolean;
	canShare?: boolean;
	shareType?: ShareType;
	inheritedFrom?: string | null;
}

export interface BulkUpdateFileNodePermissionDto {
	upsert?: UpsertFileNodePermissionDto[];
	remove?: string[];
}
