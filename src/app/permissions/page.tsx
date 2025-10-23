"use client";

import { useEffect, useState } from "react";
import api from "@/lib/constants/api.constant";
import Page from "@/components/pages/c.page";
import Table from "@/components/tables/c.table";
import { Permission } from "@/types/type.user";
import { permissionApi } from "@/lib/apis/api.permissons";
import PermissionModal from "@/components/modals/modal.permission";

export default function PermissionsPage() {
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [metadata, setMetadata] = useState({
        currentPage: 1,
        pageSize: 20,
        totalItems: 0,
        totalPages: 1,
    });
    const [searchQuery, setSearchQuery] = useState("");

    const fetchPermissions = async (search?: string, page: number = 1) => {
        try {
            const params: any = {
                page,
                pageSize: metadata.pageSize,
            };

            if (search) {
                params.search = search;
            }

            const response = await permissionApi.getList(params);

            setPermissions(response.data?.items ?? []);
            setMetadata(response.data?.metadata ?? {
                currentPage: 1,
                pageSize: 20,
                totalItems: 0,
                totalPages: 1,
            });
        } catch (err) {
            console.error("Error fetching permissions:", err);
        }
    };

    useEffect(() => {
        fetchPermissions(searchQuery, currentPage);
    }, [currentPage]);

    const handleSave = async (permission: { action: string; resource: string }) => {
        try {
            await api.post("/permissions", permission);
            setCurrentPage(1);
            fetchPermissions(searchQuery, 1);
            setShowModal(false);
        } catch (err) {
            console.error("Error saving permission:", err);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this permission?")) return;
        try {
            await api.delete(`/permissions/${id}`);
            fetchPermissions(searchQuery, currentPage);
        } catch (err) {
            console.error("Error deleting permission:", err);
        }
    };

    const handleSearch = (value: string) => {
        setSearchQuery(value);
        setCurrentPage(1);
        fetchPermissions(value, 1);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const columns = [
        { label: "Name", field: "name" },
        { label: "Action", field: "action" },
        { label: "Resource", field: "resource" },
        { label: "Description", field: "description" },
    ];

    return (
        <Page title="Permissions" isShowTitle={false}>
            <Table
                data={permissions}
                columns={columns}
                onCreate={() => setShowModal(true)}
                onDelete={handleDelete}
                onEdit={() => { }}
                onSearch={handleSearch}
                pagination={{
                    currentPage: metadata.currentPage,
                    totalPages: metadata.totalPages,
                    totalItems: metadata.totalItems,
                    itemsPerPage: metadata.pageSize,
                }}
                onPageChange={handlePageChange}
            />

            {showModal && (
                <PermissionModal
                    onClose={() => setShowModal(false)}
                    onSave={handleSave}
                />
            )}
        </Page>
    );
}