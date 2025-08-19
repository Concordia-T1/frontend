import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../entities/user/store";
import { PageLoader } from "../../shared/ui/PageLoader.tsx";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { accessToken, isAuthChecked } = useAuthStore();
  if (!isAuthChecked) {
    return <PageLoader />;
  }

  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { accessToken, isAuthChecked, role } = useAuthStore();
  const location = useLocation();

  if (!isAuthChecked) {
    return <PageLoader />;
  }

  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  if (role !== "ADMIN" && location.pathname === "/users") {
    return <Navigate to="/requests" replace />;
  }

  return <>{children}</>;
};

export const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { accessToken, isAuthChecked } = useAuthStore();

  if (!isAuthChecked) {
    return <PageLoader />;
  }

  if (accessToken) {
    return <Navigate to="/requests" replace />;
  }

  return <>{children}</>;
};
