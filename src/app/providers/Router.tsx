import { Navigate, Outlet } from "react-router-dom";
import Cookies from "js-cookie";

export const ProtectedRoute = () => {

    if (!Cookies.get("access_refresh")) {
        return <Navigate to="/login" replace />;
    }
    return <Outlet />;
};

export const PublicRoute = () => {

    if (Cookies.get("access_refresh")) {
        return <Navigate to="/requests" replace />;
    }
    return <Outlet />;
};