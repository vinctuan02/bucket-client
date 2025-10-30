"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Page from "@/components/pages/c.page";
import { authApi } from "@/modules/auth/auth.api";
import "./my-profile.scss";

interface UserProfile {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    provider?: string;
}

export default function ProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchProfile = async () => {
        try {
            const res = await authApi.me();
            setUser(res.data?.data);
        } catch (err) {
            console.error("Error fetching profile:", err);
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            router.replace("/login");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem("access_token");
        if (!token) {
            router.replace("/login");
            return;
        }

        fetchProfile();
    }, [router]);

    if (loading) {
        return (
            <Page title="My Profile">
                <div className="profile-loading">Loading profile...</div>
            </Page>
        );
    }

    if (!user) {
        return (
            <Page title="My Profile">
                <div className="profile-error">Failed to load user information.</div>
            </Page>
        );
    }

    return (
        <Page title="My Profile" isShowTitle={false}>
            <div className="profile-page">
                <div className="card">
                    <div className="avatar">
                        <img
                            src={user.avatar || "/images/default-avatar.png"}
                            alt="Avatar"
                        />
                    </div>

                    <h2 className="name">{user.name}</h2>
                    <p className="email">{user.email}</p>

                    {user.provider && (
                        <p className="provider">Signed in with {user.provider}</p>
                    )}

                    <button
                        className="logout-btn"
                        onClick={() => {
                            localStorage.removeItem("access_token");
                            localStorage.removeItem("refresh_token");
                            router.replace("/login");
                        }}
                    >
                        Logout
                    </button>
                </div>
            </div>
        </Page>
    );
}
