'use client';

import { DonutChartProps } from '@/types/dashboard.types';
import React from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

const DonutChart: React.FC<DonutChartProps> = ({
	data,
	centerText = 'File Types',
	colors,
}) => {
	// Ensure distinct colors for each category
	const chartColors = colors || [
		'#3B82F6', // Blue - Documents
		'#10B981', // Green - Images
		'#F59E0B', // Yellow - Videos
		'#EF4444', // Red - Archives
		'#8B5CF6', // Purple - Other
	];

	const CustomTooltip = ({ active, payload }: any) => {
		if (active && payload && payload.length) {
			const data = payload[0];
			return (
				<div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
					<div className="flex items-center space-x-2">
						<div
							className="w-3 h-3 rounded-full"
							style={{ backgroundColor: data.payload.color }}
						/>
						<span className="text-sm font-medium text-gray-900">
							{data.name}
						</span>
					</div>
					<div className="text-sm text-gray-600 mt-1">
						{data.value}% of total files
					</div>
				</div>
			);
		}
		return null;
	};

	const CustomLabel = ({ cx, cy }: any) => {
		return (
			<text
				x={cx}
				y={cy}
				fill="#374151"
				textAnchor="middle"
				dominantBaseline="central"
				className="text-sm font-medium"
			>
				{centerText}
			</text>
		);
	};

	return (
		<div
			className="bg-white rounded-xl shadow-sm p-6"
			role="img"
			aria-label="Donut chart showing file type distribution across the system"
		>
			{/* Chart container */}
			<div style={{ width: '100%', height: 300, marginTop: '20px' }}>
				<ResponsiveContainer>
					<PieChart>
						<Pie
							data={data as any}
							cx="50%"
							cy="50%"
							labelLine={false}
							label={<CustomLabel />}
							outerRadius={100}
							innerRadius={60}
							fill="#8884d8"
							dataKey="value"
							animationBegin={0}
							animationDuration={800}
						>
							{data.map((entry, index) => (
								<Cell
									key={`cell-${index}`}
									fill={
										entry.color ||
										chartColors[index % chartColors.length]
									}
								/>
							))}
						</Pie>
						<Tooltip content={<CustomTooltip />} />
					</PieChart>
				</ResponsiveContainer>
			</div>

			{/* Custom Legend */}
			<div className="mt-6">
				<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
					{data.map((entry, index) => (
						<div
							key={index}
							className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
						>
							<div
								className="w-4 h-4 rounded-full flex-shrink-0"
								style={{
									backgroundColor:
										entry.color ||
										chartColors[index % chartColors.length],
								}}
							/>
							<div className="min-w-0 flex-1">
								<div className="text-sm font-medium text-gray-900 truncate">
									{entry.name}
								</div>
								<div className="text-xs text-gray-600">
									{entry.value}%
								</div>
							</div>
						</div>
					))}
				</div>
			</div>

			{/* Accessibility description */}
			<div className="sr-only">
				File type distribution chart showing {data.length} categories
				with percentages.
			</div>

			{/* Summary stats */}
			<div className="mt-6 grid grid-cols-2 gap-6">
				<div className="text-center p-2">
					<div className="text-2xl font-bold text-gray-900 mb-1">
						{data.length}
					</div>
					<div className="text-sm text-gray-600">File Categories</div>
				</div>
				<div className="text-center p-2">
					<div className="text-2xl font-bold text-gray-900 mb-1">
						{data.reduce((sum, item) => sum + item.value, 0)}%
					</div>
					<div className="text-sm text-gray-600">Total Coverage</div>
				</div>
			</div>
		</div>
	);
};

export default DonutChart;
