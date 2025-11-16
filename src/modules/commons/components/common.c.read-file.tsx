"use client";

import { useEffect, useState } from "react";
import { fileNodeManagerApi } from "@/modules/home/home.api";
import { ExternalLink } from "lucide-react";
import "./common.c.read-file.scss";

interface FilePreviewProps {
    fileNodeId?: string;
    file?: File;
    onClose?: () => void;
}

export default function FilePreview({ fileNodeId, file, onClose }: FilePreviewProps) {
    const [url, setUrl] = useState<string | null>(null);
    const [contentType, setContentType] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string>("");

    useEffect(() => {
        if (file) {
            const objectUrl = URL.createObjectURL(file);
            setUrl(objectUrl);
            setContentType(file.type);
            setFileName(file.name);

            return () => URL.revokeObjectURL(objectUrl);
        }

        if (fileNodeId) {
            (async () => {
                try {
                    const res = await fileNodeManagerApi.readFile(fileNodeId);
                    setUrl(res.data?.fileBucket.readUrl ?? "");
                    setContentType(res.data?.fileBucket.contentType ?? "");
                    setFileName(res.data?.fileBucket.fileName ?? "");
                } catch (err) {
                    console.error("Error load preview", err);
                }
            })();
        }
    }, [fileNodeId, file]);

    if (!url) return <div className="file-preview loading">Loading...</div>;

    const type = contentType?.split("/")[0];
    const isImage = type === "image";
    const isVideo = type === "video";
    const isAudio = type === "audio";
    const isPdf = contentType === "application/pdf";
    const isText = contentType?.startsWith("text");

    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onClose?.();
        }
    };

    return (
        <div className="file-preview" onClick={handleOverlayClick}>
            <div className="preview-modal">
                <div className="preview-header">
                    <h3 className="preview-title">{fileName}</h3>
                    <div className="preview-actions">
                        <button
                            className="action-btn open-btn"
                            onClick={() => window.open(url, "_blank")}
                        >
                            <ExternalLink size={14} />
                        </button>

                        {onClose && (
                            <button className="action-btn action-close" onClick={onClose}>
                                ✕
                            </button>
                        )}
                    </div>

                </div>

                <div className="preview-container">
                    {isImage && <img src={url} alt="preview" />}

                    {isVideo && (
                        <video controls autoPlay>
                            <source src={url} type={contentType ?? "video/mp4"} />
                        </video>
                    )}

                    {isAudio && (
                        <audio controls autoPlay>
                            <source src={url} type={contentType ?? "audio/mpeg"} />
                        </audio>
                    )}

                    {isPdf && (
                        <iframe src={url} title="PDF Preview" />
                    )}

                    {isText && (
                        <iframe src={url} title="Text Preview" />
                    )}

                    {!isImage && !isVideo && !isAudio && !isPdf && !isText && (
                        <div className="download-section">
                            <p>Preview not available for this file type</p>
                            <a href={url} download={fileName} className="download-btn">
                                Download {fileName}
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
