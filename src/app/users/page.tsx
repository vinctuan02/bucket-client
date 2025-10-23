"use client";

import { useEffect, useState } from "react";
import UserModal from "@/components/modals/modal.user";
import { User } from "@/types/type.user";
import api from "@/lib/constants/api.constant";
import { userApi } from "@/lib/apis/api.users";
import Page from "@/components/pages/c.page";
import Table from "@/components/tables/c.table";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [showModal, setShowModal] = useState(false);

  const fetchUsers = async (search?: string) => {
    try {
      const { data } = await userApi.getList({});
      setUsers(data?.items ?? []);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSave = async (user: {
    name: string;
    email: string;
    password: string;
    role: string;
    permissions: string;
  }) => {
    try {
      await api.post("/users", user);
      fetchUsers();
      setShowModal(false);
    } catch (err) {
      console.error("Error saving user:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this user?")) return;
    try {
      await api.delete(`/users/${id}`);
      fetchUsers();
    } catch (err) {
      console.error("Error deleting user:", err);
    }
  };

  const columns = [
    { label: "Name", field: "name" },
    { label: "Email", field: "email" },
    { label: "Role", field: "role" },
    { label: "Creator", field: "creator.name" },
    { label: "Modifier", field: "modifier.name" },
    { label: "Permissions", field: "permissions" },
  ];

  return (
    <Page title="Users" isShowTitle={false}>
      <Table
        data={users}
        columns={columns}
        onCreate={() => setShowModal(true)}
        onDelete={handleDelete}
        onEdit={() => {}}
        onSearch={(val) => fetchUsers(val)}
      />

      {showModal && (
        <UserModal onClose={() => setShowModal(false)} onSave={handleSave} />
      )}
    </Page>
  );
}
