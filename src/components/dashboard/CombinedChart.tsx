'use client';

import { CombinedChartProps } from '@/types/dashboard.types';
import { formatChartDate } from '@/utils/dashboard.utils';
import React from 'react';
import {
	Bar,
	CartesianGrid,
	ComposedChart,
	Legend,
	Line,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from 'recharts';

const CombinedChart: React.FC<CombinedChartProps> = ({
	data,
	barDataKey,
	lineDataKey,
	xAxisKey,
	height = 400,
}) => {
	// Ensure we only show the last 30 days
	const chartData = data.slice(-30);

	const CustomTooltip = ({ active, payload, label }: any) => {
		if (active && payload && payload.length) {
			return (
				<div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
					<p className="text-sm font-medium text-gray-900 mb-2">
						{formatChartDate(label)}
					</p>
					{payload.map((entry: any, index: number) => (
						<div
							key={index}
							className="flex items-center space-x-2 text-sm"
						>
							<div
								className="w-3 h-3 rounded-full"
								style={{ backgroundColor: entry.color }}
							/>
							<span className="text-gray-600">{entry.name}:</span>
							<span className="font-medium text-gray-900">
								{entry.name === 'Uploads'
									? `${entry.value} files`
									: `${entry.value} GB`}
							</span>
						</div>
					))}
				</div>
			);
		}
		return null;
	};

	const formatXAxisLabel = (tickItem: string) => {
		return formatChartDate(tickItem);
	};

	return (
		<div
			className="bg-white rounded-xl shadow-sm p-6"
			role="img"
			aria-label="Combined chart showing daily uploads and storage usage over the last 30 days"
		>
			{/* Chart container */}
			<div style={{ width: '100%', height, marginTop: '20px' }}>
				<ResponsiveContainer>
					<ComposedChart
						data={chartData}
						margin={{
							top: 20,
							right: 30,
							bottom: 20,
							left: 20,
						}}
					>
						<CartesianGrid
							strokeDasharray="3 3"
							stroke="#f0f0f0"
							vertical={false}
						/>
						<XAxis
							dataKey={xAxisKey}
							tickFormatter={formatXAxisLabel}
							stroke="#6b7280"
							fontSize={12}
							tickLine={false}
							axisLine={false}
						/>
						<YAxis
							yAxisId="left"
							stroke="#6b7280"
							fontSize={12}
							tickLine={false}
							axisLine={false}
							label={{
								value: 'Files Uploaded',
								angle: -90,
								position: 'insideLeft',
								style: { textAnchor: 'middle' },
							}}
						/>
						<YAxis
							yAxisId="right"
							orientation="right"
							stroke="#6b7280"
							fontSize={12}
							tickLine={false}
							axisLine={false}
							label={{
								value: 'Storage (GB)',
								angle: 90,
								position: 'insideRight',
								style: { textAnchor: 'middle' },
							}}
						/>
						<Tooltip content={<CustomTooltip />} />
						<Legend
							wrapperStyle={{ paddingTop: '20px' }}
							iconType="circle"
						/>

						{/* Bar chart for uploads */}
						<Bar
							yAxisId="left"
							dataKey={barDataKey}
							name="Uploads"
							fill="#3B82F6"
							radius={[2, 2, 0, 0]}
							opacity={0.8}
						/>

						{/* Line chart for storage usage */}
						<Line
							yAxisId="right"
							type="monotone"
							dataKey={lineDataKey}
							name="Storage Used"
							stroke="#10B981"
							strokeWidth={3}
							dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
							activeDot={{
								r: 6,
								stroke: '#10B981',
								strokeWidth: 2,
							}}
						/>
					</ComposedChart>
				</ResponsiveContainer>
			</div>

			{/* Chart description for accessibility */}
			<div className="sr-only">
				This chart displays daily upload activity as bars and cumulative
				storage usage as a line graph. The data covers the last 30 days,
				with uploads measured in files and storage measured in
				gigabytes. Hover over data points to see exact values for each
				day.
			</div>
		</div>
	);
};

export default CombinedChart;
