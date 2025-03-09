import { baseAxios } from "./baseAxios";

export const dashboard = {
  statistics: async (body) => {
    const { data } = await baseAxios.post("/api/dashboard/statistics", body);

    return data;
  },
};
