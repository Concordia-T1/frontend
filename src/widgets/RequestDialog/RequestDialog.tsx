import {
  Dialog,
  DialogContent,
  TextField,
  Button,
  IconButton,
  Box,
  Typography,
  Chip,
  Snackbar,
  Alert,
  CircularProgress,
  Select,
  MenuItem,
} from "@mui/material";
import HorizontalRuleIcon from "@mui/icons-material/HorizontalRule";
import ClearIcon from "@mui/icons-material/Clear";
import UploadIcon from "@mui/icons-material/Upload";
import React, { useState, useEffect, useCallback } from "react";
import Papa from "papaparse";
import { theme } from "@app/providers/ThemeProvider/config/theme.ts";
import { ActionButton } from "@shared/ui/buttons/ActionButton.tsx";
import { fetchWithCppdAuth } from "@shared/api/fetchWithCppdAuth";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@entities/user/store";
import {
  type Request,
  type FetchResponse,
  type CreateRequestResponse,
  type TemplatesCollectionResponse,
  type TemplateRecord,
} from "@app/types";
import debounce from "lodash.debounce";

interface RequestDialogProps {
  open: boolean;
  onClose: () => void;
  onCreate: (newRequests: Request[]) => void;
  setError: (error: string | null) => void;
}

export const RequestDialog = ({
  open,
  onClose,
  onCreate,
  setError,
}: RequestDialogProps) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [managerEmail, setManagerEmail] = useState("");
  const [candidateEmails, setCandidateEmails] = useState<string[]>([]);
  const [candidateInput, setCandidateInput] = useState("");
  const [hasDraft, setHasDraft] = useState(false);
  const [managerEmailError, setManagerEmailError] = useState(false);
  const [candidateEmailError, setCandidateEmailError] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [timer, setTimer] = useState(15);
  const [isLoading, setIsLoading] = useState(false);
  const [cancelToken, setCancelToken] = useState<() => void>(() => () => {});
  const [templates, setTemplates] = useState<TemplateRecord[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(
    null
  );
  const navigate = useNavigate();
  const { email: storedEmail, role, setEmail } = useAuthStore();

  const validateEmail = (email: string) =>
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email.trim());

  // Загрузка email менеджера и шаблонов
  useEffect(() => {
    if (open) {
      const loadManagerEmail = async () => {
        if (storedEmail && validateEmail(storedEmail)) {
          setManagerEmail(storedEmail);
          setManagerEmailError(false);
        } else {
          setIsLoading(true);
          try {
            const response: FetchResponse<{ email: string }> =
              await fetchWithCppdAuth("/users/me", { method: "GET" }, navigate);
            console.log("Ответ от /users/me:", response);
            if (response.ok && response.data.email) {
              setManagerEmail(response.data.email);
              setEmail(response.data.email);
              setManagerEmailError(!validateEmail(response.data.email));
            } else {
              setError("Не удалось загрузить email менеджера");
              setManagerEmailError(true);
            }
          } catch (err: unknown) {
            setError("Ошибка при загрузке email менеджера");
            setManagerEmailError(true);
          } finally {
            setIsLoading(false);
          }
        }
      };

      const loadTemplates = async () => {
        try {
          console.log("[RequestDialog] Запрос списка шаблонов: /templates");
          const response: FetchResponse<TemplatesCollectionResponse> =
            await fetchWithCppdAuth("/templates", { method: "GET" }, navigate);
          console.log("[RequestDialog] Ответ от /templates:", response);
          if (response.ok) {
            setTemplates(response.data.templates);
            setSelectedTemplateId(response.data.templates[0]?.id || null);
          } else {
            setError("Не удалось загрузить шаблоны");
          }
        } catch (err: unknown) {
          setError("Ошибка при загрузке шаблонов");
        }
      };

      loadManagerEmail();
      loadTemplates();
    }
  }, [open, navigate, setError, storedEmail, setEmail]);

  // Таймер для подтверждения отправки
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (snackbarOpen && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0 && snackbarOpen) {
      handleSendConfirmed();
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [snackbarOpen, timer]);

  // Debounced функция для обработки ввода email-адресов
  const processCandidateInput = useCallback(
    debounce((value: string) => {
      const emails = value
        .split(/[\s,]+|\n/)
        .filter((email) => email.trim() && validateEmail(email));
      const remainingText = value
        .split(/[\s,]+|\n/)
        .filter((email) => email.trim() && !validateEmail(email))
        .join(" ");

      if (emails.length > 0) {
        setCandidateEmails((prev) => [...new Set([...prev, ...emails])]);
        setCandidateInput(remainingText);
        setCandidateEmailError(remainingText.trim() !== "");
        setHasDraft(true);
      } else {
        const hasInvalidEmail = value
          .split(/[\s,]+|\n/)
          .some((email) => email.trim() && !validateEmail(email));
        setCandidateEmailError(hasInvalidEmail);
      }
    }, 300),
    []
  );

  const handleMinimize = () => {
    setIsMinimized(true);
    if (managerEmail || candidateEmails.length > 0 || candidateInput) {
      setHasDraft(true);
    }
  };

  const handleClose = () => {
    setIsMinimized(false);
    setCandidateEmails([]);
    setCandidateInput("");
    setManagerEmail("");
    setHasDraft(false);
    setManagerEmailError(false);
    setCandidateEmailError(false);
    setSnackbarOpen(false);
    setTimer(15);
    cancelToken();
    setTemplates([]);
    setSelectedTemplateId(null);
    onClose();
  };

  const handleSend = async () => {
    if (candidateInput.trim()) {
      const emails = candidateInput
        .split(/[\s,]+|\n/)
        .filter((email) => email.trim() && validateEmail(email));
      if (emails.length > 0) {
        setCandidateEmails((prev) => [...new Set([...prev, ...emails])]);
        setCandidateInput("");
        setCandidateEmailError(false);
      } else {
        setCandidateEmailError(true);
        setError("Неверный формат email кандидата в поле ввода");
        return;
      }
    }

    if (!validateEmail(managerEmail)) {
      setManagerEmailError(true);
      setError("Пожалуйста, введите корректный email менеджера");
      return;
    }
    if (candidateEmails.length === 0) {
      setCandidateEmailError(true);
      setError("Добавьте хотя бы один email кандидата");
      return;
    }

    setSnackbarOpen(true);
    setTimer(15);
    setCancelToken(() => () => {
      setSnackbarOpen(false);
      setTimer(15);
    });
  };

  const handleSendConfirmed = async () => {
    setIsLoading(true);
    try {
      console.log("Отправка запроса на /claims/issue", {
        candidates_emails: candidateEmails,
        manager_email: managerEmail,
        template_id: selectedTemplateId,
      });
      const response: FetchResponse<CreateRequestResponse> =
        await fetchWithCppdAuth(
          "/claims/issue",
          {
            method: "POST",
            headers: {
              "X-User-Email": managerEmail,
              "X-User-Role": role || "ROLE_MANAGER",
            },
            data: {
              candidates_emails: candidateEmails,
              manager_email: managerEmail,
              template_id: selectedTemplateId,
            },
          },
          navigate
        );

      console.log("Ответ от /claims/issue:", response);

      if (!response.ok) {
        const errorMsg = response.detail || "Ошибка при создании заявки";
        setError(errorMsg);
        setSnackbarOpen(false);
        setTimer(15);
        return;
      }

      const newRequests: Request[] = response.data.claims.map((claim) => ({
        id: claim.id.toString(),
        date: claim.created_at,
        email: claim.candidate_email,
        status: claim.status,
        is_viewed: !!claim.responded_at,
      }));

      onCreate(newRequests);
      handleClose();
    } catch (err: unknown) {
      const error =
        err instanceof Error ? err.message : "Ошибка при отправке запроса";
      console.error("Ошибка в handleSendConfirmed:", err);
      setError(error);
      setSnackbarOpen(false);
      setTimer(15);
      if (
        error.includes("Сессия истекла") ||
        error.includes("Сервер недоступен")
      ) {
        navigate("/login");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleManagerEmailChange = (value: string) => {
    setManagerEmail(value);
    setManagerEmailError(!validateEmail(value) && value.trim() !== "");
    if (value || candidateEmails.length > 0 || candidateInput) {
      setHasDraft(true);
    }
  };

  const handleCandidateInputChange = (value: string) => {
    setCandidateInput(value);
    processCandidateInput(value);
    if (value || managerEmail) {
      setHasDraft(true);
    }
  };

  const handleCandidateInputKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      event.preventDefault();
      const emails = candidateInput
        .split(/[\s,]+|\n/)
        .filter((email) => email.trim() && validateEmail(email));
      if (emails.length === 0 && candidateInput.trim()) {
        setCandidateEmailError(true);
        setError("Неверный формат email кандидата");
      } else {
        setCandidateEmails((prev) => [...new Set([...prev, ...emails])]);
        setCandidateInput("");
        setCandidateEmailError(false);
      }
    }
  };

  const handleCsvUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      Papa.parse(file, {
        complete: (result) => {
          const emails = result.data
            .flat()
            .filter((email: string) => email.trim() && validateEmail(email));
          if (emails.length === 0) {
            setError("CSV файл не содержит корректных email-адресов");
          } else {
            setCandidateEmails((prev) => [...new Set([...prev, ...emails])]);
            setHasDraft(true);
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

  return (
    <>
      <Dialog
        open={open && !isMinimized}
        onClose={handleClose}
        fullWidth
        maxWidth="sm"
        disablePortal
        hideBackdrop
        disableEnforceFocus
        disableAutoFocus
        sx={{
          "& .MuiDialog-paper": {
            position: "fixed",
            bottom: 0,
            right: "30px",
            m: 0,
            width: { xs: "100%", sm: "600px" },
            minHeight: { xs: "60vh", sm: "500px" },
            maxHeight: { xs: "80vh", sm: "700px" },
            borderRadius: "8px 8px 0 0",
            boxShadow: theme.shadows[4],
            zIndex: 1300,
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontWeight: 500,
            p: 2,
          }}
        >
          <Typography variant="h6">Запрос кандидату</Typography>
          <Box>
            <IconButton onClick={handleMinimize}>
              <HorizontalRuleIcon />
            </IconButton>
            <IconButton onClick={handleClose}>
              <ClearIcon />
            </IconButton>
          </Box>
        </Box>

        <DialogContent>
          <TextField
            label="E-mail менеджера"
            value={managerEmail}
            onChange={(e) => handleManagerEmailChange(e.target.value)}
            fullWidth
            margin="normal"
            variant="standard"
            error={managerEmailError}
            helperText={managerEmailError ? "Неверный формат e-mail" : ""}
            disabled={isLoading}
            sx={{ bgcolor: theme.palette.brand.white, marginTop: "40px" }}
          />
          <TextField
            placeholder="Email кандидата(ов)"
            variant="standard"
            fullWidth
            margin="normal"
            InputProps={{
              startAdornment: (
                <Box
                  sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: 1 }}
                >
                  {candidateEmails.map((email) => (
                    <Chip
                      key={email}
                      label={email}
                      onDelete={() =>
                        setCandidateEmails((prev) =>
                          prev.filter((e) => e !== email)
                        )
                      }
                      deleteIcon={<ClearIcon />}
                      sx={{
                        bgcolor: theme.palette.brand.backgroundLight,
                        color: theme.palette.brand.primary,
                        marginRight: 0.5,
                        marginBottom: 0.5,
                        height: 24,
                        fontSize: "0.85rem",
                        "& .MuiChip-deleteIcon": {
                          color: theme.palette.grey[500],
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
            }}
          />

          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
            <Button
              variant="outlined"
              endIcon={<UploadIcon />}
              component="label"
              disabled={isLoading}
              sx={{
                whiteSpace: "nowrap",
                bgcolor: theme.palette.brand.backgroundLight,
                color: theme.palette.brand.primary,
                borderColor: theme.palette.brand.white,
                textTransform: "none",
                borderRadius: "30px",
                "&:hover": { backgroundColor: "#DAE1E8" },
              }}
            >
              Загрузить CSV
              <input
                type="file"
                accept=".csv"
                hidden
                onChange={handleCsvUpload}
              />
            </Button>
          </Box>

          <Box sx={{ mt: 1, display: "flex", justifyContent: "flex-start" }}>
            <ActionButton
              onClick={handleSend}
              variant="contained"
              disabled={
                isLoading ||
                (candidateEmails.length === 0 && !candidateInput.trim())
              }
              startIcon={isLoading ? <CircularProgress size={20} /> : null}
              sx={{
                bgcolor: theme.palette.brand.lightBlue,
                borderRadius: "30px",
                "&:hover": { bgcolor: theme.palette.brand.darkblue },
              }}
            >
              {isLoading ? "Отправка..." : "Отправить"}
            </ActionButton>
          </Box>
        </DialogContent>
      </Dialog>

      {isMinimized && (
        <Box
          sx={{
            position: "fixed",
            bottom: 0,
            right: "30px",
            bgcolor: theme.palette.brand.backgroundLight,
            p: 1,
            borderRadius: "8px 8px 0 0",
            boxShadow: theme.shadows[4],
            display: "flex",
            alignItems: "center",
            gap: 1,
            zIndex: 1300,
          }}
        >
          <Typography variant="body2">
            {hasDraft ? "Черновик запроса" : "Новый запрос"}
          </Typography>
          <IconButton onClick={() => setIsMinimized(false)}>
            <HorizontalRuleIcon sx={{ transform: "rotate(180deg)" }} />
          </IconButton>
          <IconButton onClick={handleClose}>
            <ClearIcon />
          </IconButton>
        </Box>
      )}

      <Snackbar
        open={snackbarOpen}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        sx={{ zIndex: 1400 }}
      >
        <Alert
          severity="info"
          action={
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Button
                color="inherit"
                size="small"
                onClick={() => {
                  setSnackbarOpen(false);
                  setTimer(15);
                }}
              >
                Отменить
              </Button>
              <IconButton
                size="small"
                onClick={() => {
                  setSnackbarOpen(false);
                  setTimer(15);
                }}
              >
                <ClearIcon fontSize="small" />
              </IconButton>
            </Box>
          }
          sx={{ minWidth: "300px" }}
        >
          Отправка запроса ({timer})
        </Alert>
      </Snackbar>
    </>
  );
};
