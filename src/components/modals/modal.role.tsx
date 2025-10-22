"use client";

import { useState } from "react";
import "./UserModal.scss";

interface RoleModalProps {
    onClose: () => void;
    onSave: (role: { name: string; description: string }) => void;
}

export default function RoleModal({ onClose, onSave }: RoleModalProps) {
    const [form, setForm] = useState({
        name: "",
        description: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = () => {
        const { name, description } = form;

        if (!name.trim()) {
            alert("Please enter role name.");
            return;
        }

        onSave({ name, description });
    };

    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) onClose();
    };

    return (
        <div className="modal-overlay" onClick={handleOverlayClick}>
            <div className="modal">
                <h2 className="modal__title">Create Role</h2>

                <div className="form-row">
                    <div className="form-group">
                        <label>Role Name</label>
                        <input
                            name="name"
                            type="text"
                            value={form.name}
                            onChange={handleChange}
                            placeholder="Enter role name"
                        />
                    </div>
                    <div className="form-group">
                        <label>Description</label>
                        <input
                            name="description"
                            type="text"
                            value={form.description}
                            onChange={handleChange}
                            placeholder="Enter description"
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
