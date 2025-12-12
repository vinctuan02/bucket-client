import { ReactNode } from 'react';

// Core dashboard data interfaces
export interface DashboardData {
	statistics: {
		totalStorageUsed: StorageMetric;
		totalFiles: number;
		activeUsers: number;
		uploadsToday: number;
	};
	chartData: {
		dailyActivity: ChartDataPoint[];
		fileDistribution: DonutDataPoint[];
	};
	activity: {
		bandwidthUsed: BandwidthMetric;
		downloadsToday: number;
		activeSharedLinks: number;
	};
	targets: {
		storage: TargetMetric;
		uploads: TargetMetric;
		shareLinks: TargetMetric;
	};
	systemHealth: {
		overall: number;
		components: HealthComponent[];
	};
}

// Storage and metrics interfaces
export interface StorageMetric {
	used: number;
	total: number;
	unit: 'GB' | 'TB' | 'PB';
	percentage: number;
}

export interface BandwidthMetric {
	current: number;
	unit: 'MB/s' | 'GB/s';
	peak24h: number;
}

export interface TargetMetric {
	current: number;
	target: number;
	unit: string;
	percentage: number;
}

export interface HealthComponent {
	name: string;
	status: 'healthy' | 'warning' | 'critical';
	value: number;
}

// Chart data interfaces
export interface ChartDataPoint {
	date: string;
	uploads: number;
	storageUsed: number;
}

export interface DonutDataPoint {
	name: string;
	value: number;
	color: string;
}

export interface ColorRange {
	min: number;
	max: number;
	color: string;
}

// Component prop interfaces
export interface DashboardHeaderProps {
	onSearch: (query: string) => void;
	notificationCount: number;
	userAvatar: string;
	userName: string;
}

export interface StatCardProps {
	title: string;
	value: string | number;
	subtitle?: string;
	showProgress?: boolean;
	progressValue?: number;
	icon: ReactNode;
	trend?: 'up' | 'down' | 'neutral';
	trendValue?: string;
}

export interface MiniCardProps {
	title: string;
	value: string | number;
	unit?: string;
	icon: ReactNode;
	color: string;
}

export interface ProgressBarProps {
	label: string;
	current: number;
	target: number;
	unit?: string;
	color?: string;
	showPercentage?: boolean;
}

export interface CombinedChartProps {
	data: ChartDataPoint[];
	barDataKey: string;
	lineDataKey: string;
	xAxisKey: string;
	height?: number;
}

export interface DonutChartProps {
	data: DonutDataPoint[];
	centerText?: string;
	colors?: string[];
}

export interface GaugeChartProps {
	value: number;
	min?: number;
	max?: number;
	title: string;
	subtitle?: string;
	colorRanges?: ColorRange[];
}

// File type categories for donut chart
export type FileTypeCategory =
	| 'Documents'
	| 'Images'
	| 'Videos'
	| 'Archives'
	| 'Other';

// Trend direction type
export type TrendDirection = 'up' | 'down' | 'neutral';

// Health status type
export type HealthStatus = 'healthy' | 'warning' | 'critical';
