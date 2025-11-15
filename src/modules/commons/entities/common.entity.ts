import { User } from '@/modules/users/user.entity';

export interface BaseUserUUIDEntity {
	id: string;
	createdAt: string;
	updatedAt: string;
	creatorId: string;
	modifierId: string;
	creator?: User | null;
	modifier?: User | null;
}

export interface BaseUUIDEntity {
	id: string;
	createdAt: string;
	updatedAt: string;
}
