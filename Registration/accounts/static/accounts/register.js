(() => {
  const $ = (id) => document.getElementById(id);
  const form = $("register-form");
  const submitBtn = $("submit");
  const fields = { email: $("id_email"), password: $("id_password"), confirm: $("id_confirm") };
  const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/;
  const labels = ["Too weak", "Weak", "Fair", "Good", "Strong"];
  const pwRules = [
    { id: "len", test: (p) => p.length >= 8, msg: "Use at least 8 characters." },
    { id: "up", test: (p) => /[A-Z]/.test(p), msg: "Add at least one uppercase letter." },
    { id: "low", test: (p) => /[a-z]/.test(p), msg: "Add at least one lowercase letter." },
    { id: "num", test: (p) => /\d/.test(p), msg: "Add at least one number." },
  ];
  let submitting = false;

  const rules = {
    email(v) {
      v = v.trim();
      if (!v) return "Enter your email address.";
      if (v.length > 254 || !EMAIL_RE.test(v)) return "Enter a valid email, like name@denr.gov.ph.";
      return "";
    },
    password(v) {
      if (!v) return "Enter a password.";
      if (!v.trim()) return "Password can't be only spaces.";
      const bad = pwRules.find((r) => !r.test(v));
      return bad ? bad.msg : "";
    },
    confirm(v) {
      if (!v) return "Re-enter your password.";
      return v !== fields.password.value ? "Passwords don't match." : "";
    },
  };

  function check(name) {
    const msg = rules[name](fields[name].value);
    $(name + "-err").textContent = msg;
    fields[name].setAttribute("aria-invalid", msg ? "true" : "false");
    return !msg;
  }

  function updateStrength() {
    const p = fields.password.value;
    const passed = pwRules.map((r) => r.test(p));
    const score = passed.filter(Boolean).length;
    $("strength").hidden = !p;
    $("strength-label").textContent = labels[score];
    document.querySelectorAll("#strength .bars i").forEach((bar, i) => {
      bar.className = i < score ? "on s" + score : "";
    });
    pwRules.forEach((r, i) => {
      document.querySelector(`#rules [data-rule="${r.id}"]`).classList.toggle("ok", passed[i]);
    });
  }

  Object.keys(fields).forEach((name) => {
    const el = fields[name];
    if ($(name + "-err").textContent.trim()) el.setAttribute("aria-invalid", "true"); // server errors
    el.addEventListener("blur", () => { el.dataset.touched = "1"; check(name); });
    el.addEventListener("input", () => {
      if (el.dataset.touched) check(name);
      if (name === "password") {
        updateStrength();
        if (fields.confirm.dataset.touched) check("confirm");
      }
    });
  });
  updateStrength();

  // One eye button shows/hides both password fields
  $("toggle-pw").addEventListener("click", (e) => {
    const btn = e.currentTarget;
    const show = fields.password.type === "password";
    fields.password.type = fields.confirm.type = show ? "text" : "password";
    btn.setAttribute("aria-label", show ? "Hide password" : "Show password");
    btn.querySelector(".eye-show").toggleAttribute("hidden", show);
    btn.querySelector(".eye-hide").toggleAttribute("hidden", !show);
  });

  // Caps Lock warning
  fields.password.addEventListener("keyup", (e) => {
    $("caps").hidden = !(e.getModifierState && e.getModifierState("CapsLock"));
  });
  fields.password.addEventListener("blur", () => { $("caps").hidden = true; });

  form.addEventListener("submit", (e) => {
    if (submitting) { e.preventDefault(); return; }
    const ok = Object.keys(fields).map((n) => { fields[n].dataset.touched = "1"; return check(n); });
    if (ok.includes(false)) {
      e.preventDefault();
      fields[Object.keys(fields).find((n) => fields[n].getAttribute("aria-invalid") === "true")].focus();
      return;
    }
    submitting = true;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner"></span> Creating account';
  });

  window.addEventListener("pageshow", () => {
    submitting = false;
    submitBtn.disabled = false;
    submitBtn.textContent = "Create account";
  });
})();