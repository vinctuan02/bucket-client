'use client';

import { Card, Descriptions, Tag, Typography } from 'antd';
import { TransactionDetail } from '../../types/transaction';

const { Title } = Typography;

interface TransactionDetailCardProps {
	transaction: TransactionDetail;
	showTitle?: boolean;
	size?: 'small' | 'middle' | 'default';
}

export default function TransactionDetailCard({
	transaction,
	showTitle = true,
	size = 'default',
}: TransactionDetailCardProps) {
	const formatBytes = (bytes: number) => {
		if (bytes === 0) return '0 Bytes';
		const k = 1024;
		const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
	};

	const formatCurrency = (amount: number, currency: string = 'VND') => {
		return new Intl.NumberFormat('vi-VN', {
			style: 'currency',
			currency: currency,
		}).format(amount);
	};

	const getStatusColor = (status: string) => {
		switch (status.toLowerCase()) {
			case 'success':
			case 'completed':
				return 'success';
			case 'pending':
				return 'processing';
			case 'failed':
			case 'error':
				return 'error';
			case 'cancelled':
				return 'warning';
			default:
				return 'default';
		}
	};

	const formatDate = (dateString: string | null | undefined) => {
		if (!dateString) return 'N/A';
		return new Date(dateString).toLocaleString('vi-VN');
	};

	return (
		<Card className="w-full">
			{showTitle && (
				<Title level={4} className="mb-4">
					Transaction Details
				</Title>
			)}

			<Descriptions
				title="Payment Information"
				bordered
				column={1}
				size={size}
				className="mb-4"
			>
				<Descriptions.Item label="Transaction ID">
					<code className="bg-gray-100 px-2 py-1 rounded text-sm">
						{transaction.id}
					</code>
				</Descriptions.Item>
				<Descriptions.Item label="Amount">
					<span className="font-semibold text-lg">
						{formatCurrency(
							transaction.amount,
							transaction.currency,
						)}
					</span>
				</Descriptions.Item>
				<Descriptions.Item label="Payment Method">
					{transaction.paymentMethod.replace('_', ' ').toUpperCase()}
				</Descriptions.Item>
				<Descriptions.Item label="Status">
					<Tag
						color={getStatusColor(transaction.status)}
						className="font-medium"
					>
						{transaction.status.toUpperCase()}
					</Tag>
				</Descriptions.Item>
				<Descriptions.Item label="Created Date">
					{formatDate(transaction.createdAt)}
				</Descriptions.Item>
				{transaction.paidAt && (
					<Descriptions.Item label="Payment Date">
						{formatDate(transaction.paidAt)}
					</Descriptions.Item>
				)}
				{transaction.paymentGatewayId && (
					<Descriptions.Item label="Gateway Transaction ID">
						<code className="bg-gray-100 px-2 py-1 rounded text-sm">
							{transaction.paymentGatewayId}
						</code>
					</Descriptions.Item>
				)}
			</Descriptions>

			{transaction.subscription && (
				<Descriptions
					title="Subscription Details"
					bordered
					column={1}
					size={size}
				>
					<Descriptions.Item label="Subscription ID">
						<code className="bg-gray-100 px-2 py-1 rounded text-sm">
							{transaction.subscription.id}
						</code>
					</Descriptions.Item>
					{transaction.subscription.plan && (
						<>
							<Descriptions.Item label="Plan">
								<Tag color="blue" className="font-medium">
									{transaction.subscription.plan.name}
								</Tag>
							</Descriptions.Item>
							<Descriptions.Item label="Duration">
								{transaction.subscription.plan.durationDays}{' '}
								days
							</Descriptions.Item>
							<Descriptions.Item label="Storage Limit">
								{formatBytes(
									transaction.subscription.plan.storageLimit,
								)}
							</Descriptions.Item>
						</>
					)}
					{transaction.subscription.startDate && (
						<Descriptions.Item label="Start Date">
							{formatDate(transaction.subscription.startDate)}
						</Descriptions.Item>
					)}
					{transaction.subscription.endDate && (
						<Descriptions.Item label="End Date">
							{formatDate(transaction.subscription.endDate)}
						</Descriptions.Item>
					)}
					<Descriptions.Item label="Status">
						<Tag
							color={
								transaction.subscription.isActive
									? 'success'
									: 'warning'
							}
							className="font-medium"
						>
							{transaction.subscription.isActive
								? 'ACTIVE'
								: 'INACTIVE'}
						</Tag>
					</Descriptions.Item>
				</Descriptions>
			)}
		</Card>
	);
}
