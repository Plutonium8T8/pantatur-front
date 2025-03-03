import { Navigate } from "react-router-dom"
import { useUser } from "./UserContext"

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { userRoles } = useUser()

  if (!userRoles) {
    return <div>Загрузка...</div>
  }

  const hasAccess = allowedRoles.some((role) => userRoles.includes(role))

  return hasAccess ? children : <Navigate to="/dashboard" replace />
}

export default ProtectedRoute
