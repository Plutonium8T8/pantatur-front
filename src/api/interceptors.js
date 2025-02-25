import Cookies from 'js-cookie';

export const axiosInterceptor = (baseAxios) =>{
  baseAxios.interceptors.request.use((config) =>{
    if (!config.headers) config.headers = {};

    const token = Cookies.get('jwt');

    if (token) config.headers["Authorization"] = `Bearer ${token}`;

    return config;
  },

  (error) => Promise.reject(error));
}