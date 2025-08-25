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
import { RequestInfoPage } from "../pages/RequestInfoPage/RequestInfoPage.tsx";

function App() {
  useInitAuth();
  const { isAuthChecked, isAuthenticated, role } = useAuthStore();

  if (!isAuthChecked) {
    return <div>Загрузка...</div>;
  }

  return (
    <>
      {isAuthenticated && <Navbar />}
      <Routes>
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/requests" replace /> : <LoginPage />}
        />
        <Route
          path="/requests"
          element={isAuthenticated ? <RequestsPage /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/request/:id"
          element={isAuthenticated ? <RequestInfoPage /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/users"
          element={
            isAuthenticated && role === "ADMIN" ? <UsersPage /> : <Navigate to="/login" replace />
          }
        />
        <Route
          path="/create-user"
          element={isAuthenticated ? <CreatingUserPage /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/templates"
          element={isAuthenticated ? <TemplatesPage /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/invite"
          element={isAuthenticated ? <Navigate to="/requests" replace /> : <RegistrationPage />}
        />
        <Route path="/consent" element={<ConsentPage />} />
        <Route path="/consent-success" element={<ConsentSuccess />} />
        <Route path="/consent-error" element={<ConsentErrorPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
}

export default App;