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
import { useSearchParams, useRouter } from 'next/navigation';
import FileNodeModal from '@/modules/home/components/home.c.modal';
import { FileNodeFM } from '@/modules/home/home.enum';
import { authApi } from '@/modules/auth/auth.api';
import CreateMenu from '@/modules/home/components/home.c.create-menu';

export default function HomePage() {
	const router = useRouter();
	const searchParams = useSearchParams();

	const [FileNodes, setFileNodes] = useState<FileNode[]>([]);
	const [showModal, setShowModal] = useState(false);
	const [modalType, setModalType] = useState<'folder' | 'file' | null>(null);
	const [editingFolder, setEditingFolder] = useState<Partial<FileNode>>({});
	const [pagination, setPagination] = useState(PAGINATION_DEFAULT);
	const [showMenu, setShowMenu] = useState(false);

	const [folderQuery, setFolderQuery] = useState<GetlistFileNodeDto>(
		new GetlistFileNodeDto(),
	);

	useEffect(() => {
		const params = Object.fromEntries(searchParams.entries());

		if (!params.fileNodeParentId) {
			(async () => {
				const { data: user } = await authApi.me();
				if (user?.id) {
					router.replace(`?fileNodeParentId=${user?.id}`, { scroll: false });
				}
			})();
		}

		setFolderQuery(
			new GetlistFileNodeDto({
				...params,
				page: Number(params.page) || 1,
				pageSize: Number(params.pageSize) || 10,
			}),
		);
	}, [searchParams]);

	const syncQueryToUrl = (params: GetlistFileNodeDto) => {
		const query = new URLSearchParams();

		if (params.keywords) query.set('keywords', params.keywords);
		if (params.page) query.set('page', String(params.page));
		if (params.pageSize) query.set('pageSize', String(params.pageSize));
		if (params.fieldOrder) query.set('fieldOrder', params.fieldOrder);
		if (params.orderBy) query.set('orderBy', params.orderBy);
		if (params.fileNodeParentId) query.set('fileNodeParentId', params.fileNodeParentId);

		router.push(`?${query.toString()}`, { scroll: false });
	};

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
			syncQueryToUrl(folderQuery);
		}, 250);

		return () => clearTimeout(delayDebounce);
	}, [
		folderQuery.keywords,
		folderQuery.page,
		folderQuery.pageSize,
		folderQuery.fieldOrder,
		folderQuery.orderBy,
		folderQuery.fileNodeParentId,
	]);

	const handleEdit = (FileNode: FileNode) => {
		setEditingFolder(FileNode);
		setModalType('folder');
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
		setFolderQuery(
			(prev) => new GetlistFileNodeDto({ ...prev, keywords: value, page: 1 }),
		);
	};

	const handlePageChange = (page: number) => {
		setFolderQuery((prev) => new GetlistFileNodeDto({ ...prev, page }));
	};

	const handleSortChange = (field: string, direction: OrderDirection) => {
		setFolderQuery(
			(prev) =>
				new GetlistFileNodeDto({
					...prev,
					fieldOrder: field as FileNodeFM,
					orderBy: direction,
					page: 1,
				}),
		);
	};

	const handleSave = async (data: any) => {
		try {
			if (modalType === 'folder') {
				await fileNodeManagerApi.createFolder({
					name: data.name,
					fileNodeParentId: data.fileNodeParentId,
				});
			} else if (modalType === 'file') {

				const file = data.file as File;
				const extension = file.name.split('.').pop() ?? '';
				const fileMetadata = {
					fileName: file.name,
					fileSize: file.size,
					contentType: file.type || 'application/octet-stream',
					extension,
				};


				const res = await fileNodeManagerApi.createFile({
					name: data.name,
					fileNodeParentId: data.fileNodeParentId,
					fileMetadata,
				});

				const uploadUrl = res.data?.data?.uploadUrl;
				if (!uploadUrl) throw new Error('No upload URL received from server');

				await fetch(uploadUrl, {
					method: 'PUT',
					headers: {
						'Content-Type': file.type,
					},
					body: file,
				});
			}

			fetchFileNodes(folderQuery);
			setShowModal(false);
			setEditingFolder({});
			setModalType(null);
		} catch (error) {
			console.error('Error saving:', error);
			alert('Error saving file or folder');
		}
	};

	const handleRowClick = (row: FileNode) => {
		setFolderQuery(prev => {
			const newQuery = new GetlistFileNodeDto({
				...prev,
				fileNodeParentId: row.id,
				page: 1,
			});
			syncQueryToUrl(newQuery);
			return newQuery;
		});
	};

	return (
		<Page title="FileNodes" isShowTitle={false}>
			<div className="relative">
				<Table
					data={FileNodes}
					columns={fileNodeConifgsColumnTable}
					onCreate={() => setShowMenu((prev) => !prev)}
					onDelete={handleDelete}
					onEdit={handleEdit}
					onSearch={handleSearch}
					pagination={pagination}
					onPageChange={handlePageChange}
					onSortChange={handleSortChange}
					onRowClick={handleRowClick}
				/>

				{showMenu && (
					<div className="absolute top-[60px] right-[20px] z-50">
						<CreateMenu
							onClose={() => setShowMenu(false)}
							onCreateFolder={() => {
								setEditingFolder({ fileNodeParentId: folderQuery.fileNodeParentId });
								setModalType('folder');
								setShowModal(true);
							}}
							onCreateFile={() => {
								setEditingFolder({ fileNodeParentId: folderQuery.fileNodeParentId });
								setModalType('file');
								setShowModal(true);
							}}
						/>
					</div>
				)}

				{showModal && modalType && (
					<FileNodeModal
						type={modalType}
						initialData={editingFolder}
						onClose={() => {
							setShowModal(false);
							setModalType(null);
						}}
						onSave={handleSave}
					/>
				)}
			</div>
		</Page>
	);
}
