'use client';

import { Button, Spin } from 'antd';
import { useEffect, useRef, useState } from 'react';

interface CheckoutFormProps {
	checkoutUrl: string;
	formData: Record<string, any>;
	loading?: boolean;
}

export default function CheckoutForm({
	checkoutUrl,
	formData,
	loading = false,
}: CheckoutFormProps) {
	const formRef = useRef<HTMLFormElement>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	useEffect(() => {
		// Auto-submit form after component mounts
		if (formRef.current && !loading) {
			setTimeout(() => {
				formRef.current?.submit();
			}, 500);
		}
	}, [loading]);

	const handleManualSubmit = () => {
		setIsSubmitting(true);
		formRef.current?.submit();
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<Spin size="large" tip="Preparing payment..." />
			</div>
		);
	}

	return (
		<div className="flex flex-col items-center justify-center min-h-screen">
			<div className="w-full max-w-md">
				<h1 className="text-2xl font-bold mb-4 text-center">
					Redirecting to Payment...
				</h1>
				<p className="text-center text-gray-600 mb-6">
					You will be redirected to Sepay to complete your payment.
				</p>

				{/* Hidden form that will be submitted to Sepay */}
				<form
					ref={formRef}
					method="POST"
					action={checkoutUrl}
					style={{ display: 'none' }}
				>
					{Object.entries(formData).map(([key, value]) => (
						<input
							key={key}
							type="hidden"
							name={key}
							value={
								typeof value === 'string'
									? value
									: JSON.stringify(value)
							}
						/>
					))}
				</form>

				{/* Manual submit button as fallback */}
				<div className="text-center">
					<p className="text-sm text-gray-500 mb-4">
						If you are not redirected automatically, click the
						button below:
					</p>
					<Button
						type="primary"
						size="large"
						loading={isSubmitting}
						onClick={handleManualSubmit}
						className="w-full"
					>
						Continue to Payment
					</Button>
				</div>
			</div>
		</div>
	);
}
