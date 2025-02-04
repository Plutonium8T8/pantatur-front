import { Navigate } from "react-router-dom";
import { useUser } from "./UserContext"; 

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { userRoles } = useUser(); // Получаем роли пользователя

    if (!userRoles) {
        return <div>Загрузка...</div>; // Можно заменить на спиннер
    }

    const hasAccess = allowedRoles.some(role => userRoles.includes(role));

    return hasAccess ? children : <Navigate to="/dashboard" replace />;
};

export default ProtectedRoute;