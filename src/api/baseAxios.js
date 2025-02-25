import axios from "axios"

console.log(process.env.REACT_APP_ORIGIN_HEADER, "process.env.REACT_APP_ORIGIN_HEADER")

export const baseAxios = axios.create({
     baseURL: process.env.REACT_APP_API_URL,
     withCredentials: true,
     headers: {
        "Content-Type": "application/json",
        "Origin": process.env.REACT_APP_ORIGIN_HEADER,
      }
})