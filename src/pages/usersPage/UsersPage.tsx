import { Box, Alert } from "@mui/material";
import { useState, useEffect } from "react";
import { fetchWithAuth } from "@shared/api/fetchWithAuth";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@entities/user/store";
import { UsersTable } from "@widgets/UsersTable/UsersTable.tsx";
import { type User, type AccountsCollectionResponse } from "@app/types";
import { FilledButton } from "../../shared/ui/buttons/FilledButton.tsx";
import { SearchBar } from "@features/TableToolbar/ui/SearchBar.tsx";

interface User {
  id: string;
  email: string;
  state: "STATE_ENABLED" | "STATE_DISABLED";
}

export const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const navigate = useNavigate();
  const { role, accessToken, refreshTrigger } = useAuthStore();

  const handleStateChange = (
    id: string,
    newState: "STATE_ENABLED" | "STATE_DISABLED"
  ) => {
    setUsers((prev) =>
      prev.map((user) => (user.id === id ? { ...user, state: newState } : user))
    );
    setFilteredUsers((prev) =>
      prev.map((user) => (user.id === id ? { ...user, state: newState } : user))
    );
    console.log("Updated local state for user", id, "to", newState);
  };

  const handleSearchChange = (search: string) => {
    setSearchQuery(search);
    const filtered = users.filter((user) =>
      user.email.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredUsers(filtered);
  };

  useEffect(() => {
    const fetchUsers = async () => {
      if (role !== "ADMIN") {
        setError(
          "Доступ к списку пользователей разрешен только администраторам"
        );
        console.error("User role is not ADMIN:", role);
        return;
      }

      if (!accessToken) {
        setError(
          "Отсутствует токен авторизации. Пожалуйста, войдите в систему."
        );
        console.error("No access token found in cookies");
        navigate("/login");
        return;
      }

      try {
        console.log(
          "Sending request to /api/auth-service/v1/accounts with token:",
          accessToken
        );
        const response = await fetchWithAuth(
          "/accounts",
          {
            method: "GET",
            params: {
              page: 0,
              size: 100,
              sort: "createdDate,desc",
              state: "ALL",
            },
          },
          navigate
        );

        console.log("API response:", response.data);

        const data: AccountsCollectionResponse = response.data;
        if (!data.ok) {
          setError(data.detail || "Ошибка при загрузке пользователей");
          console.error("API error:", data.detail, data.validation_errors);
          return;
        }

        if (!data.accounts || data.accounts.length === 0) {
          setError("Нет доступных аккаунтов в базе данных");
          console.warn("API returned empty accounts array");
          return;
        }

        const mappedUsers: User[] = data.accounts.map((account) => {
          if (!account.state) {
            console.warn(
              `Account ${account.id} has no state field in API response`
            );
          }
          return {
            id: account.id.toString(),
            email: account.email,
            state: account.state as "STATE_ENABLED" | "STATE_DISABLED",
          };
        });

        setUsers(mappedUsers);
        setFilteredUsers(mappedUsers);
        console.log("Mapped users:", mappedUsers);
      } catch (err: any) {
        setError(err.message || "Ошибка соединения с сервером");
        console.error("Fetch error:", err);
      }
    };

    fetchUsers();
  }, [navigate, role, accessToken, refreshTrigger]);

  const handleCreateAccount = () => {
    navigate("/create-user");
  };

  return (
    <Box
      sx={{ p: { xs: 1, sm: 2 }, maxWidth: "100%", boxSizing: "border-box" }}
    >
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <SearchBar onSearchChange={handleSearchChange} />
        <FilledButton onClick={handleCreateAccount}>
          Создать аккаунт
        </FilledButton>
      </Box>
      <UsersTable users={filteredUsers} onStateChange={handleStateChange} />
    </Box>
  );
};
