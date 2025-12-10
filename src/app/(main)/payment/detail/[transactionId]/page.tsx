'use client';

import { ArrowLeftOutlined, ReloadOutlined } from '@ant-design/icons';
import { Button, Card, Result, Space, Spin } from 'antd';
import { useParams, useRouter } from 'next/navigation';
import TransactionDetailCard from '../../../../../components/payment/TransactionDetailCard';
import { useTransactionDetail } from '../../../../../hooks/useTransactionDetail';

export default function TransactionDetailPage() {
	const router = useRouter();
	const params = useParams();
	const transactionId = params.transactionId as string;

	const { transaction, loading, error, refetch } =
		useTransactionDetail(transactionId);

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<Spin size="large" tip="Loading transaction details..." />
			</div>
		);
	}

	if (error || !transaction) {
		return (
			<div className="flex items-center justify-center min-h-screen p-4">
				<Card className="w-full max-w-lg">
					<Result
						status="warning"
						title="Transaction Not Found"
						subTitle={
							error ||
							'The requested transaction could not be found.'
						}
						extra={
							<Space>
								<Button
									type="primary"
									icon={<ReloadOutlined />}
									onClick={refetch}
									loading={loading}
								>
									Retry
								</Button>
								<Button
									icon={<ArrowLeftOutlined />}
									onClick={() =>
										router.push('/payment/history')
									}
								>
									Back to History
								</Button>
							</Space>
						}
					/>
				</Card>
			</div>
		);
	}

	return (
		<div className="container mx-auto px-4 py-8 max-w-4xl">
			<div className="mb-6">
				<Button
					icon={<ArrowLeftOutlined />}
					onClick={() => router.push('/payment/history')}
					className="mb-4"
				>
					Back to Payment History
				</Button>
			</div>

			<TransactionDetailCard transaction={transaction} />

			<div className="mt-6 text-center">
				<Space>
					<Button onClick={() => router.push('/dashboard')}>
						Go to Dashboard
					</Button>
					<Button onClick={() => router.push('/payment')}>
						View Plans
					</Button>
					<Button onClick={() => router.push('/payment/history')}>
						Payment History
					</Button>
				</Space>
			</div>
		</div>
	);
}
