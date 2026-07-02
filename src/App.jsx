import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import DaarasPage from "./pages/daaras/DaarasPage";
import TalibesPage from "./pages/talibes/TalibesPage";
import BesoinsPage from "./pages/besoins/BesoinsPage";
import DonsPage from "./pages/dons/DonsPage";
import FormationsPage from "./pages/formations/FormationsPage";
import MissionsPage from "./pages/missions/MissionsPage";
import NotificationsPage from "./pages/notifications/NotificationsPage";
import RapportsPage from "./pages/rapports/RapportsPage";
import UtilisateursPage from "./pages/utilisateurs/UtilisateursPage";
import AgentsPage from "./pages/agents/AgentsPage";
import PartenairesPage from "./pages/partenaires/PartenairesPage";
import ProfilePage from "./pages/profile/ProfilePage";
import ObjectifsPage from "./pages/objectifs/ObjectifsPage";
import InsertionsPage from "./pages/insertions/InsertionsPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />

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
          path="/besoins"
          element={
            <ProtectedRoute>
              <BesoinsPage />
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
          path="/formations"
          element={
            <ProtectedRoute>
              <FormationsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/insertions"
          element={
            <ProtectedRoute>
              <InsertionsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/missions"
          element={
            <ProtectedRoute>
              <MissionsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <NotificationsPage />
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
        <Route
          path="/utilisateurs"
          element={
            <ProtectedRoute>
              <UtilisateursPage />
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
          path="/partenaires"
          element={
            <ProtectedRoute>
              <PartenairesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/objectifs"
          element={
            <ProtectedRoute>
              <ObjectifsPage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
