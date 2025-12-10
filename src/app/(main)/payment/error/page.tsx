'use client';

import TransactionDetailCard from '@/components/payment/TransactionDetailCard';
import { useTransactionDetail } from '@/hooks/useTransactionDetail';
import {
	CloseCircleOutlined,
	CustomerServiceOutlined,
	ReloadOutlined,
} from '@ant-design/icons';
import { Alert, Button, Card, Descriptions, Result, Space } from 'antd';
import { useRouter, useSearchParams } from 'next/navigation';

export default function PaymentErrorPage() {
	const router = useRouter();
	const searchParams = useSearchParams();

	const errorMessage =
		searchParams.get('message') || 'Payment failed. Please try again.';
	const transactionId = searchParams.get('transactionId');
	const errorCode = searchParams.get('code');
	const orderId = searchParams.get('orderId');

	const { transaction, loading } = useTransactionDetail(transactionId);

	const getErrorDetails = (code: string | null) => {
		switch (code) {
			case 'INSUFFICIENT_FUNDS':
				return {
					title: 'Insufficient Funds',
					description:
						'Your account does not have enough balance to complete this transaction.',
					suggestion:
						'Please check your account balance and try again.',
				};
			case 'CARD_DECLINED':
				return {
					title: 'Card Declined',
					description:
						'Your payment method was declined by the bank.',
					suggestion:
						'Please try a different payment method or contact your bank.',
				};
			case 'EXPIRED_CARD':
				return {
					title: 'Expired Card',
					description: 'The payment method has expired.',
					suggestion:
						'Please update your payment method and try again.',
				};
			case 'NETWORK_ERROR':
				return {
					title: 'Network Error',
					description:
						'There was a connection issue during payment processing.',
					suggestion:
						'Please check your internet connection and try again.',
				};
			default:
				return {
					title: 'Payment Failed',
					description: errorMessage,
					suggestion:
						'Please try again or contact support if the problem persists.',
				};
		}
	};

	const errorDetails = getErrorDetails(errorCode);

	return (
		<div className="flex items-center justify-center min-h-screen p-4">
			<Card className="w-full max-w-2xl">
				<Result
					icon={
						<CloseCircleOutlined
							style={{ color: '#ff4d4f', fontSize: '72px' }}
						/>
					}
					status="error"
					title={errorDetails.title}
					subTitle={errorDetails.description}
				/>

				<Alert
					title="What to do next?"
					description={errorDetails.suggestion}
					type="info"
					showIcon
					className="mb-6"
				/>

				{/* Show transaction details if available */}
				{transaction && !loading && (
					<div className="mb-6">
						<h4 className="text-lg font-medium mb-3">
							Transaction Details
						</h4>
						<TransactionDetailCard transaction={transaction} />
					</div>
				)}

				{/* Show error details */}
				{(transactionId || orderId || errorCode) && (
					<Descriptions
						title="Error Details"
						bordered
						column={1}
						size="small"
						className="mb-6"
					>
						{transactionId && (
							<Descriptions.Item label="Transaction ID">
								<code className="bg-gray-100 px-2 py-1 rounded">
									{transactionId}
								</code>
							</Descriptions.Item>
						)}
						{orderId && (
							<Descriptions.Item label="Order ID">
								<code className="bg-gray-100 px-2 py-1 rounded">
									{orderId}
								</code>
							</Descriptions.Item>
						)}
						{errorCode && (
							<Descriptions.Item label="Error Code">
								<code className="bg-red-100 px-2 py-1 rounded text-red-600">
									{errorCode}
								</code>
							</Descriptions.Item>
						)}
						<Descriptions.Item label="Time">
							{new Date().toLocaleString('vi-VN')}
						</Descriptions.Item>
					</Descriptions>
				)}

				<div className="text-center">
					<Space size="middle">
						<Button
							type="primary"
							size="large"
							icon={<ReloadOutlined />}
							onClick={() => router.push('/payment')}
						>
							Try Again
						</Button>
						<Button
							size="large"
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
						<Button
							size="large"
							icon={<CustomerServiceOutlined />}
							onClick={() => {
								const subject = `Payment Error - Transaction ${transactionId || orderId || 'Unknown'}`;
								const body = `Hello Support,\n\nI encountered a payment error:\n\nTransaction ID: ${transactionId || 'N/A'}\nOrder ID: ${orderId || 'N/A'}\nError Code: ${errorCode || 'N/A'}\nError Message: ${errorMessage}\nTime: ${new Date().toLocaleString('vi-VN')}\n\nPlease help me resolve this issue.\n\nThank you.`;
								window.open(
									`mailto:support@yourdomain.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
									'_blank',
								);
							}}
						>
							Contact Support
						</Button>
					</Space>
				</div>
			</Card>
		</div>
	);
}
