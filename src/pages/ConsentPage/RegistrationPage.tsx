import { Box, Paper, Typography, TextField, Alert } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { useHookFormMask } from "use-mask-input";
import { isValid, parse, isBefore, subYears } from "date-fns";
import { OutlinedButton } from "../../shared/ui/buttons/OutlinedButton.tsx";
import { useState } from "react";

interface FormValues {
  lastName: string;
  firstName: string;
  middleName: string;
  birthDate: string;
  phone: string;
  email: string;
}

export const RegistrationPage = () => {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid: isFormValid },
  } = useForm<FormValues>({
    defaultValues: {
      lastName: "",
      firstName: "",
      middleName: "",
      birthDate: "",
      phone: "",
      email: "",
    },
    mode: "onChange",
  });

  const registerWithMask = useHookFormMask(control.register);

  const validateDate = (value: string) => {
    const parsedDate = parse(value, "dd.MM.yyyy", new Date());
    const minDate = new Date(1900, 0, 1); // 01.01.1900
    const maxDate = new Date(2025, 7, 15); // 15.08.2025
    const minAgeDate = subYears(maxDate, 14); // 14 лет назад от 15.08.2025

    if (!isValid(parsedDate)) {
      return "Неверный формат даты (ДД.ММ.ГГГГ)";
    }
    if (isBefore(parsedDate, minDate)) {
      return "Дата рождения не может быть ранее 01.01.1900";
    }
    if (isBefore(maxDate, parsedDate)) {
      return "Дата рождения не может быть позже текущей даты";
    }
    if (isBefore(minAgeDate, parsedDate)) {
      return "Возраст должен быть не менее 14 лет";
    }
    return true;
  };

  const onSubmit = (data: FormValues) => {
    setServerError(null);
    const e164Phone = data.phone.replace(/\D/g, "");
    const formattedData = {
      ...data,
      phone: `+${e164Phone}`,
    };
    console.log("Отправленные данные:", formattedData);
    navigate("/consent");
  };

  return (
    <Box
      sx={{
        p: { xs: 1, sm: 2 },
        maxWidth: "100%",
        boxSizing: "border-box",
        margin: { xs: "0 16px", sm: "0 24px" },
      }}
    >
      <Paper
        sx={{
          boxShadow: "none",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          p: { xs: 2, sm: 3 },
        }}
      >
        <Typography
          variant="h6"
          fontWeight={500}
          sx={{ mt: 3, mb: 5, textTransform: "uppercase" }}
        >
          Согласие на обработку персональных данных
        </Typography>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            width: "600px",
          }}
        >
          <Controller
            name="lastName"
            control={control}
            rules={{
              required: "Введите фамилию",
              pattern: {
                value: /^[А-Яа-яЁёA-Za-z\s-]{2,120}$/,
                message:
                  "Фамилия должна содержать 2–120 символов (кириллица, латиница, дефисы)",
              },
            }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Фамилия"
                variant="standard"
                required
                error={!!errors.lastName}
                helperText={errors.lastName?.message}
              />
            )}
          />

          <Controller
            name="firstName"
            control={control}
            rules={{
              required: "Введите имя",
              pattern: {
                value: /^[А-Яа-яЁёA-Za-z\s-]{2,120}$/,
                message:
                  "Имя должно содержать 2–120 символов (кириллица, латиница, дефисы)",
              },
            }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Имя"
                variant="standard"
                required
                error={!!errors.firstName}
                helperText={errors.firstName?.message}
              />
            )}
          />

          <Controller
            name="middleName"
            control={control}
            rules={{
              pattern: {
                value: /^[А-Яа-яЁёA-Za-z\s-]{0,120}$/,
                message:
                  "Отчество должно содержать до 120 символов (кириллица, латиница, дефисы)",
              },
            }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Отчество"
                variant="standard"
                error={!!errors.middleName}
                helperText={errors.middleName?.message}
              />
            )}
          />

          <Controller
            name="birthDate"
            control={control}
            rules={{
              required: "Введите дату рождения",
              validate: validateDate,
            }}
            render={({ field }) => (
              <TextField
                {...field}
                {...registerWithMask("birthDate", "99.99.9999", {
                  required: true,
                })}
                label="Дата рождения"
                variant="standard"
                required
                error={!!errors.birthDate}
                helperText={errors.birthDate?.message}
                fullWidth
              />
            )}
          />

          <Controller
            name="phone"
            control={control}
            rules={{
              required: "Введите номер телефона",
              pattern: {
                value: /^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/,
                message: "Неверный формат номера телефона (+7 (999) 123-45-67)",
              },
            }}
            render={({ field }) => (
              <TextField
                {...field}
                {...registerWithMask("phone", "+7 (999) 999-99-99", {
                  required: true,
                })}
                label="Номер телефона"
                variant="standard"
                required
                error={!!errors.phone}
                helperText={errors.phone?.message}
                fullWidth
              />
            )}
          />

          <Controller
            name="email"
            control={control}
            rules={{
              required: "Введите e-mail",
              pattern: {
                value: /^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/,
                message: "Неверный формат e-mail",
              },
              minLength: {
                value: 5,
                message: "E-mail должен содержать минимум 5 символов",
              },
              maxLength: {
                value: 50,
                message: "E-mail должен содержать максимум 50 символов",
              },
            }}
            render={({ field }) => (
              <TextField
                {...field}
                label="E-mail"
                variant="standard"
                required
                error={!!errors.email}
                helperText={errors.email?.message}
                fullWidth
              />
            )}
          />

          {serverError && (
            <Alert severity="error" sx={{ width: "100%", mt: 2 }}>
              {serverError}
            </Alert>
          )}

          <Box sx={{ mt: 5, display: "flex", justifyContent: "center" }}>
            <OutlinedButton
              onClick={handleSubmit(onSubmit)}
              disabled={!isFormValid}
              sx={{ gap: 1 }}
            >
              Продолжить
            </OutlinedButton>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};
