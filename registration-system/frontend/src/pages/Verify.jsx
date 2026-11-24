import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { verifyEmail } from "../api.js";
import { AlertIcon, CheckIcon } from "../components/Icons.jsx";

export default function Verify() {
  const [params] = useSearchParams();
  const [state, setState] = useState({ status: "loading", message: "" });
  const ran = useRef(false); // React StrictMode runs effects twice; the token works only once

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    const token = params.get("token");
    if (!token) {
      setState({ status: "error", message: "The verification link is missing its token." });
      return;
    }
    verifyEmail(token)
      .then((r) => setState({ status: "ok", message: r.message }))
      .catch((e) => setState({ status: "error", message: e.message }));
  }, [params]);

  return (
    <section className="card card-center">
      {state.status === "loading" && (<><span className="spinner dark" /><h2>Verifying your email</h2></>)}
      {state.status === "ok" && (
        <>
          <div className="badge"><CheckIcon /></div>
          <h2>Email verified</h2>
          <p className="muted">{state.message}</p>
          <Link to="/login" className="btn btn-link">Go to log in</Link>
        </>
      )}
      {state.status === "error" && (
        <>
          <div className="badge badge-error"><AlertIcon /></div>
          <h2>Verification failed</h2>
          <p className="muted">{state.message}</p>
          <Link to="/register" className="btn btn-link">Back to sign up</Link>
        </>
      )}
    </section>
  );
}
