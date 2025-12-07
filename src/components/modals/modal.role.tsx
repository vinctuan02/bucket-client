'use client';

import { PAGINATION_DEFAULT } from '@/modules/commons/const/common.constant';
import { OrderDirection } from '@/modules/commons/enum/common.enum';
import { permissionApi } from '@/modules/permissions/permission.api';
import { permissionConfigsColumnTable } from '@/modules/permissions/permission.constant';
import { GetListPermissionDto } from '@/modules/permissions/permission.dto';
import {
	PermissionAction,
	PermissionFieldMapping,
	Resource,
} from '@/modules/permissions/permisson.enum';
import { roleDefault } from '@/modules/roles/role.constant';
import { RolePermission } from '@/modules/roles/role.dto';
import { Role } from '@/modules/roles/role.entity';
import { Select, message } from 'antd';
import { useEffect, useState } from 'react';
import Portal from '../commons/portal';
import Page from '../pages/c.page';
import TableSelect from '../table-selector/c.table-selector';
import './modal.scss';

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
				pageSize: 999,
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
		permissionQuery.permissionActions,
		permissionQuery.resources,
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
			(prev) =>
				new GetListPermissionDto({ ...prev, keywords: value, page: 1 }),
		);
	};

	const handlePageChange = (page: number) => {
		setPermissionQuery(
			(prev) => new GetListPermissionDto({ ...prev, page }),
		);
	};

	const handleActionFilterChange = (values: PermissionAction[]) => {
		setPermissionQuery(
			(prev) =>
				new GetListPermissionDto({
					...prev,
					permissionActions:
						values.length > 0 ? values.join(',') : undefined,
					page: 1,
				}),
		);
	};

	const handleResourceFilterChange = (values: Resource[]) => {
		setPermissionQuery(
			(prev) =>
				new GetListPermissionDto({
					...prev,
					resources: values.length > 0 ? values.join(',') : undefined,
					page: 1,
				}),
		);
	};

	const handleSortChange = (field: string, direction: OrderDirection) => {
		setPermissionQuery(
			(prev) =>
				new GetListPermissionDto({
					...prev,
					fieldOrder: field,
					orderBy: direction,
					page: 1,
				}),
		);
	};

	const actionOptions = Object.values(PermissionAction)
		.filter((value) => typeof value === 'string')
		.map((action) => ({
			label: action as string,
			value: action as PermissionAction,
		}));

	const resourceOptions = Object.values(Resource)
		.filter((value) => typeof value === 'string')
		.map((resource) => ({
			label: resource as string,
			value: resource as Resource,
		}));

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
		<Portal>
			<div className="modal-overlay" onClick={handleOverlayClick}>
				<div className="modal">
					<h2 className="modal__title">
						{initialData?.id ? 'Edit Role' : 'Create Role'}
					</h2>

					<div className="modal__content">
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
							<div
								style={{
									marginBottom: '16px',
									display: 'flex',
									gap: '16px',
								}}
							>
								<Select
									mode="multiple"
									allowClear
									style={{ width: '200px' }}
									placeholder="Filter by Action"
									value={
										(permissionQuery.permissionActions
											?.split(',')
											.filter(Boolean) ||
											[]) as PermissionAction[]
									}
									onChange={handleActionFilterChange}
									options={actionOptions}
									getPopupContainer={(trigger) =>
										trigger.parentElement || document.body
									}
								/>
								<Select
									mode="multiple"
									allowClear
									style={{ width: '200px' }}
									placeholder="Filter by Resource"
									value={
										(permissionQuery.resources
											?.split(',')
											.filter(Boolean) ||
											[]) as Resource[]
									}
									onChange={handleResourceFilterChange}
									options={resourceOptions}
									getPopupContainer={(trigger) =>
										trigger.parentElement || document.body
									}
								/>
							</div>
							<TableSelect
								data={permissions}
								columns={permissionConfigsColumnTable}
								selectedKeys={selectedPermissionIds}
								onSelectChange={setSelectedPermissionIds}
								onSearch={handleSearch}
								pagination={pagination}
								onPageChange={handlePageChange}
								onSortChange={handleSortChange}
							/>
						</Page>
					</div>

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
		</Portal>
	);
}
