'use client';

import Page from '@/components/pages/c.page';
import Table from '@/components/tables/c.table';
import Grid from '@/components/tables/c.grid';
import GridThumbnail from '@/components/tables/c.grid-thumbnail';
import { PAGINATION_DEFAULT } from '@/modules/commons/const/common.constant';
import { OrderDirection } from '@/modules/commons/enum/common.enum';
import { fileNodeManagerApi } from '@/modules/home/home.api';
import { fileNodeConifgsColumnTable } from '@/modules/home/home.const';
import { GetListFileNodeDto } from '@/modules/home/home.dto';
import { FileNode } from '@/modules/home/home.entity';

import { authApi } from '@/modules/auth/auth.api';
import FilePreview from '@/modules/commons/components/common.c.read-file';
import FileNodeShareModal from '@/modules/home/components/file-node-permission.c.modal';
import Breadcrumbs from '@/modules/home/components/home.c.breadcrumbs';
import CreateMenu from '@/modules/home/components/home.c.create-menu';
import FileNodeModal from '@/modules/home/components/home.c.modal';
import { FileNodeFM } from '@/modules/home/home.enum';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from 'antd';
import { List, LayoutGrid, Folder, FileText } from 'lucide-react';

export default function HomePage() {
	const router = useRouter();
	const searchParams = useSearchParams();

	const [FileNodes, setFileNodes] = useState<FileNode[]>([]);
	const [showModal, setShowModal] = useState(false);
	const [modalType, setModalType] = useState<'folder' | 'file' | null>(null);
	const [editingFolder, setEditingFolder] = useState<Partial<FileNode>>({});
	const [pagination, setPagination] = useState(PAGINATION_DEFAULT);
	const [breadcrumbs, setBreadcrumbs] = useState<FileNode[]>([]);
	const [previewId, setPreviewId] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const [shareModal, setShareModal] = useState<{
		visible: boolean;
		fileNodeId?: string;
	}>({ visible: false });

	const [folderQuery, setFolderQuery] = useState<GetListFileNodeDto>(
		new GetListFileNodeDto(),
	);
	const [viewMode, setViewMode] = useState<'table' | 'grid'>('grid');

	useEffect(() => {
		const params = Object.fromEntries(searchParams.entries());

		// Set viewMode from URL
		if (params.viewMode === 'table' || params.viewMode === 'grid') {
			setViewMode(params.viewMode);
		}

		(async () => {
			if (!params.fileNodeParentId) {
				const { data: user } = await authApi.me();
				if (user?.id) {
					router.replace(`?fileNodeParentId=${user.id}`, {
						scroll: false,
					});
					return;
				}
			}

			// Filter out viewMode before creating query (don't send to API)
			const { viewMode: _, ...apiParams } = params;

			setFolderQuery(
				new GetListFileNodeDto({
					...apiParams,
					page: Number(apiParams.page) || 1,
					pageSize: Number(apiParams.pageSize) || 10,
				}),
			);
		})();
	}, [searchParams]);

	useEffect(() => {
		const delayDebounce = setTimeout(() => {
			fetchFileNodes(folderQuery);
			syncQueryToUrl(folderQuery);
			if (folderQuery.fileNodeParentId) {
				fetchBreadcrumbs(folderQuery.fileNodeParentId);
			}
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

	const syncQueryToUrl = (params: GetListFileNodeDto, mode?: 'table' | 'grid') => {
		const query = new URLSearchParams();

		if (params.keywords) query.set('keywords', params.keywords);
		if (params.page) query.set('page', String(params.page));
		if (params.pageSize) query.set('pageSize', String(params.pageSize));
		if (params.fieldOrder) query.set('fieldOrder', params.fieldOrder);
		if (params.orderBy) query.set('orderBy', params.orderBy);
		if (params.fileNodeParentId)
			query.set('fileNodeParentId', params.fileNodeParentId);
		// Add viewMode to URL (but don't use it in API call)
		query.set('viewMode', mode || viewMode);

		router.push(`?${query.toString()}`, { scroll: false });
	};

	const fetchFileNodes = async (params?: GetListFileNodeDto) => {
		if (!params?.fileNodeParentId) return;

		setLoading(true);
		try {
			const { data } = await fileNodeManagerApi.getChildren(
				params.fileNodeParentId,
				params,
			);

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
		} finally {
			setLoading(false);
		}
	};

	const fetchBreadcrumbs = async (folderId: string) => {
		try {
			const { data } = await fileNodeManagerApi.getBreadcrumbs(folderId);

			setBreadcrumbs(data ?? []);
		} catch (err) {
			console.error('Fetch Breadcrumb Error:', err);
		}
	};

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
			(prev) =>
				new GetListFileNodeDto({ ...prev, keywords: value, page: 1 }),
		);
	};

	const handlePageChange = (page: number) => {
		setFolderQuery((prev) => new GetListFileNodeDto({ ...prev, page }));
	};

	const handleSortChange = (field: string, direction: OrderDirection) => {
		setFolderQuery(
			(prev) =>
				new GetListFileNodeDto({
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
				if (!uploadUrl)
					throw new Error('No upload URL received from server');

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
		} catch (error) { }
	};

	const handleRowClick = (row: FileNode) => {
		if (row.type === 'file') {
			setPreviewId(row.id);
			return;
		}

		if (row.type === 'folder') {
			setFolderQuery((prev) => {
				const newQuery = new GetListFileNodeDto({
					...prev,
					fileNodeParentId: row.id,
					page: 1,
				});
				fetchBreadcrumbs(row.id);
				syncQueryToUrl(newQuery);
				return newQuery;
			});
		}
	};

	const handleBreadcrumbClick = (folder: FileNode) => {
		setFolderQuery((prev) => {
			const newQuery = new GetListFileNodeDto({
				...prev,
				fileNodeParentId: folder.id,
				page: 1,
			});
			fetchBreadcrumbs(folder.id);
			syncQueryToUrl(newQuery);
			return newQuery;
		});
	};

	return (
		<Page title="FileNodes" isShowTitle={false}>
			<div className="relative">
				<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
					<Breadcrumbs
						data={breadcrumbs}
						onClick={handleBreadcrumbClick}
					/>
					<div style={{ display: 'flex', gap: '8px' }}>
						<Button
							type={viewMode === 'table' ? 'primary' : 'default'}
							icon={<List size={16} />}
							onClick={() => {
								setViewMode('table');
								syncQueryToUrl(folderQuery, 'table');
							}}
						/>
						<Button
							type={viewMode === 'grid' ? 'primary' : 'default'}
							icon={<LayoutGrid size={16} />}
							onClick={() => {
								setViewMode('grid');
								syncQueryToUrl(folderQuery, 'grid');
							}}
						/>
					</div>
				</div>

				{viewMode === 'table' ? (
					<Table
						data={FileNodes}
						columns={fileNodeConifgsColumnTable}
						onCreateFolder={() => {
							setEditingFolder({
								fileNodeParentId: folderQuery.fileNodeParentId,
							});
							setModalType('folder');
							setShowModal(true);
						}}
						onCreateFile={() => {
							setEditingFolder({
								fileNodeParentId: folderQuery.fileNodeParentId,
							});
							setModalType('file');
							setShowModal(true);
						}}
						onDelete={handleDelete}
						onEdit={handleEdit}
						onSearch={handleSearch}
						pagination={pagination}
						onPageChange={handlePageChange}
						onSortChange={handleSortChange}
						onRowClick={handleRowClick}
						onShare={(row) =>
							setShareModal({ visible: true, fileNodeId: row.id })
						}
						loading={loading}
					/>
				) : (
					<Grid
						data={FileNodes}
						onDelete={handleDelete}
						onEdit={handleEdit}
						onRowClick={handleRowClick}
						onShare={(row) =>
							setShareModal({ visible: true, fileNodeId: row.id })
						}
						loading={loading}
						pagination={pagination}
						onPageChange={handlePageChange}
						onCreateFolder={() => {
							setEditingFolder({
								fileNodeParentId: folderQuery.fileNodeParentId,
							});
							setModalType('folder');
							setShowModal(true);
						}}
						onCreateFile={() => {
							setEditingFolder({
								fileNodeParentId: folderQuery.fileNodeParentId,
							});
							setModalType('file');
							setShowModal(true);
						}}
						onSearch={handleSearch}
						renderCard={(item: FileNode) => (
							<div
								style={{ cursor: item.type === 'file' ? 'pointer' : 'default' }}
								onClick={() => item.type === 'file' && setPreviewId(item.id)}
							>
								{item.type === 'file' ? (
									<GridThumbnail fileNodeId={item.id} fileName={item.name} />
								) : (
									<div style={{
										height: '120px',
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
										background: '#f5f5f5',
										borderRadius: '4px',
										marginBottom: '8px',
										fontSize: '48px'
									}}>
										<Folder size={48} color="#1890ff" />
									</div>
								)}
								<div style={{
									fontWeight: 500,
									overflow: 'hidden',
									textOverflow: 'ellipsis',
									whiteSpace: 'nowrap',
									width: '100%',
									textAlign: 'center'
								}}>
									{item.name}
								</div>
							</div>
						)}
					/>
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

				{previewId && (
					<FilePreview
						fileNodeId={previewId}
						onClose={() => setPreviewId(null)}
					/>
				)}

				{shareModal.visible && (
					<FileNodeShareModal
						visible={shareModal.visible}
						fileNodeId={shareModal.fileNodeId!}
						onClose={() => setShareModal({ visible: false })}
						onAfterSave={async () => {
							await fetchFileNodes(folderQuery);
						}}
					/>
				)}
			</div>
		</Page>
	);
}
