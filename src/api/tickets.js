import { baseAxios } from "./baseAxios"

export const tickets = {
    list: async () => { 
        const {data } = await baseAxios.get("/api/tickets")

        return data
    },

    getById: async (id) => {
        const {data } = await baseAxios.get(`/api/tickets/${id}`)

        return data
    },

    updateById: async (id, body) => {
        const {data} = await baseAxios.patch(`/api/tickets/${id}`, body)

        return data
    }
}