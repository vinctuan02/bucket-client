'use client';

import { useEffect, useState } from 'react';
import { fileNodeManagerApi } from '@/modules/home/home.api';
import './c.grid-thumbnail.scss';
import { File } from 'lucide-react';

interface GridThumbnailProps {
    fileNodeId: string;
    fileName: string;
}

export default function GridThumbnail({ fileNodeId, fileName }: GridThumbnailProps) {
    const [url, setUrl] = useState<string | null>(null);
    const [contentType, setContentType] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            try {
                const res = await fileNodeManagerApi.readFile(fileNodeId);
                setUrl(res.data?.fileBucket.readUrl ?? "");
                setContentType(res.data?.fileBucket.contentType ?? "");
            } catch (err) {
                console.error("Error load thumbnail", err);
            }
        })();
    }, [fileNodeId]);

    if (!url) return <div className="thumbnail-placeholder">Loading...</div>;

    const type = contentType?.split("/")[0];
    const isImage = type === "image";
    const isVideo = type === "video";
    const isPdf = contentType === "application/pdf";

    return (
        <div className="thumbnail-container">
            {isImage && (
                <img src={url} alt={fileName} className="thumbnail-image" />
            )}

            {isVideo && (
                <video className="thumbnail-video">
                    <source src={url} type={contentType ?? "video/mp4"} />
                </video>
            )}

            {isPdf && (
                <div className="thumbnail-pdf">
                    <iframe src={url} title="PDF Thumbnail" />
                </div>
            )}

            {!isImage && !isVideo && !isPdf && (
                <div className="thumbnail-placeholder">
                    <File size={48} />
                </div>
            )}
        </div>
    );
}
