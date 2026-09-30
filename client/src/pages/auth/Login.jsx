import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import { login as loginUser } from "../../services/auth.service";
import { useAuth } from "../../context/AuthContext";
import "./login.css";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({ email: "", password: "" });
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await loginUser(form);
      login(response.data, remember);
      navigate(response.data.user.role === "admin" ? "/admin" : "/team");
    } catch (error) {
      setError(error.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="trizen-login">
      <div className="trizen-login__backdrop" />
      <div className="trizen-login__glow" />

      <div className="trizen-login__layout">
        <section className="trizen-login__intro">
          <div className="trizen-login__eyebrow">
            <span className="trizen-login__mark">T</span>
            Trizen Photos
          </div>
          <h1>Your moments.<br />A bigger world.</h1>
          <p>Sign in to manage galleries, coordinate photo events, and keep every memory organized in one professional workspace.</p>
        </section>

        <section className="trizen-login__card">
          <div className="trizen-login__brand">
            <div className="trizen-login__brand-mark">T</div>
            <div><strong>Trizen Photos</strong><span>Professional photo workspace</span></div>
          </div>

          <h2>Welcome back.</h2>
          <p className="trizen-login__subtitle">Sign in to continue to your workspace.</p>

          {error && <div className="trizen-login__error" role="alert">{error}</div>}

          <form onSubmit={handleSubmit} className="trizen-login__form">
            <label className="trizen-login__field">
              <span>Email address</span>
              <div className="trizen-login__control">
                <input type="email" name="email" value={form.email} onChange={handleChange} required autoComplete="email" placeholder="you@example.com" />
              </div>
            </label>

            <label className="trizen-login__field">
              <span>Password</span>
              <div className="trizen-login__control">
                <input type="password" name="password" value={form.password} onChange={handleChange} required autoComplete="current-password" placeholder="••••••••" />
              </div>
            </label>

            <label className="trizen-login__remember">
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
              Remember me
            </label>

            <button type="submit" disabled={loading} className="trizen-login__submit">
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="trizen-login__footer">
            Securely manage, organize and share your memories.<br />
            <Link to="/register">Create an account</Link> if you are new here.
          </p>
        </section>
      </div>
    </main>
  );
};

export default Login;
