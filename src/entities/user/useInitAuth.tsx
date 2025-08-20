import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  const { setAuthChecked, setAuthenticated, setRole, setUserData } =
    useAuthStore();

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
          } else {
            setAuthenticated(false);
            setRole(null);
            setUserData(null, null);
            setAuthChecked(true);
            navigate("/login");
          }
        } else {
          setAuthenticated(false);
          setRole(null);
          setUserData(null, null);
          setAuthChecked(true);
          navigate("/login");
        }
      } catch (err) {
        setAuthenticated(false);
        setRole(null);
        setUserData(null, null);
        setAuthChecked(true);
        navigate("/login");
      }
    };

    checkAuth();
  }, [setAuthenticated, setRole, setUserData, setAuthChecked, navigate]);
};
