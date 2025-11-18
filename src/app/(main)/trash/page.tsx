'use client';

import Page from '@/components/pages/c.page';
import Grid from '@/components/tables/c.grid';
import GridThumbnail from '@/components/tables/c.grid-thumbnail';
import Table from '@/components/tables/c.table';
import { PAGINATION_DEFAULT } from '@/modules/commons/const/common.constant';
import { OrderDirection } from '@/modules/commons/enum/common.enum';
import Breadcrumbs from '@/modules/home/components/home.c.breadcrumbs';
import { fileNodeManagerApi } from '@/modules/home/home.api';
import { fileNodeConfigsColumnTable } from '@/modules/home/home.const';
import { GetListFileNodeDto } from '@/modules/home/home.dto';
import { FileNode } from '@/modules/home/home.entity';
import { Button, message } from 'antd';
import { Folder, LayoutGrid, List } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

export default function TrashPage() {
	const router = useRouter();
	const searchParams = useSearchParams();

	const [fileNodes, setFileNodes] = useState<FileNode[]>([]);
	const [pagination, setPagination] = useState(PAGINATION_DEFAULT);
	const [breadcrumbs, setBreadcrumbs] = useState<FileNode[]>([]);
	const [loading, setLoading] = useState(false);
	const [loadingMore, setLoadingMore] = useState(false);
	const [hasMore, setHasMore] = useState(true);
	const [viewMode, setViewMode] = useState<'table' | 'grid'>('grid');

	const [folderQuery, setFolderQuery] = useState<GetListFileNodeDto>(
		new GetListFileNodeDto({ isDelete: true }),
	);
	const observerTarget = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const params = Object.fromEntries(searchParams.entries());

		// Set viewMode from URL
		if (params.viewMode === 'table' || params.viewMode === 'grid') {
			setViewMode(params.viewMode);
		}

		// Filter out viewMode before creating query
		const { viewMode: _, ...apiParams } = params;

		const newQuery = new GetListFileNodeDto({
			...apiParams,
			isDelete: true,
			page: Number(apiParams.page) || 1,
			pageSize: Number(apiParams.pageSize) || 10,
		});

		setFolderQuery(newQuery);

		// Fetch breadcrumbs on mount if fileNodeParentId exists
		if (newQuery.fileNodeParentId) {
			fetchBreadcrumbs(newQuery.fileNodeParentId);
		} else {
			// Set default "Trash" breadcrumb when no fileNodeParentId
			setBreadcrumbs([{ id: '', name: 'Trash' } as FileNode]);
		}
	}, [searchParams]);

	useEffect(() => {
		const delayDebounce = setTimeout(() => {
			fetchFileNodes(folderQuery);
			syncQueryToUrl(folderQuery);
			// Always fetch breadcrumbs when fileNodeParentId exists
			if (folderQuery.fileNodeParentId) {
				fetchBreadcrumbs(folderQuery.fileNodeParentId);
			} else {
				// Reset breadcrumbs to empty when no fileNodeParentId
				setBreadcrumbs([]);
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
		query.set('viewMode', mode || viewMode);

		router.push(`?${query.toString()}`, { scroll: false });
	};

	const fetchFileNodes = async (
		params?: GetListFileNodeDto,
		append = false,
	) => {
		if (!params?.isDelete) return;

		if (append) {
			setLoadingMore(true);
		} else {
			setLoading(true);
		}

		try {
			// Ensure isDelete is always true for trash
			const queryParams = new GetListFileNodeDto({
				...params,
				isDelete: true,
			});
			const { data } = await fileNodeManagerApi.getTrashedItems(queryParams);

			if (append) {
				setFileNodes((prev) => [...prev, ...(data?.items ?? [])]);
			} else {
				setFileNodes(data?.items ?? []);
			}

			if (data?.metadata) {
				setPagination({
					page: data.metadata.page,
					totalPages: data.metadata.totalPages,
					totalItems: data.metadata.totalItems,
					itemsPerPage: data.metadata.pageSize,
				});
				setHasMore(data.metadata.page < data.metadata.totalPages);
			}
		} catch (err) {
			message.error('Failed to fetch trash');
		} finally {
			setLoading(false);
			setLoadingMore(false);
		}
	};

	const fetchBreadcrumbs = async (folderId: string) => {
		try {
			const { data } = await fileNodeManagerApi.getBreadcrumbs(folderId);
			// Add "Trash" as the first breadcrumb
			if (data?.[0]) {
				data[0].name = 'Trash';
			}

			setBreadcrumbs(data ?? []);
		} catch (err) {
			console.error('Fetch Breadcrumb Error:', err);
		}
	};

	const handleDelete = async (id: string) => {
		if (!confirm('Delete this file permanently?')) return;
		try {
			await fileNodeManagerApi.delete(id);
			fetchFileNodes(folderQuery);
			message.success('File deleted');
		} catch (err) {
			message.error('Error deleting file');
		}
	};

	const handleRestore = async (id: string) => {
		try {
			await fileNodeManagerApi.restore(id);
			fetchFileNodes(folderQuery);
			message.success('File restored');
		} catch (err) {
			message.error('Error restoring file');
		}
	};

	const handleSearch = (value: string) => {
		setFileNodes([]);
		setHasMore(true);
		setFolderQuery(
			(prev) =>
				new GetListFileNodeDto({
					...prev,
					keywords: value,
					page: 1,
					isDelete: true,
				}),
		);
	};

	const handleSortChange = (field: string, direction: OrderDirection) => {
		setFileNodes([]);
		setHasMore(true);
		setFolderQuery(
			(prev) =>
				new GetListFileNodeDto({
					...prev,
					fieldOrder: field as any,
					orderBy: direction,
					page: 1,
					isDelete: true,
				}),
		);
	};

	const handleRowClick = (row: FileNode) => {
		if (row.type === 'folder') {
			setFileNodes([]);
			setHasMore(true);
			setFolderQuery((prev) => {
				const newQuery = new GetListFileNodeDto({
					...prev,
					fileNodeParentId: row.id,
					page: 1,
					isDelete: true,
				});
				fetchBreadcrumbs(row.id);
				syncQueryToUrl(newQuery);
				return newQuery;
			});
		}
	};

	const handleBreadcrumbClick = (folder: FileNode) => {
		setFileNodes([]);
		setHasMore(true);

		setFolderQuery((prev) => {
			const newQuery = new GetListFileNodeDto({
				...prev,
				fileNodeParentId: folder.id,
				page: 1,
				isDelete: true,
			});
			syncQueryToUrl(newQuery);
			return newQuery;
		});
	};

	// Infinite scroll observer
	useEffect(() => {
		if (!hasMore || loading || loadingMore) return;

		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting && folderQuery.isDelete) {
					const nextPage = (pagination.page || 1) + 1;
					const nextQuery = new GetListFileNodeDto({
						...folderQuery,
						page: nextPage,
					});
					fetchFileNodes(nextQuery, true);
				}
			},
			{ threshold: 0.1 },
		);

		const currentTarget = observerTarget.current;
		if (currentTarget) {
			observer.observe(currentTarget);
		}

		return () => {
			if (currentTarget) {
				observer.unobserve(currentTarget);
			}
		};
	}, [hasMore, loading, loadingMore, pagination.page]);

	return (
		<Page title="Trash" isShowTitle={false}>
			<div className="relative">
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

				{viewMode === 'table' ? (
					<Table
						data={fileNodes}
						columns={fileNodeConfigsColumnTable}
						onDelete={handleDelete}
						onRestore={handleRestore}
						onSearch={handleSearch}
						onSortChange={handleSortChange}
						onRowClick={handleRowClick}
						loading={loading}
						loadingMore={loadingMore}
						showRestore={true}
					/>
				) : (
					<Grid
						data={fileNodes}
						onDelete={handleDelete}
						onRestore={handleRestore}
						onRowClick={handleRowClick}
						loading={loading}
						loadingMore={loadingMore}
						onSearch={handleSearch}
						showRestore={true}
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
									console.log(
										'File preview not available in trash',
									)
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

				{/* Infinite scroll trigger */}
				{hasMore && !loading && (
					<div
						ref={observerTarget}
						style={{
							height: '20px',
							margin: '20px 0',
							display: 'flex',
							justifyContent: 'center',
							alignItems: 'center',
						}}
					>
						{loadingMore && <span>Loading more...</span>}
					</div>
				)}
			</div>
		</Page>
	);
}
