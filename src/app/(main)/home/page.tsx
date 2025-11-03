'use client';

import Page from '@/components/pages/c.page';
import Table from '@/components/tables/c.table';
import { PAGINATION_DEFAULT } from '@/modules/commons/const/common.constant';
import { OrderDirection } from '@/modules/commons/enum/common.enum';
import { fileNodeManagerApi } from '@/modules/home/home.api';
import { fileNodeConifgsColumnTable } from '@/modules/home/home.const';
import { GetlistFileNodeDto } from '@/modules/home/home.dto';
import { FileNode } from '@/modules/home/home.entity';

import { useEffect, useState } from 'react';

export default function HomePage() {
	const [FileNodes, setFileNodes] = useState<FileNode[]>([]);
	const [showModal, setShowModal] = useState(false);
	const [editingFolder, setEditingFolder] = useState<Partial<FileNode>>({});
	const [pagination, setPagination] = useState(PAGINATION_DEFAULT);
	const [folderQuery, setFolderQuery] = useState<GetlistFileNodeDto>(
		new GetlistFileNodeDto(),
	);

	const fetchFileNodes = async (params?: GetlistFileNodeDto) => {
		try {
			const { data } = await fileNodeManagerApi.getList(params);
			setFileNodes(data?.items ?? []);
			if (data?.metadata) {
				setPagination({
					page: data.metadata.page,
					totalPages: data.metadata.totalPages,
					totalItems: data.metadata.totalItems,
					itemsPerPage: data.metadata.pageSize,
				});
			}
		} catch (err) {
			console.error('Error fetching FileNodes:', err);
		}
	};

	useEffect(() => {
		const delayDebounce = setTimeout(() => {
			fetchFileNodes(folderQuery);
		}, 250);
		return () => clearTimeout(delayDebounce);
	}, [
		folderQuery.keywords,
		folderQuery.page,
		folderQuery.pageSize,
		folderQuery.fieldOrder,
		folderQuery.orderBy,
	]);

	const handleSave = async (FileNode: {
		id?: string;
		name: string;
		fileNodeParentId?: string;
	}) => {
		try {
			if (FileNode.id) {
				await fileNodeManagerApi.updateFolder(FileNode.id, {
					name: FileNode.name,
				});
			} else {
				await fileNodeManagerApi.createFolder({
					name: FileNode.name,
					fileNodeParentId: FileNode.fileNodeParentId,
				});
			}
			fetchFileNodes(folderQuery);
			setShowModal(false);
			setEditingFolder({});
		} catch (err) {
			console.error('Error saving FileNode:', err);
		}
	};

	const handleEdit = (FileNode: FileNode) => {
		setEditingFolder(FileNode);
		setShowModal(true);
	};

	const handleDelete = async (id: string) => {
		if (!confirm('Delete this FileNode?')) return;
		try {
			await fileNodeManagerApi.delete(id);
			fetchFileNodes(folderQuery);
		} catch (err) {
			console.error('Error deleting FileNode:', err);
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
		<Page title="FileNodes" isShowTitle={false}>
			<Table
				data={FileNodes}
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
