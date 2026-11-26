// Validation rules. Max lengths match the operator_profile table columns.
export const LIMITS = {
  name_of_operator: 255,
  client_type: 50,
  address_street: 255,
  address_brgy: 100,
  address_municipality_city: 100,
  address_province: 100,
  email_add: 150,
  contact: 30,
  geotag: 100,
  ceo_owner_pres: 150,
  name_of_pco_representative: 150,
};

const EMAIL_RE = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
const GEO_RE = /^\s*(-?\d{1,2}(?:\.\d+)?)\s*,\s*(-?\d{1,3}(?:\.\d+)?)\s*$/;

// The form has ONE address box ("Street, Barangay, City/Municipality, Province"),
// but the database stores it in four columns. Split it from the end.
export function parseAddress(raw) {
  const parts = raw.split(",").map((p) => p.trim()).filter(Boolean);
  if (parts.length < 3) return null; // need at least Barangay, City, Province
  return {
    address_province: parts[parts.length - 1],
    address_municipality_city: parts[parts.length - 2],
    address_brgy: parts[parts.length - 3],
    address_street: parts.slice(0, -3).join(", ") || null,
  };
}

const tooLong = (label, v, max) => (v.trim().length > max ? `${label} must be ${max} characters or less.` : "");

export const validators = {
  name_of_operator: (v) =>
    !v.trim() ? "Name of operator is required." : tooLong("Name of operator", v, LIMITS.name_of_operator),

  client_type: (v) => (v ? "" : "Select a client type."),

  address: (v) => {
    if (!v.trim()) return "Address is required.";
    const a = parseAddress(v);
    if (!a) return "Use this format: Street, Barangay, City/Municipality, Province.";
    if (a.address_province.length > 100 || a.address_municipality_city.length > 100 || a.address_brgy.length > 100 || (a.address_street || "").length > 255)
      return "One part of the address is too long.";
    return "";
  },

  date_established: (v) => {
    if (!v) return "Date established is required.";
    const d = new Date(`${v}T00:00:00`);
    if (Number.isNaN(d.getTime()) || v < "1900-01-01") return "Enter a valid date.";
    if (d > new Date()) return "Date established cannot be in the future.";
    return "";
  },

  email_add: (v) => {
    const t = v.trim();
    if (!t) return "Email address is required.";
    if (!EMAIL_RE.test(t)) return "Enter a valid email, for example operator@slf-domain.ph.";
    return tooLong("Email", t, LIMITS.email_add);
  },

  contact: (v) => {
    const t = v.trim();
    if (!t) return "Contact number is required.";
    const digits = t.replace(/\D/g, "");
    if (!/^[0-9+()\-\s]+$/.test(t) || digits.length < 7 || digits.length > 13 || t.length > LIMITS.contact)
      return "Enter a valid mobile or landline number, e.g. 09171234567 or (032) 234-5678.";
    return "";
  },

  geotag: (v) => {
    if (!v.trim()) return "Geotag coordinates are required.";
    const m = v.match(GEO_RE);
    if (!m) return "Use latitude, longitude, for example 10.3157, 123.8854.";
    if (Math.abs(+m[1]) > 90) return "Latitude must be between -90 and 90.";
    if (Math.abs(+m[2]) > 180) return "Longitude must be between -180 and 180.";
    return "";
  },

  ceo_owner_pres: (v) =>
    !v.trim() ? "CEO / Owner / President is required." : tooLong("This name", v, LIMITS.ceo_owner_pres),

  name_of_pco_representative: (v) =>
    !v.trim() ? "PCO / Authorized Representative is required." : tooLong("This name", v, LIMITS.name_of_pco_representative),
};

export function validateAll(values) {
  const errors = {};
  for (const key of Object.keys(validators)) {
    const msg = validators[key](values[key] ?? "");
    if (msg) errors[key] = msg;
  }
  return errors;
}

// Turns the form values into the JSON the backend expects (keys = database columns).
export function buildPayload(values) {
  const a = parseAddress(values.address);
  const g = values.geotag.match(GEO_RE);
  return {
    name_of_operator: values.name_of_operator.trim(),
    client_type: values.client_type,
    address_province: a.address_province,
    address_municipality_city: a.address_municipality_city,
    address_brgy: a.address_brgy,
    address_street: a.address_street,
    date_established: values.date_established,
    email_add: values.email_add.trim().toLowerCase(),
    contact: values.contact.trim(),
    geotag: `${g[1]}, ${g[2]}`,
    ceo_owner_pres: values.ceo_owner_pres.trim(),
    name_of_pco_representative: values.name_of_pco_representative.trim(),
  };
}

export const pad = (n) => String(n).padStart(2, "0");
export const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};
// Operator ID shown on the form, for example SLF-2026-003
export const formatOperatorCode = (id, year) => `SLF-${year}-${String(id).padStart(3, "0")}`;
