'use client';

import { Button } from 'antd';
import { Check } from 'lucide-react';
import { PlanResponseDto } from '../subscription.dto';
import styles from './storage-plan-card.module.scss';

interface StoragePlanCardProps {
    plan: PlanResponseDto;
    onSelect: (plan: PlanResponseDto) => void;
    loading?: boolean;
}

export default function StoragePlanCard({
    plan,
    onSelect,
    loading,
}: StoragePlanCardProps) {
    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return (
            Math.round((bytes / Math.pow(k, i)) * 100) / 100 +
            ' ' +
            sizes[i]
        );
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 0,
        }).format(price);
    };

    return (
        <div className={styles.card}>
            <h3 className={styles.name}>{plan.name}</h3>

            <div className={styles.priceSection}>
                <span className={styles.priceValue}>
                    {formatPrice(plan.price)}
                </span>
                <span className={styles.priceUnit}>/mo.</span>
            </div>

            {plan.description && (
                <p className={styles.description}>{plan.description}</p>
            )}

            <Button
                type="primary"
                block
                size="large"
                onClick={() => onSelect(plan)}
                loading={loading}
                className={styles.button}
            >
                Choose Plan
            </Button>

            <div className={styles.features}>
                <div className={styles.featuresTitle}>What's included:</div>
                <ul className={styles.featuresList}>
                    <li>
                        <Check size={16} />
                        <span>{formatBytes(plan.storageLimit)} Storage</span>
                    </li>
                    <li>
                        <Check size={16} />
                        <span>{plan.durationDays} days validity</span>
                    </li>
                </ul>
            </div>
        </div>
    );
}
