'use client';

import { MiniCardProps } from '@/types/dashboard.types';
import React from 'react';

const MiniCard: React.FC<MiniCardProps> = ({
	title,
	value,
	unit,
	icon,
	color,
}) => {
	return (
		<div className="mini-card">
			{/* Icon */}
			<div
				className="mini-card-icon"
				style={{ backgroundColor: `${color}15` }}
			>
				<div style={{ color }}>{icon}</div>
			</div>

			{/* Content */}
			<div className="mini-card-label">{title}</div>
			<div className="mini-card-value">
				{value}
				{unit && <span className="mini-card-unit">{unit}</span>}
			</div>
		</div>
	);
};

export default MiniCard;
