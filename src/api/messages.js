import { baseAxios } from "./baseAxios"

export const messages = {
    list: async () => { 
        const {data } = await baseAxios.get("/tickets")

        return data
    },

    messagesTicketById: async (id) => {
        const { data } = await baseAxios.get(`/messages/ticket/${id}`)

        return data
    }
}