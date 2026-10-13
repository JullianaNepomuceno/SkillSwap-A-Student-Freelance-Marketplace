/* Authentication interactions and client-side feedback for the prototype pages. */
document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".auth-form");
  if (!form) return;

  const showMessage = (message, tone = "primary") => {
    let liveRegion = document.getElementById("app-live-region");
    if (!liveRegion) {
      liveRegion = document.createElement("div");
      liveRegion.id = "app-live-region";
      liveRegion.className = "app-live-region";
      liveRegion.setAttribute("role", "status");
      liveRegion.setAttribute("aria-live", "polite");
      document.body.appendChild(liveRegion);
    }
    liveRegion.className = `app-live-region app-live-region--${tone}`;
    liveRegion.textContent = message;
    window.clearTimeout(liveRegion.dismissTimer);
    liveRegion.dismissTimer = window.setTimeout(() => {
      liveRegion.textContent = "";
    }, 4000);
  };

  // Toggle password visibility without changing the form value.
  document.querySelectorAll(".password-toggle").forEach((button) => {
    button.addEventListener("click", () => {
      const input = document.getElementById(button.dataset.target);
      if (!input) return;
      const isPassword = input.type === "password";
      input.type = isPassword ? "text" : "password";
      button.textContent = isPassword ? "Hide" : "Show";
      button.setAttribute("aria-label", `${isPassword ? "Hide" : "Show"} password`);
    });
  });

  const password = document.getElementById("password");
  const confirmPassword = document.getElementById("confirm-password");
  const strengthBar = document.querySelector(".password-strength__bar");
  const strengthLabel = document.querySelector(".password-strength__label");

  const updateStrength = () => {
    if (!password || !strengthBar || !strengthLabel) return;
    const value = password.value;
    const score = [
      value.length >= 8,
      /[A-Z]/.test(value),
      /[a-z]/.test(value),
      /\d/.test(value),
      /[^A-Za-z0-9]/.test(value)
    ].filter(Boolean).length;
    const levels = [
      ["", "0%"],
      ["Weak", "25%"],
      ["Fair", "45%"],
      ["Good", "70%"],
      ["Strong", "85%"],
      ["Excellent", "100%"]
    ];
    const [label, width] = levels[score];
    strengthBar.style.width = width;
    strengthBar.style.backgroundColor = score < 3 ? "var(--red)" : score < 5 ? "var(--gold)" : "var(--green)";
    strengthLabel.textContent = label ? `Password strength: ${label}` : "Use 8 or more characters with a number and symbol.";
  };

  const validateField = (field) => {
    if (!field) return true;
    const wrapper = field.closest(".auth-field");
    const valid = field.checkValidity()
      && (!field.id.includes("confirm") || field.value === password?.value);
    wrapper?.classList.toggle("is-invalid", !valid);
    wrapper?.classList.toggle("is-valid", valid && Boolean(field.value));
    const hint = wrapper?.querySelector(".field__hint--error");
    if (hint) hint.hidden = valid || !field.value;
    return valid;
  };

  [password, confirmPassword].forEach((field) => field?.addEventListener("input", () => {
    updateStrength();
    validateField(field);
    if (field === password && confirmPassword?.value) validateField(confirmPassword);
  }));

  form.querySelectorAll("input, select").forEach((field) => {
    field.addEventListener("blur", () => validateField(field));
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const valid = Array.from(form.querySelectorAll("input, select")).every(validateField);
    if (!valid) {
      showMessage("Please review the highlighted fields.", "error");
      return;
    }
    const isSignUp = form.id === "signup-form";
    showMessage(isSignUp ? "Account details saved. Welcome to SkillSwap!" : "Welcome back to SkillSwap!", "success");
    form.reset();
    form.querySelectorAll(".auth-field").forEach((field) => field.classList.remove("is-valid"));
    updateStrength();
  });

  updateStrength();
});
