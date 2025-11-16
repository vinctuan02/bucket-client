import { BaseUserUUIDEntity } from '../commons/entities/common.entity';

// ===== Plan =====
export interface Plan {
	id: string;
	name: string;
	description?: string | null;
	storageLimit: number;
	price: number;
	durationDays: number;
	isActive: boolean;
	createdAt: Date;
	updatedAt: Date;
}

// ===== UserSubscription =====
export interface UserSubscription extends BaseUserUUIDEntity {
	userId: string;
	planId: string;
	plan?: Plan;
	startDate: Date;
	endDate: Date;
	isActive: boolean;
}
