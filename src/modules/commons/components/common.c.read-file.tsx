"use client";

import { useEffect, useState } from "react";
import { fileNodeManagerApi } from "@/modules/home/home.api";
import "./common.c.read-file.scss";

interface FilePreviewProps {
    fileNodeId?: string;
    file?: File;
    onClose?: () => void;
}

export default function FilePreview({ fileNodeId, file, onClose }: FilePreviewProps) {
    const [url, setUrl] = useState<string | null>(null);
    const [contentType, setContentType] = useState<string | null>(null);

    useEffect(() => {
        if (file) {
            // Nếu có file local => tạo URL tạm để preview
            const objectUrl = URL.createObjectURL(file);
            setUrl(objectUrl);
            setContentType(file.type);

            return () => URL.revokeObjectURL(objectUrl);
        }

        if (fileNodeId) {
            // Nếu có fileNodeId => lấy từ API
            (async () => {
                try {
                    const res = await fileNodeManagerApi.readFile(fileNodeId);
                    setUrl(res.data?.fileBucket.readUrl ?? "");
                    setContentType(res.data?.fileBucket.contentType ?? "");
                } catch (err) {
                    console.error("Error load preview", err);
                }
            })();
        }
    }, [fileNodeId, file]);

    if (!url) return <div className="file-preview loading">Loading...</div>;

    const type = contentType?.split("/")[0];

    return (
        <div className="file-preview">
            <div className="preview-container">
                {type === "image" && <img src={url} alt="preview" />}

                {type === "video" && (
                    <video controls autoPlay>
                        <source src={url} type={contentType ?? "video/mp4"} />
                    </video>
                )}

                {contentType === "application/pdf" && (
                    <iframe src={url} title="PDF Preview" />
                )}

                {contentType?.startsWith("text") && (
                    <iframe src={url} title="Text Preview" />
                )}

                {!["image", "video"].includes(type ?? "") &&
                    contentType !== "application/pdf" &&
                    !contentType?.startsWith("text") && (
                        <div className="unknown">
                            <p>Can’t preview this file.</p>
                            <a href={url} download>Download</a>
                        </div>
                    )}
            </div>

            {onClose && (
                <button className="close-btn" onClick={onClose}>
                    ✕
                </button>
            )}
        </div>
    );
}
