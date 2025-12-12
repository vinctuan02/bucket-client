'use client';

import { DashboardData } from '@/types/dashboard.types';
import { formatNumber } from '@/utils/dashboard.utils';
import { Activity, Download, Share } from 'lucide-react';
import React from 'react';
import MiniCard from '../MiniCard';

interface ActivitySectionProps {
	activity: DashboardData['activity'];
}

const ActivitySection: React.FC<ActivitySectionProps> = ({ activity }) => {
	return (
		<section
			className="activity-section"
			style={{
				backgroundColor: 'white',
				borderRadius: '12px',
				padding: '24px',
				boxShadow:
					'0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
				transition: 'all 0.2s ease',
			}}
			aria-labelledby="activity-heading"
		>
			<div className="section-header" style={{ marginBottom: '20px' }}>
				<h2
					id="activity-heading"
					className="section-title"
					style={{
						fontSize: '18px',
						fontWeight: '600',
						color: '#1f2937',
						margin: '0 0 8px 0',
					}}
				>
					Current Activity
				</h2>
				<p
					className="section-description"
					style={{
						fontSize: '14px',
						color: '#6b7280',
						margin: '0',
					}}
				>
					Real-time system activity metrics
				</p>
			</div>

			<div className="activity-grid">
				{/* Bandwidth Used */}
				<MiniCard
					title="Bandwidth Used"
					value={activity.bandwidthUsed.current}
					unit={activity.bandwidthUsed.unit}
					icon={<Activity className="w-5 h-5" />}
					color="#3B82F6"
				/>

				{/* Downloads Today */}
				<MiniCard
					title="Downloads Today"
					value={formatNumber(activity.downloadsToday)}
					unit="files"
					icon={<Download className="w-5 h-5" />}
					color="#10B981"
				/>

				{/* Active Shared Links */}
				<MiniCard
					title="Active Shared Links"
					value={formatNumber(activity.activeSharedLinks)}
					unit="links"
					icon={<Share className="w-5 h-5" />}
					color="#F59E0B"
				/>
			</div>
		</section>
	);
};

export default ActivitySection;
