import Cookies from "js-cookie";
import { clearCookie } from "../Components/utils/clearCookies"

const STATUS_CODE = [401, 403];
const ERROR_MESSAGES = ["Invalid JWT Token"];

export const authInterceptor = (config) => {
  if (!config.headers) config.headers = {};
  const token = Cookies.get("jwt");

  if (token) config.headers["Authorization"] = `Bearer ${token}`;

  return config;
};

export const responseInterceptor = [
  (res) => res,
  async (err) => {
    if (
      STATUS_CODE.includes(err?.response?.status) &&
      ERROR_MESSAGES.some((e) => e === err?.response?.data?.message)
    ) {
      clearCookie()
    }

    return Promise.reject(err);
  },
];