"use client";

import { useEffect, useState } from "react";
import api from "@/lib/constants/api.constant";
import Page from "@/components/pages/c.page";
import Table from "@/components/tables/c.table";
import { Permission } from "@/types/type.user";
import PermissionModal from "@/components/modals/modal.permission";
import { permissionApi } from "@/modules/permissions/permission.api";
import { GetListPermissionDto } from "@/modules/permissions/permission.dto";
import { columnsTable } from "@/modules/permissions/permission.constant";
import { OrderDirection } from "@/modules/commons/common.enum";
import { PermissionFieldMapping } from "@/modules/permissions/permisson.enum";

export default function PermissionsPage() {
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [editingPermission, setEditingPermission] = useState<Permission>();
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 20,
    });

    const [permissionQuery, setPermissionQuery] = useState<GetListPermissionDto>(
        new GetListPermissionDto({ fieldOrder: PermissionFieldMapping.NAME })
    );

    const fetchPermissions = async (params?: GetListPermissionDto) => {
        try {
            const { data } = await permissionApi.getList(params);
            setPermissions(data?.items ?? []);

            if (data?.metadata) {
                setPagination({
                    currentPage: data.metadata.currentPage,
                    totalPages: data.metadata.totalPages,
                    totalItems: data.metadata.totalItems,
                    itemsPerPage: data.metadata.pageSize,
                });
            }
        } catch (err) {
            console.error("Error fetching permissions:", err);
        }
    };

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            fetchPermissions(permissionQuery);
        }, 1000 / 4);

        return () => clearTimeout(delayDebounce);
    }, [
        permissionQuery.keywords,
        permissionQuery.page,
        permissionQuery.pageSize,
        permissionQuery.orderBy,
        permissionQuery.fieldOrder
    ]);


    const handleSave = async (permission: { id?: string; name: string; description: string; action: string; resource: string }) => {
        try {
            const { id, ...rest } = permission

            if (permission.id) {
                await permissionApi.update(permission.id, rest);
            } else {
                await permissionApi.create(permission);
            }

            fetchPermissions(permissionQuery);
            setShowModal(false);
        } catch (err) {
            console.error("Error saving permission:", err);
        }
    };


    const handleEdit = (permission: Permission) => {
        setEditingPermission(permission);
        setShowModal(true);
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
        setPermissionQuery(prev => new GetListPermissionDto({ ...prev, keywords: [value] }));
    };

    const handlePageChange = (page: number) => {
        setPermissionQuery(prev => new GetListPermissionDto({ ...prev, page }));
    };

    const handleSortChange = (field: string, direction: OrderDirection) => {
        setPermissionQuery(prev =>
            new GetListPermissionDto({ ...prev, fieldOrder: field, orderBy: direction })
        );
    };


    return (
        <Page title="Permissions" isShowTitle={false}>
            <Table
                data={permissions}
                columns={columnsTable}
                onCreate={() => setShowModal(true)}
                onDelete={handleDelete}
                onEdit={handleEdit}
                onSearch={handleSearch}
                pagination={pagination}
                onPageChange={handlePageChange}
                onSortChange={handleSortChange}
            />

            {showModal && (
                <PermissionModal
                    initialData={editingPermission}
                    onClose={() => setShowModal(false)}
                    onSave={handleSave}
                />
            )}
        </Page>
    );
}