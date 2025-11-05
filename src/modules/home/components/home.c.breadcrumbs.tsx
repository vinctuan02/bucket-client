import { ChevronRight } from "lucide-react";
import React from "react";
import "./home.c.breadcrumbs.scss";
import { FileNode } from "../home.entity";

interface BreadcrumbsProps {
    data: FileNode[];
    onClick: (item: FileNode) => void;
}

export default function Breadcrumbs({ data, onClick }: BreadcrumbsProps) {
    return (
        <nav className="breadcrumbs">
            <div className="breadcrumbs-list">
                {data.map((item, index) => (
                    <div key={item.id} className="breadcrumbs-item">
                        <button
                            className={`crumb ${index === data.length - 1 ? "active" : ""
                                }`}
                            onClick={() => onClick(item)}
                        >
                            {item.name}
                        </button>

                        {index < data.length - 1 && (
                            <ChevronRight className="separator" size={14} />
                        )}
                    </div>
                ))}
            </div>
        </nav>
    );
}
