import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerAdmin } from "../../services/auth.service";
import "./register.css";

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name:"", email:"", password:"", setupKey:"" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);\n\n  const EyeIcon = () => <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 12s3.4-6 9.5-6 9.5 6 9.5 6-3.4 6-9.5 6-9.5-6-9.5-6Z" fill="none" stroke="currentColor" strokeWidth="1.8"/><circle cx="12" cy="12" r="2.7" fill="none" stroke="currentColor" strokeWidth="1.8"/></svg>;\n  const EyeOffIcon = () => <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 3 18 18M10.6 6.2A10.7 10.7 0 0 1 12 6c6.1 0 9.5 6 9.5 6a17.8 17.8 0 0 1-3.1 3.7M6.2 6.8C3.8 8.3 2.5 12 2.5 12s3.4 6 9.5 6c1.3 0 2.5-.3 3.5-.8" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>;
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(""); setSuccess("");
    try {
      await registerAdmin(
        { name: form.name, email: form.email, password: form.password },
        form.setupKey
      );
      setSuccess("Admin account created. Redirecting to login...");
      setTimeout(() => navigate("/login", { replace: true }), 1200);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Check your setup key.");
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
        <div className="trizen-register__brand"><div className="trizen-register__brand-mark">T</div><div><strong>Trizen Photos</strong><span>Authorized admin setup</span></div></div>
        <div className="trizen-register__heading"><p>CREATE ACCOUNT</p><h2>Set up your workspace.</h2><span>Registration is protected by an administrator setup key.</span></div>
        {error && <div className="trizen-register__message is-error" role="alert">{error}</div>}
        {success && <div className="trizen-register__message is-success" role="status">{success}</div>}
        <form onSubmit={handleSubmit} className="trizen-register__form">
          <label className="trizen-register__field"><span>Full name</span><input name="name" value={form.name} onChange={handleChange} required minLength={2} maxLength={50} autoComplete="name" placeholder="Your name" /></label>
          <label className="trizen-register__field"><span>Email address</span><input type="email" name="email" value={form.email} onChange={handleChange} required autoComplete="email" placeholder="you@example.com" /></label>
          <label className="trizen-register__field"><span>Password</span><input type={showPassword ? "text" : "password"} name="password" value={form.password} onChange={handleChange} required minLength={6} autoComplete="new-password" placeholder="At least 6 characters" />
          <button type="button" className="trizen-register__password-toggle" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOffIcon /> : <EyeIcon />}</button></label>
          <label className="trizen-register__field"><span>Admin setup key</span><input type="password" name="setupKey" value={form.setupKey} onChange={handleChange} required autoComplete="off" placeholder="Enter setup key" /></label>
          <button type="submit" disabled={loading} className="trizen-register__submit">{loading ? "Creating account..." : "Create admin account →"}</button>
        </form>
        <p className="trizen-register__footer">Already have an account? <Link to="/login">Sign in</Link></p>
      </section>
    </main>
  );
};
export default Register;
