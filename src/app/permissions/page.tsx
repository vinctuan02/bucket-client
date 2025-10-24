"use client";

import { useEffect, useState } from "react";
import api from "@/lib/constants/api.constant";
import Page from "@/components/pages/c.page";
import Table from "@/components/tables/c.table";
import { Permission } from "@/types/type.user";
import PermissionModal from "@/components/modals/modal.permission";
import { permissionApi } from "@/modules/permissions/permission.api";
import { GetListPermissionDto } from "@/modules/permissions/permission.class";
import { columnsTable } from "@/modules/permissions/permission.constant";

export default function PermissionsPage() {
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [showModal, setShowModal] = useState(false);

    const [permissionQuery, setPermissionQuery] = useState<GetListPermissionDto>(
        new GetListPermissionDto()
    );

    const fetchPermissions = async (params?: GetListPermissionDto) => {
        try {
            const response = await permissionApi.getList(params);
            setPermissions(response.data?.items ?? []);
        } catch (err) {
            console.error("Error fetching permissions:", err);
        }
    };

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            fetchPermissions(permissionQuery);
        }, 1000 / 2);

        return () => clearTimeout(delayDebounce);
    }, [permissionQuery.keywords, permissionQuery.page, permissionQuery.pageSize]);


    const handleSave = async (permission: { action: string; resource: string }) => {
        try {
            await api.post("/permissions", permission);
            // setCurrentPage(1);
            // fetchPermissions();
            // setShowModal(false);
        } catch (err) {
            console.error("Error saving permission:", err);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this permission?")) return;
        try {
            await api.delete(`/permissions/${id}`);
            fetchPermissions();
        } catch (err) {
            console.error("Error deleting permission:", err);
        }
    };

    const handleSearch = (value: string) => {
        setPermissionQuery(prev =>
            Object.assign(new GetListPermissionDto(), prev, { keywords: value })
        );
    };


    const handlePageChange = (page: number) => {
        // setCurrentPage(page);
    };



    return (
        <Page title="Permissions" isShowTitle={false}>
            <Table
                data={permissions}
                columns={columnsTable}
                onCreate={() => setShowModal(true)}
                onDelete={handleDelete}
                onEdit={() => { }}
                onSearch={handleSearch}
                // pagination={ }
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