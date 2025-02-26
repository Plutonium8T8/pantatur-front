import { baseAxios } from "./baseAxios";

export const admin = {
  user: {
    updateRoles: async (body) => {
      const { data } = await baseAxios.post("/admin/user/roles", body);

      return data;
    },

    deleteRoles: async (body) => {
      await baseAxios.delete("/admin/user/roles", { data: body });
    },
  },
};