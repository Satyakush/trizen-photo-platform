import { Navigate, Route, Routes } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import Login from "../pages/auth/Login";

import AdminDashboard from "../pages/admin/AdminDashboard";
import EventDetail from "../pages/admin/EventDetail";
import TeamMembers from "../pages/admin/TeamMembers";

import TeamDashboard from "../pages/team/TeamDashboard";
import TeamEventDetail from "../pages/team/TeamEventDetail";

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

const PublicGallery = () => (
  <div className="p-8">Public Gallery</div>
);

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <HomeRedirect />
          </ProtectedRoute>
        }
      />

      {/* Admin */}
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

      {/* Team Member */}
      <Route
        path="/team"
        element={
          <RoleRoute allowedRoles={["team_member"]}>
            <TeamDashboard />
          </RoleRoute>
        }
      />

      <Route
        path="/team/events/:eventId"
        element={
          <RoleRoute allowedRoles={["team_member"]}>
            <TeamEventDetail />
          </RoleRoute>
        }
      />

      {/* Customer */}
      <Route
        path="/gallery/:slug"
        element={<PublicGallery />}
      />

      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />
    </Routes>
  );
};

export default AppRoutes;