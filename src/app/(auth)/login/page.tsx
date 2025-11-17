'use client';

import PasswordInput from '@/components/commons/c.password-input';
import { authApi } from '@/modules/auth/auth.api';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import './login.scss';

export default function LoginPage() {
	const router = useRouter();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [isChecking, setIsChecking] = useState(true);

	// Handle Google OAuth callback
	useEffect(() => {
		const url = new URL(window.location.href);
		const token = url.searchParams.get('accessToken');

		if (token) {
			localStorage.setItem('access_token', token);
			window.history.replaceState({}, '', '/');
			router.replace('/');
		}
	}, [router]);

	// Check if already logged in
	useEffect(() => {
		const token = localStorage.getItem('access_token');
		if (token) {
			router.replace('/');
		} else {
			setIsChecking(false);
		}
	}, [router]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError('');
		setLoading(true);

		try {
			const res = await authApi.login({ email, password });
			const { accessToken, refreshToken } = res.data!;

			localStorage.setItem('access_token', accessToken);
			if (refreshToken) {
				localStorage.setItem('refresh_token', refreshToken);
			}

			router.push('/');
		} catch (err: any) {
			setError(err.message || 'Login failed');
		} finally {
			setLoading(false);
		}
	};

	const handleGoogleLogin = () => {
		authApi.googleLogin();
	};

	if (isChecking) {
		return null;
	}

	return (
		<div className="login-page">
			<div className="card">
				<h1>Login</h1>

				<form onSubmit={handleSubmit}>
					<div className="form-group">
						<label>Email</label>
						<input
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
							placeholder="you@example.com"
						/>
					</div>

					<div className="form-group">
						<label>Password</label>
						<PasswordInput
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
							name="password"
						/>
					</div>

					{error && <p className="error">{error}</p>}

					<button type="submit" disabled={loading}>
						{loading ? 'Signing in...' : 'Sign in'}
					</button>
				</form>

				<div style={{ marginTop: '1rem', textAlign: 'right', fontSize: '0.875rem' }}>
					<a href="/forgot-password" style={{ color: '#2563eb', textDecoration: 'none' }}>
						Forgot password?
					</a>
				</div>

				<div className="divider">or</div>

				<div className="social-login">
					<button onClick={handleGoogleLogin}>
						<img src="/logo.google.png" alt="Google" />
						Sign in with Google
					</button>
				</div>

				<div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem', color: '#6b7280' }}>
					Don't have an account?{' '}
					<a href="/register" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: '500' }}>
						Sign up
					</a>
				</div>
			</div>
		</div>
	);
}
