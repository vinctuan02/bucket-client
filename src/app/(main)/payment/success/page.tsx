'use client';

import TransactionDetailCard from '@/components/payment/TransactionDetailCard';
import { useTransactionDetail } from '@/hooks/useTransactionDetail';
import { CheckCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import { Button, Card, Result, Space, Spin, message } from 'antd';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export default function PaymentSuccessPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const transactionId = searchParams.get('transactionId');

	const { transaction, loading, error, refetch } =
		useTransactionDetail(transactionId);

	useEffect(() => {
		if (transaction?.status === 'SUCCESS') {
			message.success('Payment successful!');
		}
	}, [transaction]);

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<Spin size="large" tip="Loading transaction details..." />
			</div>
		);
	}

	if (error || !transactionId) {
		return (
			<div className="flex items-center justify-center min-h-screen p-4">
				<Card className="w-full max-w-lg">
					<Result
						status="warning"
						title="Payment Status Check"
						subTitle={error || 'Transaction ID not found in URL'}
						extra={
							<Space>
								{transactionId && (
									<Button
										type="primary"
										icon={<ReloadOutlined />}
										onClick={refetch}
										loading={loading}
									>
										Refresh Status
									</Button>
								)}
								<Button onClick={() => router.push('/payment')}>
									Back to Payment
								</Button>
								<Button
									onClick={() =>
										router.push('/payment/history')
									}
								>
									Payment History
								</Button>
							</Space>
						}
					/>
				</Card>
			</div>
		);
	}

	if (!transaction) {
		return (
			<div className="flex items-center justify-center min-h-screen p-4">
				<Card className="w-full max-w-lg">
					<Result
						status="404"
						title="Transaction Not Found"
						subTitle="The requested transaction could not be found."
						extra={
							<Space>
								<Button
									type="primary"
									onClick={() =>
										router.push('/payment/history')
									}
								>
									View Payment History
								</Button>
								<Button onClick={() => router.push('/payment')}>
									Back to Payment
								</Button>
							</Space>
						}
					/>
				</Card>
			</div>
		);
	}

	return (
		<div className="flex items-center justify-center min-h-screen p-4">
			<Card className="w-full max-w-2xl">
				<Result
					icon={
						<CheckCircleOutlined
							style={{ color: '#52c41a', fontSize: '72px' }}
						/>
					}
					status="success"
					title="Payment Successful!"
					subTitle="Your subscription has been activated successfully."
				/>

				<div className="mt-6">
					<TransactionDetailCard transaction={transaction} />
				</div>

				<div className="mt-6 text-center">
					<Space>
						<Button
							type="primary"
							size="large"
							onClick={() => router.push('/dashboard')}
						>
							Go to Dashboard
						</Button>
						<Button
							size="large"
							onClick={() => router.push('/payment')}
						>
							View Plans
						</Button>
						<Button
							size="large"
							onClick={() => router.push('/payment/history')}
						>
							Payment History
						</Button>
					</Space>
				</div>
			</Card>
		</div>
	);
}
