import { AppBar, Toolbar, Box, Typography } from "@mui/material";
import logo from "@shared/assets/logo.svg";
import { useAuthStore } from "@entities/user/store.ts";
import IconButton from "@mui/material/IconButton";
import { useNavigate, Link, useLocation } from "react-router-dom";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import { theme } from "@app/providers/ThemeProvider/config/theme.ts";
import { NavbarTypography } from "../../../shared/ui/links/NavbarTypography.tsx";

export const Navbar = () => {
  const { logout, role, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <AppBar
      position="static"
      sx={{
        backgroundColor: "#fff",
        color: "#000",
        boxShadow: "none",
      }}
    >
      <Toolbar>
        <Box component="img" src={logo} alt="icon" sx={{ height: 40, mr: 2 }} />

        {isAuthenticated && (
          <Box sx={{ display: "flex", gap: 6, ml: 6 }}>
            {role === "MANAGER" && (
              <>
                <Link to="/requests" style={{ textDecoration: "none" }}>
                  <NavbarTypography
                    sx={{
                      color:
                        location.pathname === "/requests"
                          ? theme.palette.brand.lightBlue
                          : theme.palette.brand.primary,
                    }}
                  >
                    Заявки
                  </NavbarTypography>
                </Link>
                <Link to="/templates" style={{ textDecoration: "none" }}>
                  <NavbarTypography
                    sx={{
                      color:
                        location.pathname === "/templates"
                          ? theme.palette.brand.lightBlue
                          : theme.palette.brand.primary,
                    }}
                  >
                    Шаблоны
                  </NavbarTypography>
                </Link>
              </>
            )}
            {role === "ADMIN" && (
              <>
                <Link to="/requests" style={{ textDecoration: "none" }}>
                  <NavbarTypography
                    sx={{
                      color:
                        location.pathname === "/requests"
                          ? theme.palette.brand.lightBlue
                          : theme.palette.brand.primary,
                    }}
                  >
                    Заявки
                  </NavbarTypography>
                </Link>
                <Link to="/users" style={{ textDecoration: "none" }}>
                  <NavbarTypography
                    sx={{
                      color:
                        location.pathname === "/users"
                          ? theme.palette.brand.lightBlue
                          : theme.palette.brand.primary,
                    }}
                  >
                    Пользователи
                  </NavbarTypography>
                </Link>
                <Link to="/templates" style={{ textDecoration: "none" }}>
                  <NavbarTypography
                    sx={{
                      color:
                        location.pathname === "/templates"
                          ? theme.palette.brand.lightBlue
                          : theme.palette.brand.primary,
                    }}
                  >
                    Шаблоны
                  </NavbarTypography>
                </Link>
              </>
            )}
          </Box>
        )}

        <Box sx={{ flexGrow: 1 }} />

        {isAuthenticated && (
          <IconButton
            color="inherit"
            onClick={() => {
              logout(navigate);
            }}
            sx={{
              padding: 0,
              color: theme.palette.brand.grayDark,
              transition: "0.5s",
              "&:hover": {
                backgroundColor: theme.palette.brand.white,
                color: theme.palette.brand.primary,
              },
            }}
          >
            <ExitToAppIcon sx={{ fontSize: 32 }} />
          </IconButton>
        )}
      </Toolbar>
    </AppBar>
  );
};
