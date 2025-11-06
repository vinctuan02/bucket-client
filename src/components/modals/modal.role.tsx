'use client';

import { PAGINATION_DEFAULT } from '@/modules/commons/const/common.constant';
import { permissionApi } from '@/modules/permissions/permission.api';
import { permissionConfigsColumnTable } from '@/modules/permissions/permission.constant';
import { GetListPermissionDto } from '@/modules/permissions/permission.dto';
import { PermissionFieldMapping } from '@/modules/permissions/permisson.enum';
import { roleDefault } from '@/modules/roles/role.constant';
import { RolePermission } from '@/modules/roles/role.dto';
import { Role } from '@/modules/roles/role.entity';
import { useEffect, useState } from 'react';
import Page from '../pages/c.page';
import TableSelect from '../table-selector/c.table-selector';
import './modal.scss';
import { message } from 'antd';

interface RoleModalProps {
	initialData: Partial<Role>;
	onClose: () => void;
	onSave: (role: {
		id?: string;
		name: string;
		description: string;
		rolePermissions: RolePermission[];
	}) => void;
}

export default function RoleModal({
	initialData,
	onClose,
	onSave,
}: RoleModalProps) {
	const [form, setForm] = useState<Partial<Role>>(roleDefault);
	const [permissions, setPermissions] = useState<any[]>([]);
	const [selectedPermissionIds, setSelectedPermissionIds] = useState<
		string[]
	>([]);
	const [pagination, setPagination] = useState(PAGINATION_DEFAULT);

	const [permissionQuery, setPermissionQuery] =
		useState<GetListPermissionDto>(
			new GetListPermissionDto({
				fieldOrder: PermissionFieldMapping.NAME,
			}),
		);

	// ===== FETCH PERMISSIONS =====
	const fetchPermissions = async (params?: GetListPermissionDto) => {
		try {
			const { data } = await permissionApi.getList(params);
			setPermissions(data?.items ?? []);

			if (data?.metadata) {
				setPagination({
					page: data.metadata.page,
					totalPages: data.metadata.totalPages,
					totalItems: data.metadata.totalItems,
					itemsPerPage: data.metadata.pageSize,
				});
			}
		} catch (err) {
			console.error('Error fetching permissions:', err);
		}
	};

	useEffect(() => {
		const delayDebounce = setTimeout(() => {
			fetchPermissions(permissionQuery);
		}, 250);

		return () => clearTimeout(delayDebounce);
	}, [
		permissionQuery.keywords,
		permissionQuery.page,
		permissionQuery.pageSize,
		permissionQuery.orderBy,
		permissionQuery.fieldOrder,
	]);

	// ===== FORM & INITIAL DATA =====
	useEffect(() => {
		if (initialData) {
			setForm(initialData);
			setSelectedPermissionIds(
				initialData.rolePermissions?.map((rp) => rp.permissionId) ?? [],
			);
		} else {
			setForm(roleDefault);
			setSelectedPermissionIds([]);
		}
	}, [initialData]);

	// ===== HANDLERS =====
	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setForm((prev) => ({ ...prev, [name]: value }));
	};

	const handleSearch = (value: string) => {
		setPermissionQuery(
			(prev) => new GetListPermissionDto({ ...prev, keywords: value }),
		);
	};

	const handlePageChange = (page: number) => {
		setPermissionQuery(
			(prev) => new GetListPermissionDto({ ...prev, page }),
		);
	};

	const handleSubmit = () => {
		const { id, name, description } = form;

		if (!name?.trim()) {
			message.warning('Please enter role name.');
			return;
		}

		const rolePermissions = selectedPermissionIds.map((id) => ({
			permissionId: id,
		}));

		onSave({
			id,
			name,
			description: description || '',
			rolePermissions,
		});
	};

	const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
		if (e.target === e.currentTarget) onClose();
	};

	return (
		<div className="modal-overlay" onClick={handleOverlayClick}>
			<div className="modal">
				<h2 className="modal__title">
					{initialData?.id ? 'Edit Role' : 'Create Role'}
				</h2>

				<div className="form-row">
					<div className="form-group">
						<label>Role Name</label>
						<input
							name="name"
							type="text"
							value={form.name ?? ''}
							onChange={handleChange}
							placeholder="Enter role name"
						/>
					</div>
					<div className="form-group">
						<label>Description</label>
						<input
							name="description"
							type="text"
							value={form?.description ?? ''}
							onChange={handleChange}
							placeholder="Enter description"
						/>
					</div>
				</div>

				<Page title="Permissions" isShowTitle={true}>
					<TableSelect
						data={permissions}
						columns={permissionConfigsColumnTable}
						selectedKeys={selectedPermissionIds}
						onSelectChange={setSelectedPermissionIds}
						onSearch={handleSearch}
						pagination={pagination}
						onPageChange={handlePageChange}
					/>
				</Page>

				<div className="modal__actions">
					<button className="btn btn-cancel" onClick={onClose}>
						Cancel
					</button>
					<button className="btn btn-blue" onClick={handleSubmit}>
						Save
					</button>
				</div>
			</div>
		</div>
	);
}
