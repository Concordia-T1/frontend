import { Box, Typography, Alert } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { OutlinedButton } from "@shared/ui/buttons/OutlinedButton.tsx";
import { theme } from "@app/providers/ThemeProvider/config/theme.ts";
import { useState } from "react";
import { fetchWithCppdAuth } from "../../shared/api/fetchWithCppdAuth";

export const ConsentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [serverError, setServerError] = useState<string | null>(null);

  const onSubmit = async (accepted: boolean) => {
    setServerError(null);
    const inviteParams = location.state?.inviteParams;
    if (!inviteParams?.epk || !inviteParams?.ctx || !inviteParams?.sig) {
      setServerError("Недействительная ссылка");
      navigate("/consent-error");
      return;
    }

    const response = await fetchWithCppdAuth("/claims", {
      method: "POST",
      data: {
        epk: inviteParams.epk,
        ctx: inviteParams.ctx,
        sig: inviteParams.sig,
        accepted,
      },
    });

    if (!response.ok) {
      setServerError(response.detail || "Ошибка отправки согласия");
      navigate("/consent-error");
      return;
    }

    navigate("/consent-success");
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

      <Typography
        component="p"
        className="sobd"
        sx={{
          fontSize: "0.9rem",
          lineHeight: 1.5,
          textAlign: "justify",
          maxWidth: "600px",
        }}
      >
        Согласие
      </Typography>

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
