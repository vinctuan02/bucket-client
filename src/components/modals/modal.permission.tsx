"use client";

import { useState } from "react";
import "./modal.scss";
import "./modal.permission.scss"
import { PermissionAction } from "@/enums/enum";

interface PermissionModalProps {
    onClose: () => void;
    onSave: (data: {
        name: string;
        description: string;
        action: string;
        resource: string;
    }) => void;
    initialData?: {
        name: string;
        description: string;
        action: string;
        resource: string;
    };
}

export default function PermissionModal({ onClose, onSave, initialData }: PermissionModalProps) {
    const [form, setForm] = useState({
        name: initialData?.name ?? "",
        description: initialData?.description ?? "",
        action: initialData?.action ?? "",
        resource: initialData?.resource ?? "",
    });

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = () => {
        const { name, description, action, resource } = form;

        if (!name.trim() || !action.trim() || !resource.trim()) {
            alert("Please fill in all required fields.");
            return;
        }

        onSave({ name, description, action, resource });
    };

    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) onClose();
    };

    return (
        <div className="modal-overlay" onClick={handleOverlayClick}>
            <div className="modal">
                <h2 className="modal__title">
                    {initialData ? "Edit Permission" : "Create Permission"}
                </h2>

                {/* First Row: Name + Resource */}
                <div className="form-row">
                    <div className="form-group">
                        <label>Name</label>
                        <input
                            name="name"
                            type="text"
                            value={form.name}
                            onChange={handleChange}
                            placeholder="Enter permission name"
                        />
                    </div>

                    <div className="form-group">
                        <label>Resource</label>
                        <input
                            name="resource"
                            type="text"
                            value={form.resource}
                            onChange={handleChange}
                            placeholder="e.g. user, role, order..."
                        />
                    </div>
                </div>

                {/* Second Row: Action + Description */}
                <div className="form-row">
                    <div className="form-group">
                        <label>Action</label>
                        <select
                            name="action"
                            value={form.action}
                            onChange={handleChange}
                        >
                            <option value="">Select action</option>
                            {Object.values(PermissionAction).map((action) => (
                                <option key={action} value={action}>
                                    {action.charAt(0).toUpperCase() + action.slice(1)}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <input
                            name="description"
                            type="text"
                            value={form.description}
                            onChange={handleChange}
                            placeholder="Enter description (optional)"
                        />
                    </div>
                </div>

                <div className="modal__actions">
                    <button className="btn btn-cancel" onClick={onClose}>
                        Cancel
                    </button>
                    <button className="btn btn-blue" onClick={handleSubmit}>
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
}
