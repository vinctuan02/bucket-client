'use client';

import { ProgressBarProps } from '@/types/dashboard.types';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import React from 'react';

const ProgressBar: React.FC<ProgressBarProps> = ({
	label,
	current,
	target,
	unit = '',
	color = '#3B82F6',
	showPercentage = true,
}) => {
	const percentage = target > 0 ? Math.round((current / target) * 100) : 0;
	const isOverAchievement = percentage > 100;
	const isAtRisk = percentage < 50;

	const getProgressColor = () => {
		if (isOverAchievement) return '#10B981'; // Green for over-achievement
		if (isAtRisk) return '#EF4444'; // Red for at risk
		return color; // Default color
	};

	const getStatusIcon = () => {
		if (isOverAchievement) {
			return <CheckCircle className="w-4 h-4 text-green-500" />;
		}
		if (isAtRisk) {
			return <AlertTriangle className="w-4 h-4 text-red-500" />;
		}
		return null;
	};

	const getStatusText = () => {
		if (isOverAchievement) return 'Target exceeded';
		if (isAtRisk) return 'At risk';
		return 'On track';
	};

	const getStatusColor = () => {
		if (isOverAchievement) return 'text-green-600';
		if (isAtRisk) return 'text-red-600';
		return 'text-blue-600';
	};

	return (
		<div className="progress-bar-component">
			{/* Header */}
			<div className="flex-between" style={{ marginBottom: '8px' }}>
				<div className="progress-bar-label">{label}</div>
				<div
					className="flex"
					style={{ alignItems: 'center', gap: '4px' }}
				>
					{getStatusIcon()}
					<span
						className={`${getStatusColor()}`}
						style={{ fontSize: '11px', fontWeight: 500 }}
					>
						{getStatusText()}
					</span>
				</div>
			</div>

			{/* Progress Stats */}
			<div className="progress-bar-stats">
				<div className="progress-bar-current">
					{current.toLocaleString()} {unit} of{' '}
					{target.toLocaleString()} {unit}
				</div>
				{showPercentage && (
					<div className="progress-bar-percentage">{percentage}%</div>
				)}
			</div>

			{/* Progress Bar */}
			<div className="progress-bar">
				<div
					className="progress-fill"
					style={{
						width: `${Math.min(percentage, 100)}%`,
						backgroundColor: getProgressColor(),
					}}
				/>
			</div>

			{/* Over-achievement indicator */}
			{isOverAchievement && (
				<div
					style={{
						marginTop: '8px',
						fontSize: '11px',
						color: 'var(--success-color)',
						fontWeight: 500,
					}}
				>
					+{(percentage - 100).toFixed(1)}% above target
				</div>
			)}
		</div>
	);
};

export default ProgressBar;
