import { baseAxios } from "./baseAxios"

export const messages = {
    list: async () => { 
        const {data } = await baseAxios.get("/api/tickets")

        return data
    },

    messagesTicketById: async (id) => {
        const { data } = await baseAxios.get(`/api/messages/ticket/${id}`)

        return data
    }
}