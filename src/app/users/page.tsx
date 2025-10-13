"use client";

import { useEffect, useState } from "react";
import { userApi } from "@/lib/users.api";
import { User } from "@/types/type.user";

export default function UserPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await userApi.getList();
                setUsers(res.data?.data?.items || []);
            } catch (err: any) {
                setError(err.message || "Failed to load users");
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    if (loading)
        return <div className="p-4 text-gray-600">Loading...</div>;

    if (error)
        return (
            <div className="p-4 text-red-500">
                ⚠️ Error: {error}
            </div>
        );

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">User List</h1>
            <table className="min-w-full border border-gray-300 rounded-md overflow-hidden shadow-sm">
                <thead>
                    <tr className="bg-gray-100 text-left">
                        <th className="border px-4 py-2">ID</th>
                        <th className="border px-4 py-2">Name</th>
                        <th className="border px-4 py-2">Email</th>
                    </tr>
                </thead>
                <tbody>
                    {users.length === 0 ? (
                        <tr>
                            <td
                                colSpan={3}
                                className="text-center text-gray-500 py-4"
                            >
                                No users found
                            </td>
                        </tr>
                    ) : (
                        users.map((u) => (
                            <tr key={u.id} className="hover:bg-gray-50">
                                <td className="border px-4 py-2">{u.id}</td>
                                <td className="border px-4 py-2">{u.name}</td>
                                <td className="border px-4 py-2">{u.email}</td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}
