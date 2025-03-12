import Cookies from "js-cookie"
import { clearCookies } from "../Components/utils/clearCookies"

const POSTMAN_TOKEN =
  "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJpYXQiOjE3NDE3ODU1NjksImV4cCI6MTc0MTgyODc2OSwicm9sZXMiOlsiUk9MRV9BRE1JTiIsIlJPTEVfVEFTS19BRE1JTiIsIlJPTEVfTk9USUZJQ0FUSU9OX0FETUlOIiwiUk9MRV9BQ0NPVU5UX0FETUlOIiwiUk9MRV9BQ0NPVU5UX1dSSVRFIiwiUk9MRV9OT1RJRklDQVRJT05fV1JJVEUiLCJST0xFX1RBU0tfV1JJVEUiLCJST0xFX1RBU0tfUkVBRCIsIlJPTEVfTk9USUZJQ0FUSU9OX1JFQUQiLCJST0xFX0FDQ09VTlRfUkVBRCIsIlJPTEVfREFTSEJPQVJEX0FETUlOIiwiUk9MRV9EQVNIQk9BUkRfV1JJVEUiLCJST0xFX0RBU0hCT0FSRF9SRUFEIiwiUk9MRV9MRUFEX0FETUlOIiwiUk9MRV9MRUFEX1dSSVRFIiwiUk9MRV9MRUFEX1JFQUQiLCJST0xFX0NIQVRfQURNSU4iLCJST0xFX0NIQVRfV1JJVEUiLCJST0xFX0NIQVRfUkVBRCJdLCJ1c2VybmFtZSI6IkR1bWl0cnUgUGxhY2ludGEifQ.QFIvkgAWoLFFa51pidBP5xdGhM2mRIiDodYtvJmQEldV2vsmYPuVg1UdTiGkj6MGlBCJQtJPxrblqh_J7AoaKxM8kPchHGQplWuelDox2e47vdWLkqck43BUFQOkkImjM6umqQtIvd268sK_h6DLWXWZQ2GdqO_a_EQjij_Kw2IL0VNBae0DJMDxO5Xb8rY3aTNvDx9nJsZs9e4ZLU_IyCo_ZeI0Ofh8VIAxkfUfio9g_ah1f8GvO7Hs-NYLMbEQYGjxk_NdDdTeKRM7tmmm7E1iJem6Lo18nmlfIz1AuYR-VywLg1kTS0FdBiXlLX54uexLOyxiqwGLOUkeLMWj4MN86WANuWg-AJLq6sb4dYfcDAfml9hKo_y2m7ie3OAgDzsvR2pWYKds6WrP58OhXoT8_8xhDXwAEd6EgYrWMZBmlx0DWwppB2DL0KOWzWLh1OcI1PpXIRD-fErS-aro1gII1dvZ-arM5SgI8FuBmJAxqOG0aM0Dtr0Sxc9C-TqjJy2bg-IxdkEdSSeGwrAN8jiKsRFjrihAVN8tLUPcrTWzVEcVuVHvZmYp-QlbvpDO9cQcIFTf2q91gycAjT0vQqLM7DNZHCMQ2XwRtHBydpG5jfJp4tqrNM-9znOuX-aQ2QGmTN4o76WEAd76LF9w0LsvIGUv955RlShDCnFBNtc"

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
