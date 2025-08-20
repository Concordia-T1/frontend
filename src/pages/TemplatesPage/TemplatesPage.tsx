import { Box, Button, Typography } from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@entities/user/store";
import { theme } from "@app/providers/ThemeProvider/config/theme.ts";
import { Template } from "@widgets/Template/Template.tsx";

export const TemplatesPage = () => {
  const [activeTemplate, setActiveTemplate] = useState<"sopd" | "email">(
    "sopd"
  );

  return (
    <Box
      sx={{
        p: { xs: 1, sm: 2 },
        mt: { xs: 1, sm: 3 },
        maxWidth: "70%",
        margin: "0 auto",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        gap: 2,
        minHeight: "100vh",
      }}
    >
      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        <Button
          variant={activeTemplate === "sopd" ? "contained" : "outlined"}
          onClick={() => setActiveTemplate("sopd")}
          sx={{
            backgroundColor:
              activeTemplate === "sopd"
                ? theme.palette.brand.lightBlue
                : theme.palette.brand.backgroundLight,
            color:
              activeTemplate === "sopd"
                ? theme.palette.brand.white
                : theme.palette.brand.primary,
            borderRadius: "30px",
            transition: "0.5s",
            border: "none",
            "&:hover": {
              backgroundColor:
                activeTemplate === "sopd"
                  ? theme.palette.brand.darkblue
                  : theme.palette.brand.backgroundLight,
            },
          }}
        >
          Редактирование шаблона СОПД
        </Button>
        <Button
          variant={activeTemplate === "email" ? "contained" : "outlined"}
          onClick={() => setActiveTemplate("email")}
          sx={{
            backgroundColor:
              activeTemplate === "email"
                ? theme.palette.brand.lightBlue
                : theme.palette.brand.backgroundLight,
            color:
              activeTemplate === "email"
                ? theme.palette.brand.white
                : theme.palette.brand.primary,
            borderRadius: "30px",
            border: "none",
            transition: "0.5s",
            "&:hover": {
              backgroundColor:
                activeTemplate === "email"
                  ? theme.palette.brand.darkblue
                  : theme.palette.brand.backgroundLight,
            },
          }}
        >
          Редактирование шаблона письма
        </Button>
      </Box>

      <Template templateType={activeTemplate} />
    </Box>
  );
};
