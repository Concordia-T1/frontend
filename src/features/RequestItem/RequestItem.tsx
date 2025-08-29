import { TableCell, TableRow, Chip, Box } from "@mui/material";
import { theme } from "../../app/providers/ThemeProvider/config/theme.ts";
import { useNavigate } from "react-router-dom";
import React from "react";
import type { Request, RequestAdmin } from "../../app/types.ts";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

interface RequestItemProps {
  request: Request | RequestAdmin;
  isAdmin?: boolean;
}

export const RequestItem = ({
                              request,
                              isAdmin = false,
                            }: RequestItemProps) => {
  const navigate = useNavigate();

  const handleRowClick = (event: React.MouseEvent<HTMLTableRowElement>) => {
    const target = event.target as HTMLElement;
    if (target.closest(".MuiChip-root")) {
      return;
    }
    navigate(`/request/${request.id}`);
  };

  const statusLabels: Record<Request["status"], string> = {
    STATUS_QUEUED: "Ожидание",
    STATUS_WAITING: "Ожидание",
    STATUS_CONSENT: "Согласие",
    STATUS_REFUSED: "Отказ",
  };

  const statusColors: Record<Request["status"], string> = {
    STATUS_QUEUED: theme.palette.brand.pastelOrange,
    STATUS_WAITING: theme.palette.brand.pastelOrange,
    STATUS_CONSENT: theme.palette.brand.pastelGreen,
    STATUS_REFUSED: theme.palette.brand.pastelRed,
  };

  const isResponseReceived =
    request.status === "STATUS_CONSENT" || request.status === "STATUS_REFUSED";

  const formatDate = (dateString: string) => {
    if (!dateString) return "—";
    try {
      // Если пришла ISO-строка → форматируем
      return format(new Date(dateString), "dd.MM.yyyy", { locale: ru });
    } catch {
      // Если сервер уже вернул готовую дату → просто показываем
      return dateString;
    }
  };

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
        sx={{
          width: { xs: "25%", sm: "120px" },
          fontFamily: '"ALS HAUSS", sans-serif',
          fontSize: 14,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {formatDate(request.date)}
      </TableCell>
      <TableCell
        sx={{
          width: { xs: "35%", sm: "180px" },
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {request.email}
      </TableCell>
      {isAdmin && (
        <TableCell
          sx={{
            width: { xs: "30%", sm: "180px" },
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {"sender" in request ? request.sender : ""}
        </TableCell>
      )}
      <TableCell
        sx={{
          width: { xs: "30%", sm: "200px" },
        }}
      >
        <Chip
          label={statusLabels[request.status]}
          sx={{
            backgroundColor: statusColors[request.status],
          }}
        />
      </TableCell>
      <TableCell
        sx={{
          width: { xs: "10%", sm: "20px" },
        }}
      >
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
    </TableRow>
  );
};
