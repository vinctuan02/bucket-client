'use client';

import { dashboardApiService } from '@/services/dashboard-api.service';
import { DashboardData } from '@/types/dashboard.types';
import { useCallback, useEffect, useState } from 'react';

interface UseDashboardReturn {
	data: DashboardData | null;
	loading: boolean;
	error: string | null;
	refetch: () => Promise<void>;
	lastUpdated: Date | null;
	setDemoData: (data: DashboardData) => void;
	clearDemoData: () => void;
	isDemoMode: boolean;
}

export const useDashboard = (
	autoRefresh = true,
	refreshInterval = 30000,
): UseDashboardReturn => {
	const [data, setData] = useState<DashboardData | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
	const [isDemoMode, setIsDemoMode] = useState(false);

	const fetchData = useCallback(async () => {
		if (isDemoMode) return; // Don't fetch real data in demo mode

		try {
			setError(null);
			const dashboardData = await dashboardApiService.getDashboardData();
			setData(dashboardData);
			setLastUpdated(new Date());
		} catch (err) {
			setError(
				err instanceof Error
					? err.message
					: 'Failed to fetch dashboard data',
			);
			console.error('Dashboard data fetch error:', err);
		} finally {
			setLoading(false);
		}
	}, [isDemoMode]);

	const refetch = useCallback(async () => {
		if (isDemoMode) return; // Don't refetch in demo mode
		setLoading(true);
		await fetchData();
	}, [fetchData, isDemoMode]);

	const setDemoData = useCallback((demoData: DashboardData) => {
		setData(demoData);
		setIsDemoMode(true);
		setError(null);
		setLoading(false);
		setLastUpdated(new Date());
	}, []);

	const clearDemoData = useCallback(() => {
		setIsDemoMode(false);
		setData(null);
		setLoading(true);
		setError(null);
		// Trigger real data fetch
		fetchData();
	}, [fetchData]);

	// Initial data fetch
	useEffect(() => {
		void fetchData();
	}, [fetchData]);

	// Auto-refresh setup (disabled in demo mode)
	useEffect(() => {
		if (!autoRefresh || isDemoMode) return;

		const interval = setInterval(() => {
			void fetchData();
		}, refreshInterval);

		return () => clearInterval(interval);
	}, [autoRefresh, refreshInterval, fetchData, isDemoMode]);

	return {
		data,
		loading,
		error,
		refetch,
		lastUpdated,
		setDemoData,
		clearDemoData,
		isDemoMode,
	};
};
