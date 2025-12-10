'use client';

import TransactionDetailCard from '@/components/payment/TransactionDetailCard';
import { useTransactionDetail } from '@/hooks/useTransactionDetail';
import {
	ExclamationCircleOutlined,
	HomeOutlined,
	ShoppingCartOutlined,
} from '@ant-design/icons';
import { Alert, Button, Card, Result, Space, Timeline } from 'antd';
import { useRouter, useSearchParams } from 'next/navigation';

export default function PaymentCancelPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const transactionId = searchParams.get('transactionId');
	const orderId = searchParams.get('orderId');
	const planName = searchParams.get('planName');

	const { transaction, loading } = useTransactionDetail(transactionId);

	return (
		<div className="flex items-center justify-center min-h-screen p-4">
			<Card className="w-full max-w-2xl">
				<Result
					icon={
						<ExclamationCircleOutlined
							style={{ color: '#faad14', fontSize: '72px' }}
						/>
					}
					status="warning"
					title="Payment Cancelled"
					subTitle={
						planName
							? `You have cancelled the payment for ${planName}. Your subscription was not activated.`
							: 'You have cancelled the payment. Your subscription was not activated.'
					}
				/>

				<Alert
					title="No charges were made"
					description="Since you cancelled the payment, no money has been deducted from your account. You can try again anytime."
					type="info"
					showIcon
					className="mb-6"
				/>

				<div className="mb-6">
					<h4 className="text-lg font-medium mb-3">
						What happens next?
					</h4>
					<Timeline
						items={[
							{
								children:
									'Your payment was cancelled - no charges applied',
								color: 'orange',
							},
							{
								children:
									'Your current subscription remains unchanged',
								color: 'blue',
							},
							{
								children: 'You can retry the payment anytime',
								color: 'green',
							},
						]}
					/>
				</div>

				{/* Show transaction details if available */}
				{transaction && !loading && (
					<div className="mb-6">
						<h4 className="text-lg font-medium mb-3">
							Transaction Details
						</h4>
						<TransactionDetailCard
							transaction={transaction}
							showTitle={false}
						/>
					</div>
				)}

				{/* Fallback to show orderId if no transaction details */}
				{!transaction && orderId && (
					<div className="mb-6 p-3 bg-gray-50 rounded">
						<p className="text-sm text-gray-600">
							<strong>Order ID:</strong>{' '}
							<code className="bg-white px-2 py-1 rounded">
								{orderId}
							</code>
						</p>
					</div>
				)}

				{/* Show transaction ID if available */}
				{transactionId && (
					<div className="mb-6 p-3 bg-gray-50 rounded">
						<p className="text-sm text-gray-600">
							<strong>Transaction ID:</strong>{' '}
							<code className="bg-white px-2 py-1 rounded">
								{transactionId}
							</code>
						</p>
					</div>
				)}

				<div className="text-center">
					<Space size="middle">
						<Button
							type="primary"
							size="large"
							icon={<ShoppingCartOutlined />}
							onClick={() => router.push('/payment')}
						>
							Choose Plan Again
						</Button>
						<Button
							size="large"
							icon={<HomeOutlined />}
							onClick={() => router.push('/dashboard')}
						>
							Back to Dashboard
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
