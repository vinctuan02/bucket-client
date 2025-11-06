'use client';

import { useEffect, useState } from 'react';
import { X, Upload } from 'lucide-react';
import './home.c.modal.scss';
import { FileNode } from '@/modules/home/home.entity';
import { message } from 'antd';

interface FileNodeModalProps {
    type: 'folder' | 'file';
    initialData?: Partial<FileNode>;
    onClose: () => void;
    onSave: (data: any) => void;
}

export default function FileNodeModal({ type, initialData, onClose, onSave }: FileNodeModalProps) {
    const [name, setName] = useState(initialData?.name ?? '');
    const [file, setFile] = useState<File | null>(null);

    useEffect(() => {
        if (initialData?.name) setName(initialData.name);
    }, [initialData]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (f) {
            setFile(f);
            if (!name.trim()) setName(f.name);
        }
    };

    const handleSubmit = () => {
        if (!name.trim()) return message.warning('Name is required');
        if (type === 'file' && !file) return message.warning('Please select a file');

        onSave({
            name,
            fileNodeParentId: initialData?.fileNodeParentId,
            ...(type === 'file' ? { file } : {}),
        });
    };

    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) onClose();
    };

    return (
        <div className="modal-overlay" onClick={handleOverlayClick}>
            <div className="modal">
                <h2 className="modal__title">
                    {initialData?.id ? 'Edit' : 'Create New'} {type === 'folder' ? 'Folder' : 'File'}
                </h2>

                <div className="form-row">
                    <div className="form-group full">
                        <label>Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder={`Enter ${type} name`}
                        />
                    </div>

                    {type === 'file' && (
                        <div className="form-group full">
                            <label>Upload File</label>
                            {file ? (
                                <div className="file-preview-u">
                                    <span className="file-name">{file.name}</span>
                                    <button
                                        className="file-remove"
                                        onClick={() => {
                                            setFile(null);
                                            setName('');
                                        }}
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ) : (
                                <label className="upload-box">
                                    <Upload size={18} />
                                    <span>Click to choose file</span>
                                    <input type="file" onChange={handleFileChange} />
                                </label>
                            )}
                        </div>
                    )}
                </div>

                <div className="modal__actions">
                    <button className="btn btn-cancel" onClick={onClose}>
                        Cancel
                    </button>
                    <button className="btn btn-blue" onClick={handleSubmit}>
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
}
