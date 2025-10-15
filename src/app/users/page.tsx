"use client";

import { useEffect, useState } from "react";
import { userApi } from "@/lib/users.api";
import { User } from "@/types/type.user";
import UserForm from "@/components/UserForm";

export default function UserPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    async function fetchUsers() {
        setLoading(true);
        try {
            const res = await userApi.getList();
            setUsers(res.data?.data?.items || []);
        } catch (err: any) {
            setError(err.message || "Failed to load users");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchUsers();
    }, []);

    async function handleSubmit(data: { name: string; email: string; roleName?: string }) {
        try {
            if (editingUser) {
                await userApi.update(editingUser.id, data);
            } else {
                // await userApi.create(data);
            }
            await fetchUsers();
            setShowForm(false);
            setEditingUser(null);
        } catch (err: any) {
            alert(err.message || "Save failed");
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("Delete this user?")) return;
        try {
            // await userApi.delete(id);
            await fetchUsers();
        } catch (err: any) {
            alert(err.message || "Delete failed");
        }
    }

    if (loading) return <div className="p-4 text-gray-600">Loading...</div>;
    if (error) return <div className="p-4 text-red-500">⚠️ {error}</div>;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Users</h1>
                <button
                    onClick={() => {
                        setEditingUser(null);
                        setShowForm(true);
                    }}
                    className="px-4 py-2 rounded bg-blue-600 text-white"
                >
                    + Add User
                </button>
            </div>

            {/* Form modal (simple inline toggle) */}
            {showForm && (
                <div className="border p-4 rounded-md mb-6 bg-gray-50">
                    <UserForm
                        initial={editingUser ?? {}}
                        onCancel={() => {
                            setShowForm(false);
                            setEditingUser(null);
                        }}
                        onSubmit={handleSubmit}
                        submitLabel={editingUser ? "Update" : "Create"}
                    />
                </div>
            )}

            <table className="min-w-full border border-gray-300 rounded-md overflow-hidden shadow-sm">
                <thead>
                    <tr className="bg-gray-100 text-left">
                        <th className="border px-4 py-2">ID</th>
                        <th className="border px-4 py-2">Name</th>
                        <th className="border px-4 py-2">Email</th>
                        <th className="border px-4 py-2 w-32">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.length === 0 ? (
                        <tr>
                            <td colSpan={4} className="text-center text-gray-500 py-4">
                                No users found
                            </td>
                        </tr>
                    ) : (
                        users.map((u) => (
                            <tr key={u.id} className="hover:bg-gray-50">
                                <td className="border px-4 py-2 text-gray-600">{u.id}</td>
                                <td className="border px-4 py-2">{u.name}</td>
                                <td className="border px-4 py-2">{u.email}</td>
                                <td className="border px-4 py-2 space-x-2">
                                    <button
                                        onClick={() => {
                                            setEditingUser(u);
                                            setShowForm(true);
                                        }}
                                        className="text-blue-600 hover:underline"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(u.id)}
                                        className="text-red-600 hover:underline"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}
