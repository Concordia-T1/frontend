import { useAuthStore } from "../../entities/user/store";
import { AdminRequestsPage } from "./AdminRequestsPage";
import { UserRequestsPage } from "./UserRequestsPage";

export const RequestsPage = () => {
  const { role } = useAuthStore();

  return role === "ROLE_ADMIN" ? <AdminRequestsPage /> : <UserRequestsPage />;
};