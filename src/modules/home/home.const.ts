import { IConfigTableColumn } from '../commons/interface/common.interface';
import { FileNodeFM } from './home.enum';

export const fileNodeConfigsColumnTable: IConfigTableColumn[] = [
	{ field: 'name', label: 'Name', orderField: FileNodeFM.name },
	{
		field: 'type',
		label: 'Type',
		orderField: FileNodeFM.type,
	},
	{
		label: 'Created At',
		field: 'createdAt',
		orderField: FileNodeFM.createdAt,
		width: 10,
	},
	{
		label: 'Updated At',
		field: 'updatedAt',
		orderField: FileNodeFM.updatedAt,
		width: 10,
	},
];
