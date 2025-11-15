import { Switch } from 'antd';
import { IConfigTableColumn } from '../commons/interface/common.interface';
import { UserFM } from './user.enum';

export const usersConfigsColumnTable: IConfigTableColumn[] = [
	{ field: 'name', label: 'Name', orderField: UserFM.NAME },
	{
		field: 'email',
		label: 'Email',
		orderField: UserFM.EMAIL,
	},
	{
		field: 'isActive',
		label: 'Active',
		orderField: UserFM.IS_ACTIVE,
		render: (value: boolean) => (
			<Switch checked={value} disabled size="small" />
		),
	},
	{
		label: 'Created At',
		field: 'createdAt',
		orderField: UserFM.CREATED_AT,
		width: 10,
	},
	{
		label: 'Updated At',
		field: 'updatedAt',
		orderField: UserFM.UPDATED_AT,
		width: 10,
	},
];
