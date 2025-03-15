import queryString from "query-string"
import { baseAxios } from "./baseAxios"

export const activity = {
  getLogs: async (params) => {
    const url = queryString.stringifyUrl({
      url: "/api/activity/logs",
      query: params
    })
    const { data } = await baseAxios.get(url)

    return data
  }
}
