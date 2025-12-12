import { DashboardData } from '@/types/dashboard.types';

export class DashboardApiService {
	private baseUrl =
		process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

	private getAuthHeaders(): HeadersInit {
		const token = this.getAuthToken();
		console.log('Dashboard API - Token:', token ? 'Found' : 'Not found');
		return {
			'Content-Type': 'application/json',
			...(token && { Authorization: `Bearer ${token}` }),
		};
	}

	private getAuthToken(): string | null {
		if (typeof window !== 'undefined') {
			return localStorage.getItem('access_token');
		}
		return null;
	}

	async getDashboardData(): Promise<DashboardData> {
		try {
			console.log(
				'Fetching dashboard data from:',
				`${this.baseUrl}/api/dashboard`,
			);

			const response = await fetch(`${this.baseUrl}/api/dashboard`, {
				method: 'GET',
				headers: this.getAuthHeaders(),
			});

			console.log('Response status:', response.status);

			if (!response.ok) {
				throw new Error(
					`HTTP ${response.status}: ${response.statusText}`,
				);
			}

			const data = await response.json();
			console.log('Dashboard data received:', data);
			return data;
		} catch (error) {
			console.error('Dashboard API error:', error);
			throw error;
		}
	}

	async getDebugCounts(): Promise<any> {
		try {
			const response = await fetch(
				`${this.baseUrl}/api/dashboard/debug/database-counts`,
				{
					method: 'GET',
					headers: this.getAuthHeaders(),
				},
			);

			if (!response.ok) {
				throw new Error(
					`HTTP ${response.status}: ${response.statusText}`,
				);
			}

			const data = await response.json();
			console.log('Debug counts:', data);
			return data;
		} catch (error) {
			console.error('Debug API error:', error);
			throw error;
		}
	}
}

export const dashboardApiService = new DashboardApiService();
