import { storageApi, StorageInfo } from '@/modules/storage/storage.api';
import { useEffect, useState } from 'react';

export const useStorageInfo = () => {
	const [storage, setStorage] = useState<StorageInfo | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchStorage = async () => {
		try {
			setLoading(true);
			setError(null);
			const res = await storageApi.getMyStorage();
			setStorage(res.data || null);
		} catch (err: any) {
			setError(err.message || 'Failed to fetch storage info');
			console.error('Failed to fetch storage info:', err);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchStorage();
	}, []);

	return { storage, loading, error, refetch: fetchStorage };
};
