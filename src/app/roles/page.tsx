"use client";

import { useEffect, useState } from "react";
import Page from "@/components/pages/c.page";
import Table from "@/components/tables/c.table";
import RoleModal from "@/components/modals/modal.role";
import { GetListRoleDto, RolePermission } from "@/modules/roles/role.dto";
import { OrderDirection } from "@/modules/commons/common.enum";
import { RoleFieldMapping } from "@/modules/roles/role.enum";
import { Role } from "@/types/type.user";
import { rolesApi } from "@/modules/roles/role.api";
import { roleDefault, rolesConifgsColumnTable } from "@/modules/roles/role.constant";
import { PAGINATION_DEFAULT } from "@/modules/commons/common.constant";

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingRole, setEditingRole] = useState<Partial<Role>>(roleDefault);
  const [pagination, setPagination] = useState(PAGINATION_DEFAULT);

  const [roleQuery, setRoleQuery] = useState<GetListRoleDto>(
    new GetListRoleDto({ fieldOrder: RoleFieldMapping.NAME })
  );

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
    const delayDebounce = setTimeout(() => {
      fetchRoles(roleQuery);
    }, 250);

    return () => clearTimeout(delayDebounce);
  }, [
    roleQuery.keywords,
    roleQuery.page,
    roleQuery.pageSize,
    roleQuery.orderBy,
    roleQuery.fieldOrder,
  ]);

  const handleSave = async (role: { id?: string; name: string; description: string; rolePermissions: RolePermission[]; }) => {
    try {
      const { id, ...rest } = role;
      if (id) {
        await rolesApi.update(id, rest);
      } else {
        await rolesApi.create(rest);
      }
      fetchRoles(roleQuery);
      setShowModal(false);
      setEditingRole(roleDefault)
    } catch (err) {
      console.error("Error saving role:", err);
    }
  };

  const handleEdit = (role: Role) => {
    setEditingRole(role);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this role?")) return;
    try {
      await rolesApi.delete(id);
      fetchRoles();
    } catch (err) {
      console.error("Error deleting role:", err);
    }
  };

  const handleSearch = (value: string) => {
    setRoleQuery(prev => new GetListRoleDto({ ...prev, keywords: value }));
  };

  const handlePageChange = (page: number) => {
    setRoleQuery(prev => new GetListRoleDto({ ...prev, page }));
  };

  const handleSortChange = (field: string, direction: OrderDirection) => {
    setRoleQuery(prev =>
      new GetListRoleDto({ ...prev, fieldOrder: field, orderBy: direction })
    );
  };

  return (
    <Page title="Roles" isShowTitle={false}>
      <Table
        data={roles}
        columns={rolesConifgsColumnTable}
        onCreate={() => setShowModal(true)}
        onDelete={handleDelete}
        onEdit={handleEdit}
        onSearch={handleSearch}
        pagination={pagination}
        onPageChange={handlePageChange}
        onSortChange={handleSortChange}
      />

      {showModal && (
        <RoleModal
          initialData={editingRole}
          onClose={() => {
            setShowModal(false);
            setEditingRole(roleDefault);
          }}

          onSave={handleSave}
        />
      )}
    </Page>
  );
}
