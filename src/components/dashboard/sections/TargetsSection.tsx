'use client';

import { DashboardData } from '@/types/dashboard.types';
import React from 'react';
import ProgressBar from '../ProgressBar';

interface TargetsSectionProps {
	targets: DashboardData['targets'];
}

const TargetsSection: React.FC<TargetsSectionProps> = ({ targets }) => {
	return (
		<section className="targets-section" aria-labelledby="targets-heading">
			<div className="section-header">
				<h2 id="targets-heading" className="section-title">
					Performance Targets
				</h2>
				<p className="section-description">
					Track progress toward operational goals and targets
				</p>
			</div>

			<div className="targets-grid">
				{/* Storage Target */}
				<ProgressBar
					label="Storage Target"
					current={targets.storage.current}
					target={targets.storage.target}
					unit={targets.storage.unit}
					color="#3B82F6"
					showPercentage={true}
				/>

				{/* Upload Target */}
				<ProgressBar
					label="Upload Target"
					current={targets.uploads.current}
					target={targets.uploads.target}
					unit={targets.uploads.unit}
					color="#10B981"
					showPercentage={true}
				/>

				{/* Share Link Target */}
				<ProgressBar
					label="Share Link Target"
					current={targets.shareLinks.current}
					target={targets.shareLinks.target}
					unit={targets.shareLinks.unit}
					color="#F59E0B"
					showPercentage={true}
				/>
			</div>
		</section>
	);
};

export default TargetsSection;
