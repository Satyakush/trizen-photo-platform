import { Navigate, Route, Routes } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import Login from "../pages/auth/Login";

import AdminDashboard from "../pages/admin/AdminDashboard";
import EventDetail from "../pages/admin/EventDetail";
import TeamMembers from "../pages/admin/TeamMembers";

import TeamDashboard from "../pages/team/TeamDashboard";
import TeamEventDetail from "../pages/team/TeamEventDetail";

import GalleryAccess from "../pages/public/GalleryAccess";
import PublicGallery from "../pages/public/PublicGallery";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const RoleRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const HomeRedirect = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === "admin") {
    return <Navigate to="/admin" replace />;
  }

  return <Navigate to="/team" replace />;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Auth */}
      <Route
        path="/login"
        element={<Login />}
      />

      {/* Home */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <HomeRedirect />
          </ProtectedRoute>
        }
      />

      {/* ================================
          ADMIN
      ================================= */}

      <Route
        path="/admin"
        element={
          <RoleRoute allowedRoles={["admin"]}>
            <AdminDashboard />
          </RoleRoute>
        }
      />

      <Route
        path="/admin/events/:eventId"
        element={
          <RoleRoute allowedRoles={["admin"]}>
            <EventDetail />
          </RoleRoute>
        }
      />

      <Route
        path="/admin/team-members"
        element={
          <RoleRoute allowedRoles={["admin"]}>
            <TeamMembers />
          </RoleRoute>
        }
      />

      {/* ================================
          TEAM MEMBER
      ================================= */}

      <Route
        path="/team"
        element={
          <RoleRoute
            allowedRoles={["team_member"]}
          >
            <TeamDashboard />
          </RoleRoute>
        }
      />

      <Route
        path="/team/events/:eventId"
        element={
          <RoleRoute
            allowedRoles={["team_member"]}
          >
            <TeamEventDetail />
          </RoleRoute>
        }
      />

      {/* ================================
          CUSTOMER GALLERY
      ================================= */}

      <Route
        path="/gallery/:slug"
        element={<GalleryAccess />}
      />

      <Route
        path="/gallery/:slug/view"
        element={<PublicGallery />}
      />

      {/* Fallback */}
      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />
    </Routes>
  );
};

export default AppRoutes;