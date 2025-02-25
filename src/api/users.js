import {  baseAxios } from "./baseAxios"

export const users = {
    getById: async (id) => {
        const { data } = await baseAxios.get(`/api/users/${id}`)

        return data
    },

    technician: async () => {
        const { data } = await baseAxios.get("/api/users-technician")

        return data
    },

    extended: async (selectClient) => {
        const { data } = await baseAxios.get(`/api/users-extended/${selectClient}`)

        return data
    },

    updataExtended: async (selectClient, body) => {
        const { data } = await baseAxios.patch(`/api/users-extended/${selectClient}`, body)

        return data
    },

    updateUsernameAndEmail: async (id, body) => {
        const { data } = await baseAxios.patch(`/api/users/${id}`, body)

        return  data
    },

    clientMerge: async (body) => {
        const { data } = await baseAxios.patch("/api/users-client/merge", body)

        return data
    }
}