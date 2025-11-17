'use client';

import { useStorageInfo } from '@/modules/commons/hooks/useStorageInfo';
import styles from './storage.module.scss';

export default function StoragePage() {
    const { storage, loading } = useStorageInfo();

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    };

    if (loading) {
        return <div className={styles.container}>Loading...</div>;
    }

    if (!storage) {
        return <div className={styles.container}>Failed to load storage info</div>;
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Storage</h1>
                <p>Manage your storage space</p>
            </div>

            <div className={styles.mainCard}>
                <div className={styles.storageIcon}>
                    <svg
                        width="64"
                        height="64"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                    >
                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
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
                            <span className={styles.value}>{formatBytes(storage.used)}</span>
                        </div>
                        <div className={styles.detail}>
                            <span className={styles.label}>Available</span>
                            <span className={styles.value}>{formatBytes(storage.available)}</span>
                        </div>
                        <div className={styles.detail}>
                            <span className={styles.label}>Total</span>
                            <span className={styles.value}>{formatBytes(storage.totalLimit)}</span>
                        </div>
                    </div>

                    <button className={styles.upgradeButton}>Get more storage</button>
                </div>
            </div>

            <div className={styles.breakdownCard}>
                <h3>Storage Breakdown</h3>

                <div className={styles.breakdownItem}>
                    <div className={styles.breakdownLabel}>
                        <span className={styles.label}>Base Storage</span>
                        <span className={styles.value}>{formatBytes(storage.baseLimit)}</span>
                    </div>
                    <div className={styles.breakdownBar}>
                        <div
                            className={styles.breakdownFill}
                            style={{
                                width: `${(storage.baseLimit / storage.totalLimit) * 100}%`,
                                backgroundColor: '#2563eb',
                            }}
                        />
                    </div>
                </div>

                {storage.bonusLimit > 0 && (
                    <div className={styles.breakdownItem}>
                        <div className={styles.breakdownLabel}>
                            <span className={styles.label}>Bonus Storage</span>
                            <span className={styles.value}>{formatBytes(storage.bonusLimit)}</span>
                        </div>
                        <div className={styles.breakdownBar}>
                            <div
                                className={styles.breakdownFill}
                                style={{
                                    width: `${(storage.bonusLimit / storage.totalLimit) * 100}%`,
                                    backgroundColor: '#10b981',
                                }}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
