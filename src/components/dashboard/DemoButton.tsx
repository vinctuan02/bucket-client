'use client';

import { demoDataService } from '@/services/demo-data.service';
import { DashboardData } from '@/types/dashboard.types';
import { useState } from 'react';

interface DemoButtonProps {
	onDemoData: (data: DashboardData) => void;
	onRealData: () => void;
	isDemoMode: boolean;
}

export default function DemoButton({
	onDemoData,
	onRealData,
	isDemoMode,
}: DemoButtonProps) {
	const [loading, setLoading] = useState(false);

	const handleDemoClick = async () => {
		setLoading(true);
		try {
			// Simulate API delay
			await new Promise((resolve) => setTimeout(resolve, 500));

			const mockData = demoDataService.generateMockDashboardData();
			onDemoData(mockData);
		} catch (error) {
			console.error('Failed to load demo data:', error);
		} finally {
			setLoading(false);
		}
	};

	const handleRealDataClick = () => {
		onRealData();
	};

	return (
		<div className="demo-button-container">
			<button
				onClick={handleDemoClick}
				disabled={loading || isDemoMode}
				className={`demo-button ${
					isDemoMode ? 'demo-active' : 'demo-inactive'
				}`}
			>
				{loading ? '...' : isDemoMode ? '✓ Demo' : 'Demo'}
			</button>

			{isDemoMode && (
				<button
					onClick={handleRealDataClick}
					className="demo-button real-data"
				>
					Real
				</button>
			)}
		</div>
	);
}
