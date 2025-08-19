import { Box, Alert, Pagination } from "@mui/material";
import React, { useState, useEffect } from "react";
import { fetchWithAuth } from "@shared/api/fetchWithAuth";
import { useNavigate } from "react-router-dom";
import { TableToolbar } from "@features/TableToolbar/ui/TableToolbar.tsx";
import { RequestsTable } from "@widgets/RequestsTable/ui/RequestsTable.tsx";
import { RequestDialog } from "@widgets/RequestDialog/RequestDialog.tsx";
import {
  type Request,
  type FetchResponse,
  type RequestsCollectionResponse,
} from "@app/types";
import { useRequestsFilter } from "@app/useRequestsFilter";
import { theme } from "../../app/providers/ThemeProvider/config/theme";

export const RequestsPage = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [requests, setRequests] = useState<Request[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1); // Текущая страница
  const [totalPages, setTotalPages] = useState(1); // Общее количество страниц
  const pageSize = 20; // Ограничение на 20 заявок
  const navigate = useNavigate();

  const {
    filteredAndSortedRequests,
    setSearchValue,
    setSortValue,
    setFilters,
  } = useRequestsFilter(requests);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response: FetchResponse<RequestsCollectionResponse> =
          await fetchWithAuth(
            "/claims",
            {
              method: "GET",
              params: {
                page: page - 1, // API ожидает 0-based индекс
                size: pageSize,
                sort: ["createdDate,desc"],
              },
            },
            navigate
          );

        if (!response.ok) {
          setError(response.detail || "Ошибка при загрузке заявок");
          return;
        }

        setRequests(response.data.requests);
        // Предполагаем, что API возвращает totalPages или общее количество записей
        setTotalPages(
          Math.ceil(
            (response.data.total || response.data.requests.length) / pageSize
          )
        );
      } catch (err: unknown) {
        setError(
          err instanceof Error ? err.message : "Ошибка соединения с сервером"
        );
      }
    };

    fetchRequests();
  }, [navigate, page]); // Зависимость от page для обновления при смене страницы

  const handleDelete = async (id: string) => {
    try {
      const response = await fetchWithAuth(
        `/claims/${id}/act`,
        {
          method: "POST",
          data: { status: "REJECTED" },
        },
        navigate
      );

      if (!response.ok) {
        setError(response.detail || "Ошибка при отклонении заявки");
        return;
      }

      setRequests((prev) =>
        prev.map((req) =>
          req.id === id ? { ...req, status: "REJECTED" } : req
        )
      );
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Ошибка при отклонении заявки"
      );
    }
  };

  const handleAddRequest = () => {
    setDialogOpen(true);
  };

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
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
      <RequestsTable
        requests={filteredAndSortedRequests}
        onDelete={handleDelete}
      />
      <RequestDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onCreate={setRequests}
        setError={setError}
      />
      <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
        <Pagination
          count={totalPages}
          page={page}
          onChange={handlePageChange}
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
    </Box>
  );
};
