'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

export interface UploadItem {
    id: string;
    fileName: string;
    progress: number;
    status: 'uploading' | 'completed' | 'error';
    speed?: string;
    uploadedSize?: string;
    totalSize?: string;
}

interface UploadContextType {
    uploads: UploadItem[];
    addUpload: (item: UploadItem) => void;
    updateUpload: (id: string, updates: Partial<UploadItem>) => void;
    removeUpload: (id: string) => void;
    clearCompleted: () => void;
}

const UploadContext = createContext<UploadContextType | undefined>(undefined);

export function UploadProvider({ children }: { children: React.ReactNode }) {
    const [uploads, setUploads] = useState<UploadItem[]>([]);

    const addUpload = useCallback((item: UploadItem) => {
        setUploads((prev) => [...prev, item]);
    }, []);

    const updateUpload = useCallback((id: string, updates: Partial<UploadItem>) => {
        setUploads((prev) =>
            prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
        );
    }, []);

    const removeUpload = useCallback((id: string) => {
        setUploads((prev) => prev.filter((item) => item.id !== id));
    }, []);

    const clearCompleted = useCallback(() => {
        setUploads((prev) =>
            prev.filter((item) => item.status !== 'completed')
        );
    }, []);

    return (
        <UploadContext.Provider
            value={{ uploads, addUpload, updateUpload, removeUpload, clearCompleted }}
        >
            {children}
        </UploadContext.Provider>
    );
}

export function useUpload() {
    const context = useContext(UploadContext);
    if (!context) {
        throw new Error('useUpload must be used within UploadProvider');
    }
    return context;
}
