import React, { useEffect, useState } from "react"
import Cookies from "js-cookie"
import { useUser } from "./UserContext"
import { api } from "./api"
import { useNavigate, useLocation } from "react-router-dom"
import { privateRoutes } from "./routes"
import { enqueueSnackbar } from "notistack"
import { showServerError } from "./Components/utils"
import { LoadingOverlay } from "./Components/LoadingOverlay"

const ADMIN_ROLE = "ROLE_ADMIN"

export const Session = ({ children }) => {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [loading, setLoading] = useState(true)
  const { setUserId, setName, setSurname, hasRole } = useUser()

  const privatePath = privateRoutes(hasRole(ADMIN_ROLE)).map(({ path }) => path)

  const navigateToRightPath = (path) => {
    // Special case: Opening a new window with the lead's ID in the format `/leads/{id}`
    if (path.startsWith("/leads")) {
      return path
    }

    return privatePath.includes(path) ? path : "/leads"
  }

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
      navigate(navigateToRightPath(pathname))
    } catch (error) {
      navigate("/auth")
      handleLogout()
      enqueueSnackbar(showServerError(error), { variant: "error" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSession()
  }, [])

  return <>{loading ? <LoadingOverlay /> : children}</>
}
