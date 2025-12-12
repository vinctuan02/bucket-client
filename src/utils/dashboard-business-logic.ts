import { DashboardData } from '@/types/dashboard.types';

/**
 * Business logic for download comparison display
 * Compares current day downloads with previous periods
 */
export function calculateDownloadComparison(
	currentDownloads: number,
	previousPeriodDownloads: number[],
): {
	current: number;
	previousAverage: number;
	percentageChange: number;
	trend: 'up' | 'down' | 'neutral';
	comparisonText: string;
} {
	const previousAverage =
		previousPeriodDownloads.length > 0
			? Math.round(
					previousPeriodDownloads.reduce((sum, val) => sum + val, 0) /
						previousPeriodDownloads.length,
				)
			: 0;

	const percentageChange =
		previousAverage > 0
			? Math.round(
					((currentDownloads - previousAverage) / previousAverage) *
						100,
				)
			: 0;

	let trend: 'up' | 'down' | 'neutral' = 'neutral';
	if (percentageChange > 5) trend = 'up';
	else if (percentageChange < -5) trend = 'down';

	const comparisonText = `${Math.abs(percentageChange)}% ${trend === 'up' ? 'above' : trend === 'down' ? 'below' : 'same as'} 7-day average`;

	return {
		current: currentDownloads,
		previousAverage,
		percentageChange,
		trend,
		comparisonText,
	};
}

/**
 * Filter active shared links from all shared links
 * Only includes currently active public sharing links
 */
export function filterActiveSharedLinks(
	allLinks: Array<{
		id: string;
		isActive: boolean;
		isPublic: boolean;
		expiresAt?: Date;
	}>,
): number {
	const now = new Date();

	return allLinks.filter((link) => {
		// Must be active and public
		if (!link.isActive || !link.isPublic) return false;

		// Check if not expired
		if (link.expiresAt && link.expiresAt < now) return false;

		return true;
	}).length;
}

/**
 * Calculate target achievement with proper percentage and status
 */
export function calculateTargetAchievement(
	current: number,
	target: number,
): {
	percentage: number;
	status: 'exceeded' | 'on-track' | 'at-risk' | 'critical';
	statusColor: string;
	message: string;
} {
	const percentage = target > 0 ? Math.round((current / target) * 100) : 0;

	let status: 'exceeded' | 'on-track' | 'at-risk' | 'critical';
	let statusColor: string;
	let message: string;

	if (percentage >= 100) {
		status = 'exceeded';
		statusColor = '#10B981'; // Green
		message = `Target exceeded by ${percentage - 100}%`;
	} else if (percentage >= 75) {
		status = 'on-track';
		statusColor = '#3B82F6'; // Blue
		message = 'On track to meet target';
	} else if (percentage >= 50) {
		status = 'at-risk';
		statusColor = '#F59E0B'; // Yellow
		message = 'At risk of missing target';
	} else {
		status = 'critical';
		statusColor = '#EF4444'; // Red
		message = 'Critical: Far from target';
	}

	return {
		percentage,
		status,
		statusColor,
		message,
	};
}

/**
 * Enhanced dashboard data with business logic applied
 */
export function enhanceDashboardData(
	rawData: DashboardData,
	historicalData?: {
		previousDownloads: number[];
		allSharedLinks: Array<{
			id: string;
			isActive: boolean;
			isPublic: boolean;
			expiresAt?: Date;
		}>;
	},
): DashboardData & {
	enhanced: {
		downloadComparison: ReturnType<typeof calculateDownloadComparison>;
		targetAchievements: {
			storage: ReturnType<typeof calculateTargetAchievement>;
			uploads: ReturnType<typeof calculateTargetAchievement>;
			shareLinks: ReturnType<typeof calculateTargetAchievement>;
		};
	};
} {
	// Calculate download comparison
	const downloadComparison = calculateDownloadComparison(
		rawData.activity.downloadsToday,
		historicalData?.previousDownloads || [
			8500, 9200, 8800, 9100, 8900, 9300, 8700,
		],
	);

	// Calculate target achievements
	const targetAchievements = {
		storage: calculateTargetAchievement(
			rawData.targets.storage.current,
			rawData.targets.storage.target,
		),
		uploads: calculateTargetAchievement(
			rawData.targets.uploads.current,
			rawData.targets.uploads.target,
		),
		shareLinks: calculateTargetAchievement(
			rawData.targets.shareLinks.current,
			rawData.targets.shareLinks.target,
		),
	};

	// Filter active shared links if historical data is provided
	if (historicalData?.allSharedLinks) {
		rawData.activity.activeSharedLinks = filterActiveSharedLinks(
			historicalData.allSharedLinks,
		);
	}

	return {
		...rawData,
		enhanced: {
			downloadComparison,
			targetAchievements,
		},
	};
}

