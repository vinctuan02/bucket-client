"use client";

import { useEffect, useState } from "react";
import UserModal from "@/components/modals/UserModal";
import { User } from "@/types/type.user";
import { userApi } from "@/lib/apis/api.users";
import api from "@/lib/constants/api.constant";
import Table from "@/components/tables/c.table";

export default function PermissionsPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [search, setSearch] = useState("");
    const [showModal, setShowModal] = useState(false);

    const fetchUsers = async () => {
        try {
            const { data } = await userApi.getList({});
            setUsers(data?.items ?? []);
        } catch (err) {
            console.error("Error fetching users:", err);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [search]);

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
        <div className="users-page">
            <h1 className="title">Users</h1>

            <div className="toolbar">
                <input
                    type="text"
                    placeholder="Search ..."
                    className="search-input"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <div className="actions">
                    <button className="btn btn-blue" onClick={() => setShowModal(true)}>
                        CREATE
                    </button>
                </div>
            </div>

            <Table data={users} columns={columns} onDelete={handleDelete} />

            {showModal && (
                <UserModal
                    onClose={() => setShowModal(false)}
                    onSave={handleSave}
                />
            )}
        </div>
    );
}
