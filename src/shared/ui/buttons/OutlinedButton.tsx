import { styled } from "@mui/material/styles";
import Button from "@mui/material/Button";

export const OutlinedButton = styled(Button)(({ theme }) => ({
    backgroundColor: theme.palette.brand.white,
    color: theme.palette.brand.lightBlue,
    border: "1px solid",
    padding: "8px 30px",
    transition: "0.5s",
    boxShadow: "none",
    borderRadius: "30px",
    textTransform: "none",
    fontSize: "18px",
    "&:hover": {
        backgroundColor: theme.palette.brand.lightBlue,
        color: theme.palette.brand.white
    },
}));
