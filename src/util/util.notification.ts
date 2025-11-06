'use client';

import { message } from 'antd';

export const notifySuccess = (msg: string) => {
	message.success(msg);
};

export const notifyError = (msg: string) => {
	message.error(msg);
};
