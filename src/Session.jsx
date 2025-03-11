import React, { useEffect } from "react"
import Cookies from "js-cookie"
import { useUser } from "./UserContext"
import { api } from "./api"
import { useNavigate, useLocation } from "react-router-dom"
import { privateRoutes } from "./routes"
import { enqueueSnackbar } from "notistack"
import { showServerError } from "./Components/utils"

const ADMIN_ROLE = "ROLE_ADMIN"

export const Session = () => {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { setUserId, setName, setSurname, hasRole } = useUser()

  const privatePath = privateRoutes(hasRole(ADMIN_ROLE)).map(({ path }) => path)

  const handleLogout = () => {
    Cookies.remove("jwt")
    setUserId(null)
    setName(null)
    setSurname(null)
  }

  const fetchSession = async () => {
    try {
      const data = await api.auth.session()

      setUserId(data.user_id)
      setName(data.username || "")
      setSurname(data.surname || "")
      navigate(privatePath.includes(pathname) ? pathname : "/")
    } catch (error) {
      navigate("/auth")
      handleLogout()
      enqueueSnackbar(showServerError(error), { variant: "error" })
    }
  }

  useEffect(() => {
    fetchSession()
  }, [])

  return <></>
}
