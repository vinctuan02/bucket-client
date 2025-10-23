"use client";

import { useState } from "react";

interface PermissionModalProps {
    onClose: () => void;
    onSave: (data: { action: string; resource: string }) => void;
    initialData?: { action: string; resource: string };
}

export default function PermissionModal({ onClose, onSave, initialData }: PermissionModalProps) {
    const [action, setAction] = useState(initialData?.action ?? "");
    const [resource, setResource] = useState(initialData?.resource ?? "");

    const handleSubmit = () => {
        if (!action.trim() || !resource.trim()) {
            alert("Please fill in all fields");
            return;
        }
        onSave({ action, resource });
    };

    return (
        <div className="modal-overlay">
            <div className="modal">
                <h2>{initialData ? "Edit Permission" : "Create Permission"}</h2>

                <div className="modal-body">
                    <label>Action</label>
                    <input
                        type="text"
                        value={action}
                        onChange={(e) => setAction(e.target.value)}
                        placeholder="e.g. create, read, update..."
                    />

                    <label>Resource</label>
                    <input
                        type="text"
                        value={resource}
                        onChange={(e) => setResource(e.target.value)}
                        placeholder="e.g. users, roles, settings..."
                    />
                </div>

                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={onClose}>
                        Cancel
                    </button>
                    <button className="btn btn-primary" onClick={handleSubmit}>
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
}
