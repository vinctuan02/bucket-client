export enum TransactionStatus {
	PENDING = 'pending',
	SUCCESS = 'success',
	FAILED = 'failed',
	CANCELED = 'canceled',
	ERROR = 'error',
}

export interface CheckoutRequest {
	planId: string;
}

export interface CheckoutResponse {
	status: string;
	transactionId: string;
	checkoutUrl: string;
	formData: Record<string, string>;
	subscription: {
		id: string;
		planName: string;
		amount: number;
		durationDays: number;
	};
}

export interface PaymentStatusResponse {
	transactionId: string;
	status: TransactionStatus;
	amount: number;
	paidAt: string | null;
	subscription: {
		id: string;
		isActive: boolean;
		startDate: string | null;
		endDate: string | null;
		plan: {
			id: string;
			name: string;
			description: string;
			price: number;
			storageLimit: number;
			durationDays: number;
		};
	} | null;
}
