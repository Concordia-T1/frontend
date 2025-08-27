import { Box, Alert, Pagination, Typography, useTheme, useMediaQuery } from "@mui/material";
import { useState, useEffect } from "react";
import { fetchWithCppdAuth } from "../../shared/api/fetchWithCppdAuth";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../entities/user/store";
import { TableToolbar } from "../../features/TableToolbar/ui/TableToolbar.tsx";
import { RequestsTable } from "../../widgets/RequestsTable/ui/RequestsTable.tsx";
import { RequestDialog } from "../../widgets/RequestDialog/RequestDialog.tsx";
import {
  type RequestAdmin,
  type FetchResponse,
  type RequestsCollectionResponse,
  type ClaimRecord,
} from "../../app/types";
import { useRequestsFilter } from "../../app/useRequestsFilter";
import { theme } from "../../app/providers/ThemeProvider/config/theme";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Slide } from "@mui/material";

export const AdminRequestsPage = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [requests, setRequests] = useState<RequestAdmin[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeTab, setActiveTab] = useState<"all" | "my">("all");
  const pageSize = 20;
  const navigate = useNavigate();
  const location = useLocation();
  const { userId, isAuthenticated, isAuthChecked } = useAuthStore();
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm'));

  const {
    filteredAndSortedRequests,
    setSearchValue,
    setSortValue,
    setFilters,
  } = useRequestsFilter(requests);

  useEffect(() => {
    if (location.state?.newRequests) {
      setRequests((prev) => [...location.state.newRequests, ...prev]);
      setSuccessMessage("Заявка отправлена");
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    if (!isAuthenticated || !userId) {
      navigate("/login");
      return;
    }

    const fetchRequests = async () => {
      try {
        const endpoint = activeTab === "all" ? "/claims" : "/claims/my";
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
            },
            navigate
          );

        console.log(`Ответ от ${endpoint}:`, response);

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

        const mappedRequests: RequestAdmin[] =
          response.claims?.map((claim: ClaimRecord) => ({
            id: claim.id != null ? claim.id.toString() : "",
            date: claim.created_at
              ? format(new Date(claim.created_at), "dd.MM.yyyy", { locale: ru })
              : "",
            email: claim.candidate_email || "",
            sender: claim.owner_email || "",
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
  }, [navigate, page, userId, isAuthChecked, activeTab]);

  const handleAddRequest = () => {
    if (isMobile) {
      navigate("/request-mobile");
    } else {
      setDialogOpen(true);
    }
  };

  const handleCreateRequest = (newRequests: RequestAdmin[]) => {
    setRequests((prev) => [...newRequests, ...prev]);
    setDialogOpen(false);
    setSuccessMessage("Заявка отправлена");
  };

  const handlePageChange = (_: React.ChangeEvent<unknown>, newPage: number) => {
    setPage(newPage);
  };

  const handleTabChange = (tab: "all" | "my") => {
    setActiveTab(tab);
    setPage(1);
  };

  return (
    <Box
      sx={{ p: { xs: 1, sm: 2 }, maxWidth: "100%", boxSizing: "border-box" }}
    >
      {error && (
        <Alert
          severity="error"
          sx={{ mb: { xs: 1, sm: 2 }, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
        >
          {error}
        </Alert>
      )}
      <TableToolbar
        onSearch={setSearchValue}
        onSortChange={setSortValue}
        onFilterChange={setFilters}
        onAddRequest={handleAddRequest}
        isAdmin
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />
      {filteredAndSortedRequests.length === 0 ? (
        <Typography
          variant={isMobile ? "body1" : "h6"}
          sx={{ mt: { xs: 1, sm: 2 }, textAlign: "center" }}
        >
          Заявки отсутствуют
        </Typography>
      ) : (
        <>
          <RequestsTable requests={filteredAndSortedRequests} isAdmin />
          <Box sx={{ display: "flex", justifyContent: "center", mt: { xs: 1, sm: 2 } }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={handlePageChange}
              showFirstButton
              showLastButton
              sx={{
                "& .MuiPaginationItem-root": {
                  color: theme.palette.brand.lightBlue,
                  fontSize: { xs: '0.875rem', sm: '1rem' },
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
      {!isMobile && (
        <RequestDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          onCreate={() => handleCreateRequest}
          setError={setError}
        />
      )}
      {successMessage && (
        <Slide direction="up" in={!!successMessage} mountOnEnter unmountOnExit>
          <Alert
            severity="success"
            sx={{
              position: 'fixed',
              bottom: { xs: 16, sm: 24 },
              left: { xs: 16, sm: 24 },
              zIndex: 1000,
              maxWidth: { xs: '80%', sm: '400px' },
              padding: { xs: '8px 16px', sm: '16px 24px' },
              fontSize: { xs: '0.75rem', sm: '1rem' },
              lineHeight: { xs: 1.4, sm: 1.5 },
              bgcolor: theme.palette.brand.lightBlue,
              color: theme.palette.brand.white,
              "& .MuiAlert-icon": {
                color: theme.palette.brand.white,
              },
            }}
          >
            {successMessage}
          </Alert>
        </Slide>
      )}
    </Box>
  );
};