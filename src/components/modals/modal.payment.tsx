'use client';

import { CheckCircleOutlined, LoadingOutlined } from '@ant-design/icons';
import { Alert, Button, Card, Divider, Modal, Spin, Typography } from 'antd';
import { useEffect, useState } from 'react';
import {
	CheckoutResponse,
	paymentApi,
} from '../../modules/payment/payment.api';

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
	const [paymentStatus, setPaymentStatus] = useState<
		'pending' | 'success' | 'failed'
	>('pending');
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

	const submitPaymentForm = (url: string, fields: Record<string, any>) => {
		const form = document.createElement('form');
		form.method = 'POST';
		form.action = url;
		form.target = '_blank';

		Object.keys(fields).forEach((key) => {
			const input = document.createElement('input');
			input.type = 'hidden';
			input.name = key;
			input.value = fields[key];
			form.appendChild(input);
		});

		document.body.appendChild(form);
		form.submit();
		document.body.removeChild(form);
	};

	const initiatePayment = async () => {
		if (!planId) return;

		setLoading(true);
		try {
			const response = await paymentApi.checkout({ planId });

			if (
				response.paymentInfo.checkoutUrl &&
				response.paymentInfo.checkoutFields
			) {
				submitPaymentForm(
					response.paymentInfo.checkoutUrl,
					response.paymentInfo.checkoutFields,
				);
				startPolling(response.transactionId);
				setPaymentData(response);
				setPaymentStatus('pending');
			}
		} catch (error) {
			console.error('Failed to initiate payment:', error);
			setPaymentStatus('failed');
		} finally {
			setLoading(false);
		}
	};

	const startPolling = (transactionId: string) => {
		const interval = setInterval(async () => {
			try {
				const status = await paymentApi.checkStatus(transactionId);

				if (status.status === 'success') {
					setPaymentStatus('success');
					clearInterval(interval);
					setTimeout(() => {
						onSuccess();
						handleClose();
					}, 2000);
				} else if (status.status === 'failed') {
					setPaymentStatus('failed');
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
		setPaymentStatus('pending');
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

			{!loading && paymentStatus === 'success' && (
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

			{!loading && paymentStatus === 'failed' && (
				<Alert
					title="Thanh toán thất bại"
					description="Vui lòng thử lại hoặc liên hệ hỗ trợ."
					type="error"
					showIcon
				/>
			)}

			{!loading && paymentStatus === 'pending' && paymentData && (
				<div>
					<Alert
						title="Đang chờ thanh toán"
						description="Một tab mới đã được mở để bạn thanh toán qua SePay. Sau khi thanh toán thành công, hệ thống sẽ tự động cập nhật."
						type="info"
						showIcon
						icon={<LoadingOutlined />}
						style={{ marginBottom: 16 }}
					/>

					<Card>
						<div style={{ textAlign: 'center', padding: '20px 0' }}>
							<Title level={4}>Thanh toán qua SePay</Title>
							<Paragraph>
								Vui lòng hoàn tất thanh toán trên tab đã mở
							</Paragraph>

							{paymentData.paymentInfo.checkoutUrl &&
								paymentData.paymentInfo.checkoutFields && (
									<Button
										type="primary"
										size="large"
										onClick={() =>
											submitPaymentForm(
												paymentData.paymentInfo
													.checkoutUrl!,
												paymentData.paymentInfo
													.checkoutFields!,
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
								<Text>{paymentData.subscription.planName}</Text>
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
									{paymentData.subscription.durationDays} ngày
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
