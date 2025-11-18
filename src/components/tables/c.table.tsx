'use client';

import { OrderDirection } from '@/modules/commons/enum/common.enum';
import {
	IConfigTableColumn,
	PaginationInfo,
} from '@/modules/commons/interface/common.interface';
import CreateMenu from '@/modules/home/components/home.c.create-menu';
import type { TableProps as AntTableProps } from 'antd';
import {
	Pagination as AntPagination,
	Table as AntTable,
	Button,
	Input,
	Tooltip,
} from 'antd';
import { Edit, RotateCcw, Trash, UserPlus } from 'lucide-react';
import React, { useState } from 'react';
import './c.table.scss';

interface TableProps<T> {
	data: T[];
	columns: IConfigTableColumn[];
	onEdit?: (row: T) => void;
	onDelete?: (id: string) => void;
	onShare?: (row: T) => void;
	onRestore?: (id: string) => void;
	onCreate?: () => void;
	onCreateFolder?: () => void;
	onCreateFile?: () => void;
	onSearch?: (value: string) => void;
	pagination?: PaginationInfo;
	onPageChange?: (page: number) => void;
	onSortChange?: (field: string, direction: OrderDirection) => void;
	onRowClick?: (row: T) => void;
	loading?: boolean;
	loadingMore?: boolean;
	showRestore?: boolean;
}

