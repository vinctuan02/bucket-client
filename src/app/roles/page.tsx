"use client";

import { useEffect, useState } from "react";
import { Role } from "@/types/type.user";
import { rolesApi } from "@/lib/apis/api.roles";
import api from "@/lib/constants/api.constant";
import Page from "@/components/pages/c.page";
import Table from "@/components/tables/c.table";
import RoleModal from "@/components/modals/modal.role";

export default function RolesPage() {
    const [roles, setRoles] = useState<Role[]>([]);
    const [showModal, setShowModal] = useState(false);

    const fetchRoles = async (search?: string) => {
        try {
            const { data } = await rolesApi.getList({});
            setRoles(data?.items ?? []);
        } catch (err) {
            console.error("Error fetching roles:", err);
        }
    };

    useEffect(() => {
        fetchRoles();
    }, []);

    const handleSave = async (role: {
        name: string;
        description?: string;
        permissions?: string[];
    }) => {
        try {
            await api.post("/roles", role);
            await fetchRoles();
            setShowModal(false);
        } catch (err) {
            console.error("Error saving role:", err);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this role?")) return;
        try {
            await api.delete(`/roles/${id}`);
            await fetchRoles();
        } catch (err) {
            console.error("Error deleting role:", err);
        }
    };

    const columns = [
        { label: "Name", field: "name" },
        { label: "Description", field: "description" },
        { label: "Creator", field: "creator.name" },
        { label: "Modifier", field: "modifier.name" },
        { label: "Permissions", field: "permissions" },
    ];

    return (
        <Page title="Roles" isShowTitle={false}>
            <Table
                data={roles}
                columns={columns}
                onCreate={() => setShowModal(true)}
                onDelete={handleDelete}
                onSearch={(val) => fetchRoles(val)}
            />

            {showModal && (
                <RoleModal
                    onClose={() => setShowModal(false)}
                    onSave={handleSave}
                />
            )}
        </Page>
    );
}
