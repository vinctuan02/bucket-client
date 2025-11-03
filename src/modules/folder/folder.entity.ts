import { BaseUserUUIDEntity } from '@/modules/users/user.entity';

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
