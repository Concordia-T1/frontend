import { Navigate, Route, Routes } from "react-router-dom";
import { useAuthStore } from "../entities/user/store";
import { useInitAuth } from "../entities/user/useInitAuth";
import { Navbar } from "../widgets/Navbar/ui/Navbar";
import { LoginPage } from "../pages/LoginPage/LoginPage";
import { RequestsPage } from "../pages/RequestsPage/RequestsPage";
import { UsersPage } from "../pages/usersPage/UsersPage";
import { CreatingUserPage } from "../pages/CreatingUserPage/CreatingUserPage";
import { TemplatesPage } from "../pages/TemplatesPage/TemplatesPage";
import { RegistrationPage } from "../pages/ConsentPage/RegistrationPage";
import { ConsentPage } from "../pages/ConsentPage/ConsentPage";
import { ConsentSuccess } from "../pages/ConsentPage/ConsentSuccess";
import { ConsentErrorPage } from "../pages/ConsentPage/ConsentErrorPage";
import { ProtectedRoute, PublicRoute, AdminRoute } from "./providers/Router";
import { RequestInfoPage } from "../pages/RequestInfoPage/RequestInfoPage.tsx";

function App() {
  useInitAuth();
  const { isAuthChecked, isAuthenticated } = useAuthStore();

  if (!isAuthChecked) {
    return <div>Загрузка...</div>;
  }

  return (
    <>
      <Navbar />
      <Routes>
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/requests"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <RequestsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/request/:id"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <RequestInfoPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users"
          element={
            <AdminRoute isAuthenticated={isAuthenticated}>
              <UsersPage />
            </AdminRoute>
          }
        />
        <Route
          path="/create-user"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <CreatingUserPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/templates"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <TemplatesPage />
            </ProtectedRoute>
          }
        />
        <Route path="/registration" element={<RegistrationPage />} />
        <Route path="/consent" element={<ConsentPage />} />
        <Route path="/consent-success" element={<ConsentSuccess />} />
        <Route path="/consent-error" element={<ConsentErrorPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
}

export default App;
