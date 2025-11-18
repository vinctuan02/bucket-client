'use client';

import { ChevronDown, ChevronUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import './upload-progress.c.scss';

export interface UploadProgressData {
	fileName: string;
	progress: number;
	status: 'uploading' | 'completed' | 'error';
	speed?: string;
	uploadedSize?: string;
	totalSize?: string;
}

interface UploadProgressProps {
	data: UploadProgressData | null;
	onClose?: () => void;
}

export default function UploadProgress({ data, onClose }: UploadProgressProps) {
	const [visible, setVisible] = useState(false);
	const [isCollapsed, setIsCollapsed] = useState(false);

	useEffect(() => {
		if (data) {
			setVisible(true);
		}
	}, [data]);

	if (!data || !visible) return null;

	return (
		<div className="upload-progress-overlay">
			<div
				className={`upload-progress-modal ${isCollapsed ? 'collapsed' : ''}`}
			>
				<div className="upload-progress-header">
					<h3>Upload Progress</h3>
					<button
						className="collapse-btn"
						onClick={() => setIsCollapsed(!isCollapsed)}
						title={isCollapsed ? 'Expand' : 'Collapse'}
					>
						{isCollapsed ? (
							<ChevronUp size={16} />
						) : (
							<ChevronDown size={16} />
						)}
					</button>
				</div>
				{!isCollapsed && (
					<div className="upload-progress-content">
						<div className="upload-item">
							<div className="upload-info">
								<span className="upload-filename">
									{data.fileName}
								</span>
								<span className="upload-percent">
									{Math.round(data.progress)}%
								</span>
							</div>
							<div className="upload-bar">
								<div
									className={`upload-fill ${data.status}`}
									style={{
										width: `${data.progress}%`,
									}}
								/>
							</div>
							<div className="upload-details">
								<div className="detail-row">
									<span className="detail-label">
										{data.uploadedSize} / {data.totalSize}
									</span>
									<span className="detail-speed">
										{data.speed}
									</span>
								</div>
							</div>
							<div className="upload-status">
								{data.status === 'uploading' && (
									<span className="status-uploading">
										Uploading...
									</span>
								)}
								{data.status === 'completed' && (
									<span className="status-completed">
										✓ Completed
									</span>
								)}
								{data.status === 'error' && (
									<span className="status-error">
										✗ Error
									</span>
								)}
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
