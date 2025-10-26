import { IConfigTableColumn } from "@/modules/commons/common.interface";
import { RoleFieldMapping } from "./role.enum";

export const rolesConifgsColumnTable: IConfigTableColumn[] = [
  { field: "name", label: "Name", orderField: RoleFieldMapping.NAME },
  {
    field: "description",
    label: "Description",
    orderField: RoleFieldMapping.DESCRIPTION,
  },
];

export const roleDefault = {
  name: "",
  description: "",
};
