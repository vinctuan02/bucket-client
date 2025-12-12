'use client';

import { DashboardData } from '@/types/dashboard.types';
import { Database, Globe, HardDrive, Server, Shield } from 'lucide-react';
import React from 'react';
import GaugeChart from '../GaugeChart';

interface SystemHealthSectionProps {
	systemHealth: DashboardData['systemHealth'];
}

const SystemHealthSection: React.FC<SystemHealthSectionProps> = ({
	systemHealth,
}) => {
	const getComponentIcon = (name: string) => {
		switch (name.toLowerCase()) {
			case 'api server':
				return <Server className="w-4 h-4" />;
			case 'database':
				return <Database className="w-4 h-4" />;
			case 'storage':
				return <HardDrive className="w-4 h-4" />;
			case 'cdn':
				return <Globe className="w-4 h-4" />;
			case 'auth service':
				return <Shield className="w-4 h-4" />;
			default:
				return <Server className="w-4 h-4" />;
		}
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case 'healthy':
				return 'text-green-600 bg-green-50 border-green-200';
			case 'warning':
				return 'text-yellow-600 bg-yellow-50 border-yellow-200';
			case 'critical':
				return 'text-red-600 bg-red-50 border-red-200';
			default:
				return 'text-gray-600 bg-gray-50 border-gray-200';
		}
	};

	return (
		<div
			className="system-health-section"
			style={{
				backgroundColor: 'white',
				borderRadius: '12px',
				padding: '24px',
				boxShadow:
					'0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
				transition: 'all 0.2s ease',
			}}
		>
			<div className="section-header" style={{ marginBottom: '24px' }}>
				<h2
					className="section-title"
					style={{
						fontSize: '18px',
						fontWeight: '600',
						color: '#1f2937',
						margin: '0 0 8px 0',
					}}
				>
					System Health Overview
				</h2>
				<p
					className="section-description"
					style={{
						fontSize: '14px',
						color: '#6b7280',
						margin: '0',
					}}
				>
					Monitor overall system performance and component health
				</p>
			</div>

			<div
				className="health-grid"
				style={{
					display: 'grid',
					gridTemplateColumns: '1fr 2fr',
					gap: '32px',
					alignItems: 'start',
				}}
			>
				{/* Gauge Chart */}
				<div
					className="gauge-container"
					style={{
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						justifyContent: 'center',
						padding: '20px',
						backgroundColor: '#f9fafb',
						borderRadius: '12px',
					}}
				>
					<GaugeChart
						value={systemHealth.overall}
						title="System Health"
						subtitle="Overall system performance"
					/>
				</div>

				{/* Health Components */}
				<div
					className="components-container"
					style={{
						display: 'flex',
						flexDirection: 'column',
						gap: '12px',
					}}
				>
					<h3
						style={{
							fontSize: '16px',
							fontWeight: '600',
							color: '#1f2937',
							marginBottom: '16px',
						}}
					>
						Component Status
					</h3>

					{systemHealth.components.map((component, index) => (
						<div
							key={index}
							className={`health-component ${component.status}`}
							style={{
								padding: '16px',
								borderRadius: '8px',
								border: '1px solid',
								display: 'flex',
								justifyContent: 'space-between',
								alignItems: 'center',
								transition: 'all 0.2s ease',
							}}
						>
							<div
								className="health-component-info"
								style={{
									display: 'flex',
									alignItems: 'center',
									gap: '12px',
								}}
							>
								{getComponentIcon(component.name)}
								<span
									className="health-component-name"
									style={{
										fontSize: '14px',
										fontWeight: '500',
										color: '#374151',
									}}
								>
									{component.name}
								</span>
							</div>
							<div
								className="health-component-value"
								style={{
									fontSize: '14px',
									fontWeight: '600',
									color: '#1f2937',
								}}
							>
								{component.value}%
							</div>
						</div>
					))}

					{/* Summary */}
					<div
						style={{
							marginTop: '20px',
							paddingTop: '20px',
							borderTop: '1px solid #e5e7eb',
							fontSize: '13px',
							color: '#6b7280',
						}}
					>
						<div
							className="flex-between"
							style={{
								display: 'flex',
								justifyContent: 'space-between',
								alignItems: 'center',
							}}
						>
							<span>
								{
									systemHealth.components.filter(
										(c) => c.status === 'healthy',
									).length
								}{' '}
								of {systemHealth.components.length} components
								healthy
							</span>
							<span
								style={{
									fontWeight: '500',
									color: '#1f2937',
								}}
							>
								Overall: {systemHealth.overall}%
							</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default SystemHealthSection;
