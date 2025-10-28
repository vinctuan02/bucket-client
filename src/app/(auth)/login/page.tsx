"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/modules/auth/auth.api";
import "./login.scss";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await authApi.login({ email, password });
            const { accessToken, refreshToken } = res.data!

            localStorage.setItem("access_token", accessToken);
            if (refreshToken) {
                localStorage.setItem("refresh_token", refreshToken);
            }

            router.push("/users");
        } catch (err: any) {
            setError(err.message || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        authApi.googleLogin();
    };

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
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="••••••••"
                        />
                    </div>

                    {error && <p className="error">{error}</p>}

                    <button type="submit" disabled={loading}>
                        {loading ? "Signing in..." : "Sign in"}
                    </button>
                </form>

                <div className="divider">or</div>

                <div className="social-login">
                    <button onClick={handleGoogleLogin}>
                        <img src="/google-icon.svg" alt="Google" />
                        Sign in with Google
                    </button>
                </div>
            </div>
        </div>
    );
}
