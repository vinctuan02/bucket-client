'use client';

import Page from '@/components/pages/c.page';
import { useAppConfigStore } from '@/modules/app-config/app-config.store';
import { userApi } from '@/modules/users/user.api';
import { User } from '@/modules/users/user.entity';
import { UploadOutlined, UserOutlined } from '@ant-design/icons';
import {
	Avatar,
	Button,
	Card,
	Form,
	Input,
	InputNumber,
	message,
	Spin,
	Upload,
} from 'antd';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import './my-profile.scss';

export default function ProfilePage() {
	const router = useRouter();
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);
	const [updating, setUpdating] = useState(false);
	const [isEditing, setIsEditing] = useState(false);
	const [avatarFileList, setAvatarFileList] = useState<any[]>([]);
	const [form] = Form.useForm();
	const { storage, loading: storageLoading } = useStorageInfo();
	const [plans, setPlans] = useState<PlanResponseDto[]>([]);
	const [plansLoading, setPlansLoading] = useState(false);
	const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
	const { config, fetchConfig } = useAppConfigStore();

	const fetchProfile = async () => {
		try {
			const res = await userApi.getProfile();
			setUser(res?.data ?? null);
			if (res?.data) {
				form.setFieldsValue({
					name: res.data.name,
					avatar: res.data.avatar,
					trashRetentionDays: res.data.trashRetentionDays,
				});

				// Set avatar fileList if exists
				if (res.data.avatar) {
					setAvatarFileList([
						{
							uid: '-1',
							name: 'avatar',
							status: 'done',
							url: res.data.avatar,
						},
					]);
				} else {
					setAvatarFileList([]);
				}
			}
		} catch (err) {
			console.error('Error fetching profile:', err);
			localStorage.removeItem('access_token');
			localStorage.removeItem('refresh_token');
			router.replace('/login');
		} finally {
			setLoading(false);
		}
	};

	const fetchPlans = async () => {
		setPlansLoading(true);
		try {
			const res = await subscriptionApi.getStoragePlans();
			setPlans(res.data?.data || []);
		} catch (error) {
			message.error('Failed to load storage plans');
		} finally {
			setPlansLoading(false);
		}
	};

	const handleSelectPlan = async (plan: PlanResponseDto) => {
		setSelectedPlanId(plan.id);
		try {
			await subscriptionApi.create({ planId: plan.id });
			message.success('Subscription created successfully!');
			fetchPlans();
		} catch (error) {
			message.error('Failed to create subscription');
		} finally {
			setSelectedPlanId(null);
		}
	};

	const formatBytes = (bytes: number) => {
		if (bytes === 0) return '0 B';
		const k = 1024;
		const sizes = ['B', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return (
			Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
		);
	};

	useEffect(() => {
		const token = localStorage.getItem('access_token');
		if (!token) {
			router.replace('/login');
			return;
		}

		fetchProfile();
		fetchConfig();
		fetchPlans();
	}, [router]);

	const handleSubmit = async (values: any) => {
		setUpdating(true);
		try {
			const updateData: any = {
				name: values.name,
			};

			// Always include avatar field (can be null to remove avatar)
			updateData.avatar = values.avatar || null;

			if (values.trashRetentionDays !== undefined) {
				updateData.trashRetentionDays = values.trashRetentionDays;
			}

			const res = await userApi.updateProfile(updateData);
			setUser(res.data ?? null);
			message.success('Profile updated successfully');
			setIsEditing(false);
		} catch (error) {
			message.error('Failed to update profile');
		} finally {
			setUpdating(false);
		}
	};

	if (loading) {
		return (
			<Page title="My Profile">
				<div className="flex justify-center items-center h-screen">
					<Spin size="large" />
				</div>
			</Page>
		);
	}

	if (!user) {
		return (
			<Page title="My Profile">
				<div className="profile-error">
					Failed to load user information.
				</div>
			</Page>
		);
	}

	const systemDefault = config?.trashRetentionDays || 30;

	const profileTab = (
		<Card
			title="Profile Information"
			extra={
				!isEditing && (
					<Button type="primary" onClick={() => setIsEditing(true)}>
						Edit Profile
					</Button>
				)
			}
		>
					extra={
						!isEditing && (
							<Button
								type="primary"
								onClick={() => setIsEditing(true)}
							>
								Edit Profile
							</Button>
						)
					}
				>
					{!isEditing ? (
						<div className="profile-view">
							<div className="flex items-center gap-4 mb-6">
								<Avatar
									size={80}
									src={user.avatar}
									icon={<UserOutlined />}
								/>
								<div>
									<h2 className="text-2xl font-bold">
										{user.name}
									</h2>
									<p className="text-gray-500">
										{user.email}
									</p>
									{user.provider && (
										<p className="text-sm text-gray-400">
											Signed in with {user.provider}
										</p>
									)}
								</div>
							</div>

							<div className="space-y-4">
								<div>
									<label className="text-gray-600 text-sm">
										Trash Retention Period
									</label>
									<p className="text-lg">
										{user.trashRetentionDays
											? `${user.trashRetentionDays} days`
											: `${systemDefault} days (System Default)`}
									</p>
								</div>
							</div>

							<div className="mt-6">
								<Button
									danger
									onClick={() => {
										localStorage.removeItem('access_token');
										localStorage.removeItem(
											'refresh_token',
										);
										router.replace('/login');
									}}
								>
									Logout
								</Button>
							</div>
						</div>
					) : (
						<Form
							form={form}
							layout="vertical"
							onFinish={handleSubmit}
						>
							<Form.Item
								label="Name"
								name="name"
								rules={[
									{
										required: true,
										message: 'Please enter your name',
									},
								]}
							>
								<Input placeholder="Your name" />
							</Form.Item>

							<Form.Item label="Avatar">
								<Upload
									listType="picture-card"
									maxCount={1}
									fileList={avatarFileList}
									beforeUpload={async (file) => {
										try {
											// Get upload URL
											const res =
												await userApi.getAvatarUploadUrl(
													{
														fileName: file.name,
														fileSize: file.size,
														contentType:
															file.type ||
															'image/jpeg',
													},
												);

											const uploadUrl =
												res.data?.uploadUrl;
											const avatarUrl =
												res.data?.avatarUrl;

											if (!uploadUrl || !avatarUrl) {
												throw new Error(
													'Failed to get upload URL',
												);
											}

											// Upload to MinIO
											await fetch(uploadUrl, {
												method: 'PUT',
												body: file,
												headers: {
													'Content-Type': file.type,
												},
											});

											// Update form and fileList with avatar URL
											form.setFieldValue(
												'avatar',
												avatarUrl,
											);
											setAvatarFileList([
												{
													uid: '-1',
													name: file.name,
													status: 'done',
													url: avatarUrl,
												},
											]);
											message.success(
												'Avatar uploaded successfully',
											);
										} catch (error) {
											message.error(
												'Failed to upload avatar',
											);
										}
										return false; // Prevent default upload
									}}
									onRemove={() => {
										form.setFieldValue('avatar', null);
										setAvatarFileList([]);
										message.info(
											'Avatar will be removed when you save',
										);
									}}
								>
									{avatarFileList.length === 0 && (
										<div>
											<UploadOutlined />
											<div style={{ marginTop: 8 }}>
												Upload
											</div>
										</div>
									)}
								</Upload>
								<Form.Item name="avatar" hidden>
									<Input />
								</Form.Item>
							</Form.Item>

							<Form.Item
								label="Trash Retention Days"
								name="trashRetentionDays"
								extra={`Leave empty to use system default (${systemDefault} days). Files will be permanently deleted after this many days in trash.`}
							>
								<InputNumber
									min={1}
									max={365}
									className="w-full"
									placeholder={`${systemDefault} (System Default)`}
								/>
							</Form.Item>

							<Form.Item>
								<div className="flex gap-2">
									<Button
										type="primary"
										htmlType="submit"
										loading={updating}
									>
										Save Changes
									</Button>
									<Button
										onClick={() => {
											setIsEditing(false);
											form.setFieldsValue({
												name: user.name,
												avatar: user.avatar,
												trashRetentionDays:
													user.trashRetentionDays,
											});
											// Reset avatar fileList
											if (user.avatar) {
												setAvatarFileList([
													{
														uid: '-1',
														name: 'avatar',
														status: 'done',
														url: user.avatar,
													},
												]);
											} else {
												setAvatarFileList([]);
											}
										}}
									>
										Cancel
									</Button>
								</div>
							</Form.Item>
						</Form>
					)}
				</Card>
			</div>
		</Page>
	);
}
