"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight, ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import { OrderDirection } from "@/modules/commons/common.enum";
import { IConfigTableColumn, PaginationInfo } from "@/modules/commons/common.interface";

interface TableSelectProps<T> {
    data: T[];
    columns: IConfigTableColumn[];
    selectedKeys: (string)[];
    onSelectChange: (keys: (string)[]) => void;
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
    const [search, setSearch] = useState("");
    const [fieldOrder, setFieldOrder] = useState("");
    const [orderDirection, setOrderDirection] = useState<OrderDirection>(OrderDirection.ASC);

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

    // sort
    const handleSort = (col: IConfigTableColumn) => {
        if (!col.orderField) return;
        const newDirection =
            fieldOrder === col.orderField && orderDirection === OrderDirection.ASC
                ? OrderDirection.DESC
                : OrderDirection.ASC;

        setFieldOrder(col.orderField);
        setOrderDirection(newDirection);
        onSortChange?.(col.orderField, newDirection);
    };

    // select
    const handleSelectRow = (id: string) => {
        const newSelected = selectedKeys.includes(id)
            ? selectedKeys.filter((k) => k !== id)
            : [...selectedKeys, id];
        onSelectChange(newSelected);
    };

    const handleSelectAll = () => {
        if (selectedKeys.length === data.length) onSelectChange([]);
        else onSelectChange(data.map((d) => d.id!));
    };

    // render page numbers
    const renderPageNumbers = () => {
        if (!pagination) return null;
        const { currentPage, totalPages } = pagination;
        const pages: (number | string)[] = [];

        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);
            if (currentPage > 3) pages.push("...");
            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);
            for (let i = start; i <= end; i++) pages.push(i);
            if (currentPage < totalPages - 2) pages.push("...");
            pages.push(totalPages);
        }
        return pages;
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
            </div>

            {/* Table */}
            <div className="table-container">
                <table className="custom-table">
                    <thead>
                        <tr>
                            <th style={{ width: 40 }}>
                                <input
                                    type="checkbox"
                                    checked={selectedKeys.length === data.length && data.length > 0}
                                    onChange={handleSelectAll}
                                />
                            </th>
                            {columns.map((col) => (
                                <th
                                    key={col.field}
                                    onClick={() => handleSort(col)}
                                    className={col.orderField ? "sortable" : ""}
                                >
                                    <div className="th-content">
                                        <span>{col.label}</span>
                                        {col.orderField && (
                                            <>
                                                {fieldOrder === col.orderField ? (
                                                    orderDirection === OrderDirection.ASC ? (
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
                        </tr>
                    </thead>

                    <tbody>
                        {data?.length ? (
                            data.map((row: any) => (
                                <tr
                                    key={row.id}
                                    className={selectedKeys.includes(row.id) ? "selected" : ""}
                                    onClick={() => handleSelectRow(row.id!)}
                                >
                                    <td>
                                        <input
                                            type="checkbox"
                                            checked={selectedKeys.includes(row.id!)}
                                            onChange={() => handleSelectRow(row.id!)}
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                    </td>
                                    {columns.map((col) => {
                                        const value = col.field.split(".").reduce((acc, key) => acc?.[key], row);
                                        return <td key={col.field}>{value ?? "-"}</td>;
                                    })}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={columns.length + 1} style={{ textAlign: "center" }}>
                                    No data
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {pagination && (
                <div className="pagination">
                    <div className="pagination-info">
                        {`${(pagination.currentPage - 1) * pagination.itemsPerPage + 1}-${Math.min(
                            pagination.currentPage * pagination.itemsPerPage,
                            pagination.totalItems
                        )} / ${pagination.totalItems}`}
                    </div>

                    <div className="pagination-controls">
                        <button
                            className="page-btn"
                            onClick={() => handlePageChange(pagination.currentPage - 1)}
                            disabled={pagination.currentPage === 1}
                        >
                            <ChevronLeft size={18} />
                        </button>

                        {renderPageNumbers()?.map((page, index) => (
                            <button
                                key={index}
                                className={`page-btn ${page === pagination.currentPage ? "active" : ""} ${page === "..." ? "dots" : ""
                                    }`}
                                onClick={() => typeof page === "number" && handlePageChange(page)}
                                disabled={page === "..."}
                            >
                                {page}
                            </button>
                        ))}

                        <button
                            className="page-btn"
                            onClick={() => handlePageChange(pagination.currentPage + 1)}
                            disabled={pagination.currentPage === pagination.totalPages}
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
