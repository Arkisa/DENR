import { useEffect, useRef, useState } from "react";
import { createOperatorProfile, getNextOperatorId } from "../api.js";
import Field from "../components/Field.jsx";
import { AlertIcon, CheckIcon, CloseIcon } from "../components/Icons.jsx";
import {
  LIMITS, buildPayload, formatOperatorCode, todayISO, validateAll, validators,
} from "../utils/validation.js";

// Edit this list if the group adds more client types (stored in client_type, max 50 chars)
const CLIENT_TYPES = [
  { value: "LGU", label: "Local Government Unit (LGU)" },
  { value: "Private", label: "Private" },
  { value: "Others", label: "Others" },
];

const EMPTY = {
  name_of_operator: "",
  client_type: "LGU",
  address: "",
  date_established: "",
  email_add: "",
  contact: "",
  geotag: "",
  ceo_owner_pres: "",
  name_of_pco_representative: "",
};

// Order of fields on the screen (used to focus the first error)
const ORDER = ["name_of_operator", "client_type", "address", "date_established", "email_add", "contact", "geotag", "ceo_owner_pres", "name_of_pco_representative"];

export default function SlfProfileRegistration() {
  const today = todayISO();
  const year = today.slice(0, 4);

  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [banner, setBanner] = useState(null); // { type: "success" | "error", message }
  const [nextId, setNextId] = useState(null);
  const formRef = useRef(null);

  useEffect(() => { getNextOperatorId().then(setNextId); }, []);

  const operatorCode = nextId ? formatOperatorCode(nextId, year) : "Assigned on save";

  function handleChange(e) {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: value }));
    // Clear an old error as soon as the user fixes the field
    if (errors[name]) setErrors((er) => ({ ...er, [name]: validators[name](value) }));
  }

  function handleBlur(e) {
    const { name, value } = e.target;
    if (value === "" && !errors[name]) return; // do not nag on untouched empty fields
    setErrors((er) => ({ ...er, [name]: validators[name](value) }));
  }

  function handleClear() {
    setValues(EMPTY);
    setErrors({});
    setBanner(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setBanner(null);

    const found = validateAll(values);
    setErrors(found);
    const firstBad = ORDER.find((k) => found[k]);
    if (firstBad) {
      document.getElementById(firstBad)?.focus();
      return;
    }

    setSubmitting(true);
    try {
      const res = await createOperatorProfile(buildPayload(values));
      const code = formatOperatorCode(res.operator_id, year);
      setBanner({ type: "success", message: `SLF profile ${code} was registered successfully.` });
      setValues(EMPTY);
      setErrors({});
      setNextId(await getNextOperatorId());
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      if (err.code === "EMAIL_EXISTS") {
        setErrors({ email_add: err.message });
        document.getElementById("email_add")?.focus();
      } else {
        setBanner({ type: "error", message: err.message });
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } finally {
      setSubmitting(false);
    }
  }

  // Props shared by the text inputs
  const bind = (name) => ({
    id: name,
    name,
    value: values[name],
    onChange: handleChange,
    onBlur: handleBlur,
    "aria-invalid": errors[name] ? "true" : undefined,
    "aria-describedby": errors[name] ? `${name}-error` : undefined,
  });

  return (
    <>
      <div className="page-head">
        <h1>SLF Profile Registration</h1>
        <p>Register new Sanitary Landfill Facility profiles, operator details, and dynamic cell structures</p>
      </div>

      {banner && (
        <div className={`banner banner-${banner.type}`} role={banner.type === "error" ? "alert" : "status"}>
          {banner.type === "success" ? <CheckIcon /> : <AlertIcon />}
          <p>{banner.message}</p>
          <button type="button" className="banner-close" onClick={() => setBanner(null)} aria-label="Dismiss message">
            <CloseIcon />
          </button>
        </div>
      )}

      <form className="card" onSubmit={handleSubmit} noValidate ref={formRef}>
        <div className="meta-panel">
          <div>
            <label htmlFor="operator_id">Operator ID</label>
            <input id="operator_id" className="readonly mono" value={operatorCode} readOnly tabIndex={-1} />
          </div>
          <div>
            <label htmlFor="date_registration">Date of Registration</label>
            <input id="date_registration" className="readonly mono" value={today} readOnly tabIndex={-1} />
          </div>
        </div>

        <div className="grid">
          <Field id="name_of_operator" label="Name of Operator" required error={errors.name_of_operator}>
            <input {...bind("name_of_operator")} type="text" maxLength={LIMITS.name_of_operator}
              placeholder="e.g. Metro Cebu SLF Development Corp." autoComplete="organization" />
          </Field>

          <Field id="client_type" label="Client Type" required error={errors.client_type}>
            <select {...bind("client_type")}>
              {CLIENT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </Field>

          <Field id="address" label="Address" required full error={errors.address}>
            <input {...bind("address")} type="text" placeholder="Street, Barangay, City/Municipality, Province"
              autoComplete="street-address" />
          </Field>

          <Field id="date_established" label="Date Established" required error={errors.date_established}>
            <input {...bind("date_established")} type="date" max={today} />
          </Field>

          <Field id="email_add" label="Email Address" required error={errors.email_add}>
            <input {...bind("email_add")} type="email" maxLength={LIMITS.email_add}
              placeholder="operator@slf-domain.ph" autoComplete="email" />
          </Field>

          <Field id="contact" label="Contact Number" required error={errors.contact}>
            <input {...bind("contact")} className="mono" type="tel" maxLength={LIMITS.contact}
              placeholder="09171234567 or (032) 234-5678" autoComplete="tel" />
          </Field>

          <Field id="geotag" label="Geotag / Lat Long Coordinates" required error={errors.geotag}>
            <input {...bind("geotag")} className="mono" type="text" maxLength={LIMITS.geotag}
              placeholder="e.g. 10.3157, 123.8854" inputMode="decimal" />
          </Field>

          <Field id="ceo_owner_pres" label="CEO / Owner / President" required error={errors.ceo_owner_pres}>
            <input {...bind("ceo_owner_pres")} type="text" maxLength={LIMITS.ceo_owner_pres}
              placeholder="Full Name of Chief Officer" />
          </Field>

          <Field id="name_of_pco_representative" label="PCO / Authorized Representative" required
            error={errors.name_of_pco_representative}>
            <input {...bind("name_of_pco_representative")} type="text" maxLength={LIMITS.name_of_pco_representative}
              placeholder="Full Name of Pollution Control Officer" />
          </Field>
        </div>

        <div className="actions">
          <p className="hint"><span className="req">*</span> Required field</p>
          <div className="buttons">
            <button type="button" className="btn btn-secondary" onClick={handleClear} disabled={submitting}>Clear Form</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? <><span className="spinner" /> Saving</> : "Register SLF Profile"}
            </button>
          </div>
        </div>
      </form>
    </>
  );
}
