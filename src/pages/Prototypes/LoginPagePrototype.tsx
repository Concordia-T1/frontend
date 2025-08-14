import { Box, TextField, Typography, Link, Paper, Alert } from "@mui/material";
import { useState } from "react";
import { OutlinedButton } from "../../shared/ui/buttons/OutlinedButton.tsx";
import { theme } from "../../app/providers/ThemeProvider/config/theme.ts";
import { useForm, Controller } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

interface FormValues {
    email: string;
    password: string;
}

export const LoginPagePrototype = () => {
    const { control, handleSubmit, formState: { errors } } = useForm<FormValues>({
        defaultValues: { email: "", password: "" },
    });
    const navigate = useNavigate();
    const [serverError, setServerError] = useState<string | null>(null);

    const onSubmit = async (data: FormValues) => {
        setServerError(null);

        try {
            if (data.email === "pfmaria13@gmail.com" && data.password === "123123") {
                const accessToken = "fake_access_token_123";
                const refreshToken = "fake_refresh_token_456";
                const role = "MANAGER";

                Cookies.set("access_refresh", `${accessToken}_${refreshToken}`, { expires: 7 });
                Cookies.set("role", role, { expires: 7 });

                navigate("/requests");
            } else {
                setServerError("Неправильный e-mail или пароль");
            }
        } catch (error) {
            console.error("Ошибка обработки:", error);
            setServerError("Ошибка при обработке данных");
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