'use client';

import Page from '@/components/pages/c.page';
import Table from '@/components/tables/c.table';
import { PAGINATION_DEFAULT } from '@/modules/commons/const/common.constant';
import { OrderDirection } from '@/modules/commons/enum/common.enum';
import UserModal from '@/modules/users/components/user.c.create-update.modal';
import { userApi } from '@/modules/users/user.api';
import { usersConfigsColumnTable } from '@/modules/users/user.constant';
import { GetListUserDto } from '@/modules/users/user.dto';
import { User, UserRole } from '@/modules/users/user.entity';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

export default function UsersPage() {
	const router = useRouter();
	const searchParams = useSearchParams();

	const [users, setUsers] = useState<User[]>([]);
	const [showModal, setShowModal] = useState(false);
	const [editingUser, setEditingUser] = useState<Partial<User>>({});
	const [pagination, setPagination] = useState(PAGINATION_DEFAULT);
	const [loading, setLoading] = useState(false);

	const [userQuery, setUserQuery] = useState<GetListUserDto>(
		new GetListUserDto(),
	);

	useEffect(() => {
		const qp = Object.fromEntries(searchParams.entries());
		setUserQuery(
			new GetListUserDto({
				...qp,
				page: qp.page ? Number(qp.page) : 1,
				pageSize: qp.pageSize ? Number(qp.pageSize) : 10,
			}),
		);
	}, []);

	const syncUrlParams = (params: Partial<GetListUserDto>) => {
		const url = new URLSearchParams(searchParams.toString());
		Object.entries(params).forEach(([key, value]) => {
			if (!value) url.delete(key);
			else url.set(key, String(value));
		});
		router.replace(`?${url.toString()}`, { scroll: false });
	};

	const fetchUsers = useCallback(async (params?: GetListUserDto) => {
		setLoading(true);
		try {
			const { data } = await userApi.getList(params);
			setUsers(data?.items ?? []);
			if (data?.metadata) {
				setPagination({
					page: data.metadata.page,
					totalPages: data.metadata.totalPages,
					totalItems: data.metadata.totalItems,
					itemsPerPage: data.metadata.pageSize,
				});
			}
		} catch (err) {
			console.error('Error fetching users:', err);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		const t = setTimeout(() => fetchUsers(userQuery), 250);
		syncUrlParams(userQuery);
		return () => clearTimeout(t);
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
			if (user.password) dto.password = user.password;
			if (user.id) await userApi.update(user.id, dto);
			else {
				if (!user.password)
					throw new Error('Password is required for new user');
				await userApi.create(dto);
			}
			fetchUsers(userQuery);
			setShowModal(false);
			setEditingUser({});
		} catch (err) {
			console.error('Error saving user:', err);
		}
	};

	const handleEdit = (user: User) => {
		setEditingUser(user);
		setShowModal(true);
	};

	const handleDelete = async (id: string) => {
		if (!confirm('Delete this user?')) return;
		try {
			await userApi.delete(id);
			fetchUsers(userQuery);
		} catch (err) {
			console.error('Error deleting user:', err);
		}
	};

	const handleSearch = (value: string) => {
		setUserQuery(
			(prev) => new GetListUserDto({ ...prev, keywords: value, page: 1 }),
		);
	};

	const handlePageChange = (page: number) => {
		setUserQuery((prev) => new GetListUserDto({ ...prev, page }));
	};

	const handleSortChange = (field: string, direction: OrderDirection) => {
		setUserQuery(
			(prev) =>
				new GetListUserDto({
					...prev,
					fieldOrder: field,
					orderBy: direction,
					page: 1,
				}),
		);
	};

	return (
		<Page title="Users" isShowTitle={false}>
			<Table
				data={users}
				columns={usersConfigsColumnTable}
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
				loading={loading}
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
