import { BaseQueryDto } from '@/modules/commons/dto/common.dto';

// ===== Plan DTOs =====
export interface CreatePlanDto {
	name: string;
	description?: string;
	storageLimit: number;
	price: number;
	durationDays: number;
	isActive?: boolean;
}

export interface UpdatePlanDto extends Partial<CreatePlanDto> {}

export class GetListPlanDto extends BaseQueryDto {
	constructor(init?: Partial<GetListPlanDto>) {
		super();
		Object.assign(this, init);
	}
}

// ===== Subscription DTOs =====
export interface CreateSubscriptionDto {
	planId: string;
	paymentMethod?: string;
}

export interface SubscriptionResponseDto {
	id: string;
	userId: string;
	planId: string;
	plan: PlanResponseDto;
	startDate: Date;
	endDate: Date;
	isActive: boolean;
	createdAt: Date;
	updatedAt: Date;
}

export interface PlanResponseDto {
	id: string;
	name: string;
	description: string | null;
	storageLimit: number;
	price: number;
	durationDays: number;
	isActive: boolean;
	createdAt: Date;
	updatedAt: Date;
}
