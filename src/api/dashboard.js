import { baseAxios } from "./baseAxios"

export const dashboard = {
  statistics: async () => {
    const { data } = await baseAxios.get("/api/dashboard/statistics")

    return data
  }
}
