import { IConfigTableColumn } from '@/modules/commons/interface/common.interface';
import { RoleFieldMapping } from './role.enum';

export const rolesConifgsColumnTable: IConfigTableColumn[] = [
	{ field: 'name', label: 'Name', orderField: RoleFieldMapping.NAME },
	{
		field: 'description',
		label: 'Description',
		orderField: RoleFieldMapping.DESCRIPTION,
	},
	{
		label: 'Created At',
		field: 'createdAt',
		orderField: RoleFieldMapping.CREATED_AT,
		width: 10,
	},
	{
		label: 'Updated At',
		field: 'updatedAt',
		orderField: RoleFieldMapping.UPDATED_AT,
		width: 10,
	},
];

export const roleDefault = {
	name: '',
	description: '',
};
