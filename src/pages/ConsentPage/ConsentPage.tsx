import { Box, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { OutlinedButton } from "@shared/ui/buttons/OutlinedButton.tsx";
import { theme } from "@app/providers/ThemeProvider/config/theme.ts";

export const ConsentPage = () => {
  const navigate = useNavigate();

  const onSubmit = () => {
    // TODO: Отправка на бэк
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

      <Box sx={{ mt: 5, display: "flex", justifyContent: "center", gap: 8 }}>
        <OutlinedButton
          onClick={onSubmit}
          sx={{
            gap: 1,
            color: theme.palette.brand.secondary,
            "&:hover": { bgcolor: theme.palette.brand.secondary },
          }}
        >
          Отказаться
        </OutlinedButton>
        <OutlinedButton onClick={onSubmit} sx={{ gap: 1 }}>
          Согласиться
        </OutlinedButton>
      </Box>
    </Box>
  );
};
