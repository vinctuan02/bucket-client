'use client';

import CheckoutForm from '@/components/payment/CheckoutForm';
import { useEffect, useState } from 'react';

interface CheckoutData {
	checkoutUrl: string;
	formData: Record<string, any>;
	transactionId: string;
	subscription: {
		id: string;
		planName: string;
		amount: number;
		durationDays: number;
	};
}

export default function CheckoutPage() {
	const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		// Get checkout data from session storage
		const data = sessionStorage.getItem('checkoutData');
		if (data) {
			try {
				const parsed = JSON.parse(data);
				setCheckoutData(parsed);
			} catch (error) {
				console.error('Failed to parse checkout data:', error);
			}
		}
		setLoading(false);
	}, []);

	if (loading) {
		return null;
	}

	if (!checkoutData) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="text-center">
					<h1 className="text-2xl font-bold mb-4">Checkout Error</h1>
					<p className="text-gray-600">
						Unable to load checkout information. Please try again.
					</p>
				</div>
			</div>
		);
	}

	return (
		<CheckoutForm
			checkoutUrl={checkoutData.checkoutUrl}
			formData={checkoutData.formData}
			loading={false}
		/>
	);
}
