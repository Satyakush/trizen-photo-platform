import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { login as loginUser } from "../../services/auth.service";
import { useAuth } from "../../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      const response = await loginUser(form);

      login(response.data, remember);

      if (response.data.user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/team");
      }
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Invalid email or password"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gray-950 px-4 py-8 sm:px-6 lg:px-8">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/trizen-photo.png')" }}
      />

      <div className="absolute inset-0 bg-black/55" />
      <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/35 to-black/65" />

      <div className="relative z-10 flex w-full max-w-5xl items-center justify-center lg:justify-end">
        <div className="w-full max-w-md rounded-3xl border border-white/20 bg-white/90 p-6 shadow-2xl backdrop-blur-xl sm:p-8 md:p-10">
          <div className="mb-8 text-center">
            <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-950 text-xl font-bold text-white shadow-lg">
              T
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl">
              Trizen Photos
            </h1>

            <p className="mt-2 text-sm text-gray-600 sm:text-base">
              Your moments. A bigger world.
            </p>
          </div>

          {error && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-800">
                Email
              </label>

              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                autoComplete="email"
                className="w-full rounded-xl border border-gray-300 bg-white/90 px-4 py-3 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-700 focus:ring-4 focus:ring-gray-900/10"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-800">
                Password
              </label>

              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                autoComplete="current-password"
                className="w-full rounded-xl border border-gray-300 bg-white/90 px-4 py-3 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-700 focus:ring-4 focus:ring-gray-900/10"
                placeholder="••••••••"
              />
            </div>

            <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-600"><input type="checkbox" checked={remember} onChange={e=>setRemember(e.target.checked)} className="h-4 w-4 accent-gray-950"/> Remember me</label>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gray-950 px-4 py-3 font-semibold text-white shadow-lg transition hover:bg-gray-800 focus:outline-none focus:ring-4 focus:ring-gray-900/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="mt-7 text-center text-xs leading-relaxed text-gray-500 sm:text-sm">
            Securely manage, organize and share your memories.
          </p>
        </div>
      </div>
    </main>
  );
};

export default Login;