import { FileTypeCategory } from '@/types/dashboard.types';

/**
 * Format storage values to human-readable units (GB, TB, PB)
 */
export function formatStorageSize(bytes: number): {
	value: number;
	unit: 'GB' | 'TB' | 'PB';
} {
	const units = ['GB', 'TB', 'PB'] as const;
	const threshold = 1024;

	let value = bytes / threshold ** 3; // Start with GB
	let unitIndex = 0;

	while (value >= threshold && unitIndex < units.length - 1) {
		value /= threshold;
		unitIndex++;
	}

	return {
		value: Math.round(value * 100) / 100, // Round to 2 decimal places
		unit: units[unitIndex],
	};
}

/**
 * Format bandwidth values to appropriate units (MB/s, GB/s)
 */
export function formatBandwidth(bytesPerSecond: number): {
	value: number;
	unit: 'MB/s' | 'GB/s';
} {
	const mbps = bytesPerSecond / (1024 * 1024);

	if (mbps >= 1024) {
		return {
			value: Math.round((mbps / 1024) * 100) / 100,
			unit: 'GB/s',
		};
	}

	return {
		value: Math.round(mbps * 100) / 100,
		unit: 'MB/s',
	};
}

/**
 * Format large numbers with appropriate suffixes (K, M, B)
 */
export function formatNumber(num: number): string {
	if (num >= 1000000000) {
		return (num / 1000000000).toFixed(1) + 'B';
	}
	if (num >= 1000000) {
		return (num / 1000000).toFixed(1) + 'M';
	}
	if (num >= 1000) {
		return (num / 1000).toFixed(1) + 'K';
	}
	return num.toString();
}

/**
 * Calculate percentage with proper rounding
 */
export function calculatePercentage(current: number, total: number): number {
	if (total === 0) return 0;
	return Math.round((current / total) * 100 * 100) / 100; // Round to 2 decimal places
}

/**
 * Categorize file types into standard groups
 */
export function categorizeFileType(fileName: string): FileTypeCategory {
	const extension = fileName.split('.').pop()?.toLowerCase() || '';

	const categories = {
		Documents: [
			'pdf',
			'doc',
			'docx',
			'txt',
			'rtf',
			'odt',
			'xls',
			'xlsx',
			'ppt',
			'pptx',
		],
		Images: [
			'jpg',
			'jpeg',
			'png',
			'gif',
			'bmp',
			'svg',
			'webp',
			'ico',
			'tiff',
		],
		Videos: [
			'mp4',
			'avi',
			'mov',
			'wmv',
			'flv',
			'webm',
			'mkv',
			'3gp',
			'm4v',
		],
		Archives: ['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz', 'iso'],
	};

	for (const [category, extensions] of Object.entries(categories)) {
		if (extensions.includes(extension)) {
			return category as FileTypeCategory;
		}
	}

	return 'Other';
}

/**
 * Generate distinct colors for chart categories
 */
export function generateChartColors(count: number): string[] {
	const baseColors = [
		'#3B82F6', // Blue
		'#10B981', // Green
		'#F59E0B', // Yellow
		'#EF4444', // Red
		'#8B5CF6', // Purple
		'#06B6D4', // Cyan
		'#F97316', // Orange
		'#84CC16', // Lime
		'#EC4899', // Pink
		'#6B7280', // Gray
	];

	if (count <= baseColors.length) {
		return baseColors.slice(0, count);
	}

	// Generate additional colors if needed
	const colors = [...baseColors];
	for (let i = baseColors.length; i < count; i++) {
		const hue = (i * 137.508) % 360; // Golden angle approximation
		colors.push(`hsl(${hue}, 70%, 50%)`);
	}

	return colors;
}

/**
 * Get color based on health percentage
 */
export function getHealthColor(percentage: number): string {
	if (percentage >= 80) return '#10B981'; // Green
	if (percentage >= 60) return '#F59E0B'; // Yellow
	return '#EF4444'; // Red
}

/**
 * Get color based on progress percentage and thresholds
 */
export function getProgressColor(
	percentage: number,
	isOverAchievement = false,
): string {
	if (isOverAchievement && percentage > 100) return '#10B981'; // Green for over-achievement
	if (percentage >= 80) return '#3B82F6'; // Blue for good progress
	if (percentage >= 50) return '#F59E0B'; // Yellow for moderate progress
	return '#EF4444'; // Red for low progress
}

/**
 * Format date for chart display
 */
export function formatChartDate(date: string | Date): string {
	const d = new Date(date);
	return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * Generate mock data for development/testing
 */
export function generateMockChartData(
	days: number = 30,
): Array<{ date: string; uploads: number; storageUsed: number }> {
	const data = [];
	const today = new Date();

	for (let i = days - 1; i >= 0; i--) {
		const date = new Date(today);
		date.setDate(date.getDate() - i);

		data.push({
			date: date.toISOString().split('T')[0],
			uploads: Math.floor(Math.random() * 100) + 20,
			storageUsed: Math.floor(Math.random() * 1000) + 500,
		});
	}

	return data;
}
