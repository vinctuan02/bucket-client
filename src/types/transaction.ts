export interface TransactionDetail {
	id: string;
	userId: string;
	amount: number;
	currency: string;
	paymentMethod: string;
	status: string;
	transactionRef?: string | null;
	paymentGatewayId?: string | null;
	paidAt?: string | null;
	createdAt: string;
	updatedAt: string;
	subscription?: {
		id: string;
		isActive: boolean;
		startDate?: string | null;
		endDate?: string | null;
		plan?: {
			id: string;
			name: string;
			price: number;
			durationDays: number;
			storageLimit: number;
		} | null;
	} | null;
}

export interface TransactionHistoryItem {
	id: string;
	amount: number;
	currency: string;
	status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELED';
	paymentMethod: string;
	paymentGatewayId?: string;
	createdAt: string;
	paidAt?: string;
	subscription?: {
		id: string;
		isActive: boolean;
		startDate: string;
		endDate: string;
		plan: {
			id: string;
			name: string;
			price: number;
			durationDays: number;
			storageLimit: number;
		};
	};
}

export interface PaymentCallbackParams {
	transactionId?: string;
	orderId?: string;
	planName?: string;
	message?: string;
	code?: string;
}

export interface TransactionDetailResponse {
	success: boolean;
	data: TransactionDetail;
	message?: string;
}

export interface TransactionHistoryResponse {
	success: boolean;
	data: TransactionHistoryItem[];
	message?: string;
}
