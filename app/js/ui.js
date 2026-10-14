document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("a[href]").forEach((link) => {
    link.addEventListener("click", (event) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        link.target ||
        link.hasAttribute("download")
      )
        return;

      const destination = new URL(link.href, window.location.href);
      if (
        destination.origin !== window.location.origin ||
        destination.pathname === window.location.pathname &&
          destination.search === window.location.search
      )
        return;

      event.preventDefault();
      document.body.classList.add("page-exit");
      window.setTimeout(() => {
        window.location.href = destination.href;
      }, 200);
    });
  });
});

window.addEventListener("pageshow", () => {
  document.body.classList.remove("page-exit");
});

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
