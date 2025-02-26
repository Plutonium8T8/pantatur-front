import { baseAxios } from "./baseAxios"

export const notification = {
    create: async (body) => {
        const { data } = await baseAxios.post("/api/notification", body)

        return data
    },

    delete: async (body) => {
        const { data } = await baseAxios.delete("/api/notification", {data: body})

        return data
    },

    updata: async (body) => {
        const { data } = await baseAxios.patch("/api/notification", body)

        return data
    },

    getById: async (id) => {
        const { data } = await baseAxios.get(`/api/notification/${id}`)

        return data
    }
}