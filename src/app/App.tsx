import { RequestsPage } from "../pages/RequestsPage/RequestsPage.tsx";
import { Navbar } from "../widgets/Navbar/ui/Navbar.tsx";
import {
  ProtectedRoute,
  PublicRoute,
  AdminRoute,
} from "./providers/Router.tsx";
import { LoginPage } from "../pages/LoginPage/LoginPage.tsx";
import { Navigate, Route, Routes } from "react-router-dom";
import { RequestInfoPage } from "../pages/RequestInfoPage/RequestInfoPage.tsx";
import { RegistrationPage } from "../pages/ConsentPage/RegistrationPage.tsx";
import { ConsentPage } from "../pages/ConsentPage/ConsentPage.tsx";
import { ConsentSuccess } from "../pages/ConsentPage/ConsentSuccess.tsx";
import { ConsentErrorPage } from "../pages/ConsentPage/ConsentErrorPage.tsx";
import { useInitAuth } from "../entities/user/useInitAuth.tsx";
import { UsersPage } from "../pages/usersPage/UsersPage.tsx";
import { CreatingUserPage } from "../pages/CreatingUserPage/CreatingUserPage.tsx";
import { TemplatesPage } from "../pages/TemplatesPage/TemplatesPage.tsx";

function App() {
  useInitAuth();

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
            <ProtectedRoute>
              <RequestsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users"
          element={
            <AdminRoute>
              <UsersPage />
            </AdminRoute>
          }
        />
        <Route
          path="/create-user"
          element={
            <ProtectedRoute>
              <CreatingUserPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/templates"
          element={
            <ProtectedRoute>
              <TemplatesPage />
            </ProtectedRoute>
          }
        />
        <Route path="/registration" element={<RegistrationPage />} />
        <Route path="/consent" element={<ConsentPage />} />
        <Route path="/consent-success" element={<ConsentSuccess />} />
        <Route path="/consent-error" element={<ConsentErrorPage />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
}

export default App;
