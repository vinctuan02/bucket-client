'use client';
import React from 'react';
import { Button, Space } from 'antd';
import { notify } from '@/modules/commons/const/common.const.notifi';

const DemoPage: React.FC = () => {
    const success = () => notify.success('This is a success message');
    const error = () => notify.error('This is an error message');
    const warning = () => notify.warning('This is a warning message');

    return (
        <Space>
            <Button onClick={success}>Success</Button>
            <Button onClick={error}>Error</Button>
            <Button onClick={warning}>Warning</Button>
        </Space>
    );
};

export default DemoPage;
