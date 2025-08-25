import { Box, Alert, Pagination, Typography } from "@mui/material";
import { useState, useEffect } from "react";
import { fetchWithCppdAuth } from "../../shared/api/fetchWithCppdAuth";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../entities/user/store";
import { TableToolbar } from "../../features/TableToolbar/ui/TableToolbar.tsx";
import { RequestsTable } from "../../widgets/RequestsTable/ui/RequestsTable.tsx";
import { RequestDialog } from "../../widgets/RequestDialog/RequestDialog.tsx";
import {
  type Request,
  type FetchResponse,
  type RequestsCollectionResponse,
  type ClaimRecord,
} from "../../app/types";
import { useRequestsFilter } from "../../app/useRequestsFilter";
import { theme } from "../../app/providers/ThemeProvider/config/theme";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

export const RequestsPage = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [requests, setRequests] = useState<Request[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 20;
  const navigate = useNavigate();
  const { role, userId, isAuthenticated, isAuthChecked } = useAuthStore();

  const {
    filteredAndSortedRequests,
    setSearchValue,
    setSortValue,
    setFilters,
  } = useRequestsFilter(requests);

  useEffect(() => {
    if (!isAuthenticated || !userId || !role) {
      setError(
        "Идентификатор пользователя или роль не найдены. Пожалуйста, войдите заново."
      );
      navigate("/login");
      return;
    }

    const fetchRequests = async () => {
      try {
        const endpoint = role === "ADMIN" ? "/claims/my" : "/claims/my"; // Исправлено для админа
        console.log(`Отправка запроса на ${endpoint}`, {
          page,
          pageSize,
          userId,
        });

        const response: FetchResponse<RequestsCollectionResponse> =
          await fetchWithCppdAuth(
            endpoint,
            {
              method: "GET",
              params: {
                page: page - 1,
                size: pageSize,
                sort: "createdAt,desc",
              },
              headers: {
                "X-User-Role": role === "ADMIN" ? "ROLE_ADMIN" : "ROLE_MANAGER",
                "X-User-ID": userId.toString(),
              },
            },
            navigate
          );

        console.log(`Ответ от ${endpoint}:`, response);
        console.log("Claims:", response.claims);

        if (!response.ok) {
          switch (response.status) {
            case 401:
              setError(
                "Неавторизованный доступ. Пожалуйста, войдите в систему."
              );
              navigate("/login");
              break;
            case 400:
              setError("Некорректный запрос. Проверьте параметры.");
              break;
            case 404:
              setError("Заявки не найдены. Проверьте настройки сервера.");
              break;
            default:
              setError(response.detail || "Ошибка при загрузке заявок");
          }
          return;
        }

        const mappedRequests: Request[] =
          response.claims?.map((claim: ClaimRecord) => ({
            id: claim.id != null ? claim.id.toString() : "",
            date: claim.created_at
              ? format(new Date(claim.created_at), "dd.MM.yyyy", { locale: ru })
              : "",
            email: claim.candidate_email || "",
            status: claim.status || "",
            is_viewed: !!claim.responded_at,
          })) || [];

        setRequests(mappedRequests);
        setTotalPages(response.total_pages || 1);
      } catch (err: unknown) {
        setError(
          err instanceof Error ? err.message : "Ошибка соединения с сервером"
        );
        console.error("Ошибка при загрузке заявок:", err);
      }
    };

    fetchRequests();
  }, [navigate, page, userId, role, isAuthChecked]);

  const handleDelete = async (id: string) => {
    try {
      console.log("Отправка запроса на /claims/act для удаления заявки", {
        id,
      });
      const response = await fetchWithCppdAuth(
        `/claims/act`,
        {
          method: "POST",
          data: {
            claim_id: parseInt(id),
            state: "ACT_REFUSED",
            sig: "dummy_signature", // Замените на реальную подпись
          },
          headers: {
            "X-User-Role": role === "ADMIN" ? "ROLE_ADMIN" : "ROLE_MANAGER",
            "X-User-ID": userId!.toString(),
          },
        },
        navigate
      );

      console.log("Ответ от /claims/act:", response);

      if (!response.ok) {
        switch (response.status) {
          case 401:
            setError("Неавторизованный доступ. Пожалуйста, войдите в систему.");
            navigate("/login");
            break;
          case 400:
            setError("Некорректный запрос. Проверьте данные.");
            break;
          case 404:
            setError("Заявка не найдена.");
            break;
          default:
            setError(response.detail || "Ошибка при отклонении заявки");
        }
        return;
      }

      setRequests((prev) =>
        prev.map((req) =>
          req.id === id ? { ...req, status: "STATUS_REFUSED" } : req
        )
      );
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Ошибка при отклонении заявки"
      );
      console.error("Ошибка при удаления заявки:", err);
    }
  };

  const handleAddRequest = () => {
    setDialogOpen(true);
  };

  const handleCreateRequest = (newRequests: Request[]) => {
    setRequests((prev) => [...newRequests, ...prev]);
    setDialogOpen(false);
  };

  const handlePageChange = (
    newPage: number
  ) => {
    setPage(newPage);
  };

  return (
    <Box
      sx={{ p: { xs: 1, sm: 2 }, maxWidth: "100%", boxSizing: "border-box" }}
    >
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <TableToolbar
        onSearch={setSearchValue}
        onSortChange={setSortValue}
        onFilterChange={setFilters}
        onAddRequest={handleAddRequest}
      />
      {filteredAndSortedRequests.length === 0 ? (
        <Typography variant="h6" sx={{ mt: 2, textAlign: "center" }}>
          Вы еще не отправляли заявки
        </Typography>
      ) : (
        <>
          <RequestsTable
            requests={filteredAndSortedRequests}
            onDelete={handleDelete}
          />
          <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={() => handlePageChange}
              showFirstButton
              showLastButton
              sx={{
                "& .MuiPaginationItem-root": {
                  color: theme.palette.brand.lightBlue,
                  "&.Mui-selected": {
                    backgroundColor: theme.palette.brand.lightBlue,
                    color: theme.palette.brand.white,
                    "&:hover": {
                      backgroundColor: theme.palette.brand.darkblue,
                      color: theme.palette.brand.white,
                    },
                  },
                  "&:hover": {
                    backgroundColor: theme.palette.brand.darkblue,
                    color: theme.palette.brand.white,
                  },
                },
                "& .MuiPaginationItem-icon": {
                  color: theme.palette.brand.lightBlue,
                  "&:hover": {
                    color: theme.palette.brand.darkblue,
                  },
                },
              }}
            />
          </Box>
        </>
      )}
      <RequestDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onCreate={handleCreateRequest}
        setError={setError}
      />
    </Box>
  );
};
