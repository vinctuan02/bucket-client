import { useStorageInfo } from '@/modules/commons/hooks/useStorageInfo';
import styles from './c.storage-display.module.scss';

export default function StorageDisplay() {
    const { storage, loading } = useStorageInfo();

    if (loading || !storage) {
        return null;
    }

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    };

    return (
        <div className={styles.storageContainer}>
            <div className={styles.header}>
                <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                >
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                </svg>
                <span className={styles.title}>Storage</span>
                <span className={styles.percentage}>{storage.percentage}% full</span>
            </div>

            <div className={styles.progressBar}>
                <div
                    className={styles.progressFill}
                    style={{ width: `${storage.percentage}%` }}
                />
            </div>

            <div className={styles.info}>
                <span className={styles.used}>
                    {formatBytes(storage.used)} of {formatBytes(storage.totalLimit)} used
                </span>
            </div>

            <button className={styles.upgradeButton}>Get more storage</button>
        </div>
    );
}
