"use client";

import { useEffect, useState } from "react";
import Page from "@/components/pages/c.page";
import Table from "@/components/tables/c.table";
import UserModal from "@/components/modals/modal.user";
import { User, UserRole } from "@/types/type.user";
import { PAGINATION_DEFAULT } from "@/modules/commons/const/common.constant";
import { OrderDirection } from "@/modules/commons/common.enum";
import { userApi } from "@/modules/users/user.api";
import { CreateUserDto, GetListUserDto, UpdateUserDto } from "@/modules/users/user.dto";
import { UserFieldOrder } from "@/modules/users/user.enum";
import { usersConifgsColumnTable } from "@/modules/users/user.constant";

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);

    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState<Partial<User>>({});
    const [pagination, setPagination] = useState(PAGINATION_DEFAULT);

    const [userQuery, setUserQuery] = useState<GetListUserDto>(
        new GetListUserDto()
    );

    const fetchUsers = async (params?: GetListUserDto) => {
        try {
            const { data } = await userApi.getList(params);
            setUsers(data?.items ?? []);
            if (data?.metadata) {
                setPagination({
                    currentPage: data.metadata.currentPage,
                    totalPages: data.metadata.totalPages,
                    totalItems: data.metadata.totalItems,
                    itemsPerPage: data.metadata.pageSize,
                });
            }
        } catch (err) {
            console.error("Error fetching users:", err);
        }
    };

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            fetchUsers(userQuery);
        }, 250);

        return () => clearTimeout(delayDebounce);
    }, [
        userQuery.keywords,
        userQuery.page,
        userQuery.pageSize,
        userQuery.fieldOrder,
        userQuery.orderBy,
    ]);

    const handleSave = async (user: {
        id?: string;
        name: string;
        email: string;
        password?: string;
        userRoles: UserRole[];
    }) => {
        try {

            const dto: any = {
                name: user.name,
                email: user.email,
                userRoles: user.userRoles.map((ur) => ({ roleId: ur.roleId })),
            };

            if (user.password) {
                dto.password = user.password;
            }

            if (user.id) {
                await userApi.update(user.id, dto);
            } else {

                if (!user.password) throw new Error("Password is required for new user");
                await userApi.create(dto);
            }

            fetchUsers(userQuery);
            setShowModal(false);
            setEditingUser({});
        } catch (err) {
            console.error("Error saving user:", err);
        }
    };




    const handleEdit = (user: User) => {
        setEditingUser(user);
        setShowModal(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this user?")) return;
        try {
            await userApi.delete(id);
            fetchUsers(userQuery);
        } catch (err) {
            console.error("Error deleting user:", err);
        }
    };

    const handleSearch = (value: string) => {
        setUserQuery(prev => new GetListUserDto({ ...prev, keywords: value }));
    };

    const handlePageChange = (page: number) => {
        setUserQuery(prev => new GetListUserDto({ ...prev, page }));
    };

    const handleSortChange = (field: string, direction: OrderDirection) => {
        setUserQuery(prev =>
            new GetListUserDto({ ...prev, fieldOrder: field, orderBy: direction })
        );
    };

    return (
        <Page title="Users" isShowTitle={false}>
            <Table
                data={users}
                columns={usersConifgsColumnTable}
                onCreate={() => {
                    setEditingUser({});
                    setShowModal(true);
                }}
                onDelete={handleDelete}
                onEdit={handleEdit}
                onSearch={handleSearch}
                pagination={pagination}
                onPageChange={handlePageChange}
                onSortChange={handleSortChange}
            />

            {showModal && (
                <UserModal
                    initialData={editingUser}
                    onClose={() => setShowModal(false)}
                    onSave={handleSave}
                />
            )}
        </Page>
    );
}
