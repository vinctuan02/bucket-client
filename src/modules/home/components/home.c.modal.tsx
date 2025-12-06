'use client';

import Portal from '@/components/commons/portal';
import { useUpload } from '@/modules/home/contexts/upload.context';
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
}

export default function FileNodeModal({
	type,
	initialData,
	onClose,
	onSave,
}: FileNodeModalProps) {
	const { addUpload, updateUpload, removeUpload } = useUpload();
	const [name, setName] = useState(initialData?.name ?? '');
	const [file, setFile] = useState<File | null>(null);
	const [isUploading, setIsUploading] = useState(false);
	const uploadId = `upload-${Date.now()}-${Math.random()}`;

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
			id: uploadId,
			fileName: name,
			progress: 0,
			status: 'uploading' as const,
			uploadedSize: '0 B',
			totalSize: totalSize,
			speed: '0 B/s',
		};
		addUpload(initialProgress);

		try {
			// Callback to track real upload progress
			const handleProgress = (uploadedBytes: number) => {
				const elapsedSeconds = (Date.now() - startTime) / 1000;
				const progress = (uploadedBytes / fileSize) * 100;
				const speed = uploadedBytes / elapsedSeconds;

				updateUpload(uploadId, {
					progress: Math.min(progress, 99),
					uploadedSize: formatFileSize(uploadedBytes),
					speed: formatFileSize(speed) + '/s',
				});
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
			updateUpload(uploadId, {
				progress: 100,
				status: 'completed',
				uploadedSize: totalSize,
				speed:
					formatFileSize(
						fileSize / ((Date.now() - startTime) / 1000),
					) + '/s',
			});

			// Auto remove after 2 seconds
			setTimeout(() => {
				removeUpload(uploadId);
				setIsUploading(false);
			}, 2000);
		} catch (error) {
			updateUpload(uploadId, {
				progress: 0,
				status: 'error',
				uploadedSize: '0 B',
			});
			setIsUploading(false);
		}
	};

	const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
		if (e.target === e.currentTarget) onClose();
	};

	return (
		<Portal>
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
													src={URL.createObjectURL(
														file,
													)}
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
											{file.type ===
												'application/pdf' && (
												<iframe
													src={URL.createObjectURL(
														file,
													)}
													className="preview-pdf"
												/>
											)}
											{file.type.startsWith('text/') && (
												<iframe
													src={URL.createObjectURL(
														file,
													)}
													className="preview-text"
												/>
											)}
											{!file.type.startsWith('image/') &&
												!file.type.startsWith(
													'video/',
												) &&
												file.type !==
													'application/pdf' &&
												!file.type.startsWith(
													'text/',
												) && (
													<div className="preview-unavailable">
														<p>
															Preview not
															available for this
															file type
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
			</div>
		</Portal>
	);
}
