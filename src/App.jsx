import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import DaarasPage from "./pages/daaras/DaarasPage";
import TalibesPage from "./pages/talibes/TalibesPage";
import DonsPage from "./pages/dons/DonsPage";
import PartenairesPage from "./pages/partenaires/PartenairesPage";
import FormationsPage from "./pages/formations/FormationsPage";
import AgentsPage from "./pages/agents/AgentsPage";
import RapportsPage from "./pages/rapports/RapportsPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirection racine vers login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Login */}
        <Route path="/login" element={<LoginPage />} />

        {/* Pages protégées */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/daaras"
          element={
            <ProtectedRoute>
              <DaarasPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/talibes"
          element={
            <ProtectedRoute>
              <TalibesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dons"
          element={
            <ProtectedRoute>
              <DonsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/partenaires"
          element={
            <ProtectedRoute>
              <PartenairesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/formations"
          element={
            <ProtectedRoute>
              <FormationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/agents"
          element={
            <ProtectedRoute>
              <AgentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/rapports"
          element={
            <ProtectedRoute>
              <RapportsPage />
            </ProtectedRoute>
          }
        />

        {/* 404 */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
