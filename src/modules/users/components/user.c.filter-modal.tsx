// src/components/modals/modal.user-filter.tsx
'use client';

import { OrderDirection } from '@/modules/commons/enum/common.enum';
import { Input, Modal, Select } from 'antd';
import { useEffect, useState } from 'react';

export default function UserFilterModal({
	open,
	onClose,
	initialFilter,
	onApply,
}: any) {
	const [filter, setFilter] = useState(initialFilter);

	useEffect(() => {
		setFilter(initialFilter);
	}, [initialFilter]);

	return (
		<Modal
			open={open}
			title="Filter Users"
			onCancel={onClose}
			onOk={() => onApply(filter)}
			okText="Apply"
		>
			<div className="flex flex-col gap-3">
				<Input
					placeholder="Keyword"
					value={filter.keywords || ''}
					onChange={(e) =>
						setFilter({ ...filter, keywords: e.target.value })
					}
				/>
				<Select
					placeholder="Order by"
					value={filter.orderBy}
					onChange={(v) => setFilter({ ...filter, orderBy: v })}
					options={[
						{ label: 'ASC', value: OrderDirection.ASC },
						{ label: 'DESC', value: OrderDirection.DESC },
					]}
				/>
			</div>
		</Modal>
	);
}
