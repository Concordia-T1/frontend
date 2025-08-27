import { useMediaQuery } from "@mui/material";
import { Table, TableBody, TableCell, TableHead, TableRow, Box, Paper } from "@mui/material";
import { RequestItem } from "../../../features/RequestItem/RequestItem.tsx";
import { RequestCard } from "./RequestCard.tsx";
import { theme } from "../../../app/providers/ThemeProvider/config/theme.ts";
import { type Request, type RequestAdmin } from "../../../app/types.ts";

interface RequestsTableProps {
  requests: (Request | RequestAdmin)[];
  isAdmin?: boolean;
}

export const RequestsTable = ({ requests, isAdmin = false }: RequestsTableProps) => {
  const isMobile = useMediaQuery('(max-width:940px)');

  return (
    <Box
      component={Paper}
      sx={{
        margin: { xs: "0 16px", sm: "0 24px" },
        border: "1px solid",
        boxShadow: "none",
        borderColor: theme.palette.brand.grayLight,
        maxWidth: { xs: "calc(100% - 32px)", sm: "calc(100% - 48px)" },
        width: "100%",
        boxSizing: "border-box",
        overflowX: "auto",
        minWidth: "320px",
      }}
    >
      {isMobile ? (
        <Box sx={{ display: "flex", flexDirection: "column" }}>
          {requests.map((request) => (
            <RequestCard
              key={request.id}
              request={request}
              isAdmin={isAdmin}
            />
          ))}
        </Box>
      ) : (
        <Table sx={{ tableLayout: "fixed" }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: { sm: "120px" } }}>
                Дата отправки
              </TableCell>
              <TableCell sx={{ width: { sm: "180px" } }}>
                E-mail
              </TableCell>
              {isAdmin && (
                <TableCell sx={{ width: { sm: "180px" } }}>
                  Отправитель
                </TableCell>
              )}
              <TableCell sx={{ width: { sm: "200px" } }}>
                Статус
              </TableCell>
              <TableCell sx={{ width: { sm: "20px" } }} />
            </TableRow>
          </TableHead>
          <TableBody>
            {requests.map((request) => (
              <RequestItem
                key={request.id}
                request={request}
                isAdmin={isAdmin}
              />
            ))}
          </TableBody>
        </Table>
      )}
    </Box>
  );
};