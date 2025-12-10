'use client';

import { CheckCircleOutlined } from '@ant-design/icons';
import { Button, Card, Result, Spin, message } from 'antd';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function PaymentSuccessPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [loading, setLoading] = useState(true);
	const [paymentStatus, setPaymentStatus] = useState<any>(null);
	const [error, setError] = useState<string | null>(null);

	const transactionId = searchParams.get('transactionId');

	useEffect(() => {
		if (!transactionId) {
			setError('Transaction ID not found');
			setLoading(false);
			return;
		}

		const checkPaymentStatus = async () => {
			try {
				const response = await fetch(
					`${process.env.NEXT_PUBLIC_API_URL}/subscription/payment/status/${transactionId}`,
					{
						headers: {
							Authorization: `Bearer ${localStorage.getItem('token')}`,
						},
					},
				);

				if (!response.ok) {
					throw new Error('Failed to check payment status');
				}

				const data = await response.json();
				setPaymentStatus(data);

				if (data.status === 'SUCCESS') {
					message.success('Payment successful!');
				} else if (data.status === 'FAILED') {
					setError('Payment failed. Please try again.');
				} else {
					setError('Payment status is pending. Please wait.');
				}
			} catch (err) {
				setError(
					err instanceof Error ? err.message : 'An error occurred',
				);
				message.error('Failed to check payment status');
			} finally {
				setLoading(false);
			}
		};

		checkPaymentStatus();
	}, [transactionId]);

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<Spin size="large" tip="Checking payment status..." />
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<Card className="w-full max-w-md">
					<Result
						status="error"
						title="Payment Error"
						subTitle={error}
						extra={
							<Button
								type="primary"
								onClick={() => router.push('/subscription')}
							>
								Back to Subscription
							</Button>
						}
					/>
				</Card>
			</div>
		);
	}

	return (
		<div className="flex items-center justify-center min-h-screen">
			<Card className="w-full max-w-md">
				<Result
					icon={
						<CheckCircleOutlined
							style={{ color: '#52c41a', fontSize: '72px' }}
						/>
					}
					status="success"
					title="Payment Successful!"
					subTitle={
						<div className="space-y-2">
							<p>Your subscription has been activated.</p>
							{paymentStatus?.subscription && (
								<div className="text-left">
									<p>
										<strong>Plan:</strong>{' '}
										{paymentStatus.subscription.plan?.name}
									</p>
									<p>
										<strong>Duration:</strong>{' '}
										{
											paymentStatus.subscription.plan
												?.durationDays
										}{' '}
										days
									</p>
									<p>
										<strong>Storage:</strong>{' '}
										{
											paymentStatus.subscription.plan
												?.storageLimit
										}{' '}
										GB
									</p>
									<p>
										<strong>Start Date:</strong>{' '}
										{new Date(
											paymentStatus.subscription.startDate,
										).toLocaleDateString()}
									</p>
									<p>
										<strong>End Date:</strong>{' '}
										{new Date(
											paymentStatus.subscription.endDate,
										).toLocaleDateString()}
									</p>
								</div>
							)}
						</div>
					}
					extra={
						<Button
							type="primary"
							onClick={() => router.push('/dashboard')}
						>
							Go to Dashboard
						</Button>
					}
				/>
			</Card>
		</div>
	);
}
