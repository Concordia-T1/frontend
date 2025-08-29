import { styled } from "@mui/material/styles";
import Button from "@mui/material/Button";

export const ActionButton = styled(Button)(({ theme }) => ({
    backgroundColor: theme.palette.brand.pastelBlue,
    color: theme.palette.brand.white,
    padding: "8px 30px",
    "&:hover": {
        backgroundColor: theme.palette.brand.darkblue,
    },
}));
