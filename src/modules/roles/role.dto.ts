import { BaseQueryDto } from "@/modules/commons/common.dto";

export interface RolePermission {
  permissionId: string;
}

export interface CreateRoleDto {
  name: string;
  description?: string;
  rolePermissions: RolePermission[];
}

export interface UpdateRoleDto extends Partial<CreateRoleDto> {}

export class GetListRoleDto extends BaseQueryDto {
  constructor(init?: Partial<GetListRoleDto>) {
    super();
    Object.assign(this, init);
  }
}
