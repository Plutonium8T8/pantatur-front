import { baseAxios } from "./baseAxios";

export const standalone = {
  applyFilter: async (body) => {
    const { data } = await baseAxios.post("/api/apply-filter", body);

    return data;
  }
};
