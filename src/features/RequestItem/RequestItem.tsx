import {
  TableCell,
  TableRow,
  Checkbox,
  IconButton,
  Chip,
  Box,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { theme } from "@app/providers/ThemeProvider/config/theme.ts";
import { useNavigate } from "react-router-dom";
import React from "react";

interface Request {
  id: string;
  date: string;
  email: string;
  status:
    | "STATUS_QUEUED"
    | "STATUS_WAITING"
    | "STATUS_CONSENT"
    | "STATUS_REFUSED"
    | "STATUS_TIMEOUT";
  is_viewed: boolean;
}

interface RequestItemProps {
  request: Request;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

export const RequestItem = ({
  request,
  isSelected,
  onSelect,
  onDelete,
}: RequestItemProps) => {
  const navigate = useNavigate();

  const handleRowClick = (event: React.MouseEvent<HTMLTableRowElement>) => {
    const target = event.target as HTMLElement;
    if (
      target.closest('input[type="checkbox"]') ||
      target.closest(".MuiChip-root") ||
      target.closest(".MuiIconButton-root")
    ) {
      return;
    }
    navigate(`/request/${request.id}`);
  };

  const statusLabels: Record<Request["status"], string> = {
    STATUS_QUEUED: "В очереди",
    STATUS_WAITING: "Ожидание",
    STATUS_CONSENT: "Согласие",
    STATUS_REFUSED: "Отказ",
    STATUS_TIMEOUT: "Таймаут",
  };

  const statusColors: Record<Request["status"], string> = {
    STATUS_QUEUED: theme.palette.brand.pastelBlue,
    STATUS_WAITING: theme.palette.brand.pastelOrange,
    STATUS_CONSENT: theme.palette.brand.pastelGreen,
    STATUS_REFUSED: theme.palette.brand.pastelRed,
    STATUS_TIMEOUT: theme.palette.brand.pastelBlue,
  };

  const isResponseReceived =
    request.status === "STATUS_CONSENT" || request.status === "STATUS_REFUSED";

  return (
    <TableRow
      sx={{
        transition: "0.5s",
        "&:hover": {
          backgroundColor: theme.palette.brand.backgroundLight,
          cursor: "pointer",
        },
        "&:last-child td, &:last-child th": { border: 0 },
      }}
      onClick={handleRowClick}
    >
      <TableCell
        padding="checkbox"
        sx={{
          width: { xs: "10%", sm: "60px" },
          paddingLeft: { xs: "12px", sm: "20px" },
        }}
      >
        <Checkbox
          checked={isSelected}
          onChange={() => onSelect(request.id)}
          color="primary"
        />
      </TableCell>
      <TableCell sx={{ width: { xs: "20%", sm: "100px" } }}>
        {request.date}
      </TableCell>
      <TableCell
        sx={{
          width: { xs: "40%", sm: "150px" },
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {request.email}
      </TableCell>
      <TableCell sx={{ width: { xs: "30%", sm: "200px" } }}>
        <Chip
          label={statusLabels[request.status]}
          sx={{
            backgroundColor: statusColors[request.status],
            color: theme.palette.brand.white,
          }}
        />
      </TableCell>
      <TableCell sx={{ width: { xs: "10%", sm: "20px" } }}>
        {isResponseReceived && !request.is_viewed && (
          <Box
            component="span"
            sx={{
              display: "inline-block",
              width: 7,
              height: 7,
              borderRadius: "50%",
              backgroundColor: theme.palette.brand.grayLight,
              mr: 1,
            }}
          />
        )}
      </TableCell>
      <TableCell sx={{ width: { xs: "10%", sm: "30px" } }}>
        <IconButton
          onClick={() => onDelete(request.id)}
          sx={{
            color: theme.palette.brand.grayLight,
            transition: "0.5s",
            "&:hover": {
              backgroundColor: theme.palette.brand.backgroundLight,
              color: theme.palette.brand.grayDark,
            },
          }}
        >
          <DeleteIcon />
        </IconButton>
      </TableCell>
    </TableRow>
  );
};
