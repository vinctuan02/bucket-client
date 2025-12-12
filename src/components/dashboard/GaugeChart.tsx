'use client';

import { GaugeChartProps } from '@/types/dashboard.types';
import { getHealthColor } from '@/utils/dashboard.utils';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import React, { useState } from 'react';

const GaugeChart: React.FC<GaugeChartProps> = ({
	value,
	min = 0,
	max = 100,
	title,
	subtitle,
	colorRanges,
}) => {
	const [showTooltip, setShowTooltip] = useState(false);

	// Default color ranges if not provided
	const defaultColorRanges = [
		{ min: 0, max: 59, color: '#EF4444' }, // Red - Critical
		{ min: 60, max: 79, color: '#F59E0B' }, // Yellow - Warning
		{ min: 80, max: 100, color: '#10B981' }, // Green - Healthy
	];

	const ranges = colorRanges || defaultColorRanges;

	// Calculate gauge properties
	const percentage = ((value - min) / (max - min)) * 100;
	const angle = (percentage / 100) * 180; // Half circle (180 degrees)
	const radius = 80;
	const strokeWidth = 12;

	// Get current color based on value
	const getCurrentColor = () => {
		const range = ranges.find((r) => value >= r.min && value <= r.max);
		return range?.color || getHealthColor(value);
	};

	// Get status info
	const getStatusInfo = () => {
		if (value >= 80)
			return {
				icon: CheckCircle,
				text: 'Healthy',
				color: 'text-green-600',
			};
		if (value >= 60)
			return {
				icon: AlertTriangle,
				text: 'Warning',
				color: 'text-yellow-600',
			};
		return { icon: XCircle, text: 'Critical', color: 'text-red-600' };
	};

	const status = getStatusInfo();
	const StatusIcon = status.icon;

	// Create SVG path for the gauge arc
	const createArcPath = (
		startAngle: number,
		endAngle: number,
		radius: number,
	) => {
		const start = polarToCartesian(100, 100, radius, endAngle);
		const end = polarToCartesian(100, 100, radius, startAngle);
		const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

		return [
			'M',
			start.x,
			start.y,
			'A',
			radius,
			radius,
			0,
			largeArcFlag,
			0,
			end.x,
			end.y,
		].join(' ');
	};

	const polarToCartesian = (
		centerX: number,
		centerY: number,
		radius: number,
		angleInDegrees: number,
	) => {
		const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
		return {
			x: centerX + radius * Math.cos(angleInRadians),
			y: centerY + radius * Math.sin(angleInRadians),
		};
	};

	return (
		<div
			className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
			role="img"
			aria-label={`System health gauge showing ${value}% health status`}
		>
			{/* Header */}
			<div className="mb-6">
				<div className="flex items-center justify-between">
					<div>
						<h3 className="text-lg font-semibold text-gray-900">
							{title}
						</h3>
						{subtitle && (
							<p className="text-sm text-gray-600 mt-1">
								{subtitle}
							</p>
						)}
					</div>

					{/* Status indicator */}
					<div className="flex items-center space-x-2">
						<StatusIcon className={`w-5 h-5 ${status.color}`} />
						<span className={`text-sm font-medium ${status.color}`}>
							{status.text}
						</span>
					</div>
				</div>
			</div>

			{/* Gauge SVG */}
			<div className="flex justify-center mb-6">
				<div
					className="relative"
					onMouseEnter={() => setShowTooltip(true)}
					onMouseLeave={() => setShowTooltip(false)}
				>
					<svg width="200" height="120" viewBox="0 0 200 120">
						{/* Background arc */}
						<path
							d={createArcPath(0, 180, radius)}
							fill="none"
							stroke="#E5E7EB"
							strokeWidth={strokeWidth}
							strokeLinecap="round"
						/>

						{/* Progress arc */}
						<path
							d={createArcPath(0, angle, radius)}
							fill="none"
							stroke={getCurrentColor()}
							strokeWidth={strokeWidth}
							strokeLinecap="round"
							className="transition-all duration-1000 ease-out"
						/>

						{/* Center value */}
						<text
							x="100"
							y="85"
							textAnchor="middle"
							className="text-2xl font-bold fill-gray-900"
						>
							{value}%
						</text>

						{/* Min/Max labels */}
						<text
							x="20"
							y="110"
							textAnchor="middle"
							className="text-xs fill-gray-500"
						>
							{min}%
						</text>
						<text
							x="180"
							y="110"
							textAnchor="middle"
							className="text-xs fill-gray-500"
						>
							{max}%
						</text>
					</svg>

					{/* Tooltip */}
					{showTooltip && (
						<div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
							System Health: {value}%
							<div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-900"></div>
						</div>
					)}
				</div>
			</div>

			{/* Critical alert */}
			{value < 60 && (
				<div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
					<div className="flex items-center space-x-2">
						<XCircle className="w-4 h-4 text-red-500" />
						<span className="text-sm font-medium text-red-800">
							Critical System Health Alert
						</span>
					</div>
					<p className="text-xs text-red-700 mt-1">
						Immediate attention required to maintain system
						stability
					</p>
				</div>
			)}

			{/* Health ranges legend */}
			<div className="grid grid-cols-3 gap-2 text-xs">
				<div className="flex items-center space-x-2">
					<div className="w-3 h-3 bg-red-500 rounded-full"></div>
					<span className="text-gray-600">0-59% Critical</span>
				</div>
				<div className="flex items-center space-x-2">
					<div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
					<span className="text-gray-600">60-79% Warning</span>
				</div>
				<div className="flex items-center space-x-2">
					<div className="w-3 h-3 bg-green-500 rounded-full"></div>
					<span className="text-gray-600">80-100% Healthy</span>
				</div>
			</div>

			{/* Accessibility description */}
			<div className="sr-only">
				System health gauge showing {value} percent. Status is{' '}
				{status.text.toLowerCase()}. Health ranges: 0-59% is critical,
				60-79% is warning, 80-100% is healthy.
				{value < 60 && ' Critical alert: immediate attention required.'}
			</div>
		</div>
	);
};

export default GaugeChart;
