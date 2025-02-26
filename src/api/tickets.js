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
    },

    createTickets: async (body) => {
        const { data } = await baseAxios.post("/api/tickets", body)

        return data
    },

    deleteById: async (id) => {
        await baseAxios.delete(`/api/tickets/${id}`)
    },

    merge: async (body) => {
        const { data } = await baseAxios.patch("/api/merge/tickets", body)

        return data
    },

    light: async () => {
        const {data} = await baseAxios.get(`/api/light/tickets`)

        return data
    },

    ticket: {
        info: async (id) => {
            const {data} = await baseAxios.get(`/api/ticket-info/${id}`)

            return data
        },

        update: async (id, body) => {
            const {data} = await baseAxios.post(`/api/ticket-info/${id}`, body)

            return data
        },

        light: async (id) => {
            const {data} = await baseAxios.get(`/api/light/ticket/${id}`)

            return data
        }
    }
}