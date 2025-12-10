'use client';

// import { paymentApi } from '@/api/payment.api';
// import { TransactionStatus } from '@/types/payment.types';

enum TransactionStatus {
	PENDING = 'PENDING',
	SUCCESS = 'SUCCESS',
	FAILED = 'FAILED',
	CANCELED = 'CANCELED',
}
import {
	CheckCircleOutlined,
	CloseCircleOutlined,
	LoadingOutlined,
} from '@ant-design/icons';
import { Button, Card, Result, Spin, Typography } from 'antd';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

const { Paragraph, Text } = Typography;

export default function PaymentResultPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const transactionId = searchParams.get('transactionId');

	const [loading, setLoading] = useState(true);
	const [status, setStatus] = useState<TransactionStatus | null>(null);
	const [paymentData, setPaymentData] = useState<any>(null);

	useEffect(() => {
		if (transactionId) {
			checkPaymentStatus();
		} else {
			setLoading(false);
		}
	}, [transactionId]);

	const checkPaymentStatus = async () => {
		if (!transactionId) return;

		try {
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/subscription/payment/status/${transactionId}`,
				{
					headers: {
						Authorization: `Bearer ${localStorage.getItem('access_token')}`,
					},
				},
			);

			if (!response.ok) {
				throw new Error('Failed to check payment status');
			}

			const data = await response.json();
			setStatus(data.status);
			setPaymentData(data);
		} catch (error) {
			console.error('Failed to check payment status:', error);
			setStatus(TransactionStatus.FAILED);
		} finally {
			setLoading(false);
		}
	};

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat('vi-VN', {
			style: 'currency',
			currency: 'VND',
		}).format(amount);
	};

	const formatDate = (dateString: string | null) => {
		if (!dateString) return '-';
		return new Date(dateString).toLocaleDateString('vi-VN', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
		});
	};

	if (loading) {
		return (
			<div
				style={{
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
					minHeight: '400px',
				}}
			>
				<Spin size="large" />
			</div>
		);
	}

	if (!transactionId) {
		return (
			<div style={{ padding: '24px', maxWidth: 800, margin: '0 auto' }}>
				<Result
					status="warning"
					title="Không tìm thấy thông tin giao dịch"
					subTitle="Vui lòng kiểm tra lại đường dẫn hoặc quay lại trang thanh toán."
					extra={[
						<Button
							type="primary"
							key="payment"
							onClick={() => router.push('/payment')}
						>
							Quay lại trang thanh toán
						</Button>,
					]}
				/>
			</div>
		);
	}

	if (status === TransactionStatus.SUCCESS) {
		return (
			<div style={{ padding: '24px', maxWidth: 800, margin: '0 auto' }}>
				<Result
					icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
					status="success"
					title="Thanh toán thành công!"
					subTitle={`Gói ${paymentData?.subscription?.plan?.name || 'dịch vụ'} của bạn đã được kích hoạt.`}
					extra={[
						<Button
							type="primary"
							key="dashboard"
							onClick={() => router.push('/')}
						>
							Về trang chủ
						</Button>,
						<Button
							key="payment"
							onClick={() => router.push('/payment')}
						>
							Xem các gói khác
						</Button>,
					]}
				/>

				{paymentData && (
					<Card style={{ marginTop: 24 }}>
						<div style={{ marginBottom: 16 }}>
							<Text strong>Thông tin giao dịch</Text>
						</div>

						<div
							style={{
								display: 'flex',
								justifyContent: 'space-between',
								marginBottom: 8,
							}}
						>
							<Text>Mã giao dịch:</Text>
							<Text type="secondary">{transactionId}</Text>
						</div>

						<div
							style={{
								display: 'flex',
								justifyContent: 'space-between',
								marginBottom: 8,
							}}
						>
							<Text>Gói dịch vụ:</Text>
							<Text>
								{paymentData.subscription?.plan?.name || '-'}
							</Text>
						</div>

						<div
							style={{
								display: 'flex',
								justifyContent: 'space-between',
								marginBottom: 8,
							}}
						>
							<Text>Số tiền:</Text>
							<Text strong type="danger">
								{formatCurrency(paymentData.amount)}
							</Text>
						</div>

						<div
							style={{
								display: 'flex',
								justifyContent: 'space-between',
								marginBottom: 8,
							}}
						>
							<Text>Ngày thanh toán:</Text>
							<Text>{formatDate(paymentData.paidAt)}</Text>
						</div>

						{paymentData.subscription && (
							<>
								<div
									style={{
										display: 'flex',
										justifyContent: 'space-between',
										marginBottom: 8,
									}}
								>
									<Text>Ngày bắt đầu:</Text>
									<Text>
										{formatDate(
											paymentData.subscription.startDate,
										)}
									</Text>
								</div>

								<div
									style={{
										display: 'flex',
										justifyContent: 'space-between',
										marginBottom: 8,
									}}
								>
									<Text>Ngày hết hạn:</Text>
									<Text>
										{formatDate(
											paymentData.subscription.endDate,
										)}
									</Text>
								</div>
							</>
						)}
					</Card>
				)}
			</div>
		);
	}

	if (
		status === TransactionStatus.FAILED ||
		status === TransactionStatus.CANCELED
	) {
		return (
			<div style={{ padding: '24px', maxWidth: 800, margin: '0 auto' }}>
				<Result
					icon={<CloseCircleOutlined style={{ color: '#ff4d4f' }} />}
					status="error"
					title="Thanh toán thất bại"
					subTitle="Giao dịch của bạn không thành công. Vui lòng thử lại hoặc liên hệ hỗ trợ."
					extra={[
						<Button
							type="primary"
							key="retry"
							onClick={() => router.push('/payment')}
						>
							Thử lại
						</Button>,
						<Button key="home" onClick={() => router.push('/')}>
							Về trang chủ
						</Button>,
					]}
				/>

				{paymentData && (
					<Card style={{ marginTop: 24 }}>
						<div
							style={{
								display: 'flex',
								justifyContent: 'space-between',
								marginBottom: 8,
							}}
						>
							<Text>Mã giao dịch:</Text>
							<Text type="secondary">{transactionId}</Text>
						</div>

						<div
							style={{
								display: 'flex',
								justifyContent: 'space-between',
								marginBottom: 8,
							}}
						>
							<Text>Số tiền:</Text>
							<Text>{formatCurrency(paymentData.amount)}</Text>
						</div>
					</Card>
				)}
			</div>
		);
	}

	// Pending status
	return (
		<div style={{ padding: '24px', maxWidth: 800, margin: '0 auto' }}>
			<Result
				icon={<LoadingOutlined style={{ fontSize: 64 }} />}
				title="Đang xử lý thanh toán"
				subTitle="Giao dịch của bạn đang được xử lý. Vui lòng đợi trong giây lát."
				extra={[
					<Button
						type="primary"
						key="refresh"
						onClick={checkPaymentStatus}
					>
						Kiểm tra lại
					</Button>,
					<Button key="home" onClick={() => router.push('/')}>
						Về trang chủ
					</Button>,
				]}
			/>

			<Card style={{ marginTop: 24 }}>
				<Paragraph>
					Nếu bạn đã hoàn tất thanh toán, hệ thống sẽ tự động cập nhật
					trong vài phút. Bạn có thể nhấn "Kiểm tra lại" để cập nhật
					trạng thái.
				</Paragraph>
			</Card>
		</div>
	);
}
