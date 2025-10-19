"use client";

import { useState } from "react";

interface Props {
    initial?: any;
    onCancel: () => void;
    onSubmit: (data: { name: string; email: string; roleName?: string }) => void;
    submitLabel: string;
}

export default function UserForm({ initial = {}, onCancel, onSubmit, submitLabel }: Props) {
    const [form, setForm] = useState({
        name: initial.name || "",
        email: initial.email || "",
        roleName: initial.roleName || "",
    });

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        onSubmit(form);
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-3">
            <div>
                <label className="block text-sm font-medium">Name</label>
                <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full border rounded px-2 py-1"
                />
            </div>
            <div>
                <label className="block text-sm font-medium">Email</label>
                <input
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full border rounded px-2 py-1"
                />
            </div>
            <div>
                <label className="block text-sm font-medium">Role</label>
                <input
                    name="roleName"
                    value={form.roleName}
                    onChange={handleChange}
                    className="w-full border rounded px-2 py-1"
                />
            </div>

            <div className="flex justify-end gap-2 mt-4">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    {submitLabel}
                </button>
            </div>
        </form>
    );
}
