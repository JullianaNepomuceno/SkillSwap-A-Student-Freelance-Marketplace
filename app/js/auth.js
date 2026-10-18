/* Authentication interactions and client-side feedback for the prototype pages. */
document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".auth-form");
  if (!form) return;

  // Toggle password visibility without changing the form value.
  document.querySelectorAll(".password-toggle").forEach((button) => {
    button.addEventListener("click", () => {
      const input = document.getElementById(button.dataset.target);
      if (!input) return;
      const isPassword = input.type === "password";
      input.type = isPassword ? "text" : "password";
      button.textContent = isPassword ? "Hide" : "Show";
      button.setAttribute(
        "aria-label",
        `${isPassword ? "Hide" : "Show"} password`,
      );
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
      /[^A-Za-z0-9]/.test(value),
    ].filter(Boolean).length;
    const levels = [
      ["", "0%"],
      ["Weak", "25%"],
      ["Fair", "45%"],
      ["Good", "70%"],
      ["Strong", "85%"],
      ["Excellent", "100%"],
    ];
    const [label, width] = levels[score];
    strengthBar.style.width = width;
    strengthBar.style.backgroundColor =
      score < 3 ? "var(--red)" : score < 5 ? "var(--gold)" : "var(--green)";
    strengthLabel.textContent = label
      ? `Password strength: ${label}`
      : "Use 8 or more characters with a number and symbol.";
  };

  const validateField = (field) => {
    if (!field) return true;
    const wrapper = field.closest(".auth-field");
    const valid =
      field.checkValidity() &&
      (!field.id.includes("confirm") || field.value === password?.value);
    wrapper?.classList.toggle("is-invalid", !valid);
    wrapper?.classList.toggle("is-valid", valid && Boolean(field.value));
    const hint = wrapper?.querySelector(".field__hint--error");
    if (hint) hint.hidden = valid || !field.value;
    return valid;
  };

  [password, confirmPassword].forEach((field) =>
    field?.addEventListener("input", () => {
      updateStrength();
      validateField(field);
      if (field === password && confirmPassword?.value)
        validateField(confirmPassword);
    }),
  );

  form.querySelectorAll("input, select").forEach((field) => {
    field.addEventListener("blur", () => validateField(field));
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const valid = Array.from(form.querySelectorAll("input, select")).every(
      validateField,
    );
    if (!valid) {
      showMessage("Please review the highlighted fields.", "error", 4000);
      return;
    }

    const isSignUp = form.id === "signup-form";
    const submitButton = form.querySelector('button[type="submit"]');
    const originalLabel = submitButton?.textContent;
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = isSignUp ? "Creating account..." : "Logging in...";
    }

    try {
      const response = await fetch(
        isSignUp ? "../api/auth/signup.php" : "../api/auth/login.php",
        {
          method: "POST",
          body: new FormData(form),
          credentials: "same-origin",
        },
      );
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Authentication failed.");
      }

      showMessage(
        isSignUp
          ? "Account created. Redirecting..."
          : "Welcome back. Redirecting...",
        "success",
        2000,
      );
      window.setTimeout(() => {
        window.location.href = "homepage.php";
      }, 250);
    } catch (error) {
      showMessage(
        error instanceof Error
          ? error.message
          : "Unable to complete authentication. Please try again.",
        "error",
        5000,
      );
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = originalLabel;
      }
    }
  });

  updateStrength();
});
