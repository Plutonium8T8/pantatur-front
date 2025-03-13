import React, { useEffect } from "react"
import "./App.css"
import { UserProvider } from "./UserContext"
import Cookies from "js-cookie"
import { AppProvider } from "./AppContext"
import { SnackbarProvider } from "notistack"
import "./App.css"
import "./reset.css"
import { publicRoutes } from "./routes"
import { Layout } from "./Layout"
import { useNavigate, useLocation } from "react-router-dom"
import { PrivateRoutes, PublicRoutes } from "./AppRoutes"
import { Session } from "./Session"

const JWT_TOKEN = Cookies.get("jwt")

function App() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const publicPaths = publicRoutes.filter(({ isPublic }) => isPublic)

  useEffect(() => {
    if (!JWT_TOKEN) {
      navigate(publicPaths.includes(pathname) ? pathname : "/auth")
    }
  }, [])

  return (
    <SnackbarProvider
      autoHideDuration={5000}
      maxSnack={5}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
    >
      {JWT_TOKEN ? (
        <>
          <UserProvider>
            <Session>
              <AppProvider>
                <Layout>
                  <PrivateRoutes />
                </Layout>
              </AppProvider>
            </Session>
          </UserProvider>
        </>
      ) : (
        <PublicRoutes />
      )}
    </SnackbarProvider>
  )
}

export default App
