import { Box, CircularProgress } from "@mui/material";

export const PageLoader = () => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "50vh",
      }}
    >
      <CircularProgress size={60} thickness={5} />
    </Box>
  );
};
