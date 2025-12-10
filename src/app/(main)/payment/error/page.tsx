'use client';

import { CloseCircleOutlined } from '@ant-design/icons';
import { Button, Card, Result } from 'antd';
import { useRouter, useSearchParams } from 'next/navigation';

export default function PaymentErrorPage() {
	const router = useRouter();
	const searchParams = useSearchParams();

	const errorMessage =
		searchParams.get('message') || 'Payment failed. Please try again.';
	const transactionId = searchParams.get('transactionId');

	return (
		<div className="flex items-center justify-center min-h-screen">
			<Card className="w-full max-w-md">
				<Result
					icon={
						<CloseCircleOutlined
							style={{ color: '#ff4d4f', fontSize: '72px' }}
						/>
					}
					status="error"
					title="Payment Failed"
					subTitle={
						<div className="space-y-2">
							<p>{errorMessage}</p>
							{transactionId && (
								<p className="text-xs text-gray-500">
									Transaction ID: {transactionId}
								</p>
							)}
						</div>
					}
					extra={[
						<Button
							type="primary"
							key="retry"
							onClick={() => router.push('/subscription')}
						>
							Try Again
						</Button>,
						<Button
							key="home"
							onClick={() => router.push('/dashboard')}
						>
							Back to Dashboard
						</Button>,
					]}
				/>
			</Card>
		</div>
	);
}
