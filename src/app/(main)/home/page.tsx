'use client';

import Page from '@/components/pages/c.page';
import Grid from '@/components/tables/c.grid';
import GridThumbnail from '@/components/tables/c.grid-thumbnail';
import Table from '@/components/tables/c.table';
import { PAGINATION_DEFAULT } from '@/modules/commons/const/common.constant';
import { OrderDirection } from '@/modules/commons/enum/common.enum';
import { fileNodeManagerApi } from '@/modules/home/home.api';
import { fileNodeConfigsColumnTable } from '@/modules/home/home.const';
import { GetListFileNodeDto } from '@/modules/home/home.dto';
import { FileNode } from '@/modules/home/home.entity';

import { authApi } from '@/modules/auth/auth.api';
import FilePreview from '@/modules/commons/components/common.c.read-file';
import FileNodeShareModal from '@/modules/home/components/file-node-permission.c.modal';
import Breadcrumbs from '@/modules/home/components/home.c.breadcrumbs';
import FileNodeModal from '@/modules/home/components/home.c.modal';

import { FileNodeFM } from '@/modules/home/home.enum';
import { Button } from 'antd';
import { Folder, LayoutGrid, List } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

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
	const [gridPageSize, setGridPageSize] = useState(20); // Default grid page size

	// Calculate grid page size based on viewport
	useEffect(() => {
		const calculateGridPageSize = () => {
			const viewportHeight = window.innerHeight;
			const viewportWidth = window.innerWidth;

			// Grid uses minmax(200px, 1fr) with 16px gap
			const minItemWidth = 200;
			const gap = 16;
			const itemHeight = 200; // Approximate height including padding
			const headerHeight = 180; // Header + toolbar + breadcrumbs
			const paginationHeight = 80;
			const padding = 48; // Left/right padding

			const availableHeight =
				viewportHeight - headerHeight - paginationHeight;
			const availableWidth = viewportWidth - padding;

			// Calculate items per row based on minmax(200px, 1fr)
			const itemsPerRow = Math.max(
				Math.floor((availableWidth + gap) / (minItemWidth + gap)),
				1,
			);
			const rows = Math.max(
				Math.floor((availableHeight + gap) / (itemHeight + gap)),
				2,
			);

			const calculatedSize = Math.max(itemsPerRow * rows, 20); // Minimum 20 items
			setGridPageSize(calculatedSize);
		};

		calculateGridPageSize();
		window.addEventListener('resize', calculateGridPageSize);
		return () =>
			window.removeEventListener('resize', calculateGridPageSize);
	}, []);

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

			// Use gridPageSize as default for both table and grid
			setFolderQuery(
				new GetListFileNodeDto({
					...apiParams,
					page: Number(apiParams.page) || 1,
					pageSize: Number(apiParams.pageSize) || gridPageSize,
				}),
			);
		})();
	}, [searchParams, gridPageSize]);

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

	const syncQueryToUrl = (
		params: GetListFileNodeDto,
		mode?: 'table' | 'grid',
	) => {
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

	const handleSave = async (
		data: any,
		onProgress?: (uploadedBytes: number) => void,
	) => {
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

				// Use XMLHttpRequest to track upload progress
				await new Promise<void>((resolve, reject) => {
					const xhr = new XMLHttpRequest();

					xhr.upload.addEventListener('progress', (e) => {
						if (e.lengthComputable) {
							onProgress?.(e.loaded);
						}
					});

					xhr.addEventListener('load', () => {
						if (xhr.status === 200) {
							resolve();
						} else {
							reject(
								new Error(
									`Upload failed with status ${xhr.status}`,
								),
							);
						}
					});

					xhr.addEventListener('error', () => {
						reject(new Error('Upload error'));
					});

					xhr.open('PUT', uploadUrl);
					xhr.setRequestHeader('Content-Type', file.type);
					xhr.send(file);
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
			<div
				className="relative"
				style={{
					display: 'flex',
					flexDirection: 'column',
					height: '100%',
				}}
			>
				<div
					style={{
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'center',
						marginBottom: '16px',
						flexShrink: 0,
					}}
				>
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

				<div style={{ flex: 1, minHeight: 0 }}>
					{viewMode === 'table' ? (
						<Table
							data={FileNodes}
							columns={fileNodeConfigsColumnTable}
							onCreateFolder={() => {
								setEditingFolder({
									fileNodeParentId:
										folderQuery.fileNodeParentId,
								});
								setModalType('folder');
								setShowModal(true);
							}}
							onCreateFile={() => {
								setEditingFolder({
									fileNodeParentId:
										folderQuery.fileNodeParentId,
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
								setShareModal({
									visible: true,
									fileNodeId: row.id,
								})
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
								setShareModal({
									visible: true,
									fileNodeId: row.id,
								})
							}
							loading={loading}
							pagination={pagination}
							onPageChange={handlePageChange}
							onCreateFolder={() => {
								setEditingFolder({
									fileNodeParentId:
										folderQuery.fileNodeParentId,
								});
								setModalType('folder');
								setShowModal(true);
							}}
							onCreateFile={() => {
								setEditingFolder({
									fileNodeParentId:
										folderQuery.fileNodeParentId,
								});
								setModalType('file');
								setShowModal(true);
							}}
							onSearch={handleSearch}
							renderCard={(item: FileNode) => (
								<div
									style={{
										cursor:
											item.type === 'file'
												? 'pointer'
												: 'default',
									}}
									onClick={() =>
										item.type === 'file' &&
										setPreviewId(item.id)
									}
								>
									{item.type === 'file' ? (
										<GridThumbnail
											fileNodeId={item.id}
											fileName={item.name}
										/>
									) : (
										<div
											style={{
												height: '120px',
												display: 'flex',
												alignItems: 'center',
												justifyContent: 'center',
												background: '#f5f5f5',
												borderRadius: '4px',
												marginBottom: '8px',
												fontSize: '48px',
											}}
										>
											<Folder size={48} color="#1890ff" />
										</div>
									)}
									<div
										style={{
											fontWeight: 500,
											overflow: 'hidden',
											textOverflow: 'ellipsis',
											whiteSpace: 'nowrap',
											width: '100%',
											textAlign: 'center',
										}}
									>
										{item.name}
									</div>
								</div>
							)}
						/>
					)}
				</div>

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
