'use client';
import React, { useEffect, useState, useRef } from 'react';
import { Checkbox, Input, Button } from 'antd';
import { userApi } from '@/modules/users/user.api';
import { UpsertFileNodePermissionDto } from '../home.dto';
import { User } from '@/modules/users/user.entity';
import { GetListUserDto } from '@/modules/users/user.dto';
import './file-node-permission.c.modal.scss';

interface Props {
    fileNodeId: string;
    visible: boolean;
    onClose: () => void;
    onSave: (permissions: UpsertFileNodePermissionDto[]) => void;
}

interface UserRow extends User {
    canView: boolean;
    canEdit: boolean;
    canDelete: boolean;
    canUpload: boolean;
    canShare: boolean;
}

export default function FileNodeShareModal({ fileNodeId, visible, onClose, onSave }: Props) {
    const [users, setUsers] = useState<UserRow[]>([]); // user đã chọn
    const [searchResults, setSearchResults] = useState<User[]>([]); // kết quả tìm
    const [search, setSearch] = useState('');
    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    // mở modal reset
    useEffect(() => {
        if (visible) {
            setUsers([]);
            setSearch('');
            setSearchResults([]);
        }
    }, [visible]);

    // debounce search
    useEffect(() => {
        if (!search.trim()) {
            setSearchResults([]);
            return;
        }

        if (debounceRef.current) clearTimeout(debounceRef.current);

        debounceRef.current = setTimeout(async () => {
            try {
                const params = new GetListUserDto({ keywords: search });
                const res = await userApi.getListSimple(params);
                const data = res?.data?.items ?? [];

                // lọc những user đã chọn rồi
                const filtered = data.filter(u => !users.some(su => su.id === u.id));
                setSearchResults(filtered);
            } catch (err) {
                console.error(err);
                setSearchResults([]);
            }
        }, 500);

        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [search, users]);

    const handleAddUser = (user: User) => {
        const newUser: UserRow = {
            ...user,
            canView: true,
            canEdit: true,
            canDelete: true,
            canUpload: true,
            canShare: true,
        };
        setUsers(prev => [...prev, newUser]);
        setSearchResults(prev => prev.filter(u => u.id !== user.id));
    };

    const handleRemoveUser = (userId: string) => {
        setUsers(prev => prev.filter(u => u.id !== userId));
    };

    const handleCheck = (userId: string, field: keyof UserRow, value: boolean) => {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, [field]: value } : u));
    };

    const handleSave = () => {
        const permissions: UpsertFileNodePermissionDto[] = users.map(u => ({
            fileNodeId,
            userId: u.id,
            canView: u.canView,
            canEdit: u.canEdit,
            canDelete: u.canDelete,
            canUpload: u.canUpload,
            canShare: u.canShare,
        }));
        onSave(permissions);
        onClose();
    };

    if (!visible) return null;

    return (
        <div className="modal-backdrop">
            <div className="modal">
                <div className="modal-header">
                    {/* <h3>Share File</h3> */}
                    {/* <button onClick={onClose}>×</button> */}
                </div>

                <div className="modal-body">
                    <Input
                        placeholder="Search user..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />

                    {searchResults.length > 0 && (
                        <div className="search-results">
                            {searchResults.map(user => (
                                <div key={user.id} className="search-result">
                                    <span>{user.name} ({user.email})</span>
                                    <Button size="small" onClick={() => handleAddUser(user)}>Add</Button>
                                </div>
                            ))}
                        </div>
                    )}

                    {users.length > 0 ? (
                        <table className="permission-table">
                            <thead>
                                <tr>
                                    <th>User</th>
                                    <th>Email</th>
                                    <th>View</th>
                                    <th>Edit</th>
                                    <th>Delete</th>
                                    <th>Upload</th>
                                    <th>Share</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(user => (
                                    <tr key={user.id}>
                                        <td>{user.name}</td>
                                        <td>{user.email}</td>
                                        <td><Checkbox checked={user.canView} onChange={e => handleCheck(user.id, 'canView', e.target.checked)} /></td>
                                        <td><Checkbox checked={user.canEdit} onChange={e => handleCheck(user.id, 'canEdit', e.target.checked)} /></td>
                                        <td><Checkbox checked={user.canDelete} onChange={e => handleCheck(user.id, 'canDelete', e.target.checked)} /></td>
                                        <td><Checkbox checked={user.canUpload} onChange={e => handleCheck(user.id, 'canUpload', e.target.checked)} /></td>
                                        <td><Checkbox checked={user.canShare} onChange={e => handleCheck(user.id, 'canShare', e.target.checked)} /></td>
                                        <td>
                                            <Button size="small" danger onClick={() => handleRemoveUser(user.id)}>Remove</Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="no-users">No users selected</div>
                    )}
                </div>

                <div className="modal-footer">
                    <button className="btn btn-gray" onClick={onClose}>Cancel</button>
                    <button className="btn btn-blue" onClick={handleSave}>Save</button>
                </div>
            </div>
        </div>
    );
}
