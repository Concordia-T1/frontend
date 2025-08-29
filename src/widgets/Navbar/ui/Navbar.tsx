import {
  AppBar,
  Toolbar,
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import PersonIcon from "@mui/icons-material/Person";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import logo from "@shared/assets/logo.svg";
import { useAuthStore } from "../../../entities/user/store.ts";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { theme } from "../../../app/providers/ThemeProvider/config/theme.ts";
import { NavbarTypography } from "../../../shared/ui/links/NavbarTypography.tsx";
import { useState } from "react";

export const Navbar = () => {
  const { logout, role, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openLogoutDialog, setOpenLogoutDialog] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleOpenLogoutDialog = () => {
    setOpenLogoutDialog(true);
  };

  const handleCloseLogoutDialog = () => {
    setOpenLogoutDialog(false);
  };

  const handleConfirmLogout = () => {
    logout(navigate);
    setOpenLogoutDialog(false);
  };

  const drawerContent = (
    <Box sx={{ width: 250, pt: 2 }}>
      <List>
        <ListItem component={Link} to="/requests" onClick={handleDrawerToggle}>
          <ListItemText
            primary="Заявки"
            sx={{
              color:
                location.pathname === "/requests"
                  ? theme.palette.brand.lightBlue
                  : theme.palette.brand.primary,
            }}
          />
        </ListItem>
        {role === "ROLE_ADMIN" && (
          <ListItem component={Link} to="/users" onClick={handleDrawerToggle}>
            <ListItemText
              primary="Пользователи"
              sx={{
                color:
                  location.pathname === "/users"
                    ? theme.palette.brand.lightBlue
                    : theme.palette.brand.primary,
              }}
            />
          </ListItem>
        )}
        <ListItem component={Link} to="/templates" onClick={handleDrawerToggle}>
          <ListItemText
            primary="Шаблоны"
            sx={{
              color:
                location.pathname === "/templates"
                  ? theme.palette.brand.lightBlue
                  : theme.palette.brand.primary,
            }}
          />
        </ListItem>
        <ListItem component={Link} to="/profile" onClick={handleDrawerToggle}>
          <ListItemText
            primary="Профиль"
            sx={{
              color:
                location.pathname === "/profile"
                  ? theme.palette.brand.lightBlue
                  : theme.palette.brand.primary,
            }}
          />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <>
      <AppBar
        position="static"
        sx={{
          backgroundColor: "#fff",
          color: "#000",
          boxShadow: "none",
          zIndex: theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between" }}>
          {isAuthenticated && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ display: { xs: "block", md: "none" }, color: theme.palette.brand.grayDark }}
            >
              <MenuIcon sx={{ fontSize: 32 }} />
            </IconButton>
          )}
          <Box
            component="img"
            src={logo}
            alt="icon"
            sx={{ height: 40, ml: { xs: 1, md: 2 }, mr: { md: 2 } }}
          />
          {isAuthenticated && (
            <>
              <Box
                sx={{
                  display: { xs: "none", md: "flex" },
                  gap: 6,
                  ml: 6,
                }}
              >
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
                {role === "ROLE_ADMIN" && (
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
                )}
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
              </Box>
              <Box sx={{ flexGrow: 1, display: { xs: "none", md: "block" } }} />
              <Box sx={{ display: "flex", gap: 3 }}>
                <IconButton
                  color="inherit"
                  onClick={() => navigate("/profile")}
                  sx={{
                    padding: 0,
                    color: theme.palette.brand.lightBlue,
                    transition: "0.5s",
                    "&:hover": {
                      backgroundColor: theme.palette.brand.white,
                      color: theme.palette.brand.darkblue,
                    },
                    display: { xs: "none", md: "flex" }, // Скрываем на мобильной версии
                  }}
                >
                  <PersonIcon sx={{ fontSize: 32 }} />
                </IconButton>
                <IconButton
                  color="inherit"
                  onClick={handleOpenLogoutDialog}
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
              </Box>
            </>
          )}
        </Toolbar>
      </AppBar>
      {isAuthenticated && (
        <Drawer
          anchor="left"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
            BackdropProps: {
              sx: {
                top: "64px",
              },
            },
          }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": {
              width: 250,
              backgroundColor: "#fff",
              top: "64px",
              height: "calc(100% - 64px)",
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}
      <Dialog
        open={openLogoutDialog}
        onClose={handleCloseLogoutDialog}
        aria-labelledby="logout-dialog-title"
        aria-describedby="logout-dialog-description"
      >
        <DialogTitle id="logout-dialog-title">Подтверждение выхода</DialogTitle>
        <DialogContent>
          <DialogContentText id="logout-dialog-description">
            Вы хотите выйти из аккаунта?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseLogoutDialog}
            sx={{
              color: theme.palette.brand.grayDark,
              "&:hover": { color: theme.palette.brand.primary },
            }}
          >
            Нет
          </Button>
          <Button
            onClick={handleConfirmLogout}
            sx={{
              color: theme.palette.brand.lightBlue,
              "&:hover": { color: theme.palette.brand.darkblue },
            }}
            autoFocus
          >
            Да
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};