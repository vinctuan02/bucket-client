'use client';

import { paymentApi } from '@/api/payment.api';
import {
	TransactionStatus,
	type CheckoutResponse,
} from '@/types/payment.types';
import { CheckCircleOutlined, LoadingOutlined } from '@ant-design/icons';
import { Alert, Button, Card, Divider, Modal, Spin, Typography } from 'antd';
import { useEffect, useState } from 'react';

const { Title, Text, Paragraph } = Typography;

interface PaymentModalProps {
	open: boolean;
	planId: string | null;
	planName: string;
	onClose: () => void;
	onSuccess: () => void;
}

export default function PaymentModal({
	open,
	planId,
	planName,
	onClose,
	onSuccess,
}: PaymentModalProps) {
	const [loading, setLoading] = useState(false);
	const [paymentData, setPaymentData] = useState<CheckoutResponse | null>(
		null,
	);
	const [paymentStatus, setPaymentStatus] = useState<TransactionStatus>(
		TransactionStatus.PENDING,
	);
	const [pollingInterval, setPollingInterval] =
		useState<NodeJS.Timeout | null>(null);

	useEffect(() => {
		if (open && planId) {
			initiatePayment();
		}

		return () => {
			if (pollingInterval) {
				clearInterval(pollingInterval);
			}
		};
	}, [open, planId]);

	const initiatePayment = async () => {
		if (!planId) return;

		setLoading(true);
		try {
			const response = await paymentApi.checkout({ planId });

			// Open payment URL in new tab
			if (response.paymentInfo.paymentUrl) {
				window.open(response.paymentInfo.paymentUrl, '_blank');
			}

			// Start polling for payment status
			startPolling(response.transactionId);
			setPaymentData(response);
			setPaymentStatus(TransactionStatus.PENDING);
		} catch (error) {
			console.error('Failed to initiate payment:', error);
			setPaymentStatus(TransactionStatus.FAILED);
		} finally {
			setLoading(false);
		}
	};

	const startPolling = (transactionId: string) => {
		const interval = setInterval(async () => {
			try {
				const status = await paymentApi.checkStatus(transactionId);

				if (status.status === TransactionStatus.SUCCESS) {
					setPaymentStatus(TransactionStatus.SUCCESS);
					clearInterval(interval);
					setTimeout(() => {
						onSuccess();
						handleClose();
					}, 2000);
				} else if (status.status === TransactionStatus.FAILED) {
					setPaymentStatus(TransactionStatus.FAILED);
					clearInterval(interval);
				}
			} catch (error) {
				console.error('Failed to check payment status:', error);
			}
		}, 3000);

		setPollingInterval(interval);
	};

	const handleClose = () => {
		if (pollingInterval) {
			clearInterval(pollingInterval);
		}
		setPaymentData(null);
		setPaymentStatus(TransactionStatus.PENDING);
		onClose();
	};

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat('vi-VN', {
			style: 'currency',
			currency: 'VND',
		}).format(amount);
	};

	return (
		<Modal
			title={`Thanh toán gói ${planName}`}
			open={open}
			onCancel={handleClose}
			footer={null}
			width={600}
			centered
		>
			{loading && (
				<div style={{ textAlign: 'center', padding: '40px 0' }}>
					<Spin size="large" />
					<Paragraph style={{ marginTop: 16 }}>
						Đang khởi tạo thanh toán...
					</Paragraph>
				</div>
			)}

			{!loading && paymentStatus === TransactionStatus.SUCCESS && (
				<div style={{ textAlign: 'center', padding: '40px 0' }}>
					<CheckCircleOutlined
						style={{ fontSize: 64, color: '#52c41a' }}
					/>
					<Title level={3} style={{ marginTop: 16 }}>
						Thanh toán thành công!
					</Title>
					<Paragraph>
						Gói {planName} của bạn đã được kích hoạt.
					</Paragraph>
				</div>
			)}

			{!loading && paymentStatus === TransactionStatus.FAILED && (
				<Alert
					title="Thanh toán thất bại"
					description="Vui lòng thử lại hoặc liên hệ hỗ trợ."
					type="error"
					showIcon
				/>
			)}

			{!loading &&
				paymentStatus === TransactionStatus.PENDING &&
				paymentData && (
					<div>
						<Alert
							title="Đang chờ thanh toán"
							description="Một tab mới đã được mở để bạn thanh toán qua Sepay. Sau khi thanh toán thành công, hệ thống sẽ tự động cập nhật."
							type="info"
							showIcon
							icon={<LoadingOutlined />}
							style={{ marginBottom: 16 }}
						/>

						<Card>
							<div
								style={{
									textAlign: 'center',
									padding: '20px 0',
								}}
							>
								<Title level={4}>Thanh toán qua Sepay</Title>
								<Paragraph>
									Vui lòng hoàn tất thanh toán trên tab đã mở
								</Paragraph>

								{paymentData.paymentInfo.paymentUrl && (
									<Button
										type="primary"
										size="large"
										onClick={() =>
											window.open(
												paymentData.paymentInfo
													.paymentUrl,
												'_blank',
											)
										}
										style={{ marginTop: 16 }}
									>
										Mở lại trang thanh toán
									</Button>
								)}
							</div>

							<Divider />

							<div style={{ marginTop: 16 }}>
								<div
									style={{
										display: 'flex',
										justifyContent: 'space-between',
										marginBottom: 8,
									}}
								>
									<Text strong>Gói dịch vụ:</Text>
									<Text>
										{paymentData.subscription.planName}
									</Text>
								</div>
								<div
									style={{
										display: 'flex',
										justifyContent: 'space-between',
										marginBottom: 8,
									}}
								>
									<Text strong>Số tiền:</Text>
									<Text strong type="danger">
										{formatCurrency(
											paymentData.subscription.amount,
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
									<Text strong>Thời hạn:</Text>
									<Text>
										{paymentData.subscription.durationDays}{' '}
										ngày
									</Text>
								</div>
								<div
									style={{
										display: 'flex',
										justifyContent: 'space-between',
										marginBottom: 8,
									}}
								>
									<Text strong>Nội dung:</Text>
									<Text type="secondary">
										{paymentData.paymentInfo.description}
									</Text>
								</div>
							</div>

							<Alert
								title="Lưu ý"
								description="Hệ thống sẽ tự động kiểm tra và kích hoạt gói dịch vụ sau khi bạn thanh toán thành công."
								type="warning"
								showIcon
								style={{ marginTop: 16 }}
							/>
						</Card>
					</div>
				)}
		</Modal>
	);
}
