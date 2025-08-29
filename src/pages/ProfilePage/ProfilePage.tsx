import {
  Box,
  TextField,
  Button,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  ListItemText,
  CircularProgress,
  Snackbar,
  Alert,
  Switch,
  FormControlLabel,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { theme } from "../../app/providers/ThemeProvider/config/theme.ts";
import { FilledButton } from "../../shared/ui/buttons/FilledButton.tsx";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { fetchWithAuth } from "../../shared/api/fetchWithAuth.ts";
import { useAuthStore } from "../../entities/user/store";
import { type ContactsRecord, type FetchResponse } from "../../app/types";

interface ErrorResponse {
  validation_errors?: { field: string; detail: string }[];
  detail?: string;
}

const notificationOptions = [
  { value: "NOTIFY_EMAIL", label: "Email" },
  { value: "NOTIFY_TELEGRAM", label: "Telegram" },
  { value: "NOTIFY_WHATSAPP", label: "WhatsApp" },
];

export const ProfilePage = () => {
  const navigate = useNavigate();
  const { userId, email } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    smtp_host: "",
    smtp_port: 587,
    smtp_api_key: "",
    smtp_tls: true,
    smtp_ssl: false,
    smtp_ssl_host: "",
    notification_types: [] as string[],
    contact_telegram: "",
    contact_whatsapp: "",
  });
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const fetchContacts = async () => {
      if (!userId) {
        setError("ID пользователя не указан");
        setLoading(false);
        return;
      }

      try {
        console.log(`[ProfilePage] Запрос данных контактов: /accounts/${userId}/contacts`);
        const response: FetchResponse<ContactsRecord> = await fetchWithAuth<ContactsRecord>(
          `/accounts/${userId}/contacts`,
          { method: "GET" },
          navigate
        );

        if (!response.ok) {
          if (response.status === 404) {
            setFormData({
              smtp_host: "",
              smtp_port: 587,
              smtp_api_key: "",
              smtp_tls: true,
              smtp_ssl: false,
              smtp_ssl_host: "",
              notification_types: [],
              contact_telegram: "",
              contact_whatsapp: "",
            });
          } else if (response.status === 401) {
            setError("Сессия истекла. Пожалуйста, войдите заново.");
            navigate("/login");
          } else {
            const errorData = response.data as ErrorResponse;
            setError(errorData.detail || "Ошибка при загрузке данных контактов");
          }
          setLoading(false);
          return;
        }

        setFormData({
          smtp_host: response.data.smtp_host || "",
          smtp_port: response.data.smtp_port || 587,
          smtp_api_key: response.data.smtp_api_key || "",
          smtp_tls: response.data.smtp_tls ?? true,
          smtp_ssl: response.data.smtp_ssl ?? false,
          smtp_ssl_host: response.data.smtp_ssl_host || "",
          notification_types: response.data.notification_types || [],
          contact_telegram: response.data.contact_telegram || "",
          contact_whatsapp: response.data.contact_whatsapp || "",
        });
        setLoading(false);
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : "Ошибка соединения с сервером";
        setError(errorMsg);
        setLoading(false);
      }
    };

    fetchContacts();
  }, [userId, navigate]);

  const handleInputChange = (field: string, value: string | number | boolean | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFormErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validateForm = () => {
    const errors: { [key: string]: string } = {};
    if (!formData.smtp_host.trim()) {
      errors.smtp_host = "SMTP Host обязателен";
    }
    if (!formData.smtp_port || formData.smtp_port <= 0) {
      errors.smtp_port = "SMTP Port должен быть положительным числом";
    }
    if (!formData.smtp_api_key.trim()) {
      errors.smtp_api_key = "SMTP API Key обязателен";
    }
    if (formData.smtp_tls === null || formData.smtp_tls === undefined) {
      errors.smtp_tls = "SMTP TLS обязателен";
    }
    if (formData.smtp_ssl === null || formData.smtp_ssl === undefined) {
      errors.smtp_ssl = "SMTP SSL обязателен";
    }
    if (formData.notification_types.length === 0) {
      errors.notification_types = "Выберите хотя бы один тип уведомления";
    }
    if (!formData.contact_telegram.trim()) {
      errors.contact_telegram = "Telegram обязателен";
    }
    if (!formData.contact_whatsapp.trim()) {
      errors.contact_whatsapp = "WhatsApp обязателен";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!userId) {
      setError("ID пользователя не указан");
      return;
    }

    if (!validateForm()) {
      setError("Пожалуйста, заполните все обязательные поля");
      return;
    }

    setLoading(true);
    try {
      const preparedData = {
        smtp_host: formData.smtp_host.trim() || null,
        smtp_port: Number(formData.smtp_port),
        smtp_api_key: formData.smtp_api_key.trim() || null,
        smtp_tls: formData.smtp_tls,
        smtp_ssl: formData.smtp_ssl,
        smtp_ssl_host: formData.smtp_ssl_host.trim() || null,
        notification_types: formData.notification_types.length > 0 ? formData.notification_types : null,
        contact_telegram: formData.contact_telegram.trim() || null,
        contact_whatsapp: formData.contact_whatsapp.trim() || null,
      };

      const response: FetchResponse<ContactsRecord> = await fetchWithAuth(
        `/accounts/${userId}/update-contacts`,
        {
          method: "POST",
          data: preparedData,
        },
        navigate
      );

      if (!response.ok) {
        const errorData = response.data as ErrorResponse;
        const errorMsg =
          errorData.validation_errors && Array.isArray(errorData.validation_errors)
            ? errorData.validation_errors
              .map((err) => `${err.field}: ${err.detail}`)
              .join("; ")
            : errorData.detail || "Ошибка при сохранении данных";
        setError(errorMsg);
        if (response.status === 401) {
          navigate("/login");
        }
        return;
      }

      setSuccessMessage("Настройки успешно сохранены");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Ошибка при отправке запроса";
      setError(errorMsg);
      if (errorMsg.includes("Сессия истекла")) {
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        p: { xs: 1, sm: 2 },
        maxWidth: { xs: "80%", sm: "80%", md: "50%" },
        margin: "0 auto",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        minHeight: "100vh",
      }}
    >
      <Box sx={{ display: "flex", gap: 1, alignSelf: "flex-start", position: 'absolute',  }}>
        <Button
          sx={{
            color: theme.palette.brand.secondary,
            transition: "0.5s",
            "&:hover": { color: theme.palette.brand.primary, bgcolor: theme.palette.brand.white },
          }}
          onClick={() => navigate("/requests")}
        >
          <ArrowBackIcon />
        </Button>
      </Box>
      <Typography variant="h6" fontWeight={500} sx={{ mb: 4 }}>
        Настройки профиля
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2, width: "100%", alignSelf: "center" }}>
        <TextField
          label="Email"
          value={email || "Не указано"}
          variant="standard"
          InputProps={{ readOnly: true }}
        />
        <TextField
          label="SMTP Host"
          value={formData.smtp_host}
          variant="standard"
          onChange={(e) => handleInputChange("smtp_host", e.target.value)}
          disabled={loading}
          error={!!formErrors.smtp_host}
          helperText={formErrors.smtp_host}
        />
        <TextField
          label="SMTP Port"
          value={formData.smtp_port}
          type="number"
          variant="standard"
          onChange={(e) => handleInputChange("smtp_port", Number(e.target.value))}
          disabled={loading}
          error={!!formErrors.smtp_port}
          helperText={formErrors.smtp_port}
        />
        <TextField
          label="SMTP API Key"
          value={formData.smtp_api_key}
          variant="standard"
          onChange={(e) => handleInputChange("smtp_api_key", e.target.value)}
          disabled={loading}
          error={!!formErrors.smtp_api_key}
          helperText={formErrors.smtp_api_key}
        />
        <FormControlLabel
          control={
            <Switch
              checked={formData.smtp_tls}
              onChange={(e) => handleInputChange("smtp_tls", e.target.checked)}
              disabled={loading}
            />
          }
          label="SMTP TLS"
          sx={{
            "& .MuiFormControlLabel-label": {
              color: formErrors.smtp_tls ? theme.palette.error.main : "inherit",
            },
          }}
        />
        <FormControlLabel
          control={
            <Switch
              checked={formData.smtp_ssl}
              onChange={(e) => handleInputChange("smtp_ssl", e.target.checked)}
              disabled={loading}
            />
          }
          label="SMTP SSL"
          sx={{
            "& .MuiFormControlLabel-label": {
              color: formErrors.smtp_ssl ? theme.palette.error.main : "inherit",
            },
          }}
        />
        <TextField
          label="SMTP SSL Host"
          value={formData.smtp_ssl_host}
          variant="standard"
          onChange={(e) => handleInputChange("smtp_ssl_host", e.target.value)}
          disabled={loading}
        />
        <FormControl variant="standard" error={!!formErrors.notification_types}>
          <InputLabel>Типы уведомлений</InputLabel>
          <Select
            multiple
            value={formData.notification_types}
            onChange={(e) => handleInputChange("notification_types", e.target.value as string[])}
            renderValue={(selected) =>
              selected
                .map((value) => notificationOptions.find((opt) => opt.value === value)?.label)
                .join(", ")
            }
            disabled={loading}
          >
            {notificationOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                <Checkbox checked={formData.notification_types.includes(option.value)} />
                <ListItemText primary={option.label} />
              </MenuItem>
            ))}
          </Select>
          {!!formErrors.notification_types && (
            <Typography variant="caption" color="error">
              {formErrors.notification_types}
            </Typography>
          )}
        </FormControl>
        <TextField
          label="Telegram"
          value={formData.contact_telegram}
          variant="standard"
          onChange={(e) => handleInputChange("contact_telegram", e.target.value)}
          disabled={loading}
          error={!!formErrors.contact_telegram}
          helperText={formErrors.contact_telegram}
        />
        <TextField
          label="WhatsApp"
          value={formData.contact_whatsapp}
          variant="standard"
          onChange={(e) => handleInputChange("contact_whatsapp", e.target.value)}
          disabled={loading}
          error={!!formErrors.contact_whatsapp}
          helperText={formErrors.contact_whatsapp}
        />
        <Box sx={{ display: "flex", gap: 2, mt: 3, justifyContent: "center" }}>
          <FilledButton
            onClick={handleSave}
            disabled={loading}
            sx={{
              bgcolor: theme.palette.brand.lightBlue,
              "&:hover": { bgcolor: theme.palette.brand.darkblue },
            }}
          >
            {loading ? <CircularProgress size={20} /> : "Сохранить"}
          </FilledButton>
        </Box>
      </Box>
      <Snackbar
        open={!!successMessage}
        autoHideDuration={3000}
        onClose={() => setSuccessMessage(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        sx={{
          "& .MuiSnackbarContent-root": {
            bgcolor: theme.palette.brand.lightBlue,
            color: theme.palette.brand.white,
            borderRadius: "8px",
            boxShadow: theme.shadows[4],
            animation: "slideIn 0.5s ease-in-out",
            "@keyframes slideIn": {
              "0%": { transform: "translateY(100%)" },
              "100%": { transform: "translateY(0)" },
            },
          },
        }}
      >
        <Alert
          severity="success"
          sx={{
            bgcolor: theme.palette.brand.lightBlue,
            color: theme.palette.brand.white,
            "& .MuiAlert-icon": { color: theme.palette.brand.white },
          }}
        >
          {successMessage}
        </Alert>
      </Snackbar>
      <Snackbar
        open={!!error}
        autoHideDuration={3000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        sx={{
          "& .MuiSnackbarContent-root": {
            bgcolor: theme.palette.brand.pastelRed,
            color: theme.palette.brand.white,
            borderRadius: "8px",
            boxShadow: theme.shadows[4],
            animation: "slideIn 0.5s ease-in-out",
            "@keyframes slideIn": {
              "0%": { transform: "translateY(100%)" },
              "100%": { transform: "translateY(0)" },
            },
          },
        }}
      >
        <Alert
          severity="error"
          sx={{
            bgcolor: theme.palette.brand.pastelRed,
            color: theme.palette.brand.white,
            "& .MuiAlert-icon": { color: theme.palette.brand.white },
          }}
        >
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};