export default function Table<T extends { id?: number | string }>({
	data,
	columns,
	onShare,
	onEdit,
	onDelete,
	onRestore,
	onCreate,
	onCreateFolder,
	onCreateFile,
	onSearch,
	pagination,
	onPageChange,
	onSortChange,
	onRowClick,
	loading,
	loadingMore,
	showRestore,
}: TableProps<T>) {
	const [search, setSearch] = useState('');
	const [showCreateMenu, setShowCreateMenu] = useState(false);

	// search
	const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setSearch(value);
		onSearch?.(value);
	};

	// Helper to get nested value
	const getNestedValue = (obj: any, path: string) => {
		return path.split('.').reduce((acc, key) => acc?.[key], obj);
	};

	// Convert custom columns to Ant Design columns
	const antColumns: AntTableProps<T>['columns'] = [
		...columns.map((col) => ({
			title: col.label,
			dataIndex: col.field.split('.'),
			key: col.field,
			width: col.width ? `${col.width}%` : undefined,
			sorter: col.orderField ? true : false,
			sortDirections: col.orderField
				? (['ascend', 'descend', 'ascend'] as any)
				: undefined,
			showSorterTooltip: false,
			// Store orderField in column for later use
			orderField: col.orderField,
			render: (value: any, record: T) => {
				// Use custom render if provided
				if (col.render) {
					const actualValue = getNestedValue(record, col.field);
					return col.render(actualValue, record);
				}

				// Get value from record using field path
				const actualValue = getNestedValue(record, col.field);

				// Handle boolean values
				if (typeof actualValue === 'boolean') {
					return actualValue ? '✓' : '✗';
				}

				// Handle date values
				if (
					actualValue &&
					(col.field.includes('At') || col.field.includes('Date'))
				) {
					try {
						const date = new Date(actualValue);
						const dateStr = date.toLocaleDateString('vi-VN', {
							year: 'numeric',
							month: '2-digit',
							day: '2-digit',
						});
						const timeStr = date.toLocaleString('vi-VN', {
							year: 'numeric',
							month: '2-digit',
							day: '2-digit',
							hour: '2-digit',
							minute: '2-digit',
							second: '2-digit',
						});
						return <Tooltip title={timeStr}>{dateStr}</Tooltip>;
					} catch {
						return actualValue;
					}
				}

				// Handle file info tooltip for name column
				if (col.field === 'name' && (record as any).fileBucket) {
					const fileInfo = (record as any).fileBucket;
					const fileSizeMB = (
						Number(fileInfo.fileSize) /
						1024 /
						1024
					).toFixed(2);
					const tooltipContent = (
						<div style={{ whiteSpace: 'nowrap' }}>
							<div>
								<strong>Name:</strong> {actualValue}
							</div>
							<div>
								<strong>Size:</strong> {fileSizeMB} MB
							</div>
							<div>
								<strong>Type:</strong> {fileInfo.contentType}
							</div>
						</div>
					);
					return (
						<Tooltip title={tooltipContent}>{actualValue}</Tooltip>
					);
				}

				return actualValue ?? '-';
			},
		})),
		// Actions column
		...(onEdit || onDelete || onShare || onRestore
			? [
					{
						title: '',
						key: 'actions',
						width: 120,
						render: (_: any, record: T) => (
							<div
								className="table__actions"
								onClick={(e) => e.stopPropagation()}
							>
								{showRestore && onRestore && (
									<Tooltip title="Restore">
										<button
											className="icon-btn restore"
											onClick={() =>
												onRestore(record.id as string)
											}
										>
											<RotateCcw size={16} />
										</button>
									</Tooltip>
								)}
								{!showRestore && onEdit && (
									<Tooltip title="Edit">
										<button
											className="icon-btn edit"
											onClick={() => onEdit(record)}
										>
											<Edit size={16} />
										</button>
									</Tooltip>
								)}
								{onDelete && (
									<Tooltip title="Delete">
										<button
											className="icon-btn delete"
											onClick={() =>
												onDelete(record.id as string)
											}
										>
											<Trash size={16} />
										</button>
									</Tooltip>
								)}
								{!showRestore && onShare && (
									<Tooltip title="Share">
										<button
											className="icon-btn share"
											onClick={() => onShare(record)}
										>
											<UserPlus size={16} />
										</button>
									</Tooltip>
								)}
							</div>
						),
					},
				]
			: []),
	];

	// Handle table change (pagination, sorting)
	const handleTableChange: AntTableProps<T>['onChange'] = (
		paginationConfig,
		_filters,
		sorter,
	) => {
		// Handle pagination
		if (paginationConfig.current && onPageChange) {
			onPageChange(paginationConfig.current);
		}

		// Handle sorting
		if (!Array.isArray(sorter) && onSortChange) {
			if (sorter.order) {
				const direction =
					sorter.order === 'ascend'
						? OrderDirection.ASC
						: OrderDirection.DESC;
				// Use orderField from column config, not the dataIndex field
				const orderField = (sorter.column as any)?.orderField;
				console.log('Sort triggered:', {
					sorter,
					orderField,
					direction,
				});
				if (orderField) {
					onSortChange(orderField, direction);
				}
			}
		}
	};

	return (
		<div className="table-wrapper">
			{/* Toolbar */}
			<div className="toolbar">
				<Input
					placeholder="Search..."
					className="search-input"
					value={search}
					onChange={handleSearchChange}
					style={{ width: 280 }}
				/>
				{onCreate && (
					<Button type="primary" onClick={onCreate}>
						CREATE
					</Button>
				)}
				{(onCreateFolder || onCreateFile) && (
					<div style={{ position: 'relative', zIndex: 100 }}>
						<Button
							type="primary"
							onClick={() => setShowCreateMenu(!showCreateMenu)}
						>
							CREATE
						</Button>
						{showCreateMenu && (
							<div
								style={{
									position: 'absolute',
									top: '100%',
									right: 0,
									marginTop: '4px',
									zIndex: 1000,
								}}
							>
								<CreateMenu
									onClose={() => setShowCreateMenu(false)}
									onCreateFolder={() => {
										onCreateFolder?.();
										setShowCreateMenu(false);
									}}
									onCreateFile={() => {
										onCreateFile?.();
										setShowCreateMenu(false);
									}}
								/>
							</div>
						)}
					</div>
				)}
			</div>

			{/* Table Content with Scroll */}
			<div className="table-content">
				<AntTable<T>
					columns={antColumns}
					dataSource={data}
					rowKey={(record) => record.id as string | number}
					loading={loading}
					pagination={false}
					onChange={handleTableChange}
					onRow={(record) => ({
						onClick: () => onRowClick?.(record),
						style: { cursor: onRowClick ? 'pointer' : 'default' },
					})}
				/>
			</div>

			{/* Pagination */}
			{pagination && (
				<div className="ant-pagination">
					<AntPagination
						current={pagination.page}
						pageSize={pagination.itemsPerPage}
						total={pagination.totalItems}
						onChange={onPageChange}
						showSizeChanger={false}
						showTotal={(total: number, range: number[]) =>
							`${range[0]}-${range[1]} / ${total}`
						}
					/>
				</div>
			)}
		</div>
	);
}
