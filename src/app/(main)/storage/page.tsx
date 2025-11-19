'use client';

import StoragePlanCard from '@/modules/subscription/components/storage-plan-card';
import { subscriptionApi } from '@/modules/subscription/subscription.api';
import { PlanResponseDto } from '@/modules/subscription/subscription.dto';
import { useStorageInfo } from '@/modules/commons/hooks/useStorageInfo';
import { message } from 'antd';
import { useEffect, useState } from 'react';
import styles from './storage.module.scss';

export default function StoragePage() {
	const { storage, loading } = useStorageInfo();
	const [plans, setPlans] = useState<PlanResponseDto[]>([]);
	const [plansLoading, setPlansLoading] = useState(false);
	const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

	useEffect(() => {
		fetchPlans();
	}, []);

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

	if (loading) {
		return <div className={styles.container}>Loading...</div>;
	}

	if (!storage) {
		return (
			<div className={styles.container}>Failed to load storage info</div>
		);
	}

	return (
		<div className={styles.container}>
			{/* <div className={styles.header}>
				<p>Manage your storage space</p>
			</div> */}

			<div className={styles.mainCard}>
				<div className={styles.storageIcon}>
					<svg
						width="128"
						height="128"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
					>
						<rect x="2" y="2" width="20" height="8" rx="1" ry="1" />
						<rect x="2" y="14" width="20" height="8" rx="1" ry="1" />
						<line x1="6" y1="6" x2="6" y2="6.01" />
						<line x1="6" y1="18" x2="6" y2="18.01" />
					</svg>
				</div>

				<div className={styles.storageInfo}>
					<h2>Storage ({storage.percentage}% full)</h2>

					<div className={styles.progressBar}>
						<div
							className={styles.progressFill}
							style={{ width: `${storage.percentage}%` }}
						/>
					</div>

					<div className={styles.storageDetails}>
						<div className={styles.detail}>
							<span className={styles.label}>Used</span>
							<span className={styles.value}>
								{formatBytes(storage.used)}
							</span>
						</div>
						<div className={styles.detail}>
							<span className={styles.label}>Available</span>
							<span className={styles.value}>
								{formatBytes(storage.available)}
							</span>
						</div>
						<div className={styles.detail}>
							<span className={styles.label}>Total</span>
							<span className={styles.value}>
								{formatBytes(storage.totalLimit)}
							</span>
						</div>
					</div>
				</div>
			</div>

			<div className={styles.breakdownCard}>
				<h3>Storage Breakdown</h3>

				<div className={styles.breakdownBar}>
					<div
						className={styles.baseStorageFill}
						style={{
							width: `${(storage.baseLimit / storage.totalLimit) * 100}%`,
						}}
						title={`Base Storage: ${formatBytes(storage.baseLimit)}`}
					/>
					{storage.bonusLimit > 0 && (
						<div
							className={styles.bonusStorageFill}
							style={{
								width: `${(storage.bonusLimit / storage.totalLimit) * 100}%`,
							}}
							title={`Bonus Storage: ${formatBytes(storage.bonusLimit)}`}
						/>
					)}
				</div>

				<div className={styles.breakdownLegend}>
					<div className={styles.legendItem}>
						<span className={styles.legendColor} style={{ backgroundColor: '#2563eb' }} />
						<span className={styles.legendLabel}>Base Storage</span>
						<span className={styles.legendValue}>{formatBytes(storage.baseLimit)}</span>
					</div>
					{storage.bonusLimit > 0 && (
						<div className={styles.legendItem}>
							<span className={styles.legendColor} style={{ backgroundColor: '#10b981' }} />
							<span className={styles.legendLabel}>Bonus Storage</span>
							<span className={styles.legendValue}>{formatBytes(storage.bonusLimit)}</span>
						</div>
					)}
				</div>
			</div>

			<div className={styles.plansSection}>
				<div className={styles.plansHeader}>
					<h2 className={styles.plansTitle}>Get More Storage</h2>
					<p className={styles.plansSubtitle}>
						Choose a plan that fits your needs
					</p>
				</div>

				<div className={styles.plansGrid}>
					{plansLoading ? (
						<div className={styles.loading}>Loading plans...</div>
					) : plans.length > 0 ? (
						plans.map((plan) => (
							<StoragePlanCard
								key={plan.id}
								plan={plan}
								onSelect={handleSelectPlan}
								loading={selectedPlanId === plan.id}
							/>
						))
					) : (
						<div className={styles.noPlans}>
							No storage plans available
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
