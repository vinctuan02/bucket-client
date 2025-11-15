'use client';

import { OrderDirection } from '@/modules/commons/enum/common.enum';
import {
	IConfigTableColumn,
	PaginationInfo,
} from '@/modules/commons/interface/common.interface';
import type { TableProps as AntTableProps } from 'antd';
import { Table as AntTable, Input } from 'antd';
import React, { useState } from 'react';
import './c.table-selector.scss';

interface TableSelectProps<T> {
	data: T[];
	columns: IConfigTableColumn[];
	selectedKeys: string[];
	onSelectChange: (keys: string[]) => void;
	pagination?: PaginationInfo;
	onPageChange?: (page: number) => void;
	onSortChange?: (field: string, direction: OrderDirection) => void;
	onSearch?: (value: string) => void;
}

export default function TableSelect<T extends { id?: string }>({
	data,
	columns,
	selectedKeys,
	onSelectChange,
	pagination,
	onPageChange,
	onSortChange,
	onSearch,
}: TableSelectProps<T>) {
	const [search, setSearch] = useState('');

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
	const antColumns: AntTableProps<T>['columns'] = columns.map((col) => ({
		title: col.label,
		dataIndex: col.field.split('.'),
		key: col.field,
		width: col.width ? `${col.width}%` : undefined,
		sorter: col.orderField ? true : false,
		sortDirections: col.orderField
			? (['ascend', 'descend', 'ascend'] as any)
			: undefined,
		showSorterTooltip: false,
		orderField: col.orderField,
		render: (value: any, record: T) => {
			// Use custom render if provided
			if (col.render) {
				const actualValue = getNestedValue(record, col.field);
				return col.render(actualValue, record);
			}

			const actualValue = getNestedValue(record, col.field);

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
					return dateStr;
				} catch {
					return actualValue;
				}
			}

			return actualValue ?? '-';
		},
	}));

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
				const orderField = (sorter.column as any)?.orderField;
				if (orderField) {
					onSortChange(orderField, direction);
				}
			}
		}
	};

	// Row selection config
	const rowSelection = {
		selectedRowKeys: selectedKeys,
		onChange: (selectedRowKeys: React.Key[]) => {
			onSelectChange(selectedRowKeys as string[]);
		},
	};

	return (
		<div className="table-selector-wrapper">
			{/* Toolbar */}
			<div className="toolbar">
				<Input
					placeholder="Search..."
					className="search-input"
					value={search}
					onChange={handleSearchChange}
					style={{ width: 280 }}
				/>
			</div>

			{/* Ant Design Table */}
			<AntTable<T>
				columns={antColumns}
				dataSource={data}
				rowKey={(record) => record.id as string}
				rowSelection={rowSelection}
				pagination={
					pagination
						? {
								current: pagination.page,
								pageSize: pagination.itemsPerPage,
								total: pagination.totalItems,
								showSizeChanger: false,
								showTotal: (total, range) =>
									`${range[0]}-${range[1]} / ${total}`,
							}
						: false
				}
				onChange={handleTableChange}
			/>
		</div>
	);
}
