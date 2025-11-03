import { FILED_ORDER_DEFAULT } from '../const/common.constant';
import { OrderDirection } from '../enum/common.enum';

export abstract class BaseQueryDto {
	keywords?: string;
	page: number = 1;
	pageSize: number = 20;
	fieldOrder: string = FILED_ORDER_DEFAULT;
	orderBy: OrderDirection = OrderDirection.ASC;

	startCreatedAt?: Date;
	endCreatedAt?: Date;

	startUpdatedAt?: Date;
	endUpdatedAt?: Date;

	get skip(): number {
		return (this.page - 1) * this.pageSize;
	}

	get limit(): number {
		return this.pageSize;
	}
}
