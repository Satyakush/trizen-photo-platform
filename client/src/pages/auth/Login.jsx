import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login as loginUser } from "../../services/auth.service";
import { useAuth } from "../../context/AuthContext";
import "./register.css";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await loginUser(form);
      login(response.data, remember);
      navigate(response.data.user.role === "admin" ? "/admin" : "/team");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="trizen-register">
      <section className="trizen-register__intro">
        <div className="trizen-register__eyebrow"><span className="trizen-register__mark">T</span> Trizen Photos</div>
        <h1>Build the workflow behind every frame.</h1>
        <p>A focused command center for events, photographers, galleries, and the complete photo workflow.</p>
        <div className="trizen-register__features">
          {["Create events","Assign your team","Publish galleries"].map((item,i) => (
            <div className="trizen-register__feature" key={item}><span>0{i+1}</span><strong>{item}</strong></div>
          ))}
        </div>
      </section>

      <section className="trizen-register__card">
        <div className="trizen-register__brand">
          <div className="trizen-register__brand-mark">T</div>
          <div><strong>Trizen Photos</strong><span>Professional photo workspace</span></div>
        </div>

        <div className="trizen-register__heading">
          <p>WELCOME BACK</p>
          <h2>Sign in to your workspace.</h2>
          <span>Continue managing events, photographers, galleries, and every frame that matters.</span>
        </div>

        {error && <div className="trizen-register__message is-error" role="alert">{error}</div>}

        <form onSubmit={handleSubmit} className="trizen-register__form">
          <label className="trizen-register__field">
            <span>Email address</span>
            <input type="email" name="email" value={form.email} onChange={handleChange} required autoComplete="email" placeholder="you@example.com" />
          </label>

          <label className="trizen-register__field">
            <span>Password</span>
            <input type={showPassword ? "text" : "password"} name="password" value={form.password} onChange={handleChange} required autoComplete="current-password" placeholder="Enter your password" />
            <button type="button" className="trizen-register__password-toggle" onClick={() => setShowPassword((value) => !value)}>{showPassword ? "Hide" : "Show"}</button>
          </label>

          <label className="trizen-register__remember">
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
            <span>Remember me</span>
          </label>

          <button type="submit" disabled={loading} className="trizen-register__submit">
            {loading ? "Signing in..." : "Sign in →"}
          </button>
        </form>

        <p className="trizen-register__footer">New to Trizen? <Link to="/register">Create an admin account</Link></p>
      </section>
    </main>
  );
};

export default Login;
