import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "./store";
import { fetchWithAuth } from "../../shared/api/fetchWithAuth";

interface AccountResponse {
  ok: boolean;
  detail: string | null;
  account: {
    id: number;
    email: string;
    role: string;
  };
}

export const useInitAuth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setAuthChecked, setAuthenticated, setRole, setUserData, isAuthChecked } =
    useAuthStore();

  const publicRoutes = ["/login", "/registration", "/consent", "/consent-success", "/consent-error"];

  useEffect(() => {
    if (location.pathname === "/invite") {
      console.log("[useInitAuth] Пропуск проверки аутентификации для /invite");
      setAuthChecked(true);
      return;
    }

    if (isAuthChecked) return;

    const checkAuth = async () => {
      const cachedAuth = localStorage.getItem("authData");
      if (cachedAuth) {
        const { id, email, role } = JSON.parse(cachedAuth);
        if (id && email && role) {
          setUserData(id, email);
          setRole(role as "ROLE_MANAGER" | "ROLE_ADMIN");
          setAuthenticated(true);
          setAuthChecked(true);
          if (publicRoutes.includes(location.pathname)) {
            navigate("/requests", { replace: true });
          }
          return;
        }
      }

      try {
        const response = await fetchWithAuth<AccountResponse>("/accounts/me", {
          method: "GET",
        });

        if (response.ok && response.data?.account) {
          const { id, email, role } = response.data.account;
          if (id && email && role) {
            localStorage.setItem("authData", JSON.stringify({ id, email, role }));
            setUserData(id, email);
            setRole(role as "ROLE_MANAGER" | "ROLE_ADMIN");
            setAuthenticated(true);
            setAuthChecked(true);
            if (publicRoutes.includes(location.pathname)) {
              navigate("/requests", { replace: true });
            }
          } else {
            localStorage.removeItem("authData");
            setAuthenticated(false);
            setRole(null);
            setUserData(null, null);
            setAuthChecked(true);
            if (!publicRoutes.includes(location.pathname)) {
              navigate("/login", { replace: true });
            }
          }
        } else {
          localStorage.removeItem("authData");
          setAuthenticated(false);
          setRole(null);
          setUserData(null, null);
          setAuthChecked(true);
          if (!publicRoutes.includes(location.pathname)) {
            navigate("/login", { replace: true });
          }
        }
      } catch (err) {
        localStorage.removeItem("authData");
        setAuthenticated(false);
        setRole(null);
        setUserData(null, null);
        setAuthChecked(true);
        if (!publicRoutes.includes(location.pathname)) {
          navigate("/login", { replace: true });
        }
      }
    };

    checkAuth();
  }, [setAuthenticated, setRole, setUserData, setAuthChecked, navigate, isAuthChecked]);
};