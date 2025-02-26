import axios from "axios";
import { authInterceptor, responseInterceptor } from "./interceptors";

export const baseAxios = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

baseAxios.interceptors.request.use(authInterceptor);
baseAxios.interceptors.response.use(...responseInterceptor);
