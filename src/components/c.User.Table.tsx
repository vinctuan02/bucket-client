"use client";

import React from "react";
import { Pencil, Trash2 } from "lucide-react";
import "./Table.scss";

interface Column {
  label: string; // Tên hiển thị
  field: string; // Đường dẫn trong object, có thể lồng (vd: "creator.name")
}

interface UserTableProps {
  data: Record<string, any>[];
  columns: Column[];
  onEdit?: (item: any) => void;
  onDelete?: (id: number) => void;
}

const getValueByPath = (obj: any, path: string): any => {
  return path.split(".").reduce((acc, key) => (acc ? acc[key] : ""), obj);
};

const UserTable: React.FC<UserTableProps> = ({
  data,
  columns,
  onEdit,
  onDelete,
}) => {
  if (!data || data.length === 0)
    return (
      <div className="text-center text-gray-500 py-10">No data available</div>
    );

  return (
    <div className="table-wrapper">
      <table className="table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.field}>{col.label}</th>
            ))}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.id}>
              {columns.map((col) => (
                <td key={col.field}>
                  {String(getValueByPath(row, col.field) ?? "")}
                </td>
              ))}
              <td className="table__actions">
                <button className="icon-btn edit" onClick={() => onEdit?.(row)}>
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

export default UserTable;
