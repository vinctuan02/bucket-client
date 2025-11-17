'use client';

import Page from '@/components/pages/c.page';
import Table from '@/components/tables/c.table';
import Grid from '@/components/tables/c.grid';
import GridThumbnail from '@/components/tables/c.grid-thumbnail';
import { PAGINATION_DEFAULT } from '@/modules/commons/const/common.constant';
import { OrderDirection } from '@/modules/commons/enum/common.enum';
import { fileManagerApi, FileNode } from '@/modules/file-manager/file-manager.api';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button, Space, message, Popconfirm } from 'antd';
import { List, LayoutGrid, Folder, RotateCcw, Trash2 } from 'lucide-react';

interface TrashFileNode extends FileNode {
    key: string;
}

interface GetListTrashDto {
    page?: number;
    pageSize?: number;
    keywords?: string;
    fieldOrder?: string;
    orderBy?: OrderDirection;
    fileNodeParentId?: string;
}

export default function TrashPage() {
    const searchParams = useSearchParams();

    const [files, setFiles] = useState<TrashFileNode[]>([]);
    const [pagination, setPagination] = useState(PAGINATION_DEFAULT);
    const [loading, setLoading] = useState(false);
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('grid');
    const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
    const [breadcrumbs, setBreadcrumbs] = useState<TrashFileNode[]>([]);
    const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);

    const [query, setQuery] = useState<GetListTrashDto>({
        page: 1,
        pageSize: 10,
        fileNodeParentId: undefined,
    });

    useEffect(() => {
        const params = Object.fromEntries(searchParams.entries());
        if (params.viewMode === 'table' || params.viewMode === 'grid') {
            setViewMode(params.viewMode);
        }
    }, [searchParams]);

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            fetchTrash();
        }, 250);

        return () => clearTimeout(delayDebounce);
    }, [query.page, query.pageSize, query.keywords, query.fileNodeParentId]);

    const fetchTrash = async () => {
        try {
            setLoading(true);
            const res = await fileManagerApi.getTrash(query);

            const items = res.data?.items?.map((item) => ({
                ...item,
                key: item.id,
            })) || [];

            setFiles(items);

            if (res.data?.metadata) {
                setPagination({
                    page: res.data.metadata.page || 1,
                    totalPages: Math.ceil(
                        (res.data.metadata.totalItems || 0) / (res.data.metadata.limit || 10),
                    ),
                    totalItems: res.data.metadata.totalItems || 0,
                    itemsPerPage: res.data.metadata.limit || 10,
                });
            }
        } catch (error) {
            message.error('Failed to fetch trash');
        } finally {
            setLoading(false);
        }
    };

    const handleFolderClick = (folder: TrashFileNode) => {
        setCurrentFolderId(folder.id);
        setBreadcrumbs([...breadcrumbs, folder]);
        setQuery((prev) => ({
            ...prev,
            fileNodeParentId: folder.id,
            page: 1,
        }));
        setSelectedRowKeys([]);
    };

    const handleBreadcrumbClick = (index: number) => {
        if (index === -1) {
            setCurrentFolderId(null);
            setBreadcrumbs([]);
            setQuery((prev) => ({
                ...prev,
                fileNodeParentId: undefined,
                page: 1,
            }));
        } else {
            const folder = breadcrumbs[index];
            setCurrentFolderId(folder.id);
            setBreadcrumbs(breadcrumbs.slice(0, index + 1));
            setQuery((prev) => ({
                ...prev,
                fileNodeParentId: folder.id,
                page: 1,
            }));
        }
        setSelectedRowKeys([]);
    };

    const handleRestore = async (id: string) => {
        try {
            await fileManagerApi.restore(id);
            message.success('File restored successfully');
            fetchTrash();
            setSelectedRowKeys([]);
        } catch (error) {
            message.error('Failed to restore file');
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await fileManagerApi.deletePermanent(id);
            message.success('File deleted permanently');
            fetchTrash();
            setSelectedRowKeys([]);
        } catch (error) {
            message.error('Failed to delete file');
        }
    };

    const handleRestoreSelected = async () => {
        try {
            setLoading(true);
            await Promise.all(selectedRowKeys.map((id) => fileManagerApi.restore(id)));
            message.success('Files restored successfully');
            fetchTrash();
            setSelectedRowKeys([]);
        } catch (error) {
            message.error('Failed to restore files');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteSelected = async () => {
        try {
            setLoading(true);
            await Promise.all(selectedRowKeys.map((id) => fileManagerApi.deletePermanent(id)));
            message.success('Files deleted permanently');
            fetchTrash();
            setSelectedRowKeys([]);
        } catch (error) {
            message.error('Failed to delete files');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (value: string) => {
        setQuery((prev) => ({ ...prev, keywords: value, page: 1 }));
    };

    const handlePageChange = (page: number) => {
        setQuery((prev) => ({ ...prev, page }));
    };

    const trashColumns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            label: 'name',
            field: 'name',
        },
        {
            title: 'Type',
            dataIndex: 'type',
            key: 'type',
            label: 'type',
            field: 'type',
        },
        {
            title: 'Size',
            dataIndex: 'fileBucket',
            key: 'size',
            label: 'size',
            field: 'size',
            render: (fileBucket: any) => {
                if (!fileBucket) return '-';
                const bytes = fileBucket.fileSize;
                if (bytes === 0) return '0 B';
                const k = 1024;
                const sizes = ['B', 'KB', 'MB', 'GB'];
                const i = Math.floor(Math.log(bytes) / Math.log(k));
                return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
            },
        },
    ];

    const handleRowClick = (row: TrashFileNode) => {
        if (row.type === 'folder') {
            handleFolderClick(row);
        }
    };

    return (
        <Page title="Trash" isShowTitle={false}>
            <div className="relative">
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '16px',
                    }}
                >
                    <div>
                        <h2 style={{ margin: 0 }}>Trash</h2>
                        {breadcrumbs.length > 0 && (
                            <p style={{ margin: '4px 0 0 0', color: '#666', fontSize: '12px' }}>
                                {breadcrumbs.map((b, i) => (
                                    <span key={b.id}>
                                        {i > 0 && ' / '}
                                        <a
                                            onClick={() => handleBreadcrumbClick(i)}
                                            style={{ cursor: 'pointer', color: '#1890ff' }}
                                        >
                                            {b.name}
                                        </a>
                                    </span>
                                ))}
                            </p>
                        )}
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        {selectedRowKeys.length > 0 && (
                            <Space>
                                <span>{selectedRowKeys.length} selected</span>
                                <Button
                                    type="primary"
                                    icon={<RotateCcw size={14} />}
                                    onClick={handleRestoreSelected}
                                    loading={loading}
                                >
                                    Restore
                                </Button>
                                <Popconfirm
                                    title="Delete permanently?"
                                    onConfirm={handleDeleteSelected}
                                    okText="Delete"
                                    cancelText="Cancel"
                                    okButtonProps={{ danger: true }}
                                >
                                    <Button danger icon={<Trash2 size={14} />} loading={loading} />
                                </Popconfirm>
                            </Space>
                        )}
                        <Button
                            type={viewMode === 'table' ? 'primary' : 'default'}
                            icon={<List size={16} />}
                            onClick={() => setViewMode('table')}
                        />
                        <Button
                            type={viewMode === 'grid' ? 'primary' : 'default'}
                            icon={<LayoutGrid size={16} />}
                            onClick={() => setViewMode('grid')}
                        />
                    </div>
                </div>

                {viewMode === 'table' ? (
                    <Table
                        data={files}
                        columns={trashColumns}
                        onRestore={handleRestore}
                        onDelete={handleDelete}
                        onSearch={handleSearch}
                        pagination={pagination}
                        onPageChange={handlePageChange}
                        onRowClick={handleRowClick}
                        loading={loading}
                    />
                ) : (
                    <Grid
                        data={files}
                        onDelete={handleDelete}
                        onSearch={handleSearch}
                        pagination={pagination}
                        onPageChange={handlePageChange}
                        loading={loading}
                        renderCard={(item: TrashFileNode) => {
                            const isSelected = selectedRowKeys.includes(item.id);
                            return (
                                <div
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        height: '100%',
                                        cursor: item.type === 'folder' ? 'pointer' : 'default',
                                        position: 'relative',
                                        padding: '8px',
                                        borderRadius: '8px',
                                        backgroundColor: isSelected ? '#e6f7ff' : 'transparent',
                                    }}
                                    onClick={() => {
                                        if (item.type === 'folder') {
                                            handleFolderClick(item);
                                        }
                                    }}
                                >
                                    {/* Checkbox */}
                                    <div
                                        style={{
                                            position: 'absolute',
                                            top: '8px',
                                            left: '8px',
                                            zIndex: 10,
                                        }}
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() => {
                                                if (isSelected) {
                                                    setSelectedRowKeys(selectedRowKeys.filter((k) => k !== item.id));
                                                } else {
                                                    setSelectedRowKeys([...selectedRowKeys, item.id]);
                                                }
                                            }}
                                            style={{ cursor: 'pointer', width: '18px', height: '18px' }}
                                        />
                                    </div>

                                    {item.type === 'file' ? (
                                        <GridThumbnail fileNodeId={item.id} fileName={item.name} />
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
                                            textAlign: 'center',
                                            marginBottom: '8px',
                                        }}
                                    >
                                        {item.name}
                                    </div>
                                    <div
                                        style={{
                                            display: 'flex',
                                            gap: '4px',
                                            marginTop: 'auto',
                                        }}
                                    >
                                        <Button
                                            type="primary"
                                            size="small"
                                            icon={<RotateCcw size={12} />}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleRestore(item.id);
                                            }}
                                            style={{ flex: 1 }}
                                        />
                                        <Popconfirm
                                            title="Delete permanently?"
                                            onConfirm={() => handleDelete(item.id)}
                                            okText="Delete"
                                            cancelText="Cancel"
                                            okButtonProps={{ danger: true }}
                                        >
                                            <Button
                                                danger
                                                size="small"
                                                icon={<Trash2 size={12} />}
                                                onClick={(e) => e.stopPropagation()}
                                                style={{ flex: 1 }}
                                            />
                                        </Popconfirm>
                                    </div>
                                </div>
                            );
                        }}
                    />
                )}
            </div>
        </Page>
    );
}
