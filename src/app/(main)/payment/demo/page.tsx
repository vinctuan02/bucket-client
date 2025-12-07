'use client';

import { CheckCircleOutlined } from '@ant-design/icons';
import { Button, Card, Result, Typography } from 'antd';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import api from '../../../../modules/commons/const/common.const.api';

const { Title, Paragraph } = Typography;

export default function PaymentDemoPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const transactionId = searchParams.get('transactionId');
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState(false);

	const handleSimulatePayment = async () => {
		if (!transactionId) return;

		setLoading(true);
		try {
			await api.post(
				`/subscription/payment-demo/simulate-success/${transactionId}`,
			);
			setSuccess(true);
			setTimeout(() => {
				window.close();
			}, 2000);
		} catch (error) {
			console.error('Failed to simulate payment:', error);
		} finally {
			setLoading(false);
		}
	};

	if (success) {
		return (
			<div
				style={{
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
					minHeight: '100vh',
					padding: '24px',
				}}
			>
				<Result
					icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
					title="Thanh toán thành công!"
					subTitle="Gói dịch vụ của bạn đã được kích hoạt. Cửa sổ này sẽ tự động đóng."
					status="success"
				/>
			</div>
		);
	}

	return (
		<div
			style={{
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
				minHeight: '100vh',
				padding: '24px',
				background: '#f0f2f5',
			}}
		>
			<Card style={{ maxWidth: 600, width: '100%' }}>
				<div style={{ textAlign: 'center' }}>
					<Title level={2}>Demo Thanh Toán</Title>
					<Paragraph type="secondary">
						Đây là trang demo để test luồng thanh toán mà không cần
						SePay thật
					</Paragraph>

					<div
						style={{
							background: '#fafafa',
							padding: '24px',
							borderRadius: '8px',
							margin: '24px 0',
						}}
					>
						<Paragraph>
							<strong>Transaction ID:</strong>
						</Paragraph>
						<Paragraph copyable>{transactionId}</Paragraph>
					</div>

					<Button
						type="primary"
						size="large"
						loading={loading}
						onClick={handleSimulatePayment}
						block
					>
						Giả lập thanh toán thành công
					</Button>

					<Paragraph
						type="secondary"
						style={{ marginTop: 16, fontSize: 12 }}
					>
						Trong môi trường thật, bạn sẽ thanh toán qua SePay
					</Paragraph>
				</div>
			</Card>
		</div>
	);
}
