import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Checkbox,
  Paper,
  TableContainer,
} from "@mui/material";
import React, { useState } from "react";
import { UserItem } from "@features/UserItem/UserItem.tsx";
import { theme } from "@app/providers/ThemeProvider/config/theme.ts";

interface User {
  id: string;
  fullName: string;
  email: string;
  state: "STATE_ENABLED" | "STATE_DISABLED";
}

interface UsersTableProps {
  users: User[];
  onStateChange: (
    id: string,
    newState: "STATE_ENABLED" | "STATE_DISABLED"
  ) => void;
}

export const UsersTable = ({ users, onStateChange }: UsersTableProps) => {
  const [selected, setSelected] = useState<string[]>([]);

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelected(users.map((user) => user.id));
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

  const isAllSelected = users.length > 0 && selected.length === users.length;

  return (
    <TableContainer
      component={Paper}
      sx={{
        border: "1px solid",
        boxShadow: "none",
        borderColor: theme.palette.brand.grayLight,
        width: "100%",
        boxSizing: "border-box",
        overflowX: "auto",
        minWidth: "320px",
      }}
    >
      <Table sx={{ tableLayout: "auto" }}>
        <TableHead>
          <TableRow>
            <TableCell
              padding="checkbox"
              sx={{
                width: { xs: "10%", sm: "40px" },
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
            <TableCell sx={{ width: { xs: "80%", sm: "auto" } }}>
              E-mail
            </TableCell>
            <TableCell sx={{ width: { xs: "10%", sm: "40px" } }} />
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user) => (
            <UserItem
              key={user.id}
              user={user}
              isSelected={selected.includes(user.id)}
              onSelect={handleSelect}
              onStateChange={onStateChange}
            />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
