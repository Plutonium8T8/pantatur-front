import { baseAxios } from "./baseAxios";

export const task = {
  create: async (body) => {
    const { data } = await baseAxios.post("/api/task", body);

    return data;
  },

  delete: async (body) => {
    const { data } = await baseAxios.delete("/api/task/clear", { data: body });

    return data;
  },

  update: async (body) => {
    const { data } = await baseAxios.patch("/api/task", body);

    return data;
  },

  getByUserId: async (id) => {
    const { data } = await baseAxios.get(`/api/task/user/${id}`);

    return data;
  }
};
