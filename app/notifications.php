<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Notifications · SkillSwap NU Laguna</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/variable.css">
  <link rel="stylesheet" href="css/resets.css">
  <link rel="stylesheet" href="css/components.css">
</head>
<body>
  <svg class="sprite" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <symbol id="i-swap" viewBox="0 0 24 24"><path d="m17 3 4 4-4 4"/><path d="M3 7h18"/><path d="m7 21-4-4 4-4"/><path d="M21 17H3"/></symbol>
    <symbol id="i-bell" viewBox="0 0 24 24"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></symbol>
    <symbol id="i-chevron" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></symbol>
    <symbol id="i-check" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></symbol>
    <symbol id="i-send" viewBox="0 0 24 24"><path d="m22 2-7 20-4-9-9-4z"/><path d="M22 2 11 13"/></symbol>
    <symbol id="i-user" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></symbol>
    <symbol id="i-log-out" viewBox="0 0 24 24"><path d="M10 17l5-5-5-5"/><path d="M15 12H3"/><path d="M21 3v18"/></symbol>
  </svg>

  <header class="site-header">
    <div class="site-header__inner">
      <a class="brand" href="homepage.php" aria-label="SkillSwap NU Laguna home">
        <span class="brand__mark">
          <svg class="ic ic-lg" aria-hidden="true"><use href="#i-swap"/></svg>
        </span>
        <span>
          <span class="brand__name">SkillSwap</span>
          <span class="brand__school">NU LAGUNA</span>
        </span>
      </a>
      <nav class="main-nav" aria-label="Main">
        <a href="homepage.php">Find a Commission</a>
        <a href="post_commission.php">Find Student Help</a>
        <a href="dashboard.php">My Dashboard</a>
      </nav>
      <div class="user-bar">
        <a class="icon-btn" href="notifications.php" aria-label="Notifications" aria-current="page">
          <svg class="ic" aria-hidden="true"><use href="#i-bell"/></svg>
        </a>
        <div class="user-menu">
          <button class="user-chip" type="button" aria-haspopup="menu" aria-expanded="false" aria-controls="user-menu">
            <span class="avatar">JS</span>
            <span class="user-chip__name">Hi, Nationalian</span>
            <svg class="ic ic-sm user-chip__chevron" aria-hidden="true"><use href="#i-chevron"/></svg>
          </button>
          <div class="user-menu__dropdown" id="user-menu" role="menu" hidden>
            <a href="profile.php" role="menuitem"><svg class="ic ic-sm" aria-hidden="true"><use href="#i-user"/></svg>Profile</a>
            <a href="login.php" role="menuitem"><svg class="ic ic-sm" aria-hidden="true"><use href="#i-log-out"/></svg>Log out</a>
          </div>
        </div>
      </div>
    </div>
  </header>

  <main>
    <div class="page notifications-page">
      <div class="notifications-head">
        <div>
          <h1>Notifications</h1>
          <p>Updates about your commissions, applications, and activity.</p>
        </div>
        <button class="btn btn--ghost btn--sm" type="button">Mark all as read</button>
      </div>

      <section class="notifications-list" id="notifications-list" aria-label="Recent notifications">
      </section>
    </div>
  </main>

  <footer class="site-footer">
    <span>© 2026 NU Laguna SkillSwap · Student-exclusive marketplace</span>
  </footer>
  <script src="js/ui.js"></script>
  <script src="js/app.js?v=20261018-notification-icons1"></script>
</body>
</html>
