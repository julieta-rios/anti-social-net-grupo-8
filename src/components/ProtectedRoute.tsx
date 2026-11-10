import { Navigate, Outlet } from "react-router";
import { useUser } from "../context/UserContext";

//verifica si hay un usuario con sesión iniciada antes de permitir el acceso a una página
function ProtectedRoute() {
    const { user } = useUser();

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
}

export default ProtectedRoute;
