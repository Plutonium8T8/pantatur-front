import { baseAxios } from "./baseAxios"


export const auth = {
    login: async (body) => {
        const {data} = await baseAxios.post("/login", body)

        return data
    },

    register: async (body) => {
        const {data} = await baseAxios.post("/register", body)

        return data
    }
    
}