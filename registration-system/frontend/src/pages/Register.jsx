import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { registerUser } from "../api.js";
import {
  AlertIcon, CheckIcon, EyeIcon, EyeOffIcon, LockIcon, MailIcon,
  MailSentIcon, MapIcon, ScaleIcon, TruckIcon,
} from "../components/Icons.jsx";

const EMAIL_RE = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

const rules = [
  { id: "len", label: "At least 8 characters", test: (p) => p.length >= 8 },
  { id: "up", label: "One uppercase letter", test: (p) => /[A-Z]/.test(p) },
  { id: "low", label: "One lowercase letter", test: (p) => /[a-z]/.test(p) },
  { id: "num", label: "One number", test: (p) => /\d/.test(p) },
];

const strengthLabels = ["Too weak", "Weak", "Fair", "Good", "Strong"];

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null); // { code, message }
  const [done, setDone] = useState(null);   // registered email

  const passed = useMemo(() => rules.map((r) => r.test(password)), [password]);
  const score = passed.filter(Boolean).length;

  // Step: "Input valid?"
  function validate() {
    if (!EMAIL_RE.test(email.trim()))
      return "Enter a valid email address, for example name@denr.gov.ph.";
    if (score < rules.length)
      return "Your password does not meet all the requirements below.";
    if (password !== confirm) return "The two passwords do not match.";
    return null;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const problem = validate();
    if (problem) {
      setError({ code: "INVALID_INPUT", message: problem }); // "Show error message" -> back to entry
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await registerUser(email.trim(), password);
      setDone(email.trim().toLowerCase()); // "Registration complete"
    } catch (err) {
      setError({ code: err.code, message: err.message });
    } finally {
      setLoading(false);
    }
  }

  if (done) return <Success email={done} />;

  return (
    <div className="split">
      <aside className="intro">
        <h1>Create your monitoring account</h1>
        <p className="lead">
          Register to submit hauler reports, manage landfill profiles, and follow waste
          disposal records for your facility.
        </p>

        <ul className="feature-list">
          <li>
            <span className="feature-icon"><ScaleIcon /></span>
            <div>
              <strong>Disposal tracking</strong>
              <span>Waste volumes recorded in metric tons per cell.</span>
            </div>
          </li>
          <li>
            <span className="feature-icon blue"><TruckIcon /></span>
            <div>
              <strong>Hauler registry</strong>
              <span>Register haulers and vehicles under one account.</span>
            </div>
          </li>
          <li>
            <span className="feature-icon"><MapIcon /></span>
            <div>
              <strong>Landfill capacity</strong>
              <span>See operational cells and remaining capacity.</span>
            </div>
          </li>
        </ul>

        <div className="preview" aria-hidden="true">
          <div className="preview-card">
            <span>Total disposed</span>
            <strong>22.70 MT</strong>
            <em>22,700 kg</em>
          </div>
          <div className="preview-card blue">
            <span>Registered SLFs</span>
            <strong>2 Facilities</strong>
            <em>12 operational cells</em>
          </div>
        </div>
      </aside>

      <section className="card" aria-labelledby="reg-title">
        <h2 id="reg-title">Sign up</h2>
        <p className="muted">Use your official email address.</p>

        {error && (
          <div className={`alert ${error.code === "EMAIL_EXISTS" ? "alert-info" : "alert-error"}`} role="alert">
            <AlertIcon />
            <div>
              <p>{error.message}</p>
              {error.code === "EMAIL_EXISTS" && (
                <Link to="/login" state={{ email }} className="alert-link">Go to log in</Link>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <label className="field">
            <span>Email address</span>
            <div className="input">
              <MailIcon />
              <input
                type="email" autoComplete="email" placeholder="name@denr.gov.ph"
                value={email} onChange={(e) => setEmail(e.target.value)} required
              />
            </div>
          </label>

          <label className="field">
            <span>Password</span>
            <div className="input">
              <LockIcon />
              <input
                type={show ? "text" : "password"} autoComplete="new-password"
                placeholder="Create a password"
                value={password} onChange={(e) => setPassword(e.target.value)} required
              />
              <button type="button" className="eye" onClick={() => setShow(!show)}
                aria-label={show ? "Hide password" : "Show password"}>
                {show ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </label>

          {password && (
            <div className="strength" aria-live="polite">
              <div className="bars">
                {[1, 2, 3, 4].map((n) => (
                  <i key={n} className={n <= score ? `on s${score}` : ""} />
                ))}
              </div>
              <span>{strengthLabels[score]}</span>
            </div>
          )}

          <ul className="rules">
            {rules.map((r, i) => (
              <li key={r.id} className={passed[i] ? "ok" : ""}>
                <span className="tick"><CheckIcon /></span>{r.label}
              </li>
            ))}
          </ul>

          <label className="field">
            <span>Confirm password</span>
            <div className="input">
              <LockIcon />
              <input
                type={show ? "text" : "password"} autoComplete="new-password"
                placeholder="Re-enter your password"
                value={confirm} onChange={(e) => setConfirm(e.target.value)} required
              />
            </div>
          </label>

          <button className="btn" type="submit" disabled={loading}>
            {loading ? <><span className="spinner" /> Creating account</> : "Create account"}
          </button>
        </form>

        <p className="switch">Already registered? <Link to="/login">Log in</Link></p>
      </section>
    </div>
  );
}

function Success({ email }) {
  return (
    <section className="card card-center">
      <div className="badge"><MailSentIcon /></div>
      <h2>Registration complete</h2>
      <p className="muted">
        We sent a verification link to <strong>{email}</strong>. Open it to activate your
        account. The link is valid for 24 hours.
      </p>
      <Link to="/login" className="btn btn-link">Go to log in</Link>
    </section>
  );
}
