import {
  Box,
  Button,
  Paper,
  Typography,
  TextField,
  Chip,
  CircularProgress,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { theme } from "../../app/providers/ThemeProvider/config/theme.ts";
import { FilledButton } from "../../shared/ui/buttons/FilledButton.tsx";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DeleteIcon from "@mui/icons-material/Delete";
import { fetchWithCppdAuth } from "@shared/api/fetchWithCppdAuth";
import { useAuthStore } from "@entities/user/store";
import { type ClaimRecord } from "@app/types";

export const RequestInfoPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { userId, role } = useAuthStore();
  const [request, setRequest] = useState<ClaimRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRequest = async () => {
      if (!id) {
        setError("ID заявки не указан");
        setLoading(false);
        return;
      }

      try {
        console.log(`[RequestInfoPage] Запрос данных заявки: /claims/${id}`);
        const response = await fetchWithCppdAuth<ClaimRecord>(
          `/claims/${id}`,
          {
            method: "GET",
            headers: {
              "X-User-ID": userId?.toString() || "",
              "X-User-Role": role ? `ROLE_${role}` : "ROLE_ADMIN",
            },
          },
          navigate
        );

        console.log(`[RequestInfoPage] Ответ от /claims/${id}:`, response);

        if (!response.ok) {
          switch (response.status) {
            case 401:
              setError("Сессия истекла. Пожалуйста, войдите заново.");
              break;
            case 404:
              setError("Заявка не найдена.");
              break;
            default:
              setError(response.detail || "Ошибка при загрузке данных заявки");
          }
          setLoading(false);
          return;
        }

        setRequest(response.data);
        setLoading(false);
      } catch (err: unknown) {
        const errorMsg =
          err instanceof Error ? err.message : "Ошибка соединения с сервером";
        setError(errorMsg);
        setLoading(false);
      }
    };

    fetchRequest();
  }, [id, userId, role, navigate]);

  const handleExport = () => {
    if (request) {
      console.log("Экспорт данных для заявки:", request);
      // Реализуйте логику экспорта, например, создание JSON или CSV файла
    }
  };

  const handleDelete = async () => {
    if (request) {
      try {
        console.log("Удаление заявки:", request.id);
        const response = await fetchWithCppdAuth(
          `/claims/${request.id}`,
          {
            method: "DELETE",
            headers: {
              "X-User-ID": userId?.toString() || "",
              "X-User-Role": role ? `ROLE_${role}` : "ROLE_ADMIN",
            },
          },
          navigate
        );

        if (response.ok) {
          navigate("/requests");
        } else {
          setError("Ошибка при удалении заявки");
        }
      } catch (err: unknown) {
        const errorMsg =
          err instanceof Error ? err.message : "Ошибка при удалении заявки";
        setError(errorMsg);
      }
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !request) {
    return (
      <Box
        sx={{
          p: { xs: 1, sm: 2 },
          maxWidth: "100%",
          boxSizing: "border-box",
          margin: { xs: "0 16px", sm: "0 24px" },
        }}
      >
        <Typography color="error">
          {error || "Данные заявки недоступны"}
        </Typography>
        <Button
          sx={{
            color: theme.palette.brand.secondary,
            mt: 2,
            transition: "0.5s",
            "&:hover": {
              color: theme.palette.brand.primary,
              bgcolor: theme.palette.brand.white,
            },
          }}
          onClick={() => navigate("/requests")}
        >
          <ArrowBackIcon />
          Назад
        </Button>
      </Box>
    );
  }

  const isCandidateDataVisible =
    request.status === "STATUS_CONSENT" || request.status === "STATUS_REFUSED";

  return (
    <Box
      sx={{
        p: { xs: 1, sm: 2 },
        maxWidth: "100%",
        boxSizing: "border-box",
        margin: { xs: "0 16px", sm: "0 24px" },
      }}
    >
      <Box sx={{ display: "flex", gap: 1, mb: 3, mt: 2 }}>
        <Button
          sx={{
            color: theme.palette.brand.secondary,
            transition: "0.5s",
            "&:hover": {
              color: theme.palette.brand.primary,
              bgcolor: theme.palette.brand.white,
            },
          }}
          onClick={() => {
            console.log("Переход на страницу запросов");
            navigate("/requests");
          }}
        >
          <ArrowBackIcon />
        </Button>
        <Button
          sx={{
            color: theme.palette.brand.secondary,
            transition: "0.5s",
            "&:hover": {
              color: theme.palette.brand.primary,
              bgcolor: theme.palette.brand.white,
            },
          }}
          onClick={handleDelete}
        >
          <DeleteIcon />
        </Button>
      </Box>
      <Paper
        sx={{
          p: { xs: 2, sm: 3 },
          border: "1px solid",
          borderColor: "grey.300",
          borderRadius: 1,
          boxShadow: "none",
          position: "relative",
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 5 }}>
          <Box>
            <Typography
              variant="h6"
              fontWeight={500}
              sx={{ marginBottom: "10px" }}
            >
              {request.candidate_email}
            </Typography>
            <Chip
              label={
                request.status === "STATUS_CONSENT"
                  ? "Согласие"
                  : request.status === "STATUS_REFUSED"
                  ? "Отказ"
                  : request.status === "STATUS_WAITING"
                  ? "Ожидание"
                  : request.status === "STATUS_QUEUED"
                  ? "В очереди"
                  : "Таймаут"
              }
              sx={{
                backgroundColor:
                  request.status === "STATUS_CONSENT"
                    ? theme.palette.brand.pastelGreen
                    : request.status === "STATUS_REFUSED"
                    ? theme.palette.brand.pastelRed
                    : request.status === "STATUS_WAITING"
                    ? theme.palette.brand.pastelOrange
                    : request.status === "STATUS_QUEUED"
                    ? theme.palette.brand.pastelBlue
                    : theme.palette.brand.pastelBlue,
              }}
            />
          </Box>
          <Box sx={{ textAlign: "right" }}>
            <Typography variant="body2" color="text.secondary">
              Отправлено:{" "}
              {new Date(request.created_at).toLocaleDateString("ru-RU")}
            </Typography>
            {isCandidateDataVisible && (
              <>
                <Typography variant="body2" color="text.secondary">
                  Обновлено:{" "}
                  {request.updated_at
                    ? new Date(request.updated_at).toLocaleDateString("ru-RU")
                    : "—"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Истекает:{" "}
                  {new Date(request.expires_at).toLocaleDateString("ru-RU")}
                </Typography>
              </>
            )}
          </Box>
        </Box>

        {isCandidateDataVisible && (
          <>
            <Typography variant="h6" fontWeight={400} sx={{ mt: 3, mb: 2 }}>
              Данные кандидата:
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <TextField
                label="ФИО"
                value={
                  request.candidate_last_name
                    ? `${request.candidate_last_name} ${
                        request.candidate_first_name || ""
                      } ${request.candidate_middle_name || ""}`
                    : "Не указано"
                }
                variant="standard"
                InputProps={{ readOnly: true }}
                sx={{ maxWidth: "500px" }}
              />
              <TextField
                label="Номер телефона"
                value={request.candidate_phone || "Не указано"}
                variant="standard"
                InputProps={{ readOnly: true }}
                sx={{ maxWidth: "500px" }}
              />
              <TextField
                label="E-mail"
                value={request.candidate_email}
                variant="standard"
                InputProps={{ readOnly: true }}
                sx={{ maxWidth: "500px" }}
              />
            </Box>
          </>
        )}

        {isCandidateDataVisible && (
          <Box sx={{ mt: 5, display: "flex" }}>
            <FilledButton onClick={handleExport} sx={{ gap: 1 }}>
              <FileDownloadIcon />
              Экспорт данных
            </FilledButton>
          </Box>
        )}
      </Paper>
    </Box>
  );
};
