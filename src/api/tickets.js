import { baseAxios } from "./baseAxios"

export const tickets = {
    list: async () => { 
        const {data } = await baseAxios.get("/tickets")

        return data
    },

    getById: async (id) => {
        const {data } = await baseAxios.get(`/tickets/${id}`)

        return data
    }
}