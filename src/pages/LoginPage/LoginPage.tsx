import { Box, TextField, Typography, Link, Paper, Alert } from "@mui/material";
import { useState } from "react";
import { OutlinedButton } from "../../shared/ui/buttons/OutlinedButton.tsx";
import { theme } from "../../app/providers/ThemeProvider/config/theme.ts";
import { useForm, Controller } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useAuthStore, type AuthState } from "../../entities/user/store";
import axios, { AxiosError } from "axios";
import Cookies from "js-cookie";

interface FormValues {
    email: string;
    password: string;
}

interface AuthResponse {
    ok: boolean;
    detail: string | null;
    email?: string;
    role?: "ROLE_MANAGER" | "ROLE_ADMIN";
    created_date?: string;
}

export const LoginPage = () => {
    const { control, handleSubmit, formState: { errors } } = useForm<FormValues>({
        defaultValues: { email: "", password: "" },
    });
    const navigate = useNavigate();
    const setTokens = useAuthStore((state: AuthState) => state.setTokens);
    const setRole = useAuthStore((state: AuthState) => state.setRole);

    const [serverError, setServerError] = useState<string | null>(null);

    const onSubmit = async (data: FormValues) => {
        setServerError(null);

        try {
            const response = await axios.post<AuthResponse>("/auth/login", {
                email: data.email,
                password: data.password,
            }, {
                withCredentials: true
            });

            if (!response.data.ok) {
                setServerError(
                    response.data.detail === "BAD_CREDENTIALS: Username and/or password is incorrect"
                        ? "Неправильный e-mail или пароль"
                        : response.data.detail || "Ошибка авторизации"
                );
                return;
            }

            const tokenCookie = Cookies.get("access_refresh");
            if (!tokenCookie) {
                setServerError("Токены не получены");
                return;
            }

            const [accessToken, refreshToken] = tokenCookie.split("_");
            setTokens(accessToken, refreshToken);

            const role = response.data.role
                ? response.data.role.replace("ROLE_", "") as "MANAGER" | "ADMIN"
                : null;
            setRole(role);

            navigate("/requests");
        } catch (error: unknown) {
            console.error("Ошибка соединения:", error);
            const err = error as AxiosError<{ detail?: string }>;
            setServerError(
                err.response?.data?.detail || "Ошибка соединения с сервером"
            );
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
                                full surges
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
                            minLength: { value: 6, message: "Минимум 6 символов" },
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
                    <Link
                        href="#"
                        variant="body2"
                        underline="hover"
                        sx={{
                            mb: 2,
                            display: "inline-block",
                            color: theme.palette.brand.grayLight,
                        }}
                    >
                        Забыли пароль?
                    </Link>

                    {serverError && (
                        <Alert severity="error" sx={{ width: "100%", mb: 2 }}>
                            {serverError}
                        </Alert>
                    )}

                    <Box sx={{ width: "100%", display: "flex", justifyContent: "center" }}>
                        <OutlinedButton type="submit" sx={{ mt: 1 }}>
                            Войти
                        </OutlinedButton>
                    </Box>
                </Box>
            </Paper>
        </Box>
    );
};