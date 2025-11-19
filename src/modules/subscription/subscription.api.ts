import { PageDto, ResponseSuccess } from '@/types/type.response';
import api from '../commons/const/common.const.api';
import {
	CreatePlanDto,
	CreateSubscriptionDto,
	GetListPlanDto,
	PlanResponseDto,
	SubscriptionResponseDto,
	UpdatePlanDto,
} from './subscription.dto';

const SUBSCRIPTION_BASE_URL = '/subscription/subscriptions';
const PLAN_BASE_URL = '/subscription/plans';

export const subscriptionApi = {
	// Subscription endpoints
	create: async (data: CreateSubscriptionDto) =>
		await api.post<ResponseSuccess<SubscriptionResponseDto>>(
			SUBSCRIPTION_BASE_URL,
			data,
		),

	getList: async () =>
		await api.get<ResponseSuccess<SubscriptionResponseDto[]>>(
			SUBSCRIPTION_BASE_URL,
		),

	getActive: async () =>
		await api.get<ResponseSuccess<SubscriptionResponseDto>>(
			`${SUBSCRIPTION_BASE_URL}/active`,
		),

	getStoragePlans: async () =>
		await api.get<ResponseSuccess<PlanResponseDto[]>>(
			`${SUBSCRIPTION_BASE_URL}/storage/plans`,
		),
};

export const planApi = {
	// Plan endpoints
	create: async (data: CreatePlanDto) =>
		await api.post<ResponseSuccess<PlanResponseDto>>(PLAN_BASE_URL, data),

	getList: async (params?: GetListPlanDto) => {
		const res = await api.get<ResponseSuccess<PageDto<PlanResponseDto>>>(
			PLAN_BASE_URL,
			{
				params,
			},
		);
		return res.data?.data;
	},

	getOne: async (id: string) =>
		await api.get<ResponseSuccess<PlanResponseDto>>(
			`${PLAN_BASE_URL}/${id}`,
		),

	update: async (id: string, data: UpdatePlanDto) =>
		await api.put<ResponseSuccess<PlanResponseDto>>(
			`${PLAN_BASE_URL}/${id}`,
			data,
		),

	delete: async (id: string) =>
		await api.delete<ResponseSuccess<null>>(`${PLAN_BASE_URL}/${id}`),
};
