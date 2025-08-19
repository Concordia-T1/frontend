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
} from "@mui/material";
import HorizontalRuleIcon from "@mui/icons-material/HorizontalRule";
import ClearIcon from "@mui/icons-material/Clear";
import UploadIcon from "@mui/icons-material/Upload";
import React, { useState, useEffect } from "react";
import Papa from "papaparse";
import { theme } from "@app/providers/ThemeProvider/config/theme.ts";
import { ActionButton } from "@shared/ui/buttons/ActionButton.tsx";
import { fetchWithAuth } from "@shared/api/fetchWithAuth";
import { useNavigate } from "react-router-dom";
import {
  type Request,
  type FetchResponse,
  type CreateRequestResponse,
  type RequestsCollectionResponse,
} from "@app/types";

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
  const [managerEmail, setManagerEmail] = useState("manager@company.com");
  const [candidateEmails, setCandidateEmails] = useState<string[]>([]);
  const [candidateInput, setCandidateInput] = useState("");
  const [hasDraft, setHasDraft] = useState(false);
  const [managerEmailError, setManagerEmailError] = useState(false);
  const [candidateEmailError, setCandidateEmailError] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [timer, setTimer] = useState(15);
  const [cancelToken, setCancelToken] = useState<() => void>(() => () => {});
  const navigate = useNavigate();

  const validateEmail = (email: string) =>
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email.trim());

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

  const handleMinimize = () => {
    setIsMinimized(true);
    if (managerEmail || candidateEmails.length > 0) {
      setHasDraft(true);
    }
  };

  const handleClose = () => {
    setIsMinimized(false);
    setCandidateEmails([]);
    setCandidateInput("");
    setManagerEmail("manager@company.com");
    setHasDraft(false);
    setManagerEmailError(false);
    setCandidateEmailError(false);
    setSnackbarOpen(false);
    setTimer(15);
    cancelToken();
    onClose();
  };

  const handleSend = async () => {
    if (!validateEmail(managerEmail)) {
      setManagerEmailError(true);
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
    try {
      const newRequests: Request[] = [];
      for (const email of candidateEmails) {
        const response: FetchResponse<CreateRequestResponse> =
          await fetchWithAuth(
            "/claims/issue",
            {
              method: "POST",
              data: {
                email,
                manager_email: managerEmail,
              },
            },
            navigate
          );

        if (!response.ok) {
          setError(response.detail || "Ошибка при создании заявки");
          setSnackbarOpen(false);
          setTimer(15);
          return;
        }

        newRequests.push(response.data.request);
      }

      const response: FetchResponse<RequestsCollectionResponse> =
        await fetchWithAuth(
          "/claims",
          {
            method: "GET",
            params: {
              page: 0,
              size: 20,
              sort: ["createdDate,desc"],
            },
          },
          navigate
        );

      if (!response.ok) {
        setError(response.detail || "Ошибка при обновлении списка заявок");
        setSnackbarOpen(false);
        setTimer(15);
        return;
      }

      onCreate(response.data.requests);
      handleClose();
    } catch (err: unknown) {
      const error =
        err instanceof Error ? err.message : "Ошибка при отправке запроса";
      setError(error);
      setSnackbarOpen(false);
      setTimer(15);
      if (
        error.includes("Сессия истекла") ||
        error.includes("Сервер недоступен")
      ) {
        navigate("/login");
      }
    }
  };

  const handleManagerEmailChange = (value: string) => {
    setManagerEmail(value);
    setManagerEmailError(!validateEmail(value) && value.trim() !== "");
    if (value || candidateEmails.length > 0) {
      setHasDraft(true);
    }
  };

  const handleCandidateInputChange = (value: string) => {
    setCandidateInput(value);
    // Проверяем, есть ли некорректные email при вводе
    const emails = value.split(/[\s,]+|\n/).filter((email) => email.trim());
    const hasInvalidEmail = emails.some(
      (email) => !validateEmail(email) && email.trim() !== ""
    );
    setCandidateEmailError(hasInvalidEmail);
    if (value || managerEmail) {
      setHasDraft(true);
    }
  };

  const handleCandidateInputKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      event.preventDefault();
      // Разделяем ввод по пробелу, запятой или переносу строки
      const emails = candidateInput
        .split(/[\s,]+|\n/)
        .filter((email) => email.trim() && validateEmail(email));
      if (emails.length === 0 && candidateInput.trim()) {
        setCandidateEmailError(true);
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
            slotProps={{
              input: {
                readOnly: true,
              },
            }}
            margin="normal"
            variant="standard"
            error={managerEmailError}
            helperText={managerEmailError ? "Неверный формат e-mail" : ""}
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
            sx={{
              "& .MuiInputBase-root": { display: "flex", flexWrap: "wrap" },
            }}
          />

          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
            <Button
              variant="outlined"
              endIcon={<UploadIcon />}
              component="label"
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
              disabled={candidateEmails.length === 0 || managerEmailError}
              sx={{
                bgcolor: theme.palette.brand.lightBlue,
                borderRadius: "30px",
                "&:hover": { bgcolor: theme.palette.brand.darkblue },
              }}
            >
              Отправить
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
