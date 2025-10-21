"use client";

import { useState } from "react";
import "./UserModal.scss";

interface UserModalProps {
    onClose: () => void;
    onSave: (user: {
        name: string;
        email: string;
        password: string;
        role: string;
        permissions: string;
    }) => void;
}

export default function UserModal({ onClose, onSave }: UserModalProps) {
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        role: "",
        permissions: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = () => {
        const { name, email, password } = form;

        if (!name.trim() || !email.trim() || !password.trim()) {
            alert("Please fill in all fields.");
            return;
        }

        if (!/\S+@\S+\.\S+/.test(email)) {
            alert("Invalid email format.");
            return;
        }

        if (password.length < 6) {
            alert("Password must be at least 6 characters.");
            return;
        }

        onSave(form);
    };

    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) onClose();
    };

    return (
        <div className="modal-overlay" onClick={handleOverlayClick}>
            <div className="modal">
                <h2 className="modal__title">Create User</h2>

                <div className="form-row">
                    <div className="form-group">
                        <label>Name</label>
                        <input
                            name="name"
                            type="text"
                            value={form.name}
                            onChange={handleChange}
                            placeholder="Enter name"
                        />
                    </div>
                    <div className="form-group">
                        <label>Email</label>
                        <input
                            name="email"
                            type="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="Enter email"
                        />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input
                            name="password"
                            type="password"
                            value={form.password}
                            onChange={handleChange}
                            placeholder="Enter password"
                        />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>Role</label>
                        <input
                            name="role"
                            type="text"
                            value={form.role}
                            onChange={handleChange}
                            placeholder="Enter role"
                        />
                    </div>
                    <div className="form-group">
                        <label>Permissions</label>
                        <input
                            name="permissions"
                            type="text"
                            value={form.permissions}
                            onChange={handleChange}
                            placeholder="Enter permissions"
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
