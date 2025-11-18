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

import FilePreview from '@/modules/commons/components/common.c.read-file';
import FileNodeShareModal from '@/modules/home/components/file-node-permission.c.modal';
import Breadcrumbs from '@/modules/home/components/home.c.breadcrumbs';
import { FileNodeFM } from '@/modules/home/home.enum';
import { Button } from 'antd';
import { Folder, LayoutGrid, List } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ShareWithMePage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [FileNodes, setFileNodes] = useState<FileNode[]>([]);
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
    const [gridPageSize, setGridPageSize] = useState(20);

    // Calculate grid page size based on viewport
    useEffect(() => {
        const calculateGridPageSize = () => {
            const viewportHeight = window.innerHeight;
            const viewportWidth = window.innerWidth;

            const minItemWidth = 200;
            const gap = 16;
            const itemHeight = 200;
            const headerHeight = 180;
            const paginationHeight = 80;
            const padding = 48;

            const availableHeight =
                viewportHeight - headerHeight - paginationHeight;
            const availableWidth = viewportWidth - padding;

            const itemsPerRow = Math.max(
                Math.floor((availableWidth + gap) / (minItemWidth + gap)),
                1,
            );
            const rows = Math.max(
                Math.floor((availableHeight + gap) / (itemHeight + gap)),
                2,
            );

            const calculatedSize = Math.max(itemsPerRow * rows, 20);
            setGridPageSize(calculatedSize);
        };

        calculateGridPageSize();
        window.addEventListener('resize', calculateGridPageSize);
        return () =>
            window.removeEventListener('resize', calculateGridPageSize);
    }, []);

    useEffect(() => {
        const params = Object.fromEntries(searchParams.entries());

        if (params.viewMode === 'table' || params.viewMode === 'grid') {
            setViewMode(params.viewMode);
        }

        const { viewMode: _, ...apiParams } = params;

        setFolderQuery(
            new GetListFileNodeDto({
                ...apiParams,
                page: Number(apiParams.page) || 1,
                pageSize: Number(apiParams.pageSize) || gridPageSize,
            }),
        );
    }, [searchParams, gridPageSize]);

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            fetchSharedWithMeFileNodes(folderQuery);
            syncQueryToUrl(folderQuery);
            if (folderQuery.fileNodeParentId) {
                fetchBreadcrumbs(folderQuery.fileNodeParentId);
            } else {
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

    const fetchSharedWithMeFileNodes = async (params?: GetListFileNodeDto) => {
        setLoading(true);
        try {
            const { data } = await fileNodeManagerApi.getSharedWithMe(params);

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
            console.error('Error fetching shared with me:', err);
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

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this FileNode?')) return;
        try {
            await fileNodeManagerApi.delete(id);
            fetchSharedWithMeFileNodes(folderQuery);
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
        <Page title="Shared With Me" isShowTitle={false}>
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
                            onDelete={handleDelete}
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
                            await fetchSharedWithMeFileNodes(folderQuery);
                        }}
                    />
                )}
            </div>
        </Page>
    );
}
