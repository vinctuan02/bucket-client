export enum PlanFieldMapping {
	ID = 'plan.id',
	NAME = 'plan.name',
	DESCRIPTION = 'plan.description',
	STORAGE_LIMIT = 'plan.storageLimit',
	PRICE = 'plan.price',
	DURATION_DAYS = 'plan.durationDays',
	IS_ACTIVE = 'plan.isActive',
	CREATED_AT = 'plan.createdAt',
	UPDATED_AT = 'plan.updatedAt',
}

export enum SubscriptionFieldMapping {
	ID = 'subscription.id',
	USER_ID = 'subscription.userId',
	PLAN_ID = 'subscription.planId',
	START_DATE = 'subscription.startDate',
	END_DATE = 'subscription.endDate',
	IS_ACTIVE = 'subscription.isActive',
	CREATED_AT = 'subscription.createdAt',
	UPDATED_AT = 'subscription.updatedAt',
}
