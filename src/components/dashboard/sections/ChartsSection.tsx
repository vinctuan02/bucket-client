'use client';

import { DashboardData } from '@/types/dashboard.types';
import React from 'react';
import CombinedChart from '../CombinedChart';
import DonutChart from '../DonutChart';

interface ChartsSectionProps {
	chartData: DashboardData['chartData'];
}

const ChartsSection: React.FC<ChartsSectionProps> = ({ chartData }) => {
	return (
		<div
			className="charts-responsive-grid"
			style={{
				display: 'grid',
				gridTemplateColumns: '2fr 1fr',
				gap: '24px',
			}}
		>
			{/* Combined Chart */}
			<div
				className="chart-container"
				style={{
					backgroundColor: 'white',
					borderRadius: '12px',
					padding: '24px',
					boxShadow:
						'0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
					transition: 'all 0.2s ease',
				}}
			>
				<div className="chart-header" style={{ marginBottom: '20px' }}>
					<h3
						className="chart-title"
						style={{
							fontSize: '18px',
							fontWeight: '600',
							color: '#1f2937',
							margin: '0 0 8px 0',
						}}
					>
						Daily Activity Overview
					</h3>
					<p
						className="chart-description"
						style={{
							fontSize: '14px',
							color: '#6b7280',
							margin: '0',
						}}
					>
						Upload activity and storage usage trends over the last
						30 days
					</p>
				</div>
				<CombinedChart
					data={chartData.dailyActivity}
					barDataKey="uploads"
					lineDataKey="storageUsed"
					xAxisKey="date"
					height={300}
				/>
			</div>

			{/* Donut Chart */}
			<div
				className="chart-container"
				style={{
					backgroundColor: 'white',
					borderRadius: '12px',
					padding: '24px',
					boxShadow:
						'0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
					transition: 'all 0.2s ease',
				}}
			>
				<div className="chart-header" style={{ marginBottom: '20px' }}>
					<h3
						className="chart-title"
						style={{
							fontSize: '18px',
							fontWeight: '600',
							color: '#1f2937',
							margin: '0 0 8px 0',
						}}
					>
						File Type Distribution
					</h3>
					<p
						className="chart-description"
						style={{
							fontSize: '14px',
							color: '#6b7280',
							margin: '0',
						}}
					>
						Breakdown of files by category across the system
					</p>
				</div>
				<DonutChart
					data={chartData.fileDistribution}
					centerText="File Types"
				/>
			</div>
		</div>
	);
};

export default ChartsSection;
