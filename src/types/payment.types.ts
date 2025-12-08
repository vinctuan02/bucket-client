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
	status: TransactionStatus;
	transactionId: string;
	paymentInfo: {
		paymentUrl: string;
		description: string;
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
