'use client';

import { useEffect, useState } from 'react';
import './modal.scss';
import { FileNode } from '@/modules/home/home.entity';

interface FileNodeModalProps {
    type: 'folder' | 'file';
    initialData?: Partial<FileNode>;
    onClose: () => void;
    onSave: (data: any) => void; // folder -> name, parentId | file -> name, parentId, file
}

export default function FileNodeModal({ type, initialData, onClose, onSave }: FileNodeModalProps) {
    const [name, setName] = useState(initialData?.name ?? '');
    const [file, setFile] = useState<File | null>(null);

    useEffect(() => {
        if (initialData?.name) setName(initialData.name);
    }, [initialData]);

    const handleSubmit = () => {
        if (!name.trim()) return alert('Name is required');

        if (type === 'folder') {
            onSave({ name, fileNodeParentId: initialData?.fileNodeParentId });
        } else {
            if (!file) return alert('Please select a file');
            onSave({ name, fileNodeParentId: initialData?.fileNodeParentId, file });
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) setFile(e.target.files[0]);
    };

    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) onClose();
    };

    return (
        <div className="modal-overlay" onClick={handleOverlayClick}>
            <div className="modal">
                <h2 className="modal__title">{initialData?.id ? 'Edit' : 'Create New'} {type === 'folder' ? 'Folder' : 'File'}</h2>

                <div className="form-row">
                    <div className="form-group full">
                        <label>Name</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder={`Enter ${type} name`} />
                    </div>

                    {type === 'file' && (
                        <div className="form-group full">
                            <label>Choose File</label>
                            <input type="file" onChange={handleFileChange} />
                        </div>
                    )}
                </div>

                <div className="modal__actions">
                    <button className="btn btn-cancel" onClick={onClose}>Cancel</button>
                    <button className="btn btn-blue" onClick={handleSubmit}>Save</button>
                </div>
            </div>
        </div>
    );
}
