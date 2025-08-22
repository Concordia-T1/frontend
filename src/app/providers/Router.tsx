import { Navigate } from "react-router-dom";
import { useAuthStore } from "../../entities/user/store";
import { type JSX } from "react";

interface RouteProps {
  children: JSX.Element;
  isAuthenticated?: boolean;
}

export const ProtectedRoute = ({ children, isAuthenticated }: RouteProps) => {
  const storeAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const finalAuthenticated = isAuthenticated ?? storeAuthenticated;

  return finalAuthenticated ? children : <Navigate to="/login" replace />;
};

export const AdminRoute = ({ children, isAuthenticated }: RouteProps) => {
  const storeAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const role = useAuthStore((state) => state.role);
  const finalAuthenticated = isAuthenticated ?? storeAuthenticated;

  return finalAuthenticated && role === "ADMIN" ? (
    children
  ) : (
    <Navigate to="/login" replace />
  );
};

export const PublicRoute = ({ children }: RouteProps) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return isAuthenticated ? <Navigate to="/requests" replace /> : children;
};
