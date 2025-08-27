import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  TableContainer,
} from "@mui/material";
import { UserItem } from "../../features/UserItem/UserItem.tsx";
import { theme } from "../../app/providers/ThemeProvider/config/theme.ts";
import type { User } from "../../app/types.ts";

interface UsersTableProps {
  users: User[];
  onStateChange: (
    id: string,
    newState: "STATE_ENABLED" | "STATE_DISABLED"
  ) => void;
}

export const UsersTable = ({ users, onStateChange }: UsersTableProps) => {
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
            <TableCell sx={{ width: { xs: "80%", sm: "auto" } }}>
              E-mail
            </TableCell>
            <TableCell sx={{ width: { xs: "20%", sm: "80px" } }} />
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user) => (
            <UserItem
              key={user.id}
              user={user}
              onStateChange={onStateChange}
            />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
