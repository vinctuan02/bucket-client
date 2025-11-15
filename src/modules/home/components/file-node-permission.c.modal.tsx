'use client';
import { fileNodeManagerApi } from '@/modules/home/home.api';
import { userApi } from '@/modules/users/user.api';
import { GetListUserDto } from '@/modules/users/user.dto';
import { User } from '@/modules/users/user.entity';
import { Button, Checkbox, Input, message } from 'antd';
import { useEffect, useRef, useState } from 'react';
import {
	BulkUpdateFileNodePermissionDto,
	UpsertFileNodePermissionDto,
} from '../home.dto';
import './file-node-permission.c.modal.scss';

interface Props {
	fileNodeId: string;
	visible: boolean;
	onClose: () => void;
	onAfterSave?: () => void;
}

interface UserRow extends User {
	canView: boolean;
	canEdit: boolean;
	permissionId?: string;
	sharedBy?: User | null;
}

export default function FileNodeShareModal({
	fileNodeId,
	visible,
	onClose,
	onAfterSave,
}: Props) {
	const [users, setUsers] = useState<UserRow[]>([]);
	const [searchResults, setSearchResults] = useState<User[]>([]);
	const [search, setSearch] = useState('');
	const [loading, setLoading] = useState(false);
	const [saving, setSaving] = useState(false);
	const [removedPermissionIds, setRemovedPermissionIds] = useState<string[]>(
		[],
	);
	const debounceRef = useRef<NodeJS.Timeout | null>(null);

	useEffect(() => {
		if (!visible) {
			setUsers([]);
			setRemovedPermissionIds([]);
			setSearch('');
			setSearchResults([]);
			return;
		}

		let isMounted = true;
		const fetchPermissions = async () => {
			setLoading(true);
			try {
				const permissions =
					await fileNodeManagerApi.getPermissions(fileNodeId);
				if (!isMounted) return;

				const userRows: UserRow[] = permissions
					.filter((p) => p.user)
					.map((p) => ({
						...p.user!,
						canView: p.canView,
						canEdit: p.canEdit,
						permissionId: p.id,
						sharedBy: p.sharedBy,
					}));

				setUsers(userRows);
			} catch (err) {
				console.error(err);
				message.error('Failed to load permissions');
			} finally {
				if (isMounted) setLoading(false);
			}
		};

		fetchPermissions();

		return () => {
			isMounted = false;
		};
	}, [visible, fileNodeId]);

	// debounce search user
	useEffect(() => {
		if (!search.trim()) {
			setSearchResults([]);
			return;
		}

		if (debounceRef.current) clearTimeout(debounceRef.current);

		debounceRef.current = setTimeout(async () => {
			try {
				const params = new GetListUserDto({ keywords: search });
				const res = await userApi.getListSimple(params);
				const data = res?.data?.items ?? [];
				const filtered = data.filter(
					(u) => !users.some((su) => su.id === u.id),
				);
				setSearchResults(filtered);
			} catch (err) {
				console.error(err);
				setSearchResults([]);
			}
		}, 400);

		return () => {
			if (debounceRef.current) clearTimeout(debounceRef.current);
		};
	}, [search, users]);

	const handleAddUser = (user: User) => {
		const newUser: UserRow = {
			...user,
			canView: true,
			canEdit: false,
			// canDelete: false,
			// canUpload: false,
			// canShare: false,
			// không có permissionId vì chưa save
		};
		setUsers((prev) => [...prev, newUser]);
		setSearchResults((prev) => prev.filter((u) => u.id !== user.id));
	};

	const handleRemoveUser = (userId: string) => {
		const user = users.find((u) => u.id === userId);

		// Nếu có permissionId -> thêm vào mảng remove
		if (user?.permissionId) {
			setRemovedPermissionIds((prev) => [...prev, user.permissionId!]);
		}

		setUsers((prev) => prev.filter((u) => u.id !== userId));
	};

	const handleCheck = (
		userId: string,
		field: keyof UserRow,
		value: boolean,
	) => {
		setUsers((prev) =>
			prev.map((u) => (u.id === userId ? { ...u, [field]: value } : u)),
		);
	};

	const handleSave = async () => {
		try {
			setSaving(true);

			const upsert: UpsertFileNodePermissionDto[] = users.map((u) => ({
				fileNodeId,
				userId: u.id,
				canView: u.canView,
				canEdit: u.canEdit,
				// canDelete: u.canDelete,
				// canUpload: u.canUpload,
				// canShare: u.canShare,
			}));

			const dto: BulkUpdateFileNodePermissionDto = {
				upsert,
				remove: removedPermissionIds,
			};

			await fileNodeManagerApi.bulkUpdatePermissions(fileNodeId, dto);
			message.success('Permissions updated successfully');

			onClose();
			onAfterSave?.();
		} catch (err) {
			console.error('Bulk update permissions failed:', err);
			message.error('Failed to update permissions');
		} finally {
			setSaving(false);
		}
	};

	if (!visible) return null;

	return (
		<div className="modal-backdrop">
			<div className="modal">
				<div className="modal-header">
					<h3>Share File / Folder</h3>
					<button onClick={onClose}>×</button>
				</div>

				<div className="modal-body">
					<Input
						placeholder="Search user..."
						value={search}
						onChange={(e) => setSearch(e.target.value)}
					/>

					{searchResults.length > 0 && (
						<div className="search-results">
							{searchResults.map((user) => (
								<div key={user.id} className="search-result">
									<span>
										{user.name} ({user.email})
									</span>
									<Button
										size="small"
										onClick={() => handleAddUser(user)}
									>
										Add
									</Button>
								</div>
							))}
						</div>
					)}

					{loading ? (
						<div className="loading">Loading permissions...</div>
					) : users.length > 0 ? (
						<table className="permission-table">
							<thead>
								<tr>
									<th>User</th>
									<th>Email</th>
									<th>Shared By</th>
									<th>View</th>
									<th>Edit</th>
									<th>Action</th>
								</tr>
							</thead>
							<tbody>
								{users.map((user) => (
									<tr key={user.id}>
										<td>
											<div className="user-info">
												<div className="user-name">
													{user.name}
												</div>
											</div>
										</td>
										<td>{user.email}</td>
										<td>
											<div className="user-info">
												<div className="user-name">
													{user.sharedBy?.name || '-'}
												</div>
											</div>
										</td>
										<td>
											<Checkbox
												checked={user.canView}
												onChange={(e) =>
													handleCheck(
														user.id,
														'canView',
														e.target.checked,
													)
												}
											/>
										</td>
										<td>
											<Checkbox
												checked={user.canEdit}
												onChange={(e) =>
													handleCheck(
														user.id,
														'canEdit',
														e.target.checked,
													)
												}
											/>
										</td>
										<td>
											<Button
												size="small"
												danger
												onClick={() =>
													handleRemoveUser(user.id)
												}
											>
												Remove
											</Button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					) : (
						<div className="no-users">No permissions found</div>
					)}
				</div>

				<div className="modal-footer">
					<button className="btn btn-gray" onClick={onClose}>
						Cancel
					</button>
					<button
						className="btn btn-blue"
						onClick={handleSave}
						disabled={saving}
					>
						{saving ? 'Saving...' : 'Save'}
					</button>
				</div>
			</div>
		</div>
	);
}
