'use client';

import { planDefault } from '@/modules/subscription/subscription.constant';
import { Plan } from '@/modules/subscription/subscription.entity';
import { message } from 'antd';
import { useEffect, useState } from 'react';
import './modal.scss';

interface PlanModalProps {
    initialData: Partial<Plan>;
    onClose: () => void;
    onSave: (plan: {
        id?: string;
        name: string;
        description?: string;
        storageLimit: number;
        price: number;
        durationDays: number;
        isActive: boolean;
    }) => void;
}

export default function PlanModal({
    initialData,
    onClose,
    onSave,
}: PlanModalProps) {
    const [form, setForm] = useState<Partial<Plan>>(planDefault);

    useEffect(() => {
        if (initialData?.id) {
            setForm(initialData);
        } else {
            setForm(planDefault);
        }
    }, [initialData]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        const { name, value, type } = e.target as HTMLInputElement;
        setForm((prev) => ({
            ...prev,
            [name]:
                type === 'number'
                    ? value === '' || value === '0'
                        ? ''
                        : Number(value)
                    : type === 'checkbox'
                        ? (e.target as HTMLInputElement).checked
                        : value,
        }));
    };

    const formatPrice = (value: number | string | undefined): string => {
        if (!value || value === '') return '';
        const num = typeof value === 'string' ? parseInt(value, 10) : value;
        if (isNaN(num)) return '';
        return num.toLocaleString('vi-VN');
    };

    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, '');
        setForm((prev) => ({
            ...prev,
            price: value === '' ? 0 : Number(value),
        }));
    };

    const handleSubmit = () => {
        const { name, storageLimit, price, durationDays } = form;

        if (!name?.trim()) {
            message.warning('Please enter plan name.');
            return;
        }

        if (storageLimit === undefined || storageLimit <= 0) {
            message.warning('Storage limit must be greater than 0.');
            return;
        }

        if (price === undefined || price < 0) {
            message.warning('Price cannot be negative.');
            return;
        }

        if (durationDays === undefined || durationDays <= 0) {
            message.warning('Duration must be greater than 0.');
            return;
        }

        onSave({
            id: form.id,
            name,
            description: form.description || '',
            storageLimit,
            price,
            durationDays,
            isActive: form.isActive ?? true,
        });
    };

    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) onClose();
    };

    return (
        <div className="modal-overlay" onClick={handleOverlayClick}>
            <div className="modal">
                <h2 className="modal__title">
                    {initialData?.id ? 'Edit Plan' : 'Create Plan'}
                </h2>

                <div className="modal__content">
                    <div className="form-row">
                        <div className="form-group">
                            <label>Plan Name *</label>
                            <input
                                name="name"
                                type="text"
                                value={form.name ?? ''}
                                onChange={handleChange}
                                placeholder="e.g., Premium 200GB"
                            />
                        </div>
                        <div className="form-group">
                            <label>Description</label>
                            <textarea
                                name="description"
                                value={form.description ?? ''}
                                onChange={handleChange}
                                placeholder="Enter plan description"
                                rows={3}
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Storage Limit (GB) *</label>
                            <input
                                name="storageLimit"
                                type="number"
                                value={
                                    form.storageLimit
                                        ? form.storageLimit / (1024 * 1024 * 1024)
                                        : ''
                                }
                                onChange={(e) => {
                                    const gb = Number(e.target.value);
                                    setForm((prev) => ({
                                        ...prev,
                                        storageLimit: gb * (1024 * 1024 * 1024),
                                    }));
                                }}
                                placeholder="e.g., 200"
                                min="1"
                            />
                        </div>
                        <div className="form-group">
                            <label>Price (VND) *</label>
                            <input
                                name="price"
                                type="text"
                                value={formatPrice(form.price)}
                                onChange={handlePriceChange}
                                placeholder="e.g., 99,000"
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Duration (Days) *</label>
                            <input
                                name="durationDays"
                                type="number"
                                value={form.durationDays ?? ''}
                                onChange={handleChange}
                                placeholder="e.g., 30"
                                min="1"
                            />
                        </div>
                        <div className="form-group checkbox">
                            <label>
                                <input
                                    name="isActive"
                                    type="checkbox"
                                    checked={form.isActive ?? true}
                                    onChange={handleChange}
                                />
                                Active
                            </label>
                        </div>
                    </div>
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
