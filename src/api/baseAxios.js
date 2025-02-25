import axios from "axios"
import { axiosInterceptor } from "./interceptors"

export const baseAxios = axios.create({
     baseURL: process.env.REACT_APP_API_URL,
     withCredentials: true,
     headers: {
        "Content-Type": "application/json",
        "Origin": process.env.REACT_APP_ORIGIN_HEADER,
      }
})

axiosInterceptor(baseAxios)