import { PageDto, ResponseSuccess } from "@/types/type.response";
import api from "../constants/api.constant";
import { Role } from "@/types/type.user";

export const rolesApi = {
  getList: async ({ params }: { params?: Record<string, any> }) => {
    const res = await api.get<ResponseSuccess<PageDto<Role>>>("/roles", {
      params,
    });
    return res.data;
  },

  getOne: (id: string) => api.get<ResponseSuccess<Role>>(`/roles/${id}`),

  create: (data: Omit<Role, "id" | "createdAt" | "updatedAt">) =>
    api.post<ResponseSuccess<Role>>("/roles", data),

  update: (id: string, data: Partial<Role>) =>
    api.patch<ResponseSuccess<Role>>(`/roles/${id}`, data),

  remove: (id: string) => api.delete<ResponseSuccess<null>>(`/roles/${id}`),
};
