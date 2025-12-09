'use client';

import PaymentModal from '@/components/modals/modal.payment';
import Page from '@/components/pages/c.page';
import { useAppConfigStore } from '@/modules/app-config/app-config.store';
import { useStorageInfo } from '@/modules/commons/hooks/useStorageInfo';
import StoragePlanCard from '@/modules/subscription/components/storage-plan-card';
import { planApi } from '@/modules/subscription/subscription.api';
import { PlanResponseDto } from '@/modules/subscription/subscription.dto';
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
	Tabs,
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
	const { config, fetchConfig } = useAppConfigStore();
	const { storage, loading: storageLoading } = useStorageInfo();
	const [plans, setPlans] = useState<PlanResponseDto[]>([]);
	const [plansLoading, setPlansLoading] = useState(false);
	const [selectedPlan, setSelectedPlan] = useState<PlanResponseDto | null>(
		null,
	);
	const [paymentModalOpen, setPaymentModalOpen] = useState(false);

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
			const res = await planApi.getList();
			// Filter only active plans
			const activePlans = (res?.items || []).filter(
				(plan: any) => plan.isActive,
			);
			setPlans(activePlans);
		} catch (error) {
			message.error('Failed to load storage plans');
		} finally {
			setPlansLoading(false);
		}
	};

	const handleSelectPlan = (plan: PlanResponseDto) => {
		setSelectedPlan(plan);
		setPaymentModalOpen(true);
	};

	const handlePaymentSuccess = () => {
		setPaymentModalOpen(false);
		fetchPlans();
		window.location.reload();
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

	const profileContent = (
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
			{!isEditing ? (
				<div className="profile-view">
					<div className="flex items-center gap-4 mb-6">
						<Avatar
							size={80}
							src={user.avatar}
							icon={<UserOutlined />}
						/>
						<div>
							<h2 className="text-2xl font-bold">{user.name}</h2>
							<p className="text-gray-500">{user.email}</p>
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
								localStorage.removeItem('refresh_token');
								router.replace('/login');
							}}
						>
							Logout
						</Button>
					</div>
				</div>
			) : (
				<Form form={form} layout="vertical" onFinish={handleSubmit}>
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
									const res =
										await userApi.getAvatarUploadUrl({
											fileName: file.name,
											fileSize: file.size,
											contentType:
												file.type || 'image/jpeg',
										});

									const uploadUrl = res.data?.uploadUrl;
									const avatarUrl = res.data?.avatarUrl;

									if (!uploadUrl || !avatarUrl) {
										throw new Error(
											'Failed to get upload URL',
										);
									}

									await fetch(uploadUrl, {
										method: 'PUT',
										body: file,
										headers: {
											'Content-Type': file.type,
										},
									});

									form.setFieldValue('avatar', avatarUrl);
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
									message.error('Failed to upload avatar');
								}
								return false;
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
									<div style={{ marginTop: 8 }}>Upload</div>
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
	);

	const storageContent = storage && (
		<div className="storage-container">
			<Card className="storage-card">
				<div className="storage-header">
					<svg
						width="64"
						height="64"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						className="storage-icon"
					>
						<rect x="2" y="2" width="20" height="8" rx="1" ry="1" />
						<rect
							x="2"
							y="14"
							width="20"
							height="8"
							rx="1"
							ry="1"
						/>
						<line x1="6" y1="6" x2="6" y2="6.01" />
						<line x1="6" y1="18" x2="6" y2="18.01" />
					</svg>
					<div className="storage-info">
						<h2>Storage ({storage.percentage}% full)</h2>
						<div className="progress-bar">
							<div
								className="progress-fill"
								style={{ width: `${storage.percentage}%` }}
							/>
						</div>
						<div className="storage-details">
							<div>
								<span className="label">Used</span>
								<span className="value">
									{formatBytes(storage.used)}
								</span>
							</div>
							<div>
								<span className="label">Available</span>
								<span className="value">
									{formatBytes(storage.available)}
								</span>
							</div>
							<div>
								<span className="label">Total</span>
								<span className="value">
									{formatBytes(storage.totalLimit)}
								</span>
							</div>
						</div>
					</div>
				</div>
			</Card>

			<Card className="breakdown-card">
				<h3>Storage Breakdown</h3>
				<div className="breakdown-bar">
					<div
						className="base-fill"
						style={{
							width: `${(storage.baseLimit / storage.totalLimit) * 100}%`,
						}}
					/>
					{storage.bonusLimit > 0 && (
						<div
							className="bonus-fill"
							style={{
								width: `${(storage.bonusLimit / storage.totalLimit) * 100}%`,
							}}
						/>
					)}
				</div>
				<div className="breakdown-legend">
					<div className="legend-item">
						<span
							className="legend-color"
							style={{ backgroundColor: '#2563eb' }}
						/>
						<span>Base Storage</span>
						<span className="legend-value">
							{formatBytes(storage.baseLimit)}
						</span>
					</div>
					{storage.bonusLimit > 0 && (
						<div className="legend-item">
							<span
								className="legend-color"
								style={{ backgroundColor: '#10b981' }}
							/>
							<span>Bonus Storage</span>
							<span className="legend-value">
								{formatBytes(storage.bonusLimit)}
							</span>
						</div>
					)}
				</div>
			</Card>

			<Card className="plans-card">
				<h2>Get More Storage</h2>
				<p className="plans-subtitle">
					Choose a plan that fits your needs
				</p>
				<div className="plans-grid">
					{plansLoading ? (
						<div className="loading">Loading plans...</div>
					) : plans.length > 0 ? (
						plans.map((plan) => (
							<StoragePlanCard
								key={plan.id}
								plan={plan}
								onSelect={handleSelectPlan}
								loading={false}
							/>
						))
					) : (
						<div className="no-plans">
							No storage plans available
						</div>
					)}
				</div>
			</Card>
		</div>
	);

	return (
		<Page title="My Profile" isShowTitle={false}>
			<div className="profile-page-container">
				<Tabs
					defaultActiveKey="profile"
					items={[
						{
							key: 'profile',
							label: 'Profile',
							children: profileContent,
						},
						{
							key: 'storage',
							label: 'Storage',
							children: storageLoading ? (
								<div className="flex justify-center p-8">
									<Spin size="large" />
								</div>
							) : (
								storageContent
							),
						},
					]}
				/>
			</div>

			{selectedPlan && (
				<PaymentModal
					open={paymentModalOpen}
					planId={selectedPlan.id}
					planName={selectedPlan.name}
					onClose={() => setPaymentModalOpen(false)}
					onSuccess={handlePaymentSuccess}
				/>
			)}
		</Page>
	);
}
