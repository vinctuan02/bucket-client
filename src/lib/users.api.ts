import { User } from "@/types/type.user";
import api from "./api";
import { PageDto, ResponseSuccess } from "@/types/type.response";

export const userApi = {
  getList: async ({ params }: { params?: Record<string, any> }) => {
    const res = await api.get<ResponseSuccess<PageDto<User>>>("/users", {
      params,
    });

    return res.data;
  },

  getOne: (id: string) => api.get<ResponseSuccess<User>>(`/users/${id}`),

  create: (data: Omit<User, "id" | "createdAt" | "updatedAt">) =>
    api.post<ResponseSuccess<User>>("/users", data),

  update: (id: string, data: Partial<User>) =>
    api.patch<ResponseSuccess<User>>(`/users/${id}`, data),

  remove: (id: string) => api.delete<ResponseSuccess<null>>(`/users/${id}`),
};
