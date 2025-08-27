import {
  Box,
  Button,
  Paper,
  Typography,
  TextField,
  Chip,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { theme } from "../../app/providers/ThemeProvider/config/theme.ts";
import { FilledButton } from "../../shared/ui/buttons/FilledButton.tsx";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { fetchWithCppdAuth } from "../../shared/api/fetchWithCppdAuth";
import { useAuthStore } from "../../entities/user/store";
import { type ClaimRecord } from "../../app/types";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

const formatDate = (dateString: string | null | undefined) =>
  dateString ? format(new Date(dateString), "dd.MM.yyyy HH:mm", { locale: ru }) : "—";

const formatPhone = (phone: string | null | undefined) => phone || "Не указано";

const validatePhone = (phone: string | null | undefined) => {
  if (!phone) return false;
  return /^[7][0-9]{10}$/.test(phone);
};

export const RequestInfoPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { userId, role } = useAuthStore();
  const [request, setRequest] = useState<ClaimRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRequest = async () => {
      if (!id) {
        setError("ID заявки не указан");
        setLoading(false);
        return;
      }

      try {
        console.log(`[RequestInfoPage] Запрос данных заявки: /claims/${id}`);
        const response = await fetchWithCppdAuth(
          `/claims/${id}`,
          { method: "GET" },
          navigate
        );

        // Универсальное извлечение заявки из ответа
        const claim =
          (response as any).claim ??
          (response as any).data?.claim ??
          (response as any).data ??
          null;

        if (!claim || !claim.id) {
          setError("Заявка не найдена или сервер вернул пустые данные");
          setRequest(null);
          setLoading(false);
          return;
        }

        setRequest(claim);

        if (claim.candidate_phone && !validatePhone(claim.candidate_phone)) {
          setPhoneError(
            "Номер телефона кандидата имеет некорректный формат (ожидалось 11 цифр, начиная с 7)"
          );
        }
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
      const exportData = {
        id: request.id,
        owner_email: request.owner_email,
        candidate_email: request.candidate_email,
        candidate_phone: request.candidate_phone,
        candidate_last_name: request.candidate_last_name || "-",
        candidate_first_name: request.candidate_first_name || "-",
        candidate_middle_name: request.candidate_middle_name || "-",
        candidate_birthdate: request.candidate_birthdate || "-",
        status: request.status,
        created_at: request.created_at,
        responded_at: request.responded_at || "-",
        expires_at: request.expires_at,
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `claim_${request.id}.json`;
      link.click();
      URL.revokeObjectURL(url);
      console.log("[RequestInfoPage] Экспорт данных для заявки:", exportData);
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
      <Box sx={{ display: "flex", mb: 1 }}>
        <Button
          sx={{
            color: theme.palette.brand.secondary,
            transition: "0.5s",
            "&:hover": {
              color: theme.palette.brand.primary,
              bgcolor: theme.palette.brand.white,
            },
          }}
          onClick={() => navigate("/requests")}
        >
          <ArrowBackIcon/>
        </Button>
      </Box>
      <Paper
        sx={{
          p: { xs: 2, sm: 3 },
          border: "1px solid",
          borderColor: "grey.300",
          borderRadius: 1,
          boxShadow: "none",
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 5 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Typography variant="h6" fontWeight={500}>
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
                        ? "Ожидание"
                        : "Ошибка"
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
                          ? theme.palette.brand.pastelOrange
                          : theme.palette.brand.pastelRed,
                width: "fit-content",
              }}
            />

          </Box>

          <Box sx={{ textAlign: "right" }}>
            <Typography variant="body2" sx={{ mb: 2}}>
              Отправитель: {request.owner_email}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontFamily: '"ALS HAUSS", sans-serif', fontSize: 14, fontVariantNumeric: 'tabular-nums' }}>
              Отправлено: {formatDate(request.created_at)}
            </Typography>
            {isCandidateDataVisible && (
              <Typography variant="body2" color="text.secondary" sx={{ fontFamily: '"ALS HAUSS", sans-serif', fontSize: 14, fontVariantNumeric: 'tabular-nums' }}>
                Ответ получен: {formatDate(request.responded_at)}
              </Typography>
            )}

          </Box>

        </Box>

        {phoneError && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            {phoneError}
          </Alert>
        )}

        {isCandidateDataVisible && (
          <>
            <Typography variant="h6" fontWeight={400} sx={{ mt: 3, mb: 2 }}>
              Данные кандидата:
            </Typography>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                mb: 5,
              }}
            >
              <TextField
                label="ФИО"
                value={
                  request.candidate_last_name
                    ? `${request.candidate_last_name} ${
                      request.candidate_first_name || ""
                    } ${request.candidate_middle_name || ""}`.trim()
                    : "Не указано"
                }
                variant="standard"
                InputProps={{ readOnly: true }}
                sx={{ maxWidth: "500px" }}
              />
              <TextField
                label="Дата рождения"
                value={request.candidate_birthdate || "Не указано"}
                variant="standard"
                InputProps={{ readOnly: true }}
                sx={{ maxWidth: "500px" }}
              />
              <TextField
                label="Номер телефона"
                value={formatPhone(request.candidate_phone)}
                variant="standard"
                InputProps={{ readOnly: true }}
                error={!!phoneError}
                sx={{ maxWidth: "500px" }}
              />
              <TextField
                label="E-mail"
                value={request.candidate_email || "Не указано"}
                variant="standard"
                InputProps={{ readOnly: true }}
                sx={{ maxWidth: "500px" }}
              />
            </Box>
            <Box sx={{ display: "flex" }}>
              <FilledButton onClick={handleExport} sx={{ gap: 1 }}>
                <FileDownloadIcon />
                Экспорт данных
              </FilledButton>
            </Box>
          </>
        )}
      </Paper>
    </Box>
  );
};
