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
import { UploadOutlined } from '@ant-design/icons';
import {
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
	const [isEditing, setIsEditing] = useState(true);
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
			const res = await planApi.getListSimple();
			setPlans(res || []);
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
		<Card title="Profile Information">
			{/* <div className="profile-header">
				<div className="profile-info">
					<div className="avatar-section">
						<Avatar
							size={80}
							src={user.avatar}
							icon={<UserOutlined />}
						/>
						<div className="user-details">
							<h2 className="user-name">{user.name}</h2>
							<p className="user-email">{user.email}</p>
							{user.provider && (
								<p className="user-provider">
									Signed in with {user.provider}
								</p>
							)}
						</div>
					</div>
				</div>
			</div> */}

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
								const res = await userApi.getAvatarUploadUrl({
									fileName: file.name,
									fileSize: file.size,
									contentType: file.type || 'image/jpeg',
								});

								const uploadUrl = res.data?.uploadUrl;
								const avatarUrl = res.data?.avatarUrl;

								if (!uploadUrl || !avatarUrl) {
									throw new Error('Failed to get upload URL');
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
								message.success('Avatar uploaded successfully');
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
					<div className="profile-actions">
						<Button
							type="primary"
							htmlType="submit"
							loading={updating}
						>
							Save
						</Button>
						<Button
							onClick={() => {
								form.setFieldsValue({
									name: user.name,
									avatar: user.avatar,
									trashRetentionDays: user.trashRetentionDays,
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
								message.info('Changes cancelled');
							}}
						>
							Cancel
						</Button>
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
				</Form.Item>
			</Form>
		</Card>
	);

	const storageContent = storage && (
		<div className="storage-container">
			<Card className="storage-overview-card">
				<div className="storage-overview">
					<div className="storage-header">
						<h2>Storage Usage</h2>
						<span className="storage-percentage">
							{storage.percentage}% used
						</span>
					</div>

					<div className="progress-bar">
						<div
							className="progress-fill"
							style={{ width: `${storage.percentage}%` }}
						/>
					</div>

					<div className="storage-summary">
						<span className="storage-text">
							{formatBytes(storage.used)} of{' '}
							{formatBytes(storage.totalLimit)} used
						</span>
						<span className="storage-available">
							{formatBytes(storage.available)} available
						</span>
					</div>

					{storage.bonusLimit > 0 && (
						<div className="storage-breakdown">
							<div className="breakdown-item">
								<span className="breakdown-dot base"></span>
								<span>
									Base: {formatBytes(storage.baseLimit)}
								</span>
							</div>
							<div className="breakdown-item">
								<span className="breakdown-dot bonus"></span>
								<span>
									Bonus: {formatBytes(storage.bonusLimit)}
								</span>
							</div>
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
