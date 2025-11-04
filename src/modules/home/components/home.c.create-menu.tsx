'use client';

import { FolderPlus, FilePlus, X } from 'lucide-react';
import React from 'react';
import './create-menu.scss';

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
    return (
        <div className="create-menu">
            {/* <div className="create-menu__header">
                <span>Create</span>
                <button onClick={onClose} className="close-btn">
                    <X size={16} />
                </button>
            </div> */}

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
                        <span>Thư mục mới</span>
                    </div>
                    <span className="shortcut">⌃F</span>
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
                        <span>Tải tệp lên</span>
                    </div>
                    <span className="shortcut">⌃U</span>
                </button>
            </div>
        </div>
    );
}
