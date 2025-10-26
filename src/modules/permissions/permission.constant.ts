import { PermissionFieldMapping } from "./permisson.enum";

export const columnsTable = [
  {
    label: "Name",
    field: "name",
    orderField: PermissionFieldMapping.NAME,
    width: 20,
  },
  {
    label: "Action",
    field: "action",
    orderField: PermissionFieldMapping.ACTION,
    width: 20,
  },
  {
    label: "Resource",
    field: "resource",
    orderField: PermissionFieldMapping.RESOURCE,
    width: 10,
  },
  {
    label: "Description",
    field: "description",
    orderField: PermissionFieldMapping.DESCRIPTION,
    width: 30,
  },
  {
    label: "Created At",
    field: "createdAt",
    orderField: PermissionFieldMapping.CREATED_AT,
    width: 10,
  },
  {
    label: "Updated At",
    field: "updatedAt",
    orderField: PermissionFieldMapping.UPDATED_AT,
    width: 10,
  },
];
