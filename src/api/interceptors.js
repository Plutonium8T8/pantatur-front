import Cookies from "js-cookie"
import { clearCookies } from "../Components/utils/clearCookies"

const POSTMAN_TOKEN =
  "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJpYXQiOjE3NDE3NjA1MDEsImV4cCI6MTc0MTgwMzcwMSwicm9sZXMiOlsiUk9MRV9BRE1JTiIsIlJPTEVfVEFTS19BRE1JTiIsIlJPTEVfTk9USUZJQ0FUSU9OX0FETUlOIiwiUk9MRV9BQ0NPVU5UX0FETUlOIiwiUk9MRV9BQ0NPVU5UX1dSSVRFIiwiUk9MRV9OT1RJRklDQVRJT05fV1JJVEUiLCJST0xFX1RBU0tfV1JJVEUiLCJST0xFX1RBU0tfUkVBRCIsIlJPTEVfTk9USUZJQ0FUSU9OX1JFQUQiLCJST0xFX0FDQ09VTlRfUkVBRCIsIlJPTEVfREFTSEJPQVJEX0FETUlOIiwiUk9MRV9EQVNIQk9BUkRfV1JJVEUiLCJST0xFX0RBU0hCT0FSRF9SRUFEIiwiUk9MRV9MRUFEX0FETUlOIiwiUk9MRV9MRUFEX1dSSVRFIiwiUk9MRV9MRUFEX1JFQUQiLCJST0xFX0NIQVRfQURNSU4iLCJST0xFX0NIQVRfV1JJVEUiLCJST0xFX0NIQVRfUkVBRCJdLCJ1c2VybmFtZSI6IkR1bWl0cnUgUGxhY2ludGEifQ.po4YG_Mz7rb-QsmrCJEeofr8hav5xRzFCc8bxGmafktjo24c8XJ6MTxo4VYh7GK_D8fs5PRgwz2BFUXl5GlUW-qcrgLamiBcUpWoN2_6R2jARZQPAODyLap3_ooW3_J9_QOPwNwpovxLe-GefjVX5epNtvBUSeBSuUinB7mAxK7fBxGiCklDZHHynESNQ_UTik58INtZGZ4zFcqdWLN3P9IunNZJunF695HMZHkQQmft5S_UVao8ZR_KJRhWyB2o0A7iPedSSHdzcgXTT0o7Nu6zhnjBJNV6zb0c1bpiaPGiCiCQOeZAfEVvGR-GSo5iFaVHtQ_HVqTiS-pN_b7R_ddb9Xili-4ZerDkJuhn8XVj6aBnXIbd_9kdPREbprSkFbZNkQFDn5c75_nmaFBmR9pHV1mNjPxcciVCmxiaJQ-Hdi58U0h8qFgeDdUI4D7cmxXg4yMj9p9l0NdnFlGIvlsG7dttep9EoARn0R0F3tW2VFRN9CGcSBHKO8UhnBpHMrPbfcokHyfA6WwDm11dQAhwOU_fgkT0mkZwajszsTmr79X9yJvzTGyknwPcNmK6sGn-nrEg134SSWsdtHsyZUKQreMZES7qsML-xvwDSW6ooXEG9iZ-bPfR37ic6RrZEj4jjP9c0hgj_GLRfXezJk0mROCQ54jSF7cfmB7RyAM"

const STATUS_CODE = [401, 403]
const ERROR_MESSAGES = [
  "Invalid JWT Token",
  "Invalid credentials.",
  "Session does not contain the user_id"
]

export const authInterceptor = (config) => {
  if (!config.headers) config.headers = {}
  const token = Cookies.get("jwt")

  if (POSTMAN_TOKEN) config.headers["Authorization"] = `Bearer ${POSTMAN_TOKEN}`

  return config
}

export const responseInterceptor = [
  (res) => res,
  async (err) => {
    if (
      STATUS_CODE.includes(err?.response?.status) &&
      ERROR_MESSAGES.some((e) => e === err?.response?.data?.message)
    ) {
      clearCookies()
    }

    return Promise.reject(err)
  }
]
