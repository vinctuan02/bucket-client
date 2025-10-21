"use client";

import React from "react";
import { Pencil, Trash2 } from "lucide-react";
import "./Table.scss";

interface TableProps {
    data: Record<string, any>[];
    onDelete?: (id: number) => void;
}

const Table: React.FC<TableProps> = ({ data, onDelete }) => {
    if (!data || data.length === 0)
        return <div className="text-center text-gray-500 py-10">No data available</div>;

    const columns = Object.keys(data[0]).filter((col) => col !== "id");

    return (
        <div className="table-wrapper">
            <table className="table">
                <thead>
                    <tr>
                        {columns.map((col) => (
                            <th key={col}>{col}</th>
                        ))}
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((row) => (
                        <tr key={row.id}>
                            {columns.map((col) => (
                                <td key={col}>{String(row[col])}</td>
                            ))}
                            <td className="table__actions">
                                <button className="icon-btn edit">
                                    <Pencil size={16} />
                                </button>
                                <button
                                    className="icon-btn delete"
                                    onClick={() => onDelete?.(row.id)}
                                >
                                    <Trash2 size={16} />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Table;
