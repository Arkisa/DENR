import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { loginUser } from "../api.js";
import { AlertIcon, CheckIcon, EyeIcon, EyeOffIcon, LockIcon, MailIcon } from "../components/Icons.jsx";

export default function Login() {
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.email || "");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await loginUser(email.trim(), password);
      setOk(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (ok)
    return (
      <section className="card card-center">
        <div className="badge"><CheckIcon /></div>
        <h2>You are logged in</h2>
        <p className="muted">Your account is active. The dashboard opens here once it is connected.</p>
      </section>
    );

  return (
    <section className="card card-narrow">
      <h2>Log in</h2>
      <p className="muted">Enter the email and password you registered with.</p>
      {error && (
        <div className="alert alert-error" role="alert"><AlertIcon /><div><p>{error}</p></div></div>
      )}
      <form onSubmit={handleSubmit}>
        <label className="field">
          <span>Email address</span>
          <div className="input">
            <MailIcon />
            <input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
        </label>
        <label className="field">
          <span>Password</span>
          <div className="input">
            <LockIcon />
            <input type={show ? "text" : "password"} autoComplete="current-password" value={password}
              onChange={(e) => setPassword(e.target.value)} required />
            <button type="button" className="eye" onClick={() => setShow(!show)} aria-label={show ? "Hide password" : "Show password"}>
              {show ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
        </label>
        <button className="btn" type="submit" disabled={loading}>
          {loading ? <><span className="spinner" /> Logging in</> : "Log in"}
        </button>
      </form>
      <p className="switch">No account yet? <Link to="/register">Sign up</Link></p>
    </section>
  );
}
