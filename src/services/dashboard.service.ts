import {
	BandwidthMetric,
	ChartDataPoint,
	DashboardData,
	DonutDataPoint,
	HealthComponent,
	StorageMetric,
	TargetMetric,
} from '@/types/dashboard.types';

/**
 * Dashboard data service for fetching and managing dashboard metrics
 */
export class DashboardService {
	private static instance: DashboardService;
	private baseUrl =
		process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

	static getInstance(): DashboardService {
		if (!DashboardService.instance) {
			DashboardService.instance = new DashboardService();
		}
		return DashboardService.instance;
	}

	/**
	 * Get auth token from localStorage
	 */
	private getAuthToken(): string | null {
		if (typeof window !== 'undefined') {
			return localStorage.getItem('access_token');
		}
		return null;
	}

	/**
	 * Fetch complete dashboard data
	 */
	async getDashboardData(): Promise<DashboardData> {
		try {
			const response = await fetch(`${this.baseUrl}/api/dashboard`, {
				headers: {
					Authorization: `Bearer ${this.getAuthToken()}`,
					'Content-Type': 'application/json',
				},
			});

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const data = await response.json();
			return data;
		} catch (error) {
			console.error('Failed to fetch dashboard data:', error);
			// Return empty data instead of mock data when API fails
			return this.generateEmptyDashboardData();
		}
	}

	/**
	 * Fetch storage statistics
	 */
	async getStorageStatistics(): Promise<DashboardData['statistics']> {
		try {
			const response = await fetch(
				`${this.baseUrl}/api/dashboard/statistics`,
				{
					headers: {
						Authorization: `Bearer ${this.getAuthToken()}`,
						'Content-Type': 'application/json',
					},
				},
			);
			if (!response.ok) throw new Error('Failed to fetch statistics');
			return await response.json();
		} catch (error) {
			console.error('Failed to fetch storage statistics:', error);
			return this.generateEmptyStatistics();
		}
	}

	/**
	 * Fetch chart data for the last 30 days
	 */
	async getChartData(): Promise<DashboardData['chartData']> {
		try {
			const response = await fetch(
				`${this.baseUrl}/api/dashboard/charts`,
				{
					headers: {
						Authorization: `Bearer ${this.getAuthToken()}`,
						'Content-Type': 'application/json',
					},
				},
			);
			if (!response.ok) throw new Error('Failed to fetch chart data');
			return await response.json();
		} catch (error) {
			console.error('Failed to fetch chart data:', error);
			return this.generateEmptyChartData();
		}
	}

	/**
	 * Fetch activity metrics
	 */
	async getActivityMetrics(): Promise<DashboardData['activity']> {
		try {
			const response = await fetch(
				`${this.baseUrl}/api/dashboard/activity`,
				{
					headers: {
						Authorization: `Bearer ${this.getAuthToken()}`,
						'Content-Type': 'application/json',
					},
				},
			);
			if (!response.ok)
				throw new Error('Failed to fetch activity metrics');
			return await response.json();
		} catch (error) {
			console.error('Failed to fetch activity metrics:', error);
			return this.generateEmptyActivity();
		}
	}

	/**
	 * Fetch target metrics
	 */
	async getTargetMetrics(): Promise<DashboardData['targets']> {
		try {
			const response = await fetch(
				`${this.baseUrl}/api/dashboard/targets`,
				{
					headers: {
						Authorization: `Bearer ${this.getAuthToken()}`,
						'Content-Type': 'application/json',
					},
				},
			);
			if (!response.ok) throw new Error('Failed to fetch target metrics');
			return await response.json();
		} catch (error) {
			console.error('Failed to fetch target metrics:', error);
			return this.generateEmptyTargets();
		}
	}

	/**
	 * Fetch system health data
	 */
	async getSystemHealth(): Promise<DashboardData['systemHealth']> {
		try {
			const response = await fetch(
				`${this.baseUrl}/api/dashboard/health`,
				{
					headers: {
						Authorization: `Bearer ${this.getAuthToken()}`,
						'Content-Type': 'application/json',
					},
				},
			);
			if (!response.ok) throw new Error('Failed to fetch system health');
			return await response.json();
		} catch (error) {
			console.error('Failed to fetch system health:', error);
			return this.generateEmptySystemHealth();
		}
	}

	// Empty data generators for when API fails or no data exists
	private generateEmptyDashboardData(): DashboardData {
		return {
			statistics: this.generateEmptyStatistics(),
			chartData: this.generateEmptyChartData(),
			activity: this.generateEmptyActivity(),
			targets: this.generateEmptyTargets(),
			systemHealth: this.generateEmptySystemHealth(),
		};
	}

	private generateEmptyStatistics(): DashboardData['statistics'] {
		return {
			totalStorageUsed: {
				used: 0,
				total: 5.0,
				unit: 'GB',
				percentage: 0,
			},
			totalFiles: 0,
			activeUsers: 0,
			uploadsToday: 0,
		};
	}

