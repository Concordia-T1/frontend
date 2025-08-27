import {
  TableCell,
  TableRow,
  IconButton,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { theme } from "../../app/providers/ThemeProvider/config/theme.ts";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { fetchWithAuth } from "../../shared/api/fetchWithAuth";

interface User {
  id: string;
  email: string;
  state: "STATE_ENABLED" | "STATE_DISABLED";
}

interface UserItemProps {
  user: User;
  onStateChange: (
    id: string,
    newState: "STATE_ENABLED" | "STATE_DISABLED"
  ) => void;
}

export const UserItem = ({ user, onStateChange }: UserItemProps) => {
  const navigate = useNavigate();
  const [openDisableDialog, setOpenDisableDialog] = useState(false);
  const [openEnableDialog, setOpenEnableDialog] = useState(false); // New state for enable dialog
  const [error, setError] = useState<string | null>(null);

  const handleOpenDisableDialog = () => setOpenDisableDialog(true);
  const handleCloseDisableDialog = () => setOpenDisableDialog(false);

  const handleOpenEnableDialog = () => setOpenEnableDialog(true); // Open enable dialog
  const handleCloseEnableDialog = () => setOpenEnableDialog(false); // Close enable dialog

  const handleDisable = async () => {
    try {
      const response = await fetchWithAuth(
        `/accounts/${user.id}/update-state`,
        {
          method: "POST",
          data: { state: "STATE_DISABLED" },
        },
        navigate
      );

      if (!response.ok) {
        setError(response.detail || "Ошибка при отключении прав пользователя");
        return;
      }

      onStateChange(user.id, "STATE_DISABLED");
      setOpenDisableDialog(false);
    } catch {
      setError("Ошибка при отключении прав пользователя");
    }
  };

  const handleEnable = async () => {
    try {
      const response = await fetchWithAuth(
        `/accounts/${user.id}/update-state`,
        {
          method: "POST",
          data: { state: "STATE_ENABLED" },
        },
        navigate
      );

      if (!response.ok) {
        setError(
          response.detail || "Ошибка при восстановлении прав пользователя"
        );
        return;
      }

      onStateChange(user.id, "STATE_ENABLED");
      setOpenEnableDialog(false); // Close dialog on success
    } catch {
      setError("Ошибка при восстановлении прав пользователя");
    }
  };

  return (
    <>
      <TableRow
        sx={{
          transition: "0.5s",
          "&:last-child td, &:last-child th": { border: 0 },
        }}
      >
        <TableCell
          sx={{
            width: { xs: "80%", sm: "250px" },
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            paddingLeft: 5,
          }}
        >
          {user.email}
        </TableCell>
        <TableCell
          sx={{
            width: { xs: "20%", sm: "80px" },
            textAlign: "right",
          }}
        >
          {user.state === "STATE_DISABLED" ? (
            <Button
              variant="text"
              size="small"
              onClick={handleOpenEnableDialog} // Open enable dialog
              sx={{
                color: theme.palette.brand.lightBlue,
                transition: "0.5s",
                "&:hover": {
                  color: theme.palette.brand.darkblue,
                  backgroundColor: "transparent",
                },
              }}
            >
              Восстановить права
            </Button>
          ) : (
            <IconButton
              onClick={handleOpenDisableDialog}
              sx={{
                color: theme.palette.brand.grayLight,
                transition: "0.5s",
                "&:hover": {
                  backgroundColor: theme.palette.brand.backgroundLight,
                  color: theme.palette.brand.grayDark,
                },
              }}
            >
              <CloseIcon />
            </IconButton>
          )}
        </TableCell>
      </TableRow>

      {error && (
        <Box sx={{ color: theme.palette.brand.pastelRed, mt: 1, ml: 2 }}>
          {error}
        </Box>
      )}

      {/* Disable Rights Dialog */}
      <Dialog open={openDisableDialog} onClose={handleCloseDisableDialog}>
        <DialogTitle>Отобрать права у пользователя?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Вы уверены, что хотите отобрать права у пользователя {user.email}?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDisableDialog}>Нет</Button>
          <Button onClick={handleDisable} color="primary" autoFocus>
            Да
          </Button>
        </DialogActions>
      </Dialog>

      {/* Enable Rights Dialog */}
      <Dialog open={openEnableDialog} onClose={handleCloseEnableDialog}>
        <DialogTitle>Восстановить права пользователя?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Вы уверены, что хотите восстановить права пользователя {user.email}?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEnableDialog}>Нет</Button>
          <Button onClick={handleEnable} color="primary" autoFocus>
            Да
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};