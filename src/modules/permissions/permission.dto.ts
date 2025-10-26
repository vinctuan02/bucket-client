import { BaseQueryDto } from "@/modules/commons/common.class";

export class GetListPermissionDto extends BaseQueryDto {
  constructor(partial?: Partial<GetListPermissionDto>) {
    super();
    Object.assign(this, partial);
  }
}
