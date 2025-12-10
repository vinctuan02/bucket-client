'use client';

import { ExclamationCircleOutlined } from '@ant-design/icons';
import { Button, Card, Result } from 'antd';
import { useRouter } from 'next/navigation';

export default function PaymentCancelPage() {
	const router = useRouter();

	return (
		<div className="flex items-center justify-center min-h-screen">
			<Card className="w-full max-w-md">
				<Result
					icon={
						<ExclamationCircleOutlined
							style={{ color: '#faad14', fontSize: '72px' }}
						/>
					}
					status="warning"
					title="Payment Cancelled"
					subTitle="You have cancelled the payment. Your subscription was not activated."
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
