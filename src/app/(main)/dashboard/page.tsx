'use client';

import { Card, Typography } from 'antd';

const { Title } = Typography;

export default function DashboardPage() {
	return (
		<div className="container mx-auto px-4 py-8">
			<Title level={2}>Dashboard</Title>
			<Card>
				<p>Welcome to your dashboard!</p>
			</Card>
		</div>
	);
}
