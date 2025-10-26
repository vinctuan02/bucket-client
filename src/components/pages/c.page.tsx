"use client";

import React from "react";
import "./c.page.scss";

interface PageWrapperProps {
    title: string;
    isShowTitle?: boolean;
    children: React.ReactNode;
}

export default function Page({
    title,
    isShowTitle = true,
    children,
}: PageWrapperProps) {
    return (
        <div className="page-wrapper">
            {isShowTitle && <a className="page-title">{title}</a>}
            <div className="page-content">{children}</div>
        </div>
    );
}
