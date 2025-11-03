import { BaseQueryDto } from '../commons/dto/common.dto';

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
}
