'use client';

import { appConfigApi } from '@/modules/app-config/app-config.api';
import { UploadOutlined } from '@ant-design/icons';
import { message, Upload } from 'antd';
import axios from 'axios';
import { useState } from 'react';

interface IconUploadProps {
	value?: string | null;
	onChange?: (url: string | null) => void;
}

export default function IconUpload({ value, onChange }: IconUploadProps) {
	const [fileList, setFileList] = useState<any[]>(
		value
			? [
					{
						uid: '-1',
						name: 'icon',
						status: 'done',
						url: value,
					},
				]
			: [],
	);

	return (
		<Upload
			listType="picture-card"
			maxCount={1}
			fileList={fileList}
			beforeUpload={async (file) => {
				try {
					// Validate file type
					if (!file.type.startsWith('image/')) {
						message.error('Please upload an image file');
						return false;
					}

					// Get upload URL
					const res = await appConfigApi.getIconUploadUrl({
						fileName: file.name,
						fileSize: file.size,
						contentType: file.type,
					});

					const uploadUrl = res.data?.uploadUrl;
					const iconUrl = res.data?.iconUrl;

					if (!uploadUrl || !iconUrl) {
						throw new Error('Failed to get upload URL');
					}

					// Upload to MinIO
					await axios.put(uploadUrl, file, {
						headers: {
							'Content-Type': file.type,
						},
					});

					// Update fileList and notify parent
					setFileList([
						{
							uid: '-1',
							name: file.name,
							status: 'done',
							url: iconUrl,
						},
					]);

					onChange?.(iconUrl);
					message.success('Icon uploaded successfully');
				} catch (error) {
					message.error('Failed to upload icon');
					console.error('Icon upload error:', error);
				}

				return false; // Prevent default upload behavior
			}}
			onRemove={() => {
				setFileList([]);
				onChange?.(null);
				message.info('Icon will be removed when you save');
			}}
		>
			{fileList.length === 0 && (
				<div>
					<UploadOutlined />
					<div style={{ marginTop: 8 }}>Upload Icon</div>
				</div>
			)}
		</Upload>
	);
}
