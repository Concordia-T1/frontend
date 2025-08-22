import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Paper,
} from "@mui/material";
import { RequestItem } from "../../../features/RequestItem/RequestItem.tsx";
import { theme } from "../../../app/providers/ThemeProvider/config/theme.ts";
import { type Request } from "../../../app/types.ts";

interface RequestsTableProps {
  requests: Request[];
  onDelete: (id: string) => void;
}

export const RequestsTable = ({ requests, onDelete }: RequestsTableProps) => {
  const [selected, setSelected] = useState<string[]>([]);

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelected(requests.map((request) => request.id));
    } else {
      setSelected([]);
    }
  };

  const handleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((selectedId) => selectedId !== id)
        : [...prev, id]
    );
  };

  const isAllSelected =
    requests.length > 0 && selected.length === requests.length;

  return (
    <TableContainer
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
      <Table sx={{ tableLayout: "fixed" }}>
        <TableHead>
          <TableRow>
            <TableCell
              padding="checkbox"
              sx={{
                width: { xs: "10%", sm: "60px" },
                paddingLeft: { xs: "12px", sm: "20px" },
              }}
            >
              <Checkbox
                checked={isAllSelected}
                onChange={handleSelectAll}
                indeterminate={selected.length > 0 && !isAllSelected}
                color="primary"
              />
            </TableCell>
            <TableCell sx={{ width: { xs: "20%", sm: "100px" } }}>
              Дата отправки
            </TableCell>
            <TableCell sx={{ width: { xs: "40%", sm: "150px" } }}>
              E-mail
            </TableCell>
            <TableCell sx={{ width: { xs: "30%", sm: "200px" } }}>
              Статус
            </TableCell>
            <TableCell sx={{ width: { xs: "10%", sm: "20px" } }} />
            <TableCell sx={{ width: { xs: "10%", sm: "30px" } }} />
          </TableRow>
        </TableHead>
        <TableBody>
          {requests.map((request) => (
            <RequestItem
              key={request.id}
              request={request}
              isSelected={selected.includes(request.id)}
              onSelect={handleSelect}
              onDelete={onDelete}
            />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
