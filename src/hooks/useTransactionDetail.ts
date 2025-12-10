'use client';

import { TransactionDetail } from '@/types/transaction';
import { useCallback, useEffect, useState } from 'react';

interface UseTransactionDetailResult {
	transaction: TransactionDetail | null;
	loading: boolean;
	error: string | null;
	refetch: () => void;
}

export function useTransactionDetail(
	transactionId: string | null,
): UseTransactionDetailResult {
	const [transaction, setTransaction] = useState<TransactionDetail | null>(
		null,
	);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const fetchTransactionDetail = useCallback(async () => {
		if (!transactionId) {
			setError('Transaction ID is required');
			setLoading(false);
			return;
		}

		setLoading(true);
		setError(null);

		try {
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/subscription/payment/detail/${transactionId}`,
				{
					headers: {
						Authorization: `Bearer ${localStorage.getItem('access_token')}`,
						'Content-Type': 'application/json',
					},
				},
			);

			if (!response.ok) {
				if (response.status === 404) {
					throw new Error('Transaction not found');
				}
				if (response.status === 403) {
					throw new Error(
						'Access denied: You can only view your own transactions',
					);
				}
				throw new Error(
					`Failed to fetch transaction details: ${response.status}`,
				);
			}

			const result = await response.json();
			setTransaction(result.data);
		} catch (err) {
			const errorMessage =
				err instanceof Error ? err.message : 'An error occurred';
			setError(errorMessage);
			console.error('Failed to fetch transaction details:', err);
		} finally {
			setLoading(false);
		}
	}, [transactionId]);

	const refetch = useCallback(() => {
		fetchTransactionDetail();
	}, [fetchTransactionDetail]);

	useEffect(() => {
		if (transactionId) {
			fetchTransactionDetail();
		}
	}, [fetchTransactionDetail, transactionId]);

	return {
		transaction,
		loading,
		error,
		refetch,
	};
}
