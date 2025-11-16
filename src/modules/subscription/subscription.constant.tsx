import { Switch } from 'antd';
import { IConfigTableColumn } from '@/modules/commons/interface/common.interface';
import { PlanFieldMapping } from './subscription.enum';

export const createPlansConfigColumnTable = (
	onToggleActive?: (id: string, isActive: boolean) => void,
): IConfigTableColumn[] => [
		{ field: 'name', label: 'Plan Name', orderField: PlanFieldMapping.NAME },
		{
			field: 'description',
			label: 'Description',
			orderField: PlanFieldMapping.DESCRIPTION,
		},
		{
			field: 'storageLimit',
			label: 'Storage Limit (GB)',
			orderField: PlanFieldMapping.STORAGE_LIMIT,
			width: 12,
		},
		{
			field: 'price',
			label: 'Price (VND)',
			orderField: PlanFieldMapping.PRICE,
			width: 10,
		},
		{
			field: 'durationDays',
			label: 'Duration (Days)',
			orderField: PlanFieldMapping.DURATION_DAYS,
			width: 10,
		},
		{
			field: 'isActive',
			label: 'Active',
			orderField: PlanFieldMapping.IS_ACTIVE,
			width: 8,
			render: (value: boolean, record: any) => (
				<Switch
					checked={value}
					size="small"
					onChange={(checked) => onToggleActive?.(record.id, checked)}
				/>
			),
		},
		{
			label: 'Created At',
			field: 'createdAt',
			orderField: PlanFieldMapping.CREATED_AT,
			width: 10,
		},
	];

export const plansConfigColumnTable: IConfigTableColumn[] = createPlansConfigColumnTable();

export const planDefault = {
	name: '',
	description: '',
	storageLimit: 0,
	price: 0,
	durationDays: 30,
	isActive: true,
};
