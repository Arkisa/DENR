// Mock mode is ON by default so the page works without the backend.
// When the backend is ready, create frontend/.env with:  VITE_USE_MOCK=false
const USE_MOCK = import.meta.env.VITE_USE_MOCK !== "false";
const STORE_KEY = "mock_operator_profiles";

async function request(path, options = {}) {
  let res;
  try {
    res = await fetch(`/api${path}`, { headers: { "Content-Type": "application/json" }, ...options });
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

// ---------- mock (browser only, for demo) ----------
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const readStore = () => {
  try { return JSON.parse(localStorage.getItem(STORE_KEY)) || []; } catch { return []; }
};
// Starts at 3 so the first ID matches the design (SLF-2026-003)
const mockNextId = () => Math.max(2, ...readStore().map((p) => p.operator_id)) + 1;

// ---------- public functions ----------
export async function getNextOperatorId() {
  if (USE_MOCK) return mockNextId();
  try {
    const r = await request("/operator-profile/next-id");
    return r.operator_id;
  } catch {
    return null; // the form then shows "Assigned on save"
  }
}

export async function createOperatorProfile(payload) {
  if (USE_MOCK) {
    await wait(700);
    const list = readStore();
    if (list.some((p) => p.email_add === payload.email_add)) {
      const err = new Error("This email is already registered to another operator.");
      err.code = "EMAIL_EXISTS";
      throw err;
    }
    const record = { ...payload, operator_id: mockNextId(), created_at: new Date().toISOString() };
    try { localStorage.setItem(STORE_KEY, JSON.stringify([...list, record])); } catch { /* ignore */ }
    return { operator_id: record.operator_id, date_of_registration: record.created_at.slice(0, 10) };
  }
  return request("/operator-profile", { method: "POST", body: JSON.stringify(payload) });
}
