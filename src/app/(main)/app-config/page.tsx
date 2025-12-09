'use client';

import IconUpload from '@/components/IconUpload';
import { useAppConfigStore } from '@/modules/app-config/app-config.store';
import { Button, Card, Form, InputNumber, message, Spin } from 'antd';
import { useEffect } from 'react';

export default function AppConfigPage() {
	const [form] = Form.useForm();
	const { config, loading, fetchConfig, updateConfig } = useAppConfigStore();

	useEffect(() => {
		fetchConfig();
	}, [fetchConfig]);

	useEffect(() => {
		if (config) {
			form.setFieldsValue(config);
		}
	}, [config, form]);

	const handleSubmit = async (values: any) => {
		try {
			await updateConfig(values);
			message.success('Configuration updated successfully');
		} catch (error) {
			message.error('Failed to update configuration');
		}
	};

	if (loading && !config) {
		return (
			<div className="flex justify-center items-center h-screen">
				<Spin size="large" />
			</div>
		);
	}

	return (
		<div className="p-6">
			<Card title="App Configuration" className="max-w-2xl">
				<Form
					form={form}
					layout="vertical"
					onFinish={handleSubmit}
					initialValues={config || undefined}
				>
					<Form.Item
						label="Application Icon"
						name="icon"
						extra="Upload a custom icon for your application (recommended size: 512x512px)"
					>
						<IconUpload />
					</Form.Item>

					<Form.Item
						label="Trash Retention Days"
						name="trashRetentionDays"
						rules={[
							{
								required: true,
								message: 'Please enter number of days',
							},
						]}
						extra="Number of days before files are permanently deleted from trash"
					>
						<InputNumber
							min={1}
							max={365}
							className="w-full"
							placeholder="30"
						/>
					</Form.Item>

					<Form.Item>
						<Button
							type="primary"
							htmlType="submit"
							loading={loading}
						>
							Save
						</Button>
					</Form.Item>
				</Form>
			</Card>
		</div>
	);
}
