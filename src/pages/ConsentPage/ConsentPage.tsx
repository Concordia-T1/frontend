import { Box, Typography, Alert } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { OutlinedButton } from "../../shared/ui/buttons/OutlinedButton.tsx";
import { theme } from "../../app/providers/ThemeProvider/config/theme.ts";
import { useState, useEffect } from "react";
import axios from "axios";

export const ConsentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [serverError, setServerError] = useState<string | null>(null);
  const [cppdContent, setCppdContent] = useState<string>("");

  useEffect(() => {
    const fetchCppdTemplate = async () => {
      try {
        const response = await axios.get("/api/cppd-service/v1/cppd", {
          withCredentials: true,
        });

        if (response.status >= 200 && response.status < 300) {
          setCppdContent(response.data.content);
        } else {
          setServerError("Ошибка при загрузке шаблона согласия");
        }
      } catch (error: any) {
        console.error("[ConsentPage] Ошибка при загрузке шаблона согласия:", error);
        setServerError(
          error.response?.data?.detail || "Ошибка при загрузке шаблона согласия"
        );
      }
    };

    fetchCppdTemplate();
  }, []);

  const onSubmit = async (accepted: boolean) => {
    setServerError(null);
    const inviteParams = location.state?.inviteParams;
    // if (!inviteParams?.epk || !inviteParams?.ctx || !inviteParams?.sig || !inviteParams?.claim_id) {
    //   setServerError("Недействительная ссылка или отсутствуют данные");
    //   console.log("[ConsentPage] Недействительная ссылка или отсутствуют данные", inviteParams);
    //   navigate("/consent-error");
    //   return;
    // }

    const payload = {
      claim_id: inviteParams.claim_id,
      sig: inviteParams.sig,
      last_name: inviteParams.lastName,
      first_name: inviteParams.firstName,
      middle_name: inviteParams.middleName || null,
      birthdate: inviteParams.birthdate,
      phone: inviteParams.phone,
      state: accepted ? "ACT_CONSENT" : "ACT_REJECT",
    };

    try {
      console.log("[ConsentPage] Отправка запроса на /claims", payload);
      const response = await axios.post(
        "/api/cppd-service/v1/claims/act",
        payload,
        {
          withCredentials: true,
        }
      );

      console.log("[ConsentPage] Ответ от /claims:", response.data);

      if (response.status >= 200 && response.status < 300) {
        navigate("/consent-success");
      } else {
        setServerError(response.data?.detail || "Ошибка при отправке согласия");
        navigate("/consent-error");
      }
    } catch (error: any) {
      console.error("[ConsentPage] Ошибка при отправке согласия:", error);
      if (error.code === "ERR_NETWORK") {
        setServerError("Ошибка сети: сервер недоступен. Проверьте, запущен ли сервер.");
      } else {
        setServerError(error.response?.data?.detail || "Ошибка при отправке согласия");
      }
      navigate("/consent-error");
    }
  };

  return (
    <Box
      sx={{
        p: { xs: 1, sm: 2 },
        boxSizing: "border-box",
        margin: "0 auto 20px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        maxWidth: "1000px",
        width: "100%",
      }}
    >
      <Typography
        variant="h6"
        fontWeight={500}
        sx={{ mt: 3, mb: 5, textTransform: "uppercase", textAlign: "center" }}
      >
        Согласие на обработку персональных данных
      </Typography>

      <Box
        component="div"
        className="sobd"
        sx={{
          fontSize: "0.9rem",
          lineHeight: 1.5,
          textAlign: "justify",
          maxWidth: "600px",
        }}
        dangerouslySetInnerHTML={{ __html: cppdContent }}
      />

      {serverError && (
        <Alert
          severity="error"
          sx={{ width: "100%", mt: 2, maxWidth: "600px" }}
        >
          {serverError}
        </Alert>
      )}

      <Box sx={{ mt: 5, display: "flex", justifyContent: "center", gap: 8 }}>
        <OutlinedButton
          onClick={() => onSubmit(false)}
          sx={{
            gap: 1,
            color: theme.palette.brand.secondary,
            "&:hover": { bgcolor: theme.palette.brand.secondary },
          }}
        >
          Отказаться
        </OutlinedButton>
        <OutlinedButton onClick={() => onSubmit(true)} sx={{ gap: 1 }}>
          Согласиться
        </OutlinedButton>
      </Box>
    </Box>
  );
};