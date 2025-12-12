'use client';

import { DashboardData } from '@/types/dashboard.types';
import { formatNumber } from '@/utils/dashboard.utils';
import { FileText, HardDrive, Upload, Users } from 'lucide-react';
import React from 'react';
import StatCard from '../StatCard';

interface StatisticsGridProps {
	statistics: DashboardData['statistics'];
}

const StatisticsGrid: React.FC<StatisticsGridProps> = ({ statistics }) => {
	return (
		<section
			className="grid grid-cols-4 mb-8"
			style={{ gap: '3rem' }}
			aria-labelledby="statistics-heading"
		>
			<h2 id="statistics-heading" className="sr-only">
				System Statistics Overview
			</h2>

			{/* Total Storage Used */}
			<StatCard
				title="Total Storage Used"
				value={`${statistics.totalStorageUsed.used} ${statistics.totalStorageUsed.unit}`}
				subtitle={`of ${statistics.totalStorageUsed.total} ${statistics.totalStorageUsed.unit} total`}
				showProgress={true}
				progressValue={statistics.totalStorageUsed.percentage}
				icon={<HardDrive className="w-5 h-5 text-blue-600" />}
				trend="up"
				trendValue="+2.4%"
			/>

			{/* Total Files */}
			<StatCard
				title="Total Files"
				value={formatNumber(statistics.totalFiles)}
				subtitle="Files stored"
				icon={<FileText className="w-5 h-5 text-green-600" />}
				trend="up"
				trendValue="+156"
			/>

			{/* Active Users */}
			<StatCard
				title="Active Users"
				value={formatNumber(statistics.activeUsers)}
				subtitle="Currently online"
				icon={<Users className="w-5 h-5 text-purple-600" />}
				trend="neutral"
				trendValue="±0%"
			/>

			{/* Uploads Today */}
			<StatCard
				title="Uploads Today"
				value={formatNumber(statistics.uploadsToday)}
				subtitle="Files uploaded"
				icon={<Upload className="w-5 h-5 text-orange-600" />}
				trend="up"
				trendValue="+23"
			/>
		</section>
	);
};

export default StatisticsGrid;
