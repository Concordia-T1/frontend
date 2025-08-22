import {
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
  Alert,
  IconButton,
} from "@mui/material";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FilledButton } from "../../shared/ui/buttons/FilledButton.tsx";
import { theme } from "../../app/providers/ThemeProvider/config/theme.ts";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useAuthStore } from "../../entities/user/store";

export const CreatingUserPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    role: "MANAGER",
    email: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { setRefreshTrigger } = useAuthStore();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (e: React.ChangeEvent<{ value: unknown }>) => {
    setFormData((prev) => ({ ...prev, role: e.target.value as string }));
  };

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5173/api/auth-service/v1/accounts/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            email: formData.email,
            role: formData.role === "ADMIN" ? "ROLE_ADMIN" : "ROLE_MANAGER",
            passwd: formData.password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.ok) {
        setError(
          data.detail || "Ошибка при создании пользователя (недостаточно прав)"
        );
        return;
      }

      setRefreshTrigger();

      navigate("/users");
    } catch (err: any) {
      setError(err.message || "Ошибка соединения с сервером");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        p: { xs: 1, sm: 2 },
        maxWidth: "600px",
        margin: "0 auto",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        minHeight: "100vh",
      }}
    >
      <Box
        sx={{
          width: "100%",
          mb: 2,
          mt: 4,
          display: "flex",
          alignItems: "center",
        }}
      >
        <IconButton
          onClick={() => navigate(-1)}
          sx={{
            color: theme.palette.brand.grayDark,
            transition: "0.5s",
            "&:hover": {
              color: theme.palette.brand.primary,
              backgroundColor: "transparent",
            },
          }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography
          variant="h5"
          sx={{
            flexGrow: 1,
            textAlign: "center",
            color: theme.palette.brand.primary,
            fontWeight: 500,
            fontSize: "24px",
            textTransform: "uppercase",
          }}
        >
          Создание пользователя
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2, width: "100%" }}>
          {error}
        </Alert>
      )}

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          width: "100%",
          mt: 4,
        }}
      >
        <Select
          label="Роль"
          value={formData.role}
          onChange={() => handleRoleChange}
          variant="standard"
          fullWidth
        >
          <MenuItem value="MANAGER">Обычный менеджер</MenuItem>
          <MenuItem value="ADMIN">Админ</MenuItem>
        </Select>
        <TextField
          label="E-mail"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleInputChange}
          required
          fullWidth
          variant="standard"
        />
        <TextField
          label="Пароль"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleInputChange}
          variant="standard"
          required
          fullWidth
        />
        <FilledButton
          onClick={handleSubmit}
          disabled={!formData.email || !formData.password || loading}
          sx={{ mt: 2 }}
        >
          {loading ? "Создание..." : "Создать"}
        </FilledButton>
      </Box>
    </Box>
  );
};
