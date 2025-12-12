'use client';

import { dashboardApiService } from '@/services/dashboard-api.service';
import { useState } from 'react';

export default function DebugPanel() {
	const [debugData, setDebugData] = useState<any>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const testAPI = async () => {
		setLoading(true);
		setError(null);
		try {
			const data = await dashboardApiService.getDebugCounts();
			setDebugData(data);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Unknown error');
		} finally {
			setLoading(false);
		}
	};

	const testSimple = async () => {
		setLoading(true);
		setError(null);
		try {
			const response = await fetch(
				'http://localhost:3001/api/dashboard/test',
			);
			if (!response.ok) {
				throw new Error(
					`HTTP ${response.status}: ${response.statusText}`,
				);
			}
			const data = await response.json();
			setDebugData(data);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Unknown error');
		} finally {
			setLoading(false);
		}
	};

	const testDashboard = async () => {
		setLoading(true);
		setError(null);
		try {
			const data = await dashboardApiService.getDashboardData();
			setDebugData(data);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Unknown error');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div
			style={{
				position: 'fixed',
				top: '10px',
				right: '10px',
				background: 'white',
				border: '1px solid #ccc',
				padding: '10px',
				borderRadius: '5px',
				zIndex: 9999,
				maxWidth: '300px',
			}}
		>
			<h4>Debug Panel</h4>
			<div style={{ marginBottom: '10px' }}>
				<button
					onClick={testSimple}
					disabled={loading}
					style={{ marginRight: '5px', fontSize: '10px' }}
				>
					Test Simple
				</button>
				<button
					onClick={testAPI}
					disabled={loading}
					style={{ marginRight: '5px', fontSize: '10px' }}
				>
					Test Debug
				</button>
				<button
					onClick={testDashboard}
					disabled={loading}
					style={{ fontSize: '10px' }}
				>
					Test Dashboard
				</button>
			</div>

			{loading && <p>Loading...</p>}
			{error && <p style={{ color: 'red' }}>Error: {error}</p>}
			{debugData && (
				<div>
					<h5>Response:</h5>
					<pre
						style={{
							fontSize: '10px',
							maxHeight: '200px',
							overflow: 'auto',
							background: '#f5f5f5',
							padding: '5px',
						}}
					>
						{JSON.stringify(debugData, null, 2)}
					</pre>
				</div>
			)}
		</div>
	);
}
