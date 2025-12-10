'use client';

import { authApi } from '@/modules/auth/auth.api';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import '../login/login.scss';

function VerifyEmailContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const userId = searchParams.get('userId');

	const [code, setCode] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');

	useEffect(() => {
		if (!userId) {
			router.push('/login');
		}
	}, [userId, router]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError('');
		setSuccess('');
		setLoading(true);

		try {
			await authApi.verifyEmail({
				userId: userId!,
				code,
			});

			setSuccess('Email verified successfully! Redirecting to login...');
			setTimeout(() => {
				router.push('/login');
			}, 2000);
		} catch (err: any) {
			setError(err.message || 'Verification failed');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="login-page">
			<div className="card">
				<h1>Verify Email</h1>
				<p
					style={{
						textAlign: 'center',
						color: '#6b7280',
						marginBottom: '1.5rem',
					}}
				>
					Enter the verification code sent to your email
				</p>

				<form onSubmit={handleSubmit}>
					<div className="form-group">
						<label>Verification Code</label>
						<input
							type="text"
							value={code}
							onChange={(e) => setCode(e.target.value)}
							required
							placeholder="000000"
							maxLength={6}
						/>
					</div>

					{error && <p className="error">{error}</p>}
					{success && (
						<p
							style={{
								color: '#10b981',
								fontSize: '0.875rem',
								marginBottom: '1rem',
							}}
						>
							{success}
						</p>
					)}

					<button type="submit" disabled={loading}>
						{loading ? 'Verifying...' : 'Verify'}
					</button>
				</form>
			</div>
		</div>
	);
}

export default function VerifyEmailPage() {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<VerifyEmailContent />
		</Suspense>
	);
}
