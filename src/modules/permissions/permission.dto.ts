import { BaseQueryDto } from '@/modules/commons/dto/common.dto';

export class GetListPermissionDto extends BaseQueryDto {
	permissionActions?: string;
	resources?: string;

	constructor(partial?: Partial<GetListPermissionDto>) {
		super();
		Object.assign(this, partial);
	}
}
