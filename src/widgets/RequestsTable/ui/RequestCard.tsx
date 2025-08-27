import { Box, Chip, Typography } from "@mui/material";
import { theme } from "../../../app/providers/ThemeProvider/config/theme.ts";
import { useNavigate } from "react-router-dom";
import React from "react";
import type { Request, RequestAdmin } from '../../../app/types.ts';

interface RequestCardProps {
  request: Request | RequestAdmin;
  isAdmin?: boolean;
}

export const RequestCard = ({ request, isAdmin = false }: RequestCardProps) => {
  const navigate = useNavigate();

  const handleCardClick = (event: React.MouseEvent<HTMLDivElement>) => {
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

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        p: 2,
        borderBottom: `1px solid ${theme.palette.brand.grayLight}`,
        backgroundColor: theme.palette.background.paper,
        transition: "0.5s",
        "&:hover": {
          backgroundColor: theme.palette.brand.backgroundLight,
          cursor: "pointer",
        },
      }}
      onClick={handleCardClick}
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1, flex: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography
            variant="body2"
            sx={{ fontWeight: 500, color: theme.palette.text.primary }}
          >
            E-mail:
          </Typography>
          <Typography
            variant="body2"
            sx={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {request.email}
          </Typography>
        </Box>
        {isAdmin && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography
              variant="body2"
              sx={{ fontWeight: 500, color: theme.palette.text.primary }}
            >
              Отправитель:
            </Typography>
            <Typography
              variant="body2"
              sx={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {"sender" in request ? request.sender : ""}
            </Typography>
          </Box>
        )}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography
            variant="body2"
            sx={{ fontWeight: 500, color: theme.palette.text.primary }}
          >
            Статус:
          </Typography>
          <Chip
            label={statusLabels[request.status]}
            sx={{
              backgroundColor: statusColors[request.status],
            }}
          />
          {isResponseReceived && !request.is_viewed && (
            <Box
              component="span"
              sx={{
                display: "inline-block",
                width: 7,
                height: 7,
                borderRadius: "50%",
                backgroundColor: theme.palette.brand.grayLight,
              }}
            />
          )}
        </Box>
      </Box>
      <Typography
        variant="body2"
        sx={{
          fontFamily: '"ALS HAUSS", sans-serif',
          fontSize: 14,
          fontVariantNumeric: "tabular-nums",
          color: theme.palette.text.secondary,
        }}
      >
        {request.date.slice(0, -5)}
      </Typography>
    </Box>
  );
};