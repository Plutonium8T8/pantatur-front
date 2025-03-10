import { baseAxios } from "./baseAxios"

export const technicians = {
  getSchedules: async () => {
    const { data } = await baseAxios.get("/api/technicians/schedules")

    return data
  },

  deleteSchedule: async (id, dayOfWeek, body) => {
    await baseAxios.delete(`/api/technicians/${id}/schedule/${dayOfWeek}`, {
      data: body
    })
  },

  createSchedule: async (id, dayOfWeek, body) => {
    const { data } = await baseAxios.post(
      `api/technicians/${id}/schedule/${dayOfWeek}`,
      body
    )

    return data
  }
}
