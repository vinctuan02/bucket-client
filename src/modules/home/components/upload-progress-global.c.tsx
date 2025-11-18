'use client';

import { useUpload } from '@/modules/home/contexts/upload.context';
import { X, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import './upload-progress-global.c.scss';

export default function GlobalUploadProgress() {
    const { uploads, removeUpload, clearCompleted } = useUpload();
    const [isMinimized, setIsMinimized] = useState(false);

    if (uploads.length === 0) return null;

    return (
        <div className="global-upload-progress">
            <div className="upload-progress-container">
                <div className="upload-progress-header">
                    <h3>Uploads ({uploads.length})</h3>
                    <div className="header-actions">
                        {/* <button
                            className="clear-btn"
                            onClick={clearCompleted}
                            title="Clear completed uploads"
                        >
                            Clear
                        </button> */}
                        <button
                            className="minimize-btn"
                            onClick={() => setIsMinimized(!isMinimized)}
                            title={isMinimized ? 'Expand' : 'Minimize'}
                        >
                            {isMinimized ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                    </div>
                </div>

                {!isMinimized && <div className="upload-progress-list">
                    {uploads.map((upload) => (
                        <div key={upload.id} className="upload-item">
                            <div className="upload-info">
                                <span className="upload-filename">
                                    {upload.fileName}
                                </span>
                                <span className="upload-percent">
                                    {Math.round(upload.progress)}%
                                </span>
                            </div>

                            <div className="upload-bar">
                                <div
                                    className={`upload-fill ${upload.status}`}
                                    style={{
                                        width: `${upload.progress}%`,
                                    }}
                                />
                            </div>

                            <div className="upload-details">
                                <div className="detail-row">
                                    <span className="detail-label">
                                        {upload.uploadedSize} / {upload.totalSize}
                                    </span>
                                    <span className="detail-speed">
                                        {upload.speed}
                                    </span>
                                </div>
                            </div>

                            <div className="upload-status">
                                {upload.status === 'uploading' && (
                                    <span className="status-uploading">
                                        Uploading...
                                    </span>
                                )}
                                {upload.status === 'completed' && (
                                    <span className="status-completed">
                                        ✓ Completed
                                    </span>
                                )}
                                {upload.status === 'error' && (
                                    <span className="status-error">
                                        ✗ Error
                                    </span>
                                )}
                                <button
                                    className="remove-btn"
                                    onClick={() => removeUpload(upload.id)}
                                    title="Remove"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>}
            </div>
        </div>
    );
}
