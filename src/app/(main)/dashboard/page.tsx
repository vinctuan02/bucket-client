'use client';

import DemoButton from '@/components/dashboard/DemoButton';
import ErrorBoundary from '@/components/dashboard/ErrorBoundary';
import ErrorState from '@/components/dashboard/ErrorState';
import LoadingState from '@/components/dashboard/LoadingState';
import ActivitySection from '@/components/dashboard/sections/ActivitySection';
import ChartsSection from '@/components/dashboard/sections/ChartsSection';
import StatisticsGrid from '@/components/dashboard/sections/StatisticsGrid';

import TargetsSection from '@/components/dashboard/sections/TargetsSection';
import { useDashboard } from '@/hooks/useDashboard';
import { usePermission } from '@/hooks/usePermission';
import {
	PermissionAction,
	Resource,
} from '@/modules/permissions/permisson.enum';
import '@/styles/dashboard.css';

export default function DashboardPage() {
	const {
		data,
		loading,
		error,
		refetch,
		lastUpdated,
		setDemoData,
		clearDemoData,
		isDemoMode,
	} = useDashboard();

	const { can } = usePermission();

	const handleRetry = () => {
		refetch();
	};

	// Check permission
	if (!can(PermissionAction.READ, Resource.DASHBOARD)) {
		return (
			<ErrorState
				error="You don't have permission to access the dashboard"
				onRetry={() => window.location.reload()}
			/>
		);
	}

	if (loading && !data) {
		return <LoadingState />;
	}

	if (error && !data) {
		return <ErrorState error={error} onRetry={handleRetry} />;
	}

	if (!data) {
		return (
			<ErrorState
				error="No dashboard data available"
				onRetry={handleRetry}
			/>
		);
	}

	return (
		<ErrorBoundary>
			<div className="dashboard-page">
				{/* Simple Header */}
				<div className="flex items-center justify-between mb-6">
					<h1 className="text-2xl font-bold text-gray-900">
						Dashboard
					</h1>
					<DemoButton
						onDemoData={setDemoData}
						onRealData={clearDemoData}
						isDemoMode={isDemoMode}
					/>
				</div>

				{/* Main Content */}
				<div className="dashboard-content">
					{/* Statistics Cards Row */}
					<div className="dashboard-row">
						<StatisticsGrid statistics={data.statistics} />
					</div>

					{/* Charts Row */}
					<div className="dashboard-row">
						<ChartsSection chartData={data.chartData} />
					</div>

					{/* Activity & Targets Row */}
					<div className="dashboard-row dashboard-row-split">
						<div className="dashboard-col">
							<ActivitySection activity={data.activity} />
						</div>
						<div className="dashboard-col">
							<TargetsSection targets={data.targets} />
						</div>
					</div>
				</div>
			</div>
		</ErrorBoundary>
	);
}
