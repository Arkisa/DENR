// Label + input wrapper with the red required asterisk and inline error message.
export default function Field({ id, label, required, error, full, children }) {
  return (
    <div className={`field${full ? " full" : ""}${error ? " has-error" : ""}`}>
      <label htmlFor={id}>
        {label}
        {required && <span className="req"> *</span>}
      </label>
      {children}
      {error && (
        <p className="field-error" id={`${id}-error`} role="alert">{error}</p>
      )}
    </div>
  );
}
