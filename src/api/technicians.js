import { baseAxios } from "./baseAxios"

export const technicians = {
    schedules: async () => {
        const { data } = await baseAxios.get("/api/technicians/schedules");

        return data
    },

    removeSchedule: async (technicianId, dayOfWeek, body) => {
       await baseAxios.delete(`/api/technicians/${technicianId}/schedule/${dayOfWeek}`, {data: body});
    },

    addSchedule: async (technicianId, dayOfWeek, body) => {
        const { data } = await baseAxios.post(`api/technicians/${technicianId}/schedule/${dayOfWeek}`, body)

        return data
    }
}