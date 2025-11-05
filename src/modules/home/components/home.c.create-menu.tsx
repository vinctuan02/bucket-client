'use client';

import { FolderPlus, FilePlus } from 'lucide-react';
import React from 'react';
import './home.c.create-menu.scss';

interface CreateMenuProps {
    onClose: () => void;
    onCreateFolder?: () => void;
    onCreateFile?: () => void;
}

export default function CreateMenu({
    onClose,
    onCreateFolder,
    onCreateFile,
}: CreateMenuProps) {
    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) onClose();
    };

    return (
        <div className="create-menu-overlay" onClick={handleOverlayClick}>
            <div className="create-menu">
                <div className="create-menu__list">
                    <button
                        className="create-menu__item"
                        onClick={() => {
                            onCreateFolder?.();
                            onClose();
                        }}
                    >
                        <div className="item-left">
                            <FolderPlus size={16} />
                            <span>New folder</span>
                        </div>
                    </button>

                    <button
                        className="create-menu__item"
                        onClick={() => {
                            onCreateFile?.();
                            onClose();
                        }}
                    >
                        <div className="item-left">
                            <FilePlus size={16} />
                            <span>Upload file</span>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
}
