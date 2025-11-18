'use client';

import { PaginationInfo } from '@/modules/commons/interface/common.interface';
import CreateMenu from '@/modules/home/components/home.c.create-menu';
import {
	Pagination as AntPagination,
	Button,
	Input,
	Skeleton,
	Tooltip,
} from 'antd';
import { Edit, Trash, UserPlus } from 'lucide-react';
import React, { useState } from 'react';
import './c.grid.scss';

interface GridProps<T> {
	data: T[];
	onEdit?: (row: T) => void;
	onDelete?: (id: string) => void;
	onShare?: (row: T) => void;
	onRowClick?: (row: T) => void;
	loading?: boolean;
	renderCard?: (item: T) => React.ReactNode;
	pagination?: PaginationInfo;
	onPageChange?: (page: number) => void;
	onCreateFolder?: () => void;
	onCreateFile?: () => void;
	onSearch?: (value: string) => void;
}

export default function Grid<
	T extends { id?: number | string; name?: string },
>({
	data,
	onEdit,
	onDelete,
	onShare,
	onRowClick,
	loading,
	renderCard,
	pagination,
	onPageChange,
	onCreateFolder,
	onCreateFile,
	onSearch,
}: GridProps<T>) {
	const [search, setSearch] = useState('');
	const [showCreateMenu, setShowCreateMenu] = useState(false);

	const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setSearch(value);
		onSearch?.(value);
	};
	if (loading) {
		return (
			<div className="grid-wrapper">
				<div className="grid-container">
					{[...Array(6)].map((_, i) => (
						<div key={i} className="grid-item">
							<Skeleton active paragraph={{ rows: 3 }} />
						</div>
					))}
				</div>
			</div>
		);
	}

	return (
		<div className="grid-wrapper">
			{/* Toolbar */}
			<div className="toolbar">
				<Input
					placeholder="Search..."
					className="search-input"
					value={search}
					onChange={handleSearchChange}
					style={{ width: 280 }}
				/>
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

			{/* Grid Content with Scroll */}
			<div className="grid-content">
				<div className="grid-container">
					{data.map((item) => (
						<div
							key={item.id}
							className="grid-item"
							onClick={() => onRowClick?.(item)}
						>
							<div className="grid-card">
								{renderCard ? (
									renderCard(item)
								) : (
									<div className="grid-card-default">
										<div className="grid-card-icon">📄</div>
										<div className="grid-card-name">
											{(item as any).name || 'Unnamed'}
										</div>
									</div>
								)}

								<div
									className="grid-card-actions"
									onClick={(e) => e.stopPropagation()}
								>
									{onEdit && (
										<Tooltip title="Edit">
											<button
												className="icon-btn edit"
												onClick={() => onEdit(item)}
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
													onDelete(item.id as string)
												}
											>
												<Trash size={16} />
											</button>
										</Tooltip>
									)}
									{onShare && (
										<Tooltip title="Share">
											<button
												className="icon-btn share"
												onClick={() => onShare(item)}
											>
												<UserPlus size={16} />
											</button>
										</Tooltip>
									)}
								</div>
							</div>
						</div>
					))}
				</div>

				{data.length === 0 && (
					<div className="grid-empty">
						<p>Empty</p>
					</div>
				)}
			</div>

			{/* Pagination */}
			{pagination && onPageChange && (
				<div className="grid-pagination">
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
