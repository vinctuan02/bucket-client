'use client';

import {
	CheckCircleOutlined,
	ClockCircleOutlined,
	CloseCircleOutlined,
	EyeOutlined,
	HistoryOutlined,
	ReloadOutlined,
} from '@ant-design/icons';
import {
	Badge,
	Button,
	Card,
	Col,
	Descriptions,
	Empty,
	Modal,
	Row,
	Space,
	Spin,
	Table,
	Tag,
	Typography,
	message,
} from 'antd';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const { Title, Text } = Typography;

interface Plan {
	id: string;
	name: string;
	price: number;
	durationDays: number;
	storageLimit: number;
}

interface Subscription {
	id: string;
	isActive: boolean;
	startDate: string;
	endDate: string;
	plan: Plan;
}

interface Transaction {
	id: string;
	amount: number;
	currency: string;
	status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELED';
	paymentMethod: string;
	paymentGatewayId?: string;
	createdAt: string;
	paidAt?: string;
	subscription?: Subscription;
}

export default function PaymentHistoryPage() {
	const router = useRouter();
	const [transactions, setTransactions] = useState<Transaction[]>([]);
	const [loading, setLoading] = useState(true);
	const [selectedTransaction, setSelectedTransaction] =
		useState<Transaction | null>(null);
	const [detailModalVisible, setDetailModalVisible] = useState(false);

	useEffect(() => {
		fetchTransactionHistory();
	}, []);

	const fetchTransactionHistory = async () => {
		setLoading(true);
		try {
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/subscription/payment/history`,
				{
					headers: {
						Authorization: `Bearer ${localStorage.getItem('access_token')}`,
					},
				},
			);

			if (!response.ok) {
				throw new Error('Failed to fetch transaction history');
			}

			const data = await response.json();
			setTransactions(data);
		} catch (error) {
			message.error('Failed to load transaction history');
			console.error(error);
		} finally {
			setLoading(false);
		}
	};

	const formatCurrency = (amount: number, currency: string = 'VND') => {
		return new Intl.NumberFormat('vi-VN', {
			style: 'currency',
			currency: currency,
		}).format(amount);
	};

	const formatBytes = (bytes: number) => {
		if (bytes === 0) return '0 Bytes';
		const k = 1024;
		const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case 'SUCCESS':
				return 'success';
			case 'PENDING':
				return 'processing';
			case 'FAILED':
				return 'error';
			case 'CANCELED':
				return 'default';
			default:
				return 'default';
		}
	};

	const getStatusIcon = (status: string) => {
		switch (status) {
			case 'SUCCESS':
				return <CheckCircleOutlined />;
			case 'PENDING':
				return <ClockCircleOutlined />;
			case 'FAILED':
				return <CloseCircleOutlined />;
			case 'CANCELED':
				return <CloseCircleOutlined />;
			default:
				return <ClockCircleOutlined />;
		}
	};

	const getStatusText = (status: string) => {
		switch (status) {
			case 'SUCCESS':
				return 'Thành công';
			case 'PENDING':
				return 'Đang xử lý';
			case 'FAILED':
				return 'Thất bại';
			case 'CANCELED':
				return 'Đã hủy';
			default:
				return status;
		}
	};

	const showTransactionDetail = (transaction: Transaction) => {
		setSelectedTransaction(transaction);
		setDetailModalVisible(true);
	};

	const columns = [
		{
			title: 'Mã giao dịch',
			dataIndex: 'id',
			key: 'id',
			render: (id: string) => (
				<Text code className="text-xs">
					{id.substring(0, 8)}...
				</Text>
			),
		},
		{
			title: 'Gói dịch vụ',
			key: 'plan',
			render: (record: Transaction) => (
				<div>
					<Text strong>
						{record.subscription?.plan?.name || 'N/A'}
					</Text>
					{record.subscription?.plan && (
						<div className="text-xs text-gray-500">
							{formatBytes(record.subscription.plan.storageLimit)}{' '}
							- {record.subscription.plan.durationDays} ngày
						</div>
					)}
				</div>
			),
		},
		{
			title: 'Số tiền',
			dataIndex: 'amount',
			key: 'amount',
			render: (amount: number, record: Transaction) => (
				<Text strong className="text-blue-600">
					{formatCurrency(amount, record.currency)}
				</Text>
			),
		},
		{
			title: 'Trạng thái',
			dataIndex: 'status',
			key: 'status',
			render: (status: string) => (
				<Tag
					color={getStatusColor(status)}
					icon={getStatusIcon(status)}
				>
					{getStatusText(status)}
				</Tag>
			),
		},
		{
			title: 'Ngày tạo',
			dataIndex: 'createdAt',
			key: 'createdAt',
			render: (date: string) => (
				<div>
					<div>{new Date(date).toLocaleDateString('vi-VN')}</div>
					<div className="text-xs text-gray-500">
						{new Date(date).toLocaleTimeString('vi-VN')}
					</div>
				</div>
			),
		},
		{
			title: 'Hành động',
			key: 'actions',
			render: (record: Transaction) => (
				<Space>
					<Button
						type="link"
						icon={<EyeOutlined />}
						onClick={() => showTransactionDetail(record)}
					>
						Chi tiết
					</Button>
					<Button
						type="link"
						onClick={() =>
							router.push(`/payment/detail/${record.id}`)
						}
					>
						Xem đầy đủ
					</Button>
				</Space>
			),
		},
	];

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<Spin size="large" tip="Đang tải lịch sử thanh toán..." />
			</div>
		);
	}

	return (
		<div className="container mx-auto px-4 py-8 max-w-7xl">
			<div className="mb-8">
				<div className="flex items-center justify-between">
					<div>
						<Title level={2}>
							<HistoryOutlined className="mr-3 text-blue-500" />
							Lịch sử thanh toán
						</Title>
						<Text type="secondary">
							Xem tất cả các giao dịch và đơn hàng của bạn
						</Text>
					</div>
					<Button
						icon={<ReloadOutlined />}
						onClick={fetchTransactionHistory}
						loading={loading}
					>
						Làm mới
					</Button>
				</div>
			</div>

			{transactions.length === 0 ? (
				<Card>
					<Empty
						description="Chưa có giao dịch nào"
						image={Empty.PRESENTED_IMAGE_SIMPLE}
					>
						<Button
							type="primary"
							onClick={() => router.push('/payment')}
						>
							Mua gói dịch vụ
						</Button>
					</Empty>
				</Card>
			) : (
				<Card>
					<Table
						columns={columns}
						dataSource={transactions}
						rowKey="id"
						pagination={{
							pageSize: 10,
							showSizeChanger: true,
							showQuickJumper: true,
							showTotal: (total, range) =>
								`${range[0]}-${range[1]} của ${total} giao dịch`,
						}}
						scroll={{ x: 800 }}
					/>
				</Card>
			)}

			{/* Transaction Detail Modal */}
			<Modal
				title="Chi tiết giao dịch"
				open={detailModalVisible}
				onCancel={() => setDetailModalVisible(false)}
				footer={[
					<Button
						key="close"
						onClick={() => setDetailModalVisible(false)}
					>
						Đóng
					</Button>,
					selectedTransaction?.status === 'SUCCESS' && (
						<Button
							key="subscription"
							type="primary"
							onClick={() => {
								setDetailModalVisible(false);
								router.push('/payment');
							}}
						>
							Xem gói dịch vụ
						</Button>
					),
				]}
				width={800}
			>
				{selectedTransaction && (
					<div>
						<Row gutter={[24, 24]}>
							<Col xs={24} md={12}>
								<Card title="Thông tin giao dịch" size="small">
									<Descriptions column={1} size="small">
										<Descriptions.Item label="Mã giao dịch">
											<Text code>
												{selectedTransaction.id}
											</Text>
										</Descriptions.Item>
										<Descriptions.Item label="Số tiền">
											<Text
												strong
												className="text-lg text-blue-600"
											>
												{formatCurrency(
													selectedTransaction.amount,
													selectedTransaction.currency,
												)}
											</Text>
										</Descriptions.Item>
										<Descriptions.Item label="Trạng thái">
											<Tag
												color={getStatusColor(
													selectedTransaction.status,
												)}
												icon={getStatusIcon(
													selectedTransaction.status,
												)}
											>
												{getStatusText(
													selectedTransaction.status,
												)}
											</Tag>
										</Descriptions.Item>
										<Descriptions.Item label="Phương thức thanh toán">
											{selectedTransaction.paymentMethod}
										</Descriptions.Item>
										{selectedTransaction.paymentGatewayId && (
											<Descriptions.Item label="Mã thanh toán">
												<Text code>
													{
														selectedTransaction.paymentGatewayId
													}
												</Text>
											</Descriptions.Item>
										)}
										<Descriptions.Item label="Ngày tạo">
											{new Date(
												selectedTransaction.createdAt,
											).toLocaleString('vi-VN')}
										</Descriptions.Item>
										{selectedTransaction.paidAt && (
											<Descriptions.Item label="Ngày thanh toán">
												{new Date(
													selectedTransaction.paidAt,
												).toLocaleString('vi-VN')}
											</Descriptions.Item>
										)}
									</Descriptions>
								</Card>
							</Col>

							<Col xs={24} md={12}>
								{selectedTransaction.subscription && (
									<Card
										title="Thông tin gói dịch vụ"
										size="small"
									>
										<Descriptions column={1} size="small">
											<Descriptions.Item label="Tên gói">
												<Tag color="blue">
													{
														selectedTransaction
															.subscription.plan
															.name
													}
												</Tag>
											</Descriptions.Item>
											<Descriptions.Item label="Dung lượng">
												{formatBytes(
													selectedTransaction
														.subscription.plan
														.storageLimit,
												)}
											</Descriptions.Item>
											<Descriptions.Item label="Thời hạn">
												{
													selectedTransaction
														.subscription.plan
														.durationDays
												}{' '}
												ngày
											</Descriptions.Item>
											<Descriptions.Item label="Trạng thái gói">
												<Badge
													status={
														selectedTransaction
															.subscription
															.isActive
															? 'success'
															: 'default'
													}
													text={
														selectedTransaction
															.subscription
															.isActive
															? 'Đang hoạt động'
															: 'Không hoạt động'
													}
												/>
											</Descriptions.Item>
											{selectedTransaction.subscription
												.startDate && (
												<Descriptions.Item label="Ngày bắt đầu">
													{new Date(
														selectedTransaction.subscription.startDate,
													).toLocaleDateString(
														'vi-VN',
													)}
												</Descriptions.Item>
											)}
											{selectedTransaction.subscription
												.endDate && (
												<Descriptions.Item label="Ngày hết hạn">
													{new Date(
														selectedTransaction.subscription.endDate,
													).toLocaleDateString(
														'vi-VN',
													)}
												</Descriptions.Item>
											)}
										</Descriptions>
									</Card>
								)}
							</Col>
						</Row>

						{selectedTransaction.status === 'FAILED' && (
							<div className="mt-4">
								<Card size="small">
									<Text type="secondary">
										Giao dịch này đã thất bại. Bạn có thể
										thử lại bằng cách mua gói dịch vụ mới.
									</Text>
									<div className="mt-3">
										<Space>
											<Button
												type="primary"
												onClick={() => {
													setDetailModalVisible(
														false,
													);
													router.push('/payment');
												}}
											>
												Thử lại
											</Button>
											<Button
												onClick={() => {
													// You can implement support contact here
													window.open(
														'mailto:support@yourdomain.com',
														'_blank',
													);
												}}
											>
												Liên hệ hỗ trợ
											</Button>
										</Space>
									</div>
								</Card>
							</div>
						)}

						{selectedTransaction.status === 'PENDING' && (
							<div className="mt-4">
								<Card size="small">
									<Text type="secondary">
										Giao dịch này đang được xử lý. Vui lòng
										đợi hoặc liên hệ hỗ trợ nếu cần thiết.
									</Text>
								</Card>
							</div>
						)}
					</div>
				)}
			</Modal>
		</div>
	);
}
