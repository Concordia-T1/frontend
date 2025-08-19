import { styled } from "@mui/material/styles";
import { Typography } from '@mui/material';

export const NavbarTypography = styled(Typography)(({ theme }) => ({
    color: theme.palette.brand.primary,
    fontWeight: "500",
    transition: "0.5s",
    fontSize: "20px",
    "&:hover": {
        color: theme.palette.brand.lightBlue,
    },
}));
