"use client";

import { useEffect, useState } from "react";
import "./modal.scss";
import { roleDefault } from "@/modules/roles/role.constant";
import { Role } from "@/types/type.user";
import { RolePermission } from "@/modules/roles/role.dto";

interface RoleModalProps {
  initialData: Partial<Role>;
  onClose: () => void;
  onSave: (role: { name: string; description: string; rolePermissions: RolePermission[]; }) => void;
}

export default function RoleModal({ initialData, onClose, onSave }: RoleModalProps) {
  const [form, setForm] = useState<Partial<Role>>(roleDefault);

  useEffect(() => {
    if (initialData) {
      setForm(initialData);
    } else {
      setForm(roleDefault);
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    const { name, description, rolePermissions } = form;

    if (!name?.trim()) {
      alert("Please enter role name.");
      return;
    }

    onSave({ name, description: description || "", rolePermissions: rolePermissions || [] });
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
              value={form?.description ?? ''}
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
