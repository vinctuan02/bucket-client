'use client';

import { StatCardProps } from '@/types/dashboard.types';
import { Minus, TrendingDown, TrendingUp } from 'lucide-react';
import React from 'react';

const StatCard: React.FC<StatCardProps> = ({
	title,
	value,
	subtitle,
	showProgress = false,
	progressValue = 0,
	icon,
	trend = 'neutral',
	trendValue,
}) => {
	const getTrendIcon = () => {
		switch (trend) {
			case 'up':
				return <TrendingUp className="w-3 h-3" />;
			case 'down':
				return <TrendingDown className="w-3 h-3" />;
			default:
				return <Minus className="w-3 h-3" />;
		}
	};

	const getProgressClass = () => {
		if (progressValue >= 90) return 'progress-danger';
		if (progressValue >= 75) return 'progress-warning';
		return 'progress-primary';
	};

	return (
		<div
			className="stat-card"
			style={{
				backgroundColor: 'white',
				borderRadius: '12px',
				padding: '24px',
				boxShadow:
					'0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
				transition: 'all 0.2s ease',
				cursor: 'pointer',
			}}
			onMouseEnter={(e) => {
				e.currentTarget.style.boxShadow =
					'0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
				e.currentTarget.style.transform = 'translateY(-2px)';
			}}
			onMouseLeave={(e) => {
				e.currentTarget.style.boxShadow =
					'0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)';
				e.currentTarget.style.transform = 'translateY(0)';
			}}
		>
			{/* Header */}
			<div
				className="stat-card-header"
				style={{
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'flex-start',
					marginBottom: '16px',
				}}
			>
				<div
					className="stat-card-icon"
					style={{
						width: '48px',
						height: '48px',
						borderRadius: '12px',
						backgroundColor: '#f3f4f6',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
					}}
				>
					{icon}
				</div>
				{trendValue && (
					<div className={`stat-card-trend trend-${trend}`}>
						{getTrendIcon()}
						<span>{trendValue}</span>
					</div>
				)}
			</div>

			{/* Content */}
			<div
				className="stat-card-label"
				style={{
					fontSize: '14px',
					color: '#6b7280',
					fontWeight: '500',
					marginBottom: '8px',
				}}
			>
				{title}
			</div>
			<div
				className="stat-card-value"
				style={{
					fontSize: '28px',
					fontWeight: '700',
					color: '#1f2937',
					marginBottom: '4px',
				}}
			>
				{value}
			</div>
			{subtitle && (
				<div
					className="stat-card-subtitle"
					style={{
						fontSize: '12px',
						color: '#9ca3af',
					}}
				>
					{subtitle}
				</div>
			)}

			{/* Progress Bar */}
			{showProgress && (
				<div className="progress-container">
					<div className="progress-header">
						<span className="progress-label">Usage</span>
						<span className="progress-value">{progressValue}%</span>
					</div>
					<div className="progress-bar">
						<div
							className={`progress-fill ${getProgressClass()}`}
							style={{
								width: `${Math.min(progressValue, 100)}%`,
							}}
						/>
					</div>
					{progressValue >= 90 && (
						<div
							style={{
								marginTop: '8px',
								fontSize: '11px',
								color: 'var(--danger-color)',
								display: 'flex',
								alignItems: 'center',
								gap: '4px',
							}}
						>
							<div
								style={{
									width: '6px',
									height: '6px',
									backgroundColor: 'var(--danger-color)',
									borderRadius: '50%',
								}}
							/>
							High usage warning
						</div>
					)}
				</div>
			)}
		</div>
	);
};

export default StatCard;
