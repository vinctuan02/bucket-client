"use client";

import { useEffect, useState } from "react";
import "./modal.scss";
import { User, UserRole, Role } from "@/types/type.user";
import TableSelect from "../table-selector/c.table-selector";
import { rolesApi } from "@/modules/roles/role.api";
import { GetListRoleDto } from "@/modules/roles/role.dto";
import { RoleFieldMapping } from "@/modules/roles/role.enum";
import { PAGINATION_DEFAULT } from "@/modules/commons/const/common.constant";
import { rolesConifgsColumnTable } from "@/modules/roles/role.constant";
import Page from "../pages/c.page";

interface UserModalProps {
  initialData?: Partial<User>;
  onClose: () => void;
  onSave: (user: {
    id?: string;
    name: string;
    email: string;
    password?: string;
    userRoles: UserRole[];
  }) => void;
}

export default function UserModal({ initialData, onClose, onSave }: UserModalProps) {
  const [form, setForm] = useState<Partial<User>>({ name: "", email: "", password: "" });
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);
  const [pagination, setPagination] = useState(PAGINATION_DEFAULT);

  const [roleQuery, setRoleQuery] = useState<GetListRoleDto>(
    new GetListRoleDto({ fieldOrder: RoleFieldMapping.NAME })
  );

  // ===== FETCH ROLES =====
  const fetchRoles = async (params?: GetListRoleDto) => {
    try {
      const { data } = await rolesApi.getList(params);
      setRoles(data?.items ?? []);
      if (data?.metadata) {
        setPagination({
          currentPage: data.metadata.currentPage,
          totalPages: data.metadata.totalPages,
          totalItems: data.metadata.totalItems,
          itemsPerPage: data.metadata.pageSize,
        });
      }
    } catch (err) {
      console.error("Error fetching roles:", err);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => fetchRoles(roleQuery), 250);
    return () => clearTimeout(delayDebounce);
  }, [roleQuery.keywords, roleQuery.page, roleQuery.pageSize, roleQuery.orderBy, roleQuery.fieldOrder]);

  // ===== INITIAL DATA =====
  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name ?? "",
        email: initialData.email ?? "",
        password: "", // để trống khi edit
      });
      setSelectedRoleIds(initialData.userRoles?.map((ur) => ur.roleId) ?? []);
    } else {
      setForm({ name: "", email: "", password: "" });
      setSelectedRoleIds([]);
    }
  }, [initialData]);

  // ===== HANDLERS =====
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = (value: string) => setRoleQuery((prev) => new GetListRoleDto({ ...prev, keywords: value }));
  const handlePageChange = (page: number) => setRoleQuery((prev) => new GetListRoleDto({ ...prev, page }));

  const handleSubmit = () => {
    const { name, email, password } = form;

    if (!name?.trim() || !email?.trim()) {
      alert("Please fill in required fields (Name, Email).");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      alert("Invalid email format.");
      return;
    }

    // Nếu tạo mới, password bắt buộc
    if (!initialData?.id && (!password || password.length < 6)) {
      alert("Password is required and must be at least 6 characters for new users.");
      return;
    }

    // Nếu edit và muốn đổi password, phải >=6 ký tự
    if (initialData?.id && password && password.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }

    const userRoles: UserRole[] = selectedRoleIds.map((roleId) => ({
      id: "",
      userId: initialData?.id ?? "",
      roleId,
      createdAt: "",
      updatedAt: "",
      creatorId: "",
      modifierId: "",
    }));

    onSave({
      id: initialData?.id,
      name,
      email,
      ...(password ? { password } : {}),
      userRoles,
    });
  };


  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal">
        <h2 className="modal__title">{initialData?.id ? "Edit User" : "Create User"}</h2>

        <div className="form-row">
          <div className="form-group">
            <label>Name</label>
            <input name="name" type="text" value={form.name ?? ""} onChange={handleChange} placeholder="Enter name" />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input name="email" type="email" value={form.email ?? ""} onChange={handleChange} placeholder="Enter email" />
          </div>

          <div className="form-group">
            <label>{initialData?.id ? "Change Password (optional)" : "Password"}</label>
            <input
              name="password"
              type="password"
              value={form.password ?? ""}
              onChange={handleChange}
              placeholder={initialData?.id ? "Enter new password" : "Enter password"}
            />
          </div>

        </div>

        <Page title="Roles" isShowTitle={true}>
          <TableSelect
            data={roles}
            columns={rolesConifgsColumnTable}
            selectedKeys={selectedRoleIds}
            onSelectChange={setSelectedRoleIds}
            onSearch={handleSearch}
            pagination={pagination}
            onPageChange={handlePageChange}
          />
        </Page>

        <div className="modal__actions">
          <button className="btn btn-cancel" onClick={onClose}>Cancel</button>
          <button className="btn btn-blue" onClick={handleSubmit}>Save</button>
        </div>
      </div>
    </div>
  );
}
