'use client';

import { Button, Card, Col, Row, Space, Spin, Tag, Typography } from 'antd';
import { useEffect, useState } from 'react';
import PaymentModal from '../../../components/modals/modal.payment';
import { planApi } from '../../../modules/subscription/subscription.api';
import { PlanResponseDto } from '../../../modules/subscription/subscription.dto';

const { Title, Text, Paragraph } = Typography;

export default function PaymentPage() {
	const [plans, setPlans] = useState<PlanResponseDto[]>([]);
	const [loading, setLoading] = useState(true);
	const [selectedPlan, setSelectedPlan] = useState<PlanResponseDto | null>(
		null,
	);
	const [paymentModalOpen, setPaymentModalOpen] = useState(false);

	useEffect(() => {
		fetchPlans();
	}, []);

	const fetchPlans = async () => {
		try {
			setLoading(true);
			const response = await planApi.getList({ isActive: true });
			setPlans(response?.items || []);
		} catch (error) {
			console.error('Failed to fetch plans:', error);
		} finally {
			setLoading(false);
		}
	};

	const handleSelectPlan = (plan: PlanResponseDto) => {
		setSelectedPlan(plan);
		setPaymentModalOpen(true);
	};

	const handlePaymentSuccess = () => {
		window.location.reload();
	};

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat('vi-VN', {
			style: 'currency',
			currency: 'VND',
		}).format(amount);
	};

	const formatStorage = (bytes: number) => {
		const gb = bytes / (1024 * 1024 * 1024);
		return gb >= 1
			? `${gb.toFixed(0)}GB`
			: `${(bytes / (1024 * 1024)).toFixed(0)}MB`;
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

	return (
		<div style={{ padding: '24px' }}>
			<div style={{ textAlign: 'center', marginBottom: 48 }}>
				<Title level={2}>Chọn gói dịch vụ phù hợp với bạn</Title>
				<Paragraph type="secondary">
					Nâng cấp tài khoản để sử dụng nhiều tính năng hơn
				</Paragraph>
			</div>

			{plans.length === 0 ? (
				<div style={{ textAlign: 'center', padding: '40px 0' }}>
					<Paragraph type="secondary">
						Hiện tại chưa có gói dịch vụ nào
					</Paragraph>
				</div>
			) : (
				<Row gutter={[24, 24]} justify="center">
					{plans.map((plan) => (
						<Col key={plan.id} xs={24} sm={12} lg={8}>
							<Card
								hoverable
								style={{
									height: '100%',
									display: 'flex',
									flexDirection: 'column',
								}}
							>
								<div
									style={{
										textAlign: 'center',
										marginBottom: 24,
									}}
								>
									<Title level={3}>{plan.name}</Title>
									<Paragraph type="secondary">
										{plan.description || 'Gói dịch vụ'}
									</Paragraph>
									<div style={{ margin: '24px 0' }}>
										<Text
											style={{
												fontSize: 36,
												fontWeight: 'bold',
											}}
										>
											{formatCurrency(Number(plan.price))}
										</Text>
										<Text type="secondary">
											/{plan.durationDays} ngày
										</Text>
									</div>
									<Tag color="blue">
										{formatStorage(
											Number(plan.storageLimit),
										)}{' '}
										dung lượng
									</Tag>
								</div>

								<Space
									style={{ width: '100%', marginBottom: 24 }}
								>
									<div>
										<Text>
											✓{' '}
											{formatStorage(
												Number(plan.storageLimit),
											)}{' '}
											dung lượng lưu trữ
										</Text>
									</div>
									<div>
										<Text>
											✓ Sử dụng trong {plan.durationDays}{' '}
											ngày
										</Text>
									</div>
									<div>
										<Text>✓ Hỗ trợ kỹ thuật</Text>
									</div>
								</Space>

								<Button
									type="primary"
									size="large"
									block
									onClick={() => handleSelectPlan(plan)}
									style={{ marginTop: 'auto' }}
								>
									Chọn gói này
								</Button>
							</Card>
						</Col>
					))}
				</Row>
			)}

			{selectedPlan && (
				<PaymentModal
					open={paymentModalOpen}
					planId={selectedPlan.id}
					planName={selectedPlan.name}
					onClose={() => setPaymentModalOpen(false)}
					onSuccess={handlePaymentSuccess}
				/>
			)}
		</div>
	);
}
