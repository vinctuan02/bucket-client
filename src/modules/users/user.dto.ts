import { BaseQueryDto } from '../commons/dto/common.dto';
import { UserFieldOrder } from './user.enum';

export interface CreateUserDto {
	email: string;

	password: string;

	name: string;

	userRoles: {
		roleId: string;
	}[];
}

export interface UpdateUserDto extends Partial<CreateUserDto> {}

export class GetListUserDto extends BaseQueryDto {
	fieldOrder: string = UserFieldOrder.NAME;

	constructor(init?: Partial<GetListUserDto>) {
		super();
		Object.assign(this, init);
	}
}
