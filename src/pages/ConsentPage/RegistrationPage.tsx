import { Box, Paper, Typography, TextField, Alert, useMediaQuery } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { useHookFormMask } from "use-mask-input";
import { isValid, parse, isBefore, subYears } from "date-fns";
import { OutlinedButton } from "../../shared/ui/buttons/OutlinedButton.tsx";
import { useState, useEffect } from "react";
import axios from "axios";
import { theme } from "../../app/providers/ThemeProvider/config/theme";

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
  const location = useLocation();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLinkValid, setIsLinkValid] = useState<boolean | null>(null);
  const [claimId, setClaimId] = useState<number | null>(null);
  const [candidatePhone, setCandidatePhone] = useState<string | null>(null);
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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

  useEffect(() => {
    const verifyInviteLink = async () => {
      const params = new URLSearchParams(location.search);
      const epk = params.get("epk");
      const ctx = params.get("ctx");
      const sig = params.get("sig");

      if (!epk || !ctx || !sig) {
        setServerError("Недействительная ссылка: отсутствуют параметры epk, ctx или sig");
        setIsLinkValid(false);
        navigate("/consent-error");
        return;
      }

      try {
        console.log("[RegistrationPage] Отправка запроса на /claims/validate", { epk, ctx, sig });
        const response = await axios.post(
          "/api/cppd-service/v1/claims/validate",
          { epk, ctx, sig },
          {
            withCredentials: true,
          }
        );

        console.log("[RegistrationPage] Ответ от /claims/validate:", response.data);

        if (response.status >= 200 && response.status < 300 && response.data.ok) {
          setIsLinkValid(true);
          setClaimId(response.data.claim_id);
          setCandidatePhone(response.data.candidate_phone || null);
        } else {
          setServerError(response.data?.detail || "Недействительная ссылка");
          setIsLinkValid(false);
          navigate("/consent-error");
        }
      } catch (error: any) {
        console.error("[RegistrationPage] Ошибка при проверке ссылки:", error);
        if (error.code === "ERR_NETWORK") {
          setServerError("Ошибка сети: сервер недоступен. Проверьте, запущен ли сервер.");
        } else if (error.response?.status === 401 || error.response?.status === 403) {
          setServerError("Недействительная или истекшая ссылка");
        } else {
          setServerError(error.response?.data?.detail || "Ошибка проверки ссылки");
        }
        setIsLinkValid(false);
        navigate("/consent-error");
      }
    };

    verifyInviteLink();
  }, [location, navigate]);

  const validateDate = (value: string) => {
    const parsedDate = parse(value, "dd.MM.yyyy", new Date());
    const minDate = new Date(1900, 0, 1); // 01.01.1900
    const maxDate = new Date(2025, 7, 27); // 27.08.2025 (сегодняшняя дата)
    const minAgeDate = subYears(maxDate, 14); // 14 лет назад

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

  const validatePhone = (value: string) => {
    const cleanedPhone = value.replace(/\D/g, "");
    if (cleanedPhone.length !== 11 || !/^[7|8][0-9]{10}$/.test(cleanedPhone)) {
      return "Номер телефона должен состоять ровно из 11 цифр, начиная с 7 или 8";
    }
    if (candidatePhone && cleanedPhone !== candidatePhone && cleanedPhone !== ("8" + candidatePhone.slice(1))) {
      return "Введенный номер телефона не соответствует данным заявки";
    }
    return true;
  };

  const onSubmit = async (data: FormValues) => {
    setServerError(null);
    if (claimId === null) {
      setServerError("Ошибка: claim_id не получен");
      navigate("/consent-error");
      return;
    }

    const cleanedPhone = data.phone.replace(/\D/g, "");
    const e164Phone = cleanedPhone.startsWith("8") ? "7" + cleanedPhone.slice(1) : cleanedPhone;
    const params = new URLSearchParams(location.search);
    const formattedData = {
      lastName: data.lastName,
      firstName: data.firstName,
      middleName: data.middleName || null,
      birthdate: data.birthDate,
      phone: e164Phone,
      email: data.email,
      epk: params.get("epk"),
      ctx: params.get("ctx"),
      sig: params.get("sig"),
      claim_id: claimId,
    };

    console.log("[RegistrationPage] Переход на /consent с данными:", formattedData);
    navigate("/consent", {
      state: {
        inviteParams: formattedData,
      },
    });
  };

  if (isLinkValid === null) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
        <Typography variant={isMobile ? "body1" : "h6"}>Проверка ссылки...</Typography>
      </Box>
    );
  }

  if (isLinkValid === false) {
    return null;
  }

  return (
    <Box
      sx={{
        p: { xs: 1, sm: 2 },
        maxWidth: "100%",
        boxSizing: "border-box",
        margin: { xs: "0 8px", sm: "0 24px" },
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Paper
        sx={{
          borderRadius: 2,
          p: { xs: 1, sm: 3 },
          width: { xs: "100%", sm: "600px" },
          boxSizing: "border-box",
          boxShadow: 'none'
        }}
      >
        <Typography
          variant={isMobile ? "h6" : "h5"}
          fontWeight={500}
          sx={{
            mt: { xs: 2, sm: 3 },
            mb: { xs: 3, sm: 5 },
            textTransform: "uppercase",
            textAlign: "center",
          }}
        >
          Согласие на обработку персональных данных
        </Typography>

        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: { xs: 1.5, sm: 2 },
            width: "100%",
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
                size={isMobile ? "small" : "medium"}
                required
                error={!!errors.lastName}
                helperText={errors.lastName?.message}
                fullWidth
                sx={{ mb: isMobile ? 1 : 2 }}
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
                size={isMobile ? "small" : "medium"}
                required
                error={!!errors.firstName}
                helperText={errors.firstName?.message}
                fullWidth
                sx={{ mb: isMobile ? 1 : 2 }}
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
                size={isMobile ? "small" : "medium"}
                error={!!errors.middleName}
                helperText={errors.middleName?.message}
                fullWidth
                sx={{ mb: isMobile ? 1 : 2 }}
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
                size={isMobile ? "small" : "medium"}
                required
                error={!!errors.birthDate}
                helperText={errors.birthDate?.message}
                fullWidth
                sx={{ mb: isMobile ? 1 : 2 }}
              />
            )}
          />

          <Controller
            name="phone"
            control={control}
            rules={{
              required: "Введите номер телефона",
              validate: validatePhone,
            }}
            render={({ field }) => (
              <TextField
                {...field}
                {...registerWithMask("phone", "+7 (999) 999-99-99", {
                  required: true,
                })}
                label="Номер телефона"
                variant="standard"
                size={isMobile ? "small" : "medium"}
                required
                error={!!errors.phone}
                helperText={errors.phone?.message}
                fullWidth
                sx={{ mb: isMobile ? 1 : 2 }}
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
                size={isMobile ? "small" : "medium"}
                required
                error={!!errors.email}
                helperText={errors.email?.message}
                fullWidth
                sx={{ mb: isMobile ? 1 : 2 }}
              />
            )}
          />

          {serverError && (
            <Alert
              severity="error"
              sx={{
                width: "100%",
                mt: isMobile ? 1 : 2,
                fontSize: isMobile ? "0.75rem" : "0.875rem",
              }}
            >
              {serverError}
            </Alert>
          )}

          <Box sx={{ mt: { xs: 3, sm: 5 }, display: "flex", justifyContent: "center" }}>
            <OutlinedButton
              onClick={handleSubmit(onSubmit)}
              disabled={!isFormValid || claimId === null}
              sx={{
                gap: 1,
                padding: { xs: "6px 12px", sm: "8px 16px" },
                fontSize: { xs: "0.875rem", sm: "1rem" },
                "&:hover": {
                  backgroundColor: theme.palette.brand.backgroundLight,
                },
              }}
            >
              Продолжить
            </OutlinedButton>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};