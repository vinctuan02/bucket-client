"use client";

import React, { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import "./c.table.scss";

interface Column {
    label: string;
    field: string;
}

interface TableProps<T> {
    data: T[];
    columns: Column[];
    onEdit?: (row: T) => void;
    onDelete?: (id: string) => void;
    onCreate?: () => void;
    onSearch?: (value: string) => void;
}

export default function Table<T extends { id?: number | string }>({
    data,
    columns,
    onEdit,
    onDelete,
    onCreate,
    onSearch,
}: TableProps<T>) {
    const [search, setSearch] = useState("");

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearch(value);
        onSearch?.(value);
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
            <table className="custom-table">
                <thead>
                    <tr>
                        {columns.map((col) => (
                            <th key={col.field}>{col.label}</th>
                        ))}
                        {(onEdit || onDelete) && <th>Actions</th>}
                    </tr>
                </thead>

                <tbody>
                    {data?.length ? (
                        data.map((row: any) => (
                            <tr key={row.id}>
                                {columns.map((col) => {
                                    const value = col.field
                                        .split(".")
                                        .reduce((acc, key) => acc?.[key], row);
                                    return <td key={col.field}>{value ?? "-"}</td>;
                                })}

                                {(onEdit || onDelete) && (
                                    <td className="table__actions">
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
                            <td colSpan={columns.length + 1} style={{ textAlign: "center" }}>
                                No data
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
