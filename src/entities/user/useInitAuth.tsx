import { useEffect } from "react";
import { fetchWithAuth } from "../../shared/api/fetchWithAuth";
import { useAuthStore } from "./store.ts";

export const useInitAuth = () => {
  const setRole = useAuthStore((s) => s.setRole);
  const setTokens = useAuthStore((s) => s.setTokens);
  const setAuthChecked = useAuthStore((s) => s.setAuthChecked);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetchWithAuth("/accounts/me", { method: "GET" });
        if (response.data?.ok) {
          const { role } = response.data.account;
          setRole(role.replace("ROLE_", "") as "MANAGER" | "ADMIN");
          setTokens("set_by_cookie", "set_by_cookie");
        }
      } catch (err) {
        console.warn("Не удалось проверить авторизацию:", err);
      } finally {
        setAuthChecked(true);
      }
    };

    checkAuth();
  }, [setRole, setTokens, setAuthChecked]);
};
