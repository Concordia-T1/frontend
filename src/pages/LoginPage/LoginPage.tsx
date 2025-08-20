import { Box, TextField, Typography, Paper, Alert } from "@mui/material";
import { useState } from "react";
import { OutlinedButton } from "../../shared/ui/buttons/OutlinedButton.tsx";
import { useForm, Controller } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useAuthStore, type AuthState } from "../../entities/user/store";
import { fetchWithAuth } from "../../shared/api/fetchWithAuth";

interface FormValues {
  email: string;
  password: string;
}

interface AuthResponse {
  ok: boolean;
  detail: string | null;
  validation_errors: Array<{ field: string; detail: string }> | null;
}

interface AccountResponse {
  ok: boolean;
  detail: string | null;
  account: {
    id: number;
    email: string;
    role: string;
  };
}

export const LoginPage = () => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: { email: "", password: "" },
  });
  const navigate = useNavigate();
  const setRole = useAuthStore((state: AuthState) => state.setRole);
  const setUserData = useAuthStore((state: AuthState) => state.setUserData);
  const setAuthenticated = useAuthStore(
    (state: AuthState) => state.setAuthenticated
  );
  const [serverError, setServerError] = useState<string | null>(null);

  const onSubmit = async (data: FormValues) => {
    setServerError(null);

    try {
      console.log("Отправка запроса на /auth/login", data);
      const loginResponse = await fetchWithAuth<AuthResponse>("/auth/login", {
        method: "POST",
        data: {
          email: data.email,
          passwd: data.password,
        },
      });

      console.log("Ответ от /auth/login:", loginResponse);

      if (!loginResponse.ok) {
        const responseData = loginResponse.data;
        if (responseData?.validation_errors) {
          const errorMessages = responseData.validation_errors
            .map((err) => `${err.field}: ${err.detail}`)
            .join("; ");
          setServerError(errorMessages);
        } else {
          setServerError(
            responseData?.detail ===
              "BAD_CREDENTIALS: Username and/or password is incorrect"
              ? "Неправильный e-mail или пароль"
              : responseData?.detail || "Ошибка авторизации"
          );
        }
        setAuthenticated(false);
        return;
      }

      setAuthenticated(true);
      console.log(
        "Пользователь аутентифицирован, isAuthenticated установлено в true"
      );

      console.log("Отправка запроса на /accounts/me");
      const accountResponse = await fetchWithAuth<AccountResponse>(
        "/accounts/me",
        {
          method: "GET",
        }
      );
      console.log("Ответ от /accounts/me:", accountResponse);

      if (!accountResponse.ok || !accountResponse.data) {
        setAuthenticated(false);
        setServerError(
          accountResponse.detail || "Ошибка получения данных пользователя"
        );
        return;
      }

      const { role, id, email } = accountResponse.data.account;
      if (!id || !email || !role) {
        setAuthenticated(false);
        setServerError("Некорректные данные пользователя");
        return;
      }

      console.log("Сохранение данных пользователя:", { id, email, role });
      setRole(role.replace("ROLE_", "") as "MANAGER" | "ADMIN");
      setUserData(id, email);
      navigate("/requests");
    } catch (error: unknown) {
      console.error("Подробная ошибка:", error);
      setAuthenticated(false);
      setServerError("Ошибка соединения с сервером");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "40vh",
        maxHeight: "80vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        p: 2,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          width: { xs: "100%", sm: 500, md: 660 },
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          boxShadow: "none",
          p: { xs: 2, sm: 3, md: 4 },
        }}
      >
        <Typography variant="h5" fontWeight={600} gutterBottom>
          Авторизация
        </Typography>
        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          sx={{ mt: 2, width: "100%" }}
        >
          <Controller
            name="email"
            control={control}
            rules={{
              required: "Введите e-mail",
              pattern: {
                value: /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/,
                message: "Неверный формат e-mail",
              },
            }}
            render={({ field }) => (
              <TextField
                {...field}
                label="E-mail"
                fullWidth
                margin="normal"
                variant="standard"
                error={!!errors.email}
                helperText={errors.email?.message}
              />
            )}
          />

          <Controller
            name="password"
            control={control}
            rules={{
              required: "Введите пароль",
              minLength: { value: 5, message: "Минимум 5 символов" },
              maxLength: { value: 32, message: "Максимум 32 символа" },
            }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Пароль"
                type="password"
                fullWidth
                margin="normal"
                variant="standard"
                error={!!errors.password}
                helperText={errors.password?.message}
              />
            )}
          />

          {serverError && (
            <Alert severity="error" sx={{ width: "100%", mb: 2 }}>
              {serverError}
            </Alert>
          )}

          <Box
            sx={{ width: "100%", display: "flex", justifyContent: "center" }}
          >
            <OutlinedButton type="submit" sx={{ mt: 1 }}>
              Войти
            </OutlinedButton>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};
