<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Sign up · SkillSwap NU Laguna</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <!-- Bootstrap provides the same responsive base used across the marketplace. -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <link rel="stylesheet" href="css/variable.css">
  <link rel="stylesheet" href="css/resets.css">
  <link rel="stylesheet" href="css/components.css">
  <link rel="stylesheet" href="css/auth.css">
</head>
<body class="auth-page">
  <!-- Shared logo icon definition used by the marketplace pages. -->
  <svg class="sprite" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <symbol id="i-swap" viewBox="0 0 24 24">
      <path d="m17 3 4 4-4 4"/>
      <path d="M3 7h18"/>
      <path d="m7 21-4-4 4-4"/>
      <path d="M21 17H3"/>
    </symbol>
  </svg>

  <!-- Shared SkillSwap brand header. -->
  <header class="site-header">
    <div class="site-header__inner">
      <a class="brand" href="index.php" aria-label="SkillSwap NU Laguna home">
        <span class="brand__mark">
          <svg class="ic ic-lg" aria-hidden="true"><use href="#i-swap"/></svg>
        </span>
        <span>
          <span class="brand__name">SkillSwap</span>
          <span class="brand__school">NU LAGUNA</span>
        </span>
      </a>
      <div class="user-bar">
        <span class="user-chip__name">Already a member?</span>
        <a class="btn btn--ghost btn--sm" href="login.php">Log in</a>
      </div>
    </div>
  </header>

  <main class="auth-main">
    <section class="auth-shell" aria-labelledby="signup-title">
      <aside class="auth-intro">
        <p class="hero__tag"><span class="hero__tag-mark">N</span>SkillSwap · For Nationalians By Nationalians</p>
        <h1>Turn your skills into opportunities.</h1>
        <p>Join a student-first marketplace where your skills can help a classmate, organization, or local client.</p>
        <div class="auth-benefits">
          <div class="auth-benefit"><span aria-hidden="true">✓</span><span>Create a student portfolio</span></div>
          <div class="auth-benefit"><span aria-hidden="true">✓</span><span>Browse or post commissions</span></div>
          <div class="auth-benefit"><span aria-hidden="true">✓</span><span>Keep projects in one place</span></div>
        </div>
      </aside>

      <div class="auth-form-panel">
        <h2 id="signup-title">Create your account</h2>
        <p class="auth-subtitle">Set up your free SkillSwap account in less than a minute.</p>
        <form class="auth-form" id="signup-form" action="signup.php" method="post" novalidate>
          <div class="auth-field">
            <label for="full-name">Full name</label>
            <input id="full-name" name="full_name" type="text" autocomplete="name" placeholder="Juan M. Dela Cruz" minlength="2" required>
          </div>
          <div class="auth-field">
            <label for="email">School email</label>
            <input id="email" name="email" type="email" autocomplete="email" placeholder="jmdelacruz@students.nu-laguna.edu.ph" required>
          </div>
          <div class="auth-field">
            <label for="role">I want to</label>
            <select id="role" name="role" required>
              <option value="" selected disabled>Select your primary goal</option>
              <option value="earn">Earn by offering my skills</option>
              <option value="find-help">Find help for my projects</option>
              <option value="both">Do both</option>
            </select>
          </div>
          <div class="auth-field">
            <label for="password">Password</label>
            <div class="auth-input-wrap">
              <input id="password" name="password" type="password" autocomplete="new-password" minlength="8" required>
              <button class="password-toggle" type="button" data-target="password" aria-label="Show password">Show</button>
            </div>
            <div class="password-strength" aria-live="polite">
              <div class="password-strength__track"><div class="password-strength__bar"></div></div>
              <span class="password-strength__label">Use 8 or more characters with a number and symbol.</span>
            </div>
          </div>
          <div class="auth-field">
            <label for="confirm-password">Confirm password</label>
            <div class="auth-input-wrap">
              <input id="confirm-password" name="confirm_password" type="password" autocomplete="new-password" minlength="8" required>
              <button class="password-toggle" type="button" data-target="confirm-password" aria-label="Show password">Show</button>
            </div>
            <span class="field__hint field__hint--error" hidden>Passwords must match.</span>
          </div>
          <label class="auth-note"><input type="checkbox" name="terms" required> I agree to the SkillSwap terms and student community guidelines.</label>
          <button class="btn btn--primary btn--lg btn--block" type="submit">Create account</button>
          <p class="auth-note">Already have an account? <a class="auth-link" href="login.php">Log in</a></p>
        </form>
      </div>
    </section>
  </main>

  <footer class="site-footer auth-footer"><span>© 2026 NU Laguna SkillSwap · Student-exclusive marketplace</span></footer>
  <script src="js/ui.js"></script>
  <script src="js/auth.js"></script>
</body>
</html>
