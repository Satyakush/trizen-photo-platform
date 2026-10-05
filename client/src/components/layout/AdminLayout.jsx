import { Link, useLocation } from "react-router-dom";
import { useState } from "react";

import { useAuth } from "../../context/AuthContext";

const AdminLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-8">
            <Link
              to="/admin"
              className="text-xl font-bold text-gray-900"
            >
              Trizen Photos
            </Link>

            <nav className="hidden items-center gap-2 md:flex">
              <Link
                to="/admin"
                className={`rounded-lg px-3 py-2 text-sm font-medium ${
                  isActive("/admin")
                    ? "bg-gray-900 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                Events
              </Link>

              <Link
                to="/admin/team-members"
                className={`rounded-lg px-3 py-2 text-sm font-medium ${
                  isActive("/admin/team-members")
                    ? "bg-gray-900 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                Team Members
              </Link>
            </nav>
          </div>

          <button type="button" onClick={() => setMenuOpen(v => !v)} aria-label={menuOpen ? "Close navigation" : "Open navigation"} aria-expanded={menuOpen} className="flex h-10 w-10 items-center justify-center rounded-lg border text-gray-700 md:hidden">{menuOpen ? "×" : "☰"}</button>
          <div className="flex items-center gap-4">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-gray-900">
                {user?.name}
              </p>

              <p className="text-xs text-gray-500">
                Administrator
              </p>
            </div>

            <button
              onClick={logout}
              className="rounded-lg border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              Logout
            </button>
          </div>
        </div>
        {menuOpen && <div className="border-t bg-white px-4 py-3 md:hidden"><nav className="grid gap-1"><Link to="/admin" onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100">Events</Link><Link to="/admin/team-members" onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100">Team Members</Link></nav></div>}
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;