/**
 * Validate dashboard data integrity
 */
export function validateDashboardDataIntegrity(data: DashboardData): {
	isValid: boolean;
	errors: string[];
	warnings: string[];
} {
	const errors: string[] = [];
	const warnings: string[] = [];

	// Check storage metrics
	if (
		data.statistics.totalStorageUsed.used >
		data.statistics.totalStorageUsed.total
	) {
		errors.push('Storage used cannot exceed total storage');
	}

	if (
		data.statistics.totalStorageUsed.percentage !==
		Math.round(
			(data.statistics.totalStorageUsed.used /
				data.statistics.totalStorageUsed.total) *
				100,
		)
	) {
		warnings.push('Storage percentage calculation mismatch');
	}

	// Check target percentages
	Object.entries(data.targets).forEach(([key, target]) => {
		const calculatedPercentage = Math.round(
			(target.current / target.target) * 100,
		);
		if (Math.abs(target.percentage - calculatedPercentage) > 1) {
			warnings.push(`Target percentage mismatch for ${key}`);
		}
	});

	// Check system health
	if (data.systemHealth.overall < 0 || data.systemHealth.overall > 100) {
		errors.push('System health percentage must be between 0 and 100');
	}

	// Check chart data consistency
	if (data.chartData.dailyActivity.length !== 30) {
		warnings.push('Chart data should contain exactly 30 days of data');
	}

	// Check file distribution totals
	const totalFilePercentage = data.chartData.fileDistribution.reduce(
		(sum, item) => sum + item.value,
		0,
	);
	if (Math.abs(totalFilePercentage - 100) > 1) {
		warnings.push('File distribution percentages should total 100%');
	}

	return {
		isValid: errors.length === 0,
		errors,
		warnings,
	};
}

/**
 * Generate dashboard insights based on data patterns
 */
export function generateDashboardInsights(data: DashboardData): Array<{
	type: 'info' | 'warning' | 'success' | 'error';
	title: string;
	message: string;
	actionable?: boolean;
}> {
	const insights = [];

	// Storage insights
	if (data.statistics.totalStorageUsed.percentage > 90) {
		insights.push({
			type: 'error' as const,
			title: 'Storage Critical',
			message:
				'Storage usage is above 90%. Consider adding more capacity or cleaning up unused files.',
			actionable: true,
		});
	} else if (data.statistics.totalStorageUsed.percentage > 75) {
		insights.push({
			type: 'warning' as const,
			title: 'Storage Warning',
			message:
				'Storage usage is above 75%. Monitor closely and plan for expansion.',
			actionable: true,
		});
	}

	// System health insights
	if (data.systemHealth.overall < 80) {
		const criticalComponents = data.systemHealth.components.filter(
			(c) => c.status === 'critical',
		);
		if (criticalComponents.length > 0) {
			insights.push({
				type: 'error' as const,
				title: 'System Health Critical',
				message: `Critical issues detected in: ${criticalComponents.map((c) => c.name).join(', ')}`,
				actionable: true,
			});
		}
	}

	// Activity insights
	const recentUploads = data.chartData.dailyActivity
		.slice(-7)
		.reduce((sum, day) => sum + day.uploads, 0);
	const avgDailyUploads = recentUploads / 7;

	if (data.statistics.uploadsToday > avgDailyUploads * 1.5) {
		insights.push({
			type: 'info' as const,
			title: 'High Upload Activity',
			message: `Today's uploads (${data.statistics.uploadsToday}) are 50% above the 7-day average.`,
			actionable: false,
		});
	}

	// Target insights
	Object.entries(data.targets).forEach(([key, target]) => {
		if (target.percentage > 100) {
			insights.push({
				type: 'success' as const,
				title: `${key.charAt(0).toUpperCase() + key.slice(1)} Target Exceeded`,
				message: `Great job! You've exceeded the ${key} target by ${(target.percentage - 100).toFixed(1)}%.`,
				actionable: false,
			});
		}
	});

	return insights;
}
