import queryString from "query-string"
import { baseAxios } from "./baseAxios"

export const activity = {
  getLogList: async (params) => {
    const url = queryString.stringifyUrl({
      url: "/api/activity/logs",
      query: params
    })
    console.log("🚀 ~ getLogList: ~ url:", url)
    const { data } = await baseAxios.get(url)

    return data
  }
}
