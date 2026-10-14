function showMessage(message, tone = "primary", duration = 3500) {
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
  }, duration);
}
