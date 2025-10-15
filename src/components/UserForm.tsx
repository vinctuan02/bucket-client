"use client";

import { User } from "@/types/type.user";
import { useEffect, useState } from "react";

type Props = {
    initial?: Partial<User> & { roleName?: string };
    onCancel: () => void;
    onSubmit: (data: { name: string; email: string; roleName?: string }) => Promise<void> | void;
    submitLabel?: string;
};

export default function UserForm({ initial = {}, onCancel, onSubmit, submitLabel = "Save" }: Props) {
    const [name, setName] = useState(initial.name ?? "");
    const [email, setEmail] = useState(initial.email ?? "");
    const [roleName, setRoleName] = useState(initial.roleName ?? "");
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState<{ name?: string; email?: string }>({});

    useEffect(() => {
        setName(initial.name ?? "");
        setEmail(initial.email ?? "");
        setRoleName(initial.roleName ?? "");
    }, [initial]);

    function validate() {
        const e: typeof errors = {};
        if (!name.trim()) e.name = "Name is required";
        if (!email.trim()) e.email = "Email is required";
        else if (!/^\S+@\S+\.\S+$/.test(email)) e.email = "Invalid email format";
        setErrors(e);
        return Object.keys(e).length === 0;
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!validate()) return;
        setSubmitting(true);
        try {
            await onSubmit({
                name: name.trim(),
                email: email.trim(),
                roleName: roleName.trim() || undefined,
            });
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4 p-4">
            {/* Name */}
            <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`w-full mt-1 p-2 border rounded ${errors.name ? "border-red-500" : "border-gray-300"
                        }`}
                    placeholder="Full name"
                    disabled={submitting}
                />
                {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full mt-1 p-2 border rounded ${errors.email ? "border-red-500" : "border-gray-300"
                        }`}
                    placeholder="email@example.com"
                    disabled={submitting}
                />
                {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
            </div>

            {/* Role */}
            <div>
                <label className="block text-sm font-medium text-gray-700">Role</label>
                <input
                    value={roleName}
                    onChange={(e) => setRoleName(e.target.value)}
                    className="w-full mt-1 p-2 border rounded border-gray-300"
                    placeholder="e.g. admin, user"
                    disabled={submitting}
                />
            </div>

            {/* Buttons */}
            <div className="flex gap-2 pt-2">
                <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-60"
                >
                    {submitting ? "Saving..." : submitLabel}
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={submitting}
                    className="px-4 py-2 rounded border border-gray-300"
                >
                    Cancel
                </button>
            </div>
        </form>
    );
}
