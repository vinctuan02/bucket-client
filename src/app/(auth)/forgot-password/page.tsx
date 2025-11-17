'use client';

import PasswordInput from '@/components/commons/c.password-input';
import { authApi } from '@/modules/auth/auth.api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import '../login/login.scss';

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [step, setStep] = useState<'email' | 'code' | 'password'>('email');
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [userId, setUserId] = useState('');
    const [resetToken, setResetToken] = useState('');

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const res = await authApi.forgotPassword({ email });
            setUserId(res.data?.userId);
            setSuccess('Reset code sent to your email');
            setStep('code');
        } catch (err: any) {
            setError(err.message || 'Failed to send reset code');
        } finally {
            setLoading(false);
        }
    };

    const handleCodeSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const res = await authApi.verifyResetCode({
                userId,
                code,
            });

            const token = res.data?.token;
            setResetToken(token || '');
            setSuccess('Code verified! Now set your new password');
            setStep('password');
        } catch (err: any) {
            setError(err.message || 'Invalid verification code');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            await authApi.resetPassword({
                token: resetToken,
                newPassword,
            });

            setSuccess('Password reset successfully! Redirecting to login...');
            setTimeout(() => {
                router.push('/login');
            }, 2000);
        } catch (err: any) {
            setError(err.message || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="card">
                <h1>Reset Password</h1>

                {step === 'email' && (
                    <form onSubmit={handleEmailSubmit}>
                        <p style={{ textAlign: 'center', color: '#6b7280', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                            Enter your email address and we'll send you a code to reset your password
                        </p>

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

                        {error && <p className="error">{error}</p>}
                        {success && <p style={{ color: '#10b981', fontSize: '0.875rem', marginBottom: '1rem' }}>{success}</p>}

                        <button type="submit" disabled={loading}>
                            {loading ? 'Sending...' : 'Send Reset Code'}
                        </button>
                    </form>
                )}

                {step === 'code' && (
                    <form onSubmit={handleCodeSubmit}>
                        <p style={{ textAlign: 'center', color: '#6b7280', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                            Enter the verification code sent to your email
                        </p>

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
                        {success && <p style={{ color: '#10b981', fontSize: '0.875rem', marginBottom: '1rem' }}>{success}</p>}

                        <button type="submit" disabled={loading}>
                            {loading ? 'Verifying...' : 'Verify Code'}
                        </button>
                    </form>
                )}

                {step === 'password' && (
                    <form onSubmit={handlePasswordSubmit}>
                        <p style={{ textAlign: 'center', color: '#6b7280', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                            Enter your new password
                        </p>

                        <div className="form-group">
                            <label>New Password</label>
                            <PasswordInput
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                name="newPassword"
                            />
                        </div>

                        <div className="form-group">
                            <label>Confirm Password</label>
                            <PasswordInput
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                name="confirmPassword"
                            />
                        </div>

                        {error && <p className="error">{error}</p>}
                        {success && <p style={{ color: '#10b981', fontSize: '0.875rem', marginBottom: '1rem' }}>{success}</p>}

                        <button type="submit" disabled={loading}>
                            {loading ? 'Resetting...' : 'Reset Password'}
                        </button>
                    </form>
                )}

                <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem', color: '#6b7280' }}>
                    <Link href="/login" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: '500' }}>
                        Back to login
                    </Link>
                </div>
            </div>
        </div>
    );
}