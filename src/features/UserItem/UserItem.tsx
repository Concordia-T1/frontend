import {
  TableCell,
  TableRow,
  Checkbox,
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
  isSelected: boolean;
  onSelect: (id: string) => void;
  onStateChange: (
    id: string,
    newState: "STATE_ENABLED" | "STATE_DISABLED"
  ) => void;
}

// TODO: Добавить плашку для восстановления прав

export const UserItem = ({
  user,
  isSelected,
  onSelect,
  onStateChange,
}: UserItemProps) => {
  const navigate = useNavigate();
  const [openDialog, setOpenDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleDisable = async () => {
    try {
      console.log(
        `Sending request to /accounts/${user.id}/update-state with state: STATE_DISABLED`
      );
      const response = await fetchWithAuth(
        `/accounts/${user.id}/update-state`,
        {
          method: "POST",
          data: {
            state: "STATE_DISABLED",
          },
        },
        navigate
      );

      console.log("Disable response:", response.data);

      if (!response.data.ok) {
        setError(
          response.data.detail || "Ошибка при отключении прав пользователя"
        );
        console.error(
          "API error:",
          response.data.detail,
          response.data.validation_errors
        );
        return;
      }

      onStateChange(user.id, "STATE_DISABLED");
      setOpenDialog(false);
    } catch (err: any) {
      setError(err.message || "Ошибка при отключении прав пользователя");
      console.error("Disable error:", err);
    }
  };

  const handleEnable = async () => {
    try {
      console.log(
        `Sending request to /accounts/${user.id}/update-state with state: STATE_ENABLED`
      );
      const response = await fetchWithAuth(
        `/accounts/${user.id}/update-state`,
        {
          method: "POST",
          data: {
            state: "STATE_ENABLED",
          },
        },
        navigate
      );

      console.log("Enable response:", response.data);

      if (!response.data.ok) {
        setError(
          response.data.detail || "Ошибка при восстановлении прав пользователя"
        );
        console.error(
          "API error:",
          response.data.detail,
          response.data.validation_errors
        );
        return;
      }

      onStateChange(user.id, "STATE_ENABLED");
    } catch (err: any) {
      setError(err.message || "Ошибка при восстановлении прав пользователя");
      console.error("Enable error:", err);
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
          padding="checkbox"
          sx={{
            width: { xs: "10%", sm: "40px" },
            paddingLeft: { xs: "12px", sm: "20px" },
          }}
        >
          <Checkbox
            checked={isSelected}
            onChange={() => onSelect(user.id)}
            color="primary"
          />
        </TableCell>
        <TableCell
          sx={{
            width: { xs: "80%", sm: "250px" },
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {user.email}
        </TableCell>
        <TableCell
          sx={{
            width: {
              xs: "10%",
              sm: "40px",
            },
            textAlign: "right",
          }}
        >
          {user.state === "STATE_DISABLED" ? (
            <Button
              variant="text"
              size="small"
              onClick={handleEnable}
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
              onClick={handleOpenDialog}
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
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        aria-labelledby="disable-user-dialog-title"
      >
        <DialogTitle id="disable-user-dialog-title">
          Отобрать права у пользователя?
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Вы уверены, что хотите отобрать права у пользователя {user.email}?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Нет</Button>
          <Button onClick={handleDisable} color="primary" autoFocus>
            Да
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
