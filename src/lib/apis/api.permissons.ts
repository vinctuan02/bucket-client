import api from "@/lib/constants/api.constant";
import { PageDto, ResponseSuccess } from "@/types/type.response";
import { Permission } from "@/types/type.user";

export const permissionApi = {
  getList: async ({ params }: { params?: Record<string, any> }) => {
    const res = await api.get<ResponseSuccess<PageDto<Permission>>>(
      "/permissions",
      {
        params,
      }
    );

    return res.data;
  },

  getOne: (id: string) => api.get(`/permissions/${id}`),

  create: (data: { action: string; resource: string }) =>
    api.post("/permissions", data),

  update: (id: string, data: Partial<{ action: string; resource: string }>) =>
    api.patch(`/permissions/${id}`, data),

  delete: (id: string) => api.delete(`/permissions/${id}`),
};
