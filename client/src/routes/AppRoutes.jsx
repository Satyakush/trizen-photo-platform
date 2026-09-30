import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import AdminDashboard from "../pages/admin/AdminDashboard";
import Events from "../pages/admin/Events";
import EventDetail from "../pages/admin/EventDetail";
import TeamMembers from "../pages/admin/TeamMembers";
import TeamDashboard from "../pages/team/TeamDashboard";
import TeamEventDetail from "../pages/team/TeamEventDetail";
import GalleryAccess from "../pages/public/GalleryAccess";
import PublicGallery from "../pages/public/PublicGallery";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const RoleRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
};

const HomeRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return user.role === "admin" ? <Navigate to="/admin" replace /> : <Navigate to="/team" replace />;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route path="/" element={<ProtectedRoute><HomeRedirect /></ProtectedRoute>} />
    <Route path="/admin" element={<RoleRoute allowedRoles={["admin"]}><AdminDashboard /></RoleRoute>} />
    <Route path="/admin/events" element={<RoleRoute allowedRoles={["admin"]}><Events /></RoleRoute>} />
    <Route path="/admin/events/:eventId" element={<RoleRoute allowedRoles={["admin"]}><EventDetail /></RoleRoute>} />
    <Route path="/admin/team-members" element={<RoleRoute allowedRoles={["admin"]}><TeamMembers /></RoleRoute>} />
    <Route path="/team" element={<RoleRoute allowedRoles={["team_member"]}><TeamDashboard /></RoleRoute>} />
    <Route path="/team/events/:eventId" element={<RoleRoute allowedRoles={["team_member"]}><TeamEventDetail /></RoleRoute>} />
    <Route path="/gallery/:slug" element={<GalleryAccess />} />
    <Route path="/gallery/:slug/view" element={<PublicGallery />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default AppRoutes;
