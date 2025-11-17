'use client';

import PasswordInput from '@/components/commons/c.password-input';
import { authApi } from '@/modules/auth/auth.api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import '../login/login.scss';

export default function RegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (token) {
            router.replace('/');
        } else {
            setIsChecking(false);
        }
    }, [router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        try {
            const res = await authApi.register({
                name: formData.name,
                email: formData.email,
                password: formData.password,
            });

            setSuccess('Registration successful! Please check your email to verify your account.');
            const userId = res.data?.id;
            setFormData({ name: '', email: '', password: '', confirmPassword: '' });

            setTimeout(() => {
                router.push(`/verify-email?userId=${userId}`);
            }, 2000);
        } catch (err: any) {
            setError(err.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    if (isChecking) {
        return null;
    }

    return (
        <div className="login-page">
            <div className="card">
                <h1>Create Account</h1>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Full Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            placeholder="John Doe"
                        />
                    </div>

                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            placeholder="you@example.com"
                        />
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <PasswordInput
                            value={formData.password}
                            onChange={(e) => handleChange({ ...e, target: { ...e.target, name: 'password' } } as any)}
                            required
                            name="password"
                        />
                    </div>

                    <div className="form-group">
                        <label>Confirm Password</label>
                        <PasswordInput
                            value={formData.confirmPassword}
                            onChange={(e) => handleChange({ ...e, target: { ...e.target, name: 'confirmPassword' } } as any)}
                            required
                            name="confirmPassword"
                        />
                    </div>

                    {error && <p className="error">{error}</p>}
                    {success && <p style={{ color: '#10b981', fontSize: '0.875rem', marginBottom: '1rem' }}>{success}</p>}

                    <button type="submit" disabled={loading}>
                        {loading ? 'Creating account...' : 'Sign up'}
                    </button>
                </form>

                <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem', color: '#6b7280' }}>
                    Already have an account?{' '}
                    <Link href="/login" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: '500' }}>
                        Sign in
                    </Link>
                </div>
            </div>
        </div>
    );
}