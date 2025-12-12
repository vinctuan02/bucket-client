import { DashboardData } from '@/types/dashboard.types';

export class DemoDataService {
	generateMockDashboardData(): DashboardData {
		// Generate 30 days of mock chart data
		const dailyActivity = [];
		const today = new Date();

		for (let i = 29; i >= 0; i--) {
			const date = new Date(today);
			date.setDate(date.getDate() - i);

			// Generate realistic random data
			const uploads = Math.floor(Math.random() * 100) + 20; // 20-120 uploads
			const storageUsed = Math.random() * 50 + 10; // 10-60 GB

			dailyActivity.push({
				date: date.toISOString().split('T')[0],
				uploads,
				storageUsed: Math.round(storageUsed * 100) / 100,
			});
		}

		return {
			statistics: {
				totalStorageUsed: {
					used: 2.4,
					total: 5.0,
					unit: 'TB',
					percentage: 48,
				},
				totalFiles: 125847,
				activeUsers: 1247,
				uploadsToday: 342,
			},
			chartData: {
				dailyActivity,
				fileDistribution: [
					{ name: 'Documents', value: 35, color: '#3B82F6' },
					{ name: 'Images', value: 28, color: '#10B981' },
					{ name: 'Videos', value: 20, color: '#F59E0B' },
					{ name: 'Archives', value: 12, color: '#EF4444' },
					{ name: 'Other', value: 5, color: '#8B5CF6' },
				],
			},
			activity: {
				bandwidthUsed: {
					current: 156.7,
					unit: 'MB/s',
					peak24h: 234.5,
				},
				downloadsToday: 8934,
				activeSharedLinks: 456,
			},
			targets: {
				storage: {
					current: 2400,
					target: 5000,
					unit: 'GB',
					percentage: 48,
				},
				uploads: {
					current: 342,
					target: 500,
					unit: 'files',
					percentage: 68.4,
				},
				shareLinks: {
					current: 456,
					target: 600,
					unit: 'links',
					percentage: 76,
				},
			},
			systemHealth: {
				overall: 93,
				components: [
					{ name: 'API Server', status: 'healthy', value: 98 },
					{ name: 'Database', status: 'healthy', value: 95 },
					{ name: 'Storage', status: 'warning', value: 78 },
					{ name: 'Payment System', status: 'healthy', value: 99 },
					{ name: 'File Sharing', status: 'healthy', value: 97 },
				],
			},
		};
	}
}

export const demoDataService = new DemoDataService();
