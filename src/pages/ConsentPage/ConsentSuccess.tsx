import { Box, Typography } from "@mui/material";
import { theme } from "../../app/providers/ThemeProvider/config/theme.ts";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

export const ConsentSuccess = () => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "50vh",
        p: { xs: 2, sm: 4 },
      }}
    >
      <Box
        sx={{
          width: { xs: "150px", sm: "200px" },
          mb: 2,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <CheckCircleOutlineIcon
          sx={{
            color: theme.palette.brand.lightBlue,
            fontSize: 70,
          }}
        />
      </Box>
      <Typography
        variant="h5"
        sx={{
          textAlign: "center",
          fontWeight: 500,
          color: theme.palette.brand.lightBlue,
        }}
      >
        Ответ отправлен
      </Typography>
    </Box>
  );
};
