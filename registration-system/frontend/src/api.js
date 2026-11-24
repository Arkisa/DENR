// Small wrapper around fetch. Errors carry the API's `code` and `message`.
async function request(path, options = {}) {
  let res;
  try {
    res = await fetch(`/api${path}`, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
  } catch {
    const err = new Error("Cannot reach the server. Check that the backend is running.");
    err.code = "NETWORK";
    throw err;
  }
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const d = body.detail || {};
    const err = new Error(d.message || "Something went wrong. Please try again.");
    err.code = d.code || "ERROR";
    throw err;
  }
  return body;
}

export const registerUser = (email, password) =>
  request("/register", { method: "POST", body: JSON.stringify({ email, password }) });

export const loginUser = (email, password) =>
  request("/login", { method: "POST", body: JSON.stringify({ email, password }) });

export const verifyEmail = (token) => request(`/verify?token=${encodeURIComponent(token)}`);
