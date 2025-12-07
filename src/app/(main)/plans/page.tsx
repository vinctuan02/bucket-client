'use client';

import PlanModal from '@/components/modals/modal.plan';
import Page from '@/components/pages/c.page';
import Table from '@/components/tables/c.table';
import { usePermission } from '@/hooks/usePermission';
import { PAGINATION_DEFAULT } from '@/modules/commons/const/common.constant';
import { OrderDirection } from '@/modules/commons/enum/common.enum';
import {
	PermissionAction,
	Resource,
} from '@/modules/permissions/permisson.enum';
import { planApi } from '@/modules/subscription/subscription.api';
import {
	createPlansConfigColumnTable,
	planDefault,
} from '@/modules/subscription/subscription.constant';
import { GetListPlanDto } from '@/modules/subscription/subscription.dto';
import { Plan } from '@/modules/subscription/subscription.entity';
import { PlanFieldMapping } from '@/modules/subscription/subscription.enum';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

export default function PlansPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const { can } = usePermission();

	const [plans, setPlans] = useState<Plan[]>([]);
	const [showModal, setShowModal] = useState(false);
	const [editingPlan, setEditingPlan] = useState<Partial<Plan>>(planDefault);
	const [pagination, setPagination] = useState(PAGINATION_DEFAULT);
	const [loading, setLoading] = useState(false);

	const [planQuery, setplanQuery] = useState<GetListPlanDto>(
		new GetListPlanDto({ fieldOrder: PlanFieldMapping.NAME }),
	);

	// Initialize from URL params
	useEffect(() => {
		const qp = Object.fromEntries(searchParams.entries());
		setplanQuery(
			new GetListPlanDto({
				...qp,
				page: qp.page ? Number(qp.page) : 1,
				pageSize: qp.pageSize ? Number(qp.pageSize) : 20,
				fieldOrder: qp.fieldOrder || PlanFieldMapping.NAME,
				orderBy: (qp.orderBy as OrderDirection) || OrderDirection.ASC,
			}),
		);
	}, []);

	const syncUrlParams = (params: Partial<GetListPlanDto>) => {
		const url = new URLSearchParams(searchParams.toString());
		Object.entries(params).forEach(([key, value]) => {
			if (!value) url.delete(key);
			else url.set(key, String(value));
		});
		router.replace(`?${url.toString()}`, { scroll: false });
	};

	const handleToggleActive = async (id: string, isActive: boolean) => {
		try {
			await planApi.update(id, { isActive });
			fetchPlans(planQuery);
		} catch (err) {
			console.error('Error updating plan:', err);
		}
	};

	const fetchPlans = useCallback(async (params?: GetListPlanDto) => {
		setLoading(true);
		try {
			const data = await planApi.getList(params);
			setPlans((data?.items as Plan[]) ?? []);
			if (data?.metadata) {
				setPagination({
					page: data.metadata.page,
					totalPages: data.metadata.totalPages,
					totalItems: data.metadata.totalItems,
					itemsPerPage: data.metadata.pageSize,
				});
			}
		} catch (err) {
			console.error('Error fetching plans:', err);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		const t = setTimeout(() => fetchPlans(planQuery), 250);
		syncUrlParams(planQuery);
		return () => clearTimeout(t);
	}, [
		planQuery.keywords,
		planQuery.page,
		planQuery.pageSize,
		planQuery.fieldOrder,
		planQuery.orderBy,
	]);

	const handleSave = async (plan: {
		id?: string;
		name: string;
		description?: string;
		storageLimit: number;
		price: number;
		durationDays: number;
		isActive: boolean;
	}) => {
		try {
			const { id, ...rest } = plan;
			if (id) {
				await planApi.update(id, rest);
			} else {
				await planApi.create(rest);
			}
			fetchPlans(planQuery);
			setShowModal(false);
			setEditingPlan(planDefault);
		} catch (err) {
			console.error('Error saving plan:', err);
		}
	};

	const handleEdit = (plan: Plan) => {
		setEditingPlan(plan);
		setShowModal(true);
	};

	const handleDelete = async (id: string) => {
		if (!confirm('Delete this plan?')) return;
		try {
			await planApi.delete(id);
			fetchPlans(planQuery);
		} catch (err) {
			console.error('Error deleting plan:', err);
		}
	};

	const handleSearch = (value: string) => {
		setplanQuery(
			(prev) => new GetListPlanDto({ ...prev, keywords: value }),
		);
	};

	const handlePageChange = (page: number) => {
		setplanQuery((prev) => new GetListPlanDto({ ...prev, page }));
	};

	const handleSortChange = (field: string, direction: OrderDirection) => {
		console.log('handleSortChange called:', { field, direction });
		setplanQuery(
			(prev) =>
				new GetListPlanDto({
					...prev,
					fieldOrder: field,
					orderBy: direction,
					page: 1,
				}),
		);
	};

	return (
		<Page title="Plans" isShowTitle={false}>
			<Table
				data={plans}
				columns={createPlansConfigColumnTable(handleToggleActive)}
				onCreate={
					can(PermissionAction.CREATE, Resource.PLAN)
						? () => setShowModal(true)
						: undefined
				}
				onDelete={
					can(PermissionAction.DELETE, Resource.PLAN)
						? handleDelete
						: undefined
				}
				onEdit={
					can(PermissionAction.UPDATE, Resource.PLAN)
						? handleEdit
						: undefined
				}
				onSearch={handleSearch}
				pagination={pagination}
				onPageChange={handlePageChange}
				onSortChange={handleSortChange}
				loading={loading}
			/>

			{showModal && (
				<PlanModal
					initialData={editingPlan}
					onClose={() => {
						setShowModal(false);
						setEditingPlan(planDefault);
					}}
					onSave={handleSave}
				/>
			)}
		</Page>
	);
}
