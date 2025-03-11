import { Routes, Route } from "react-router-dom"
import { privateRoutes, publicRoutes } from "./routes"
import { NotFound } from "./Components/NotFound"
import { useUser } from "./UserContext"

const ADMIN_ROLE = "ROLE_ADMIN"

export const PublicRoutes = () => {
  return (
    <Routes>
      {publicRoutes.map(({ path, component: Component }) => (
        <Route key={path} path={path} element={<Component />} />
      ))}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export const PrivateRoutes = () => {
  const { hasRole } = useUser()

  return (
    <Routes>
      {privateRoutes(hasRole(ADMIN_ROLE)).map(
        ({ path, component: Component }) => (
          <Route key={path} path={path} element={<Component />} />
        )
      )}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
