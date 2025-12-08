import api from '@/modules/commons/const/common.const.api';
import type {
	CheckoutRequest,
	CheckoutResponse,
	PaymentStatusResponse,
} from '@/types/payment.types';

export const paymentApi = {
	/**
	 * Initiate payment checkout
	 */
	checkout: async (data: CheckoutRequest): Promise<CheckoutResponse> => {
		const response = await api.post('/subscription/payment/checkout', data);
		return response.data;
	},

	/**
	 * Check payment status (for polling)
	 */
	checkStatus: async (
		transactionId: string,
	): Promise<PaymentStatusResponse> => {
		const response = await api.get(
			`/subscription/payment/status/${transactionId}`,
		);
		return response.data;
	},
};
