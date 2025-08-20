import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom"; // Добавляем useLocation
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
  const location = useLocation(); // Получаем текущий маршрут
  const { setAuthChecked, setAuthenticated, setRole, setUserData } =
    useAuthStore();

  // Список публичных маршрутов, где перенаправление на /login не требуется
  const publicRoutes = [
    "/login",
    "/registration",
    "/consent",
    "/consent-success",
    "/consent-error",
  ];

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetchWithAuth<AccountResponse>("/accounts/me", {
          method: "GET",
        });

        if (response.ok && response.data?.account) {
          const { id, email, role } = response.data.account;
          if (id && email && role) {
            setUserData(id, email);
            setRole(role.replace("ROLE_", "") as "MANAGER" | "ADMIN");
            setAuthenticated(true);
            setAuthChecked(true);
            if (publicRoutes.includes(location.pathname)) {
              navigate("/requests", { replace: true });
            }
          } else {
            setAuthenticated(false);
            setRole(null);
            setUserData(null, null);
            setAuthChecked(true);
            if (!publicRoutes.includes(location.pathname)) {
              navigate("/login", { replace: true });
            }
          }
        } else {
          setAuthenticated(false);
          setRole(null);
          setUserData(null, null);
          setAuthChecked(true);
          if (!publicRoutes.includes(location.pathname)) {
            navigate("/login", { replace: true });
          }
        }
      } catch (err) {
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
  }, [
    setAuthenticated,
    setRole,
    setUserData,
    setAuthChecked,
    navigate,
    location.pathname,
    useAuthStore((state) => state.refreshTrigger),
  ]);
};
