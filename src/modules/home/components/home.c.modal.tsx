'use client';

import { FileNode } from '@/modules/home/home.entity';
import { message } from 'antd';
import { Upload, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import './home.c.modal.scss';

interface FileNodeModalProps {
	type: 'folder' | 'file';
	initialData?: Partial<FileNode>;
	onClose: () => void;
	onSave: (data: any, onProgress?: (progress: number) => void) => void;
	onUploadProgress?: (progress: UploadProgress | null) => void;
}

interface UploadProgress {
	fileName: string;
	progress: number;
	status: 'uploading' | 'completed' | 'error';
	speed?: string; // Upload speed (e.g., "2.5 MB/s")
	uploadedSize?: string; // Uploaded size (e.g., "5 MB")
	totalSize?: string; // Total size (e.g., "10 MB")
}

export default function FileNodeModal({
	type,
	initialData,
	onClose,
	onSave,
	onUploadProgress,
}: FileNodeModalProps) {
	const [name, setName] = useState(initialData?.name ?? '');
	const [file, setFile] = useState<File | null>(null);
	const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(
		null,
	);
	const [isUploading, setIsUploading] = useState(false);

	useEffect(() => {
		if (initialData?.name) setName(initialData.name);
	}, [initialData]);

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const f = e.target.files?.[0];
		if (f) {
			setFile(f);
			if (!name.trim()) setName(f.name);
		}
	};

	const formatFileSize = (bytes: number): string => {
		if (bytes === 0) return '0 B';
		const k = 1024;
		const sizes = ['B', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return (
			Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
		);
	};

	const handleSubmit = async () => {
		if (!name.trim()) return message.warning('Name is required');
		if (type === 'file' && !file)
			return message.warning('Please select a file');

		// Close modal immediately
		onClose();

		// Start upload progress tracking
		setIsUploading(true);
		const fileSize = file?.size || 0;
		const totalSize = formatFileSize(fileSize);
		const startTime = Date.now();

		const initialProgress = {
			fileName: name,
			progress: 0,
			status: 'uploading' as const,
			uploadedSize: '0 B',
			totalSize: totalSize,
			speed: '0 B/s',
		};
		setUploadProgress(initialProgress);
		onUploadProgress?.(initialProgress);

		try {
			// Callback to track real upload progress
			const handleProgress = (uploadedBytes: number) => {
				const elapsedSeconds = (Date.now() - startTime) / 1000;
				const progress = (uploadedBytes / fileSize) * 100;
				const speed = uploadedBytes / elapsedSeconds;

				const updated = {
					fileName: name,
					progress: Math.min(progress, 99), // Cap at 99% until completion
					status: 'uploading' as const,
					uploadedSize: formatFileSize(uploadedBytes),
					totalSize: formatFileSize(fileSize),
					speed: formatFileSize(speed) + '/s',
				};
				setUploadProgress(updated);
				onUploadProgress?.(updated);
			};

			await onSave(
				{
					name,
					fileNodeParentId: initialData?.fileNodeParentId,
					...(type === 'file' ? { file } : {}),
				},
				handleProgress,
			);

			// Update progress to completed
			const completedProgress = {
				fileName: name,
				progress: 100,
				status: 'completed' as const,
				uploadedSize: totalSize,
				totalSize: totalSize,
				speed:
					formatFileSize(
						fileSize / ((Date.now() - startTime) / 1000),
					) + '/s',
			};
			setUploadProgress(completedProgress);
			onUploadProgress?.(completedProgress);

			// Auto close progress modal after 2 seconds
			setTimeout(() => {
				setUploadProgress(null);
				onUploadProgress?.(null);
				setIsUploading(false);
			}, 2000);
		} catch (error) {
			setUploadProgress({
				fileName: name,
				progress: 0,
				status: 'error',
				uploadedSize: '0 B',
				totalSize: totalSize,
			});
			setIsUploading(false);
		}
	};

	const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
		if (e.target === e.currentTarget) onClose();
	};

	return (
		<div className="modal-overlay" onClick={handleOverlayClick}>
			<div className="modal">
				<h2 className="modal__title">
					{initialData?.id ? 'Edit' : 'Create New'}{' '}
					{type === 'folder' ? 'Folder' : 'File'}
				</h2>

				<div className="form-row">
					<div className="form-group full">
						<label>Name</label>
						<input
							type="text"
							value={name}
							onChange={(e) => setName(e.target.value)}
							placeholder={`Enter ${type} name`}
						/>
					</div>

					{type === 'file' && (
						<>
							<div className="form-group full">
								<label>Upload File</label>
								{file ? (
									<div className="file-preview-u">
										<span className="file-name">
											{file.name}
										</span>
										<button
											className="file-remove"
											onClick={() => {
												setFile(null);
												setName('');
											}}
										>
											<X size={16} />
										</button>
									</div>
								) : (
									<label className="upload-box">
										<Upload size={18} />
										<span>Click to choose file</span>
										<input
											type="file"
											onChange={handleFileChange}
										/>
									</label>
								)}
							</div>

							{file && (
								<div className="form-group full">
									<label>Preview</label>
									<div className="file-preview-container">
										{file.type.startsWith('image/') && (
											<img
												src={URL.createObjectURL(file)}
												alt="preview"
												className="preview-image"
											/>
										)}
										{file.type.startsWith('video/') && (
											<video
												controls
												className="preview-video"
											>
												<source
													src={URL.createObjectURL(
														file,
													)}
													type={file.type}
												/>
											</video>
										)}
										{file.type === 'application/pdf' && (
											<iframe
												src={URL.createObjectURL(file)}
												className="preview-pdf"
											/>
										)}
										{file.type.startsWith('text/') && (
											<iframe
												src={URL.createObjectURL(file)}
												className="preview-text"
											/>
										)}
										{!file.type.startsWith('image/') &&
											!file.type.startsWith('video/') &&
											file.type !== 'application/pdf' &&
											!file.type.startsWith('text/') && (
												<div className="preview-unavailable">
													<p>
														Preview not available
														for this file type
													</p>
												</div>
											)}
									</div>
								</div>
							)}
						</>
					)}
				</div>

				<div className="modal__actions">
					<button
						className="btn btn-cancel"
						onClick={onClose}
						disabled={isUploading}
					>
						Cancel
					</button>
					<button
						className="btn btn-blue"
						onClick={handleSubmit}
						disabled={isUploading}
					>
						{isUploading ? 'Uploading...' : 'Save'}
					</button>
				</div>
			</div>

			{/* Upload Progress Modal */}
			{uploadProgress && (
				<div className="upload-progress-overlay">
					<div className="upload-progress-modal">
						<div className="upload-progress-header">
							<h3>Upload Progress</h3>
						</div>
						<div className="upload-progress-content">
							<div className="upload-item">
								<div className="upload-info">
									<span className="upload-filename">
										{uploadProgress.fileName}
									</span>
									<span className="upload-percent">
										{Math.round(uploadProgress.progress)}%
									</span>
								</div>
								<div className="upload-bar">
									<div
										className={`upload-fill ${uploadProgress.status}`}
										style={{
											width: `${uploadProgress.progress}%`,
										}}
									/>
								</div>
								<div className="upload-details">
									<div className="detail-row">
										<span className="detail-label">
											{uploadProgress.uploadedSize} /{' '}
											{uploadProgress.totalSize}
										</span>
										<span className="detail-speed">
											{uploadProgress.speed}
										</span>
									</div>
								</div>
								<div className="upload-status">
									{uploadProgress.status === 'uploading' && (
										<span className="status-uploading">
											Uploading...
										</span>
									)}
									{uploadProgress.status === 'completed' && (
										<span className="status-completed">
											✓ Completed
										</span>
									)}
									{uploadProgress.status === 'error' && (
										<span className="status-error">
											✗ Error
										</span>
									)}
								</div>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
