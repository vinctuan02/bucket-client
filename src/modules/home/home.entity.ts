import { BaseUserUUIDEntity } from '../commons/entities/common.entity';
import { User } from '../users/user.entity';

export interface FileNode extends BaseUserUUIDEntity {
	name: string;
	type: 'file' | 'folder';
	path?: string | null;
	fileBucketId?: string | null;
	ownerId?: string | null;
	fileNodeParentId?: string | null;
	fileBucket?: any | null;
	owner?: any | null;
	fileNodeParent?: FileNode | null;
	fileNodeChildrens?: FileNode[];
}

export interface FileNodePermission extends BaseUserUUIDEntity {
	id: string;
	fileNodeId: string;
	userId?: string | null;
	sharedById: string;
	canView: boolean;
	canEdit: boolean;
	// canDelete: boolean;
	// canUpload: boolean;
	// canShare: boolean;
	shareType: 'DIRECT' | 'INHERITED' | 'PUBLIC';
	inheritedFrom?: string | null;

	fileNode?: FileNode | null;
	user?: User | null;
	sharedBy?: any | null;
}
