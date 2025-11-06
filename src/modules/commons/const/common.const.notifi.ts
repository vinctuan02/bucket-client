import { message } from 'antd';

export const notify = {
	success: (content: string) => message.success({ content, duration: 2 }),
	error: (content: string) => message.error({ content, duration: 3 }),
	warning: (content: string) => message.warning({ content, duration: 2 }),
};
