'use client';

import React from 'react';

const LoadingState: React.FC = () => {
	return (
		<div className="min-h-screen bg-gray-50 p-6">
			{/* Header skeleton */}
			<div className="bg-white border-b border-gray-200 px-6 py-4 mb-8">
				<div className="flex items-center justify-between">
					<div className="flex items-center space-x-6">
						<div>
							<div className="h-8 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
							<div className="h-4 bg-gray-200 rounded w-64 animate-pulse"></div>
						</div>
						<div className="hidden md:block h-10 bg-gray-200 rounded-lg w-80 animate-pulse"></div>
					</div>
					<div className="flex items-center space-x-4">
						<div className="h-10 w-10 bg-gray-200 rounded-lg animate-pulse"></div>
						<div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse"></div>
					</div>
				</div>
			</div>

			{/* Statistics grid skeleton */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
				{[...Array(4)].map((_, i) => (
					<div
						key={i}
						className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
					>
						<div className="flex items-center justify-between mb-4">
							<div className="flex items-center space-x-3">
								<div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
								<div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
							</div>
						</div>
						<div className="h-8 bg-gray-200 rounded w-20 mb-2 animate-pulse"></div>
						<div className="h-3 bg-gray-200 rounded w-16 animate-pulse"></div>
					</div>
				))}
			</div>

			{/* Charts section skeleton */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
				<div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
					<div className="h-6 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
					<div className="h-4 bg-gray-200 rounded w-64 mb-6 animate-pulse"></div>
					<div className="h-80 bg-gray-200 rounded animate-pulse"></div>
				</div>
				<div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
					<div className="h-6 bg-gray-200 rounded w-32 mb-2 animate-pulse"></div>
					<div className="h-4 bg-gray-200 rounded w-48 mb-6 animate-pulse"></div>
					<div className="h-64 bg-gray-200 rounded animate-pulse"></div>
				</div>
			</div>

			{/* Activity section skeleton */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
				{[...Array(3)].map((_, i) => (
					<div
						key={i}
						className="bg-white rounded-lg shadow-sm border border-gray-100 p-4"
					>
						<div className="w-10 h-10 bg-gray-200 rounded-lg mb-3 animate-pulse"></div>
						<div className="h-4 bg-gray-200 rounded w-24 mb-2 animate-pulse"></div>
						<div className="h-6 bg-gray-200 rounded w-16 animate-pulse"></div>
					</div>
				))}
			</div>

			{/* Loading indicator */}
			<div className="flex items-center justify-center py-8">
				<div className="flex items-center space-x-2 text-gray-500">
					<div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
					<span className="text-sm">Loading dashboard data...</span>
				</div>
			</div>
		</div>
	);
};

export default LoadingState;
