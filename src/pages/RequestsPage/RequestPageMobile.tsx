import {
  Box,
  TextField,
  Button,
  IconButton,
  Typography,
  Chip,
  CircularProgress,
  Select,
  MenuItem,
  Alert,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import UploadIcon from "@mui/icons-material/Upload";
import React, { useState, useEffect } from "react";
import Papa from "papaparse";
import { theme } from "../../app/providers/ThemeProvider/config/theme.ts";
import { ActionButton } from "../../shared/ui/buttons/ActionButton.tsx";
import { fetchWithCppdAuth } from "../../shared/api/fetchWithCppdAuth";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../entities/user/store";
import {
  type FetchResponse,
  type CreateRequestResponse,
} from "../../app/types";
import ClearIcon from '@mui/icons-material/Clear';
import { Slide, useMediaQuery } from "@mui/material";

interface TemplateRecord {
  id: string;
  name?: string;
  subject?: string;
  content: string;
}

interface ContactsResponse {
  smtp_host?: string;
  smtp_port?: number;
  smtp_api_key?: string;
  smtp_tls?: boolean;
  smtp_ssl?: boolean;
  smtp_ssl_host?: string | null;
  notification_types?: string[];
  contact_telegram?: string;
  contact_whatsapp?: string;
}

export const RequestPageMobile = () => {
  const [managerEmail, setManagerEmail] = useState("");
  const [candidateEmails, setCandidateEmails] = useState<string[]>([]);
  const [candidateInput, setCandidateInput] = useState("");
  const [candidateEmailError, setCandidateEmailError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [templates, setTemplates] = useState<TemplateRecord[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [profileWarning, setProfileWarning] = useState<string | null>(null);
  const navigate = useNavigate();
  const { email: storedEmail, userId } = useAuthStore();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const validateEmail = (email: string) =>
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email.trim());

  useEffect(() => {
    const loadManagerEmail = async () => {
      if (storedEmail) {
        setManagerEmail(storedEmail);
      } else {
        setIsLoading(true);
        try {
          const response: FetchResponse<{ account: { email: string } }> = await fetchWithCppdAuth(
            "/accounts/me",
            { method: "GET" },
            navigate
          );
          if (response.ok && response.data.account?.email) {
            setManagerEmail(response.data.account.email);
          } else {
            setError("Не удалось загрузить email менеджера");
          }
        } catch (err: unknown) {
          const errorMsg = err instanceof Error ? err.message : "Ошибка при загрузке email менеджера";
          setError(errorMsg);
        } finally {
          setIsLoading(false);
        }
      }

      try {
        const response: FetchResponse<{ templates: TemplateRecord[] }> = await fetchWithCppdAuth(
          `/templates?page=0&size=100`,
          { method: "GET" },
          navigate
        );

        if (!response.ok) {
          switch (response.status) {
            case 401:
              setError("Сессия истекла. Пожалуйста, войдите заново.");
              navigate("/login");
              break;
            case 403:
              setError("Доступ запрещен. Требуется роль администратора.");
              break;
            default:
              setError(response.detail || "Ошибка при загрузке шаблонов");
          }
          return;
        }

        const fetchedTemplates = response.data?.templates || [];
        setTemplates(fetchedTemplates);
        setSelectedTemplateId(fetchedTemplates.length > 0 ? fetchedTemplates[0].id : null);
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : "Ошибка соединения с сервером";
        setError(errorMsg);
      }
    };

    loadManagerEmail();
  }, [navigate, storedEmail]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
        navigate("/admin/requests");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, navigate]);

  const handleAddCandidateEmails = () => {
    if (!candidateInput.trim()) return;

    const emails = candidateInput
      .split(/[\s,]+|\n/)
      .filter((email) => email.trim() && validateEmail(email));

    if (emails.length === 0) {
      setCandidateEmailError(true);
      return;
    }

    setCandidateEmails((prev) => [...new Set([...prev, ...emails])]);
    setCandidateInput("");
    setCandidateEmailError(false);
  };

  const handleCandidateInputKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleAddCandidateEmails();
    }
  };

  const handleSend = async () => {
    const emailsToAdd = candidateInput
      .split(/[\s,]+|\n/)
      .filter((email) => email.trim() && validateEmail(email));

    const finalEmails = [...new Set([...candidateEmails, ...emailsToAdd])];

    if (!managerEmail || !validateEmail(managerEmail)) {
      setError("Email менеджера отсутствует или некорректен");
      return;
    }
    if (finalEmails.length === 0) {
      setCandidateEmailError(true);
      setError("Добавьте хотя бы один email кандидата");
      return;
    }
    if (!userId) {
      setError("Идентификатор пользователя отсутствует");
      return;
    }
    if (!selectedTemplateId) {
      setError("Выберите шаблон для запроса");
      return;
    }

    // Проверка контактов через /account/{id}/contacts
    try {
      const contactsResponse: FetchResponse<ContactsResponse> = await fetchWithCppdAuth(
        `/account/${userId}/contacts`,
        { method: "GET" },
        navigate
      );

      if (!contactsResponse.ok || !contactsResponse.data || Object.keys(contactsResponse.data).length === 0) {
        setProfileWarning("Перед отправкой заявки необходимо заполнить информацию в профиле");
        return;
      }

      const contacts = contactsResponse.data;
      const requiredFields = [
        contacts.smtp_host,
        contacts.smtp_port,
        contacts.smtp_api_key,
        contacts.notification_types,
        contacts.contact_telegram,
        contacts.contact_whatsapp,
      ];

      const isValid = requiredFields.every(
        (field) => field !== null && field !== undefined && field !== "" && (!Array.isArray(field) || field.length > 0)
      );

      if (!isValid) {
        setProfileWarning("Перед отправкой заявки необходимо заполнить информацию в профиле");
        return;
      }

      setCandidateEmails(finalEmails);
      setCandidateInput("");
      setCandidateEmailError(false);

      await handleSendConfirmed(finalEmails);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Ошибка при проверке контактов";
      setError(errorMsg);
      if (errorMsg.includes("Сессия истекла") || errorMsg.includes("Сервер недоступен")) {
        navigate("/login");
      }
    }
  };

  const handleSendConfirmed = async (emails: string[]) => {
    setIsLoading(true);
    try {
      const response: FetchResponse<CreateRequestResponse> = await fetchWithCppdAuth(
        "/claims/issue",
        {
          method: "POST",
          data: {
            candidates_emails: emails,
            template_id: selectedTemplateId,
          },
        },
        navigate
      );

      if (!response.ok) {
        const errorMsg =
          response.data.validation_errors && Array.isArray(response.data.validation_errors)
            ? response.data.validation_errors
              .map((err) => `${err.field}: ${err.detail}`)
              .join("; ")
            : response.detail || "Ошибка при создании заявки";
        setError(errorMsg);
        return;
      }

      setSuccessMessage("Заявка отправлена");
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Ошибка при отправке запроса";
      setError(errorMsg);
      if (errorMsg.includes("Сессия истекла") || errorMsg.includes("Сервер недоступен")) {
        navigate("/login");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCandidateInputChange = (value: string) => {
    setCandidateInput(value);
  };

  const handleCsvUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      Papa.parse<string[]>(file, {
        complete: (result) => {
          const emails = result.data
            .flat()
            .filter((email) => typeof email === "string" && email.trim() && validateEmail(email));
          if (emails.length === 0) {
            setError("CSV файл не содержит корректных email-адресов");
          } else {
            setCandidateEmails((prev) => [...new Set([...prev, ...emails])]);
          }
        },
        header: false,
        skipEmptyLines: true,
        error: () => {
          setError("Ошибка при чтении CSV файла");
        },
      });
    }
  };

  const handleBack = () => {
    navigate("/admin/requests");
  };

  return (
    <Box sx={{ p: { xs: 1, sm: 2 }, maxWidth: "100%", boxSizing: "border-box", minHeight: "100vh", bgcolor: theme.palette.brand.white }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: { xs: 1, sm: 2 } }}>
        <IconButton onClick={handleBack} sx={{ mr: 1 }}>
          <ArrowBackIcon fontSize={isMobile ? "small" : "medium"} />
        </IconButton>
        <Typography variant={isMobile ? "body1" : "h6"}>Запрос кандидату</Typography>
      </Box>

      {error && (
        <Alert
          severity="error"
          sx={{ mb: { xs: 1, sm: 2 }, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
        >
          {error}
        </Alert>
      )}
      {profileWarning && (
        <Slide direction="up" in={!!profileWarning} mountOnEnter unmountOnExit>
          <Alert
            severity="warning"
            sx={{
              position: 'fixed',
              bottom: { xs: 16, sm: 24 },
              left: { xs: 16, sm: 24 },
              zIndex: 1000,
              maxWidth: { xs: '80%', sm: '400px' },
              padding: { xs: '8px 16px', sm: '16px 24px' },
              fontSize: { xs: '0.75rem', sm: '1rem' },
              lineHeight: { xs: 1.4, sm: 1.5 },
              bgcolor: theme.palette.brand.lightBlue,
              color: theme.palette.brand.white,
              "& .MuiAlert-icon": {
                color: theme.palette.brand.white,
              },
            }}
            action={
              <ActionButton
                onClick={() => navigate("/profile")}
                variant="contained"
                sx={{
                  bgcolor: theme.palette.brand.darkblue,
                  color: theme.palette.brand.white,
                  borderRadius: "20px",
                  padding: { xs: '4px 8px', sm: '6px 12px' },
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  "&:hover": { bgcolor: theme.palette.brand.lightBlue },
                }}
              >
                Перейти в профиль
              </ActionButton>
            }
          >
            {profileWarning}
          </Alert>
        </Slide>
      )}
      <Select
        value={selectedTemplateId || ""}
        variant="standard"
        onChange={(e) => setSelectedTemplateId(e.target.value || null)}
        displayEmpty
        fullWidth
        disabled={isLoading || templates.length === 0}
        sx={{ marginTop: { xs: 1, sm: 2 }, fontSize: { xs: '0.875rem', sm: '1rem' } }}
      >
        {templates.length === 0 ? (
          <MenuItem value="" disabled sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
            Нет доступных шаблонов
          </MenuItem>
        ) : (
          templates.map((template) => (
            <MenuItem key={template.id} value={template.id} sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
              {template.name || "Без названия"}
            </MenuItem>
          ))
        )}
      </Select>
      <TextField
        label="E-mail менеджера"
        value={managerEmail}
        fullWidth
        margin="normal"
        variant="standard"
        slotProps={{
          input: {
            readOnly: true,
          },
        }}
        disabled={isLoading}
        sx={{
          bgcolor: theme.palette.brand.white,
          "& .MuiInputBase-input": { fontSize: { xs: '0.875rem', sm: '1rem' } },
        }}
      />

      <TextField
        placeholder="Email кандидата(ов)"
        variant="standard"
        fullWidth
        margin="normal"
        InputProps={{
          startAdornment: (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: 1 }}>
              {candidateEmails.map((email) => (
                <Chip
                  key={email}
                  label={email}
                  onDelete={() =>
                    setCandidateEmails((prev) => prev.filter((e) => e !== email))
                  }
                  deleteIcon={<ClearIcon />}
                  sx={{
                    bgcolor: theme.palette.brand.backgroundLight,
                    color: theme.palette.brand.primary,
                    marginRight: 0.5,
                    marginBottom: 0.5,
                    height: { xs: 20, sm: 24 },
                    fontSize: { xs: '0.75rem', sm: '0.85rem' },
                    "& .MuiChip-deleteIcon": {
                      color: theme.palette.grey[500],
                      fontSize: { xs: '0.875rem', sm: '1rem' },
                      "&:hover": { color: theme.palette.grey[700] },
                    },
                  }}
                />
              ))}
            </Box>
          ),
        }}
        onChange={(e) => handleCandidateInputChange(e.target.value)}
        onKeyDown={handleCandidateInputKeyDown}
        value={candidateInput}
        error={candidateEmailError}
        helperText={candidateEmailError ? "Неверный формат e-mail" : ""}
        disabled={isLoading}
        sx={{
          "& .MuiInputBase-root": { display: "flex", flexWrap: "wrap" },
          "& .MuiInputBase-input": { fontSize: { xs: '0.875rem', sm: '1rem' } },
        }}
      />

      <Box sx={{ display: "flex", justifyContent: "space-between", mt: { xs: 1, sm: 2 } }}>
        <ActionButton
          onClick={handleSend}
          variant="contained"
          disabled={isLoading || (candidateEmails.length === 0 && !candidateInput.trim())}
          startIcon={isLoading ? <CircularProgress size={isMobile ? 16 : 20} /> : null}
          sx={{
            maxWidth: { xs: "50%", sm: "400px" },
            bgcolor: theme.palette.brand.lightBlue,
            borderRadius: "30px",
            "&:hover": { bgcolor: theme.palette.brand.darkblue },
            padding: { xs: '6px 12px', sm: '8px 16px' },
            fontSize: { xs: '0.875rem', sm: '1rem' },
          }}
        >
          {isLoading ? "Отправка..." : "Отправить"}
        </ActionButton>
        <Button
          variant="outlined"
          endIcon={<UploadIcon fontSize={isMobile ? "small" : "medium"} />}
          component="label"
          disabled={isLoading}
          sx={{
            minWidth: { xs: "100px", sm: "120px" },
            fontSize: { xs: '0.75rem', sm: '0.85rem' },
            bgcolor: theme.palette.brand.backgroundLight,
            color: theme.palette.brand.primary,
            borderColor: theme.palette.brand.white,
            textTransform: "none",
            borderRadius: "20px",
            padding: { xs: '6px 12px', sm: '8px 16px' },
            "&:hover": { backgroundColor: "#DAE1E8" },
          }}
        >
          CSV
          <input type="file" accept=".csv" hidden onChange={handleCsvUpload} />
        </Button>
      </Box>
      {successMessage && (
        <Slide direction="up" in={!!successMessage} mountOnEnter unmountOnExit>
          <Alert
            severity="success"
            sx={{
              position: 'fixed',
              bottom: { xs: 16, sm: 24 },
              left: { xs: 16, sm: 24 },
              zIndex: 1000,
              maxWidth: { xs: '80%', sm: '400px' },
              padding: { xs: '8px 16px', sm: '16px 24px' },
              fontSize: { xs: '0.75rem', sm: '1rem' },
              lineHeight: { xs: 1.4, sm: 1.5 },
              bgcolor: theme.palette.brand.lightBlue,
              color: theme.palette.brand.white,
              "& .MuiAlert-icon": {
                color: theme.palette.brand.white,
              },
            }}
          >
            {successMessage}
          </Alert>
        </Slide>
      )}
    </Box>
  );
};