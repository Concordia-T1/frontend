import { styled } from "@mui/material/styles";
import Button from "@mui/material/Button";

export const FilledButton = styled(Button)(({ theme }) => ({
    backgroundColor: theme.palette.brand.lightBlue,
    color: theme.palette.brand.white,
    [theme.breakpoints.down("sm")]: {
        padding: "4px 20px", // маленькие экраны
    },
    [theme.breakpoints.up("md")]: {
        padding: "8px 30px", // средние и большие экраны
    },
    transition: "0.5s",
    borderRadius: "30px",
    "&:hover": {
        backgroundColor: theme.palette.brand.darkblue,
    },
}));
