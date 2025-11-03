'use client';

import Page from '@/components/pages/c.page';
import Table from '@/components/tables/c.table';
import { PAGINATION_DEFAULT } from '@/modules/commons/const/common.constant';
import { OrderDirection } from '@/modules/commons/enum/common.enum';
import { fileManagerApi } from '@/modules/folder/folder.api';
import { fileNodeConifgsColumnTable } from '@/modules/folder/folder.const';
import { GetlistFileNodeDto } from '@/modules/folder/folder.dto';
import { FileNode } from '@/modules/folder/folder.entity';
import { useEffect, useState } from 'react';

export default function FolderPage() {
	const [folders, setFolders] = useState<FileNode[]>([]);
	const [showModal, setShowModal] = useState(false);
	const [editingFolder, setEditingFolder] = useState<Partial<FileNode>>({});
	const [pagination, setPagination] = useState(PAGINATION_DEFAULT);
	const [folderQuery, setFolderQuery] = useState<GetlistFileNodeDto>(
		new GetlistFileNodeDto(),
	);

	const fetchFolders = async (params?: GetlistFileNodeDto) => {
		try {
			const { data } = await fileManagerApi.getList(params);
			setFolders(data?.items ?? []);
			if (data?.metadata) {
				setPagination({
					page: data.metadata.page,
					totalPages: data.metadata.totalPages,
					totalItems: data.metadata.totalItems,
					itemsPerPage: data.metadata.pageSize,
				});
			}
		} catch (err) {
			console.error('Error fetching folders:', err);
		}
	};

	useEffect(() => {
		const delayDebounce = setTimeout(() => {
			fetchFolders(folderQuery);
		}, 250);
		return () => clearTimeout(delayDebounce);
	}, [
		folderQuery.keywords,
		folderQuery.page,
		folderQuery.pageSize,
		folderQuery.fieldOrder,
		folderQuery.orderBy,
	]);

	const handleSave = async (folder: {
		id?: string;
		name: string;
		fileNodeParentId?: string;
	}) => {
		try {
			if (folder.id) {
				await fileManagerApi.updateFolder(folder.id, {
					name: folder.name,
				});
			} else {
				await fileManagerApi.createFolder({
					name: folder.name,
					fileNodeParentId: folder.fileNodeParentId,
				});
			}
			fetchFolders(folderQuery);
			setShowModal(false);
			setEditingFolder({});
		} catch (err) {
			console.error('Error saving folder:', err);
		}
	};

	const handleEdit = (folder: FileNode) => {
		setEditingFolder(folder);
		setShowModal(true);
	};

	const handleDelete = async (id: string) => {
		if (!confirm('Delete this folder?')) return;
		try {
			await fileManagerApi.delete(id);
			fetchFolders(folderQuery);
		} catch (err) {
			console.error('Error deleting folder:', err);
		}
	};

	const handleSearch = (value: string) => {
		// setFolderQuery(
		// 	(prev) => new GetlistFileNodeDto({ ...prev, keywords: value }),
		// );
	};

	const handlePageChange = (page: number) => {
		// setFolderQuery((prev) => new GetlistFileNodeDto({ ...prev, page }));
	};

	const handleSortChange = (field: string, direction: OrderDirection) => {
		// setFolderQuery(
		// 	(prev) =>
		// 		new GetlistFileNodeDto({
		// 			...prev,
		// 			fieldOrder: field,
		// 			orderBy: direction,
		// 		}),
		// );
	};

	return (
		<Page title="Folders" isShowTitle={false}>
			<Table
				data={folders}
				columns={fileNodeConifgsColumnTable}
				onCreate={() => {
					setEditingFolder({});
					setShowModal(true);
				}}
				onDelete={handleDelete}
				onEdit={handleEdit}
				onSearch={handleSearch}
				pagination={pagination}
				onPageChange={handlePageChange}
				onSortChange={handleSortChange}
			/>

			{/* {showModal && (
				<FolderModal
					initialData={editingFolder}
					onClose={() => setShowModal(false)}
					onSave={handleSave}
				/>
			)} */}
		</Page>
	);
}
