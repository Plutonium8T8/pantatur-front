import { baseAxios } from "./baseAxios";

export const dashboard = {
  statistics: async () => {
    const { data } = await baseAxios.post("/api/dashboard/statistics");

    return data;
  },
};
