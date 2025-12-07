import api from '../commons/const/common.const.api';

export interface CheckoutRequest {
	planId: string;
}

export interface CheckoutResponse {
	status: string;
	transactionId: string;
	paymentInfo: {
		checkoutUrl?: string;
		checkoutFields?: Record<string, any>;
		qrCodeData: string;
		description: string;
		bankInfo: {
			bankName: string;
			accountNumber: string;
			accountName: string;
		};
	};
	subscription: {
		id: string;
		planName: string;
		amount: number;
		durationDays: number;
	};
}

export interface PaymentStatusResponse {
	transactionId: string;
	status: 'pending' | 'success' | 'failed' | 'canceled';
	amount: number;
	paidAt: string | null;
	subscription: {
		id: string;
		isActive: boolean;
		startDate: string | null;
		endDate: string | null;
	};
}

export const paymentApi = {
	/**
	 * Khởi tạo thanh toán
	 */
	checkout: async (data: CheckoutRequest): Promise<CheckoutResponse> => {
		const response = await api.post('/subscription/payment/checkout', data);
		return response.data;
	},

	/**
	 * Kiểm tra trạng thái thanh toán
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
