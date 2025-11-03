'use client';

import { OrderDirection } from '@/modules/commons/enum/common.enum';
import {
	IConfigTableColumn,
	PaginationInfo,
} from '@/modules/commons/interface/common.interface';
import {
	ArrowDown,
	ArrowUp,
	ArrowUpDown,
	ChevronLeft,
	ChevronRight,
	Pencil,
	SplinePointer,
	Trash2,
} from 'lucide-react';
import React, { useState } from 'react';
import './c.table.scss';

interface TableProps<T> {
	data: T[];
	columns: IConfigTableColumn[];
	onEdit?: (row: T) => void;
	onDelete?: (id: string) => void;
	onCreate?: () => void;
	onSearch?: (value: string) => void;
	pagination?: PaginationInfo;
	onPageChange?: (page: number) => void;
	onSortChange?: (field: string, direction: OrderDirection) => void;
	onRowClick?: (row: T) => void;
	loading?: boolean;
}

export default function Table<T extends { id?: number | string }>({
	data,
	columns,
	onEdit,
	onDelete,
	onCreate,
	onSearch,
	pagination,
	onPageChange,
	onSortChange,
	onRowClick,
	loading
}: TableProps<T>) {
	const [search, setSearch] = useState('');
	const [fieldOrder, setFieldOrder] = useState('');
	const [orderDirection, setOrderDirection] = useState<OrderDirection>(
		OrderDirection.ASC,
	);

	// search
	const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setSearch(value);
		onSearch?.(value);
	};

	// pagination
	const handlePageChange = (page: number) => {
		if (page >= 1 && page <= (pagination?.totalPages || 1)) {
			onPageChange?.(page);
		}
	};

	// render số trang
	const renderPageNumbers = () => {
		if (!pagination) return null;
		const { page, totalPages } = pagination;
		const pages: (number | string)[] = [];

		if (totalPages <= 7) {
			for (let i = 1; i <= totalPages; i++) pages.push(i);
		} else {
			pages.push(1);
			if (page > 3) pages.push('...');
			const start = Math.max(2, page - 1);
			const end = Math.min(totalPages - 1, page + 1);
			for (let i = start; i <= end; i++) pages.push(i);
			if (page < totalPages - 2) pages.push('...');
			pages.push(totalPages);
		}

		return pages;
	};

	// sort toggle
	const handleSort = (col: IConfigTableColumn) => {
		if (!col.orderField) return;

		let newDirection =
			fieldOrder === col.orderField &&
				orderDirection === OrderDirection.ASC
				? OrderDirection.DESC
				: OrderDirection.ASC;

		setFieldOrder(col.orderField);
		setOrderDirection(newDirection);
		onSortChange?.(col.orderField, newDirection);
	};

	return (
		<div className="table-wrapper">
			{/* Toolbar */}
			<div className="toolbar">
				<input
					type="text"
					placeholder="Search..."
					className="search-input"
					value={search}
					onChange={handleSearchChange}
				/>
				{onCreate && (
					<div className="actions">
						<button className="btn btn-blue" onClick={onCreate}>
							CREATE
						</button>
					</div>
				)}
			</div>

			{/* Table */}
			<div className="table-container">
				<table className="custom-table">
					<thead>
						<tr>
							{columns.map((col) => (
								<th
									key={col.field}
									onClick={() => handleSort(col)}
									className={col.orderField ? 'sortable' : ''}
								>
									<div className="th-content">
										<span>{col.label}</span>
										{col.orderField && (
											<>
												{fieldOrder ===
													col.orderField ? (
													orderDirection ===
														OrderDirection.ASC ? (
														<ArrowUp size={14} />
													) : (
														<ArrowDown size={14} />
													)
												) : (
													<ArrowUpDown size={14} />
												)}
											</>
										)}
									</div>
								</th>
							))}
							{(onEdit || onDelete) && <th></th>}
						</tr>
					</thead>

					<tbody>
						{data?.length ? (
							data.map((row: any) => (
								<tr
									key={row.id}
									className="clickable-row"
									onClick={() => onRowClick?.(row)}
								>
									{columns.map((col) => {
										const value = col.field.split('.').reduce((acc, key) => acc?.[key], row);
										return <td key={col.field}>{value ?? '-'}</td>;
									})}

									{(onEdit || onDelete) && (
										<td className="table__actions" onClick={(e) => e.stopPropagation()}>
											{onEdit && (
												<button
													className="icon-btn edit"
													onClick={() => onEdit(row)}
												>
													<Pencil size={16} />
												</button>
											)}
											{onDelete && (
												<button
													className="icon-btn delete"
													onClick={() => onDelete(row.id!)}
												>
													<Trash2 size={16} />
												</button>
											)}
										</td>
									)}
								</tr>
							))
						) : (
							<tr>
								<td colSpan={columns.length + 1} style={{ textAlign: 'center' }}>No data</td>
							</tr>
						)}
					</tbody>

				</table>

				{loading && (
					<div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center z-10">
						<SplinePointer size={32} />
					</div>
				)}
			</div>

			{/* Pagination */}
			{pagination && (
				<div className="pagination">
					<div className="pagination-info">
						{`${(pagination.page - 1) * pagination.itemsPerPage + 1}-${Math.min(
							pagination.page * pagination.itemsPerPage,
							pagination.totalItems,
						)} / ${pagination.totalItems}`}
					</div>

					<div className="pagination-controls">
						<button
							className="page-btn"
							onClick={() =>
								handlePageChange(pagination.page - 1)
							}
							disabled={pagination.page === 1}
						>
							<ChevronLeft size={18} />
						</button>

						{renderPageNumbers()?.map((page, index) => (
							<button
								key={index}
								className={`page-btn ${page === pagination.page ? 'active' : ''
									} ${page === '...' ? 'dots' : ''}`}
								onClick={() =>
									typeof page === 'number' &&
									handlePageChange(page)
								}
								disabled={page === '...'}
							>
								{page}
							</button>
						))}

						<button
							className="page-btn"
							onClick={() =>
								handlePageChange(pagination.page + 1)
							}
							disabled={pagination.page === pagination.totalPages}
						>
							<ChevronRight size={18} />
						</button>
					</div>
				</div>
			)}
		</div>
	);
}
