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
          credentials: "include",
          headers: { "Content-Type": "application/json" },
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
        maxWidth: { xs: "80%", sm: "80%", md: "600px" },
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
          mt: { xs: 2, sm: 4 },
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
          <ArrowBackIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />
        </IconButton>
        <Typography
          variant="h5"
          sx={{
            flexGrow: 1,
            textAlign: "center",
            color: theme.palette.brand.primary,
            fontWeight: 500,
            fontSize: { xs: "18px", sm: "24px" },
            textTransform: "uppercase",
          }}
        >
          Создание пользователя
        </Typography>
      </Box>

      {error && (
        <Alert
          severity="error"
          sx={{
            mb: 2,
            width: "100%",
            fontSize: { xs: "14px", sm: "16px" },
          }}
        >
          {error}
        </Alert>
      )}

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: { xs: 1.5, sm: 2 },
          width: "100%",
          mt: { xs: 2, sm: 4 },
        }}
      >
        <Select
          value={formData.role}
          onChange={() => handleRoleChange}
          variant="standard"
          fullWidth
          sx={{
            "& .MuiSelect-select": {
              fontSize: { xs: "14px", sm: "16px" },
            },
          }}
        >
          <MenuItem value="MANAGER" sx={{ fontSize: { xs: "14px", sm: "16px" } }}>
            Обычный менеджер
          </MenuItem>
          <MenuItem value="ADMIN" sx={{ fontSize: { xs: "14px", sm: "16px" } }}>
            Админ
          </MenuItem>
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
          sx={{
            "& .MuiInputLabel-root": { fontSize: { xs: 14, sm: 16 } },
            "& .MuiInputBase-input": { fontSize: { xs: 14, sm: 16 } },
          }}
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
          sx={{
            "& .MuiInputLabel-root": { fontSize: { xs: 14, sm: 16 } },
            "& .MuiInputBase-input": { fontSize: { xs: 14, sm: 16 } },
          }}
        />
        <FilledButton
          onClick={handleSubmit}
          disabled={!formData.email || !formData.password || loading}
          sx={{
            mt: { xs: 1, sm: 2 },
            fontSize: { xs: 14, sm: 16 },
            padding: { xs: "8px 16px", sm: "10px 20px" },
          }}
        >
          {loading ? "Создание..." : "Создать"}
        </FilledButton>
      </Box>
    </Box>
  );
};