	private generateEmptyChartData(): DashboardData['chartData'] {
		// Generate 30 days of empty data
		const dailyActivity: ChartDataPoint[] = [];
		const today = new Date();

		for (let i = 29; i >= 0; i--) {
			const date = new Date(today);
			date.setDate(date.getDate() - i);
			dailyActivity.push({
				date: date.toISOString().split('T')[0],
				uploads: 0,
				storageUsed: 0,
			});
		}

		const fileDistribution: DonutDataPoint[] = [
			{ name: 'Documents', value: 0, color: '#3B82F6' },
			{ name: 'Images', value: 0, color: '#10B981' },
			{ name: 'Videos', value: 0, color: '#F59E0B' },
			{ name: 'Archives', value: 0, color: '#EF4444' },
			{ name: 'Other', value: 0, color: '#8B5CF6' },
		];

		return {
			dailyActivity,
			fileDistribution,
		};
	}

	private generateEmptyActivity(): DashboardData['activity'] {
		return {
			bandwidthUsed: {
				current: 0,
				unit: 'MB/s',
				peak24h: 0,
			},
			downloadsToday: 0,
			activeSharedLinks: 0,
		};
	}

	private generateEmptyTargets(): DashboardData['targets'] {
		return {
			storage: {
				current: 0,
				target: 5000,
				unit: 'GB',
				percentage: 0,
			},
			uploads: {
				current: 0,
				target: 500,
				unit: 'files',
				percentage: 0,
			},
			shareLinks: {
				current: 0,
				target: 600,
				unit: 'links',
				percentage: 0,
			},
		};
	}

	private generateEmptySystemHealth(): DashboardData['systemHealth'] {
		const components: HealthComponent[] = [
			{ name: 'API Server', status: 'healthy', value: 100 },
			{ name: 'Database', status: 'healthy', value: 100 },
			{ name: 'Storage', status: 'healthy', value: 100 },
			{ name: 'Payment System', status: 'healthy', value: 100 },
			{ name: 'File Sharing', status: 'healthy', value: 100 },
		];

		const overall = Math.round(
			components.reduce((sum, comp) => sum + comp.value, 0) /
				components.length,
		);

		return {
			overall,
			components,
		};
	}
}

/**
 * Data validation functions
 */
export const validateDashboardData = {
	/**
	 * Validate storage metric data
	 */
	storageMetric(data: any): data is StorageMetric {
		return (
			typeof data === 'object' &&
			typeof data.used === 'number' &&
			typeof data.total === 'number' &&
			['GB', 'TB', 'PB'].includes(data.unit) &&
			typeof data.percentage === 'number' &&
			data.percentage >= 0 &&
			data.percentage <= 100
		);
	},

	/**
	 * Validate bandwidth metric data
	 */
	bandwidthMetric(data: any): data is BandwidthMetric {
		return (
			typeof data === 'object' &&
			typeof data.current === 'number' &&
			['MB/s', 'GB/s'].includes(data.unit) &&
			typeof data.peak24h === 'number'
		);
	},

	/**
	 * Validate target metric data
	 */
	targetMetric(data: any): data is TargetMetric {
		return (
			typeof data === 'object' &&
			typeof data.current === 'number' &&
			typeof data.target === 'number' &&
			typeof data.unit === 'string' &&
			typeof data.percentage === 'number'
		);
	},

	/**
	 * Validate chart data point
	 */
	chartDataPoint(data: any): data is ChartDataPoint {
		return (
			typeof data === 'object' &&
			typeof data.date === 'string' &&
			typeof data.uploads === 'number' &&
			typeof data.storageUsed === 'number'
		);
	},

	/**
	 * Validate donut chart data point
	 */
	donutDataPoint(data: any): data is DonutDataPoint {
		return (
			typeof data === 'object' &&
			typeof data.name === 'string' &&
			typeof data.value === 'number' &&
			typeof data.color === 'string'
		);
	},

	/**
	 * Validate health component
	 */
	healthComponent(data: any): data is HealthComponent {
		return (
			typeof data === 'object' &&
			typeof data.name === 'string' &&
			['healthy', 'warning', 'critical'].includes(data.status) &&
			typeof data.value === 'number' &&
			data.value >= 0 &&
			data.value <= 100
		);
	},

	/**
	 * Validate complete dashboard data
	 */
	dashboardData(data: any): data is DashboardData {
		return (
			typeof data === 'object' &&
			data.statistics &&
			data.chartData &&
			data.activity &&
			data.targets &&
			data.systemHealth &&
			this.storageMetric(data.statistics.totalStorageUsed) &&
			this.bandwidthMetric(data.activity.bandwidthUsed) &&
			Array.isArray(data.chartData.dailyActivity) &&
			Array.isArray(data.chartData.fileDistribution) &&
			Array.isArray(data.systemHealth.components)
		);
	},
};

// Export singleton instance
export const dashboardService = DashboardService.getInstance();
