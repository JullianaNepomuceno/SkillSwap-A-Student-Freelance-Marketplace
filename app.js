/* Shared SkillSwap interactions. All handlers are guarded so each static page
   can use the same script without console errors. */
document.addEventListener("DOMContentLoaded", () => {
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
    }, 3500);
  };

  // Header notification feedback keeps the prototype feeling responsive.
  document.querySelectorAll(".icon-btn[aria-label='Notifications']").forEach((button) => {
    button.addEventListener("click", () => showMessage("You’re all caught up — no new notifications."));
  });

  // Browse page: search, category, budget, status, sorting, saving, and paging.
  const cards = Array.from(document.querySelectorAll(".card-grid .commission"));
  const filters = document.getElementById("filters");
  const searchForm = document.querySelector("form[role='search']");
  const queryInput = document.getElementById("q");
  const sortSelect = document.getElementById("sort");
  const resultTitle = document.querySelector("#results-title small");
  const resultSummary = document.querySelector(".pagination > span");
  const pageLinks = Array.from(document.querySelectorAll(".pager a"));
  let currentPage = 1;
  const pageSize = 6;

  const getCardData = (card) => ({
    category: card.dataset.category || "",
    text: card.textContent.toLowerCase(),
    budget: Number((card.querySelector(".price")?.textContent || "0").replace(/[^\d]/g, "")),
    due: card.querySelector(".due")?.textContent || ""
  });

  const applyBrowseFilters = () => {
    if (!cards.length) return;
    const query = (queryInput?.value || "").trim().toLowerCase();
    const checkedCategories = filters
      ? Array.from(filters.querySelectorAll("input[name='skill']:checked")).map((input) => input.value)
      : [];
    const minBudget = Number(document.getElementById("budget-min")?.value || 0);
    const maxBudget = Number(document.getElementById("budget-max")?.value || 2000);
    const status = document.getElementById("status")?.value || "Open";
    const filtered = cards.filter((card) => {
      const data = getCardData(card);
      return (!query || data.text.includes(query))
        && (!checkedCategories.length || checkedCategories.includes(data.category))
        && data.budget >= minBudget && data.budget <= maxBudget
        && status === "Open";
    });

    const sort = sortSelect?.value || "Newest first";
    const sorted = [...filtered].sort((a, b) => {
      const aData = getCardData(a);
      const bData = getCardData(b);
      if (sort === "Budget: high to low") return bData.budget - aData.budget;
      if (sort === "Budget: low to high") return aData.budget - bData.budget;
      if (sort === "Deadline: soonest") return aData.due.localeCompare(bData.due);
      return cards.indexOf(a) - cards.indexOf(b);
    });

    const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
    currentPage = Math.min(currentPage, totalPages);
    const visibleCards = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize);
    cards.forEach((card) => {
      card.hidden = !visibleCards.includes(card);
    });
    if (resultTitle) resultTitle.textContent = `(${filtered.length} result${filtered.length === 1 ? "" : "s"})`;
    if (resultSummary) {
      const start = filtered.length ? (currentPage - 1) * pageSize + 1 : 0;
      const end = Math.min(currentPage * pageSize, filtered.length);
      resultSummary.textContent = `Showing ${start}–${end} of ${filtered.length} commissions`;
    }
    pageLinks.forEach((link) => {
      const label = link.textContent.trim();
      link.classList.toggle("is-disabled", (label === "Previous" && currentPage === 1)
        || (label === "Next" && currentPage === totalPages));
      if (label === "1" || label === "2") {
        link.setAttribute("aria-current", Number(label) === currentPage ? "page" : "false");
      }
    });
  };

  if (filters) {
    filters.addEventListener("input", () => {
      currentPage = 1;
      applyBrowseFilters();
    });
    filters.addEventListener("reset", () => window.setTimeout(() => {
      currentPage = 1;
      applyBrowseFilters();
    }));
  }
  if (searchForm) {
    searchForm.addEventListener("submit", (event) => {
      event.preventDefault();
      currentPage = 1;
      applyBrowseFilters();
      showMessage("Browse results updated.");
    });
  }
  if (sortSelect) sortSelect.addEventListener("change", applyBrowseFilters);
  pageLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const label = link.textContent.trim();
      if (link.classList.contains("is-disabled")) return;
      if (label === "Previous") currentPage -= 1;
      else if (label === "Next") currentPage += 1;
      else currentPage = Number(label);
      applyBrowseFilters();
    });
  });
  document.querySelectorAll(".commission__save, .gig__save").forEach((button) => {
    button.addEventListener("click", () => {
      const saved = button.classList.toggle("is-saved");
      button.setAttribute("aria-pressed", String(saved));
      button.setAttribute("aria-label", saved ? "Remove saved commission" : "Save commission");
      showMessage(saved ? "Commission saved to your shortlist." : "Commission removed from your shortlist.");
    });
  });
  applyBrowseFilters();

  // Post page: validate the brief and keep the preview synchronized as users type.
  const postForm = document.getElementById("post-form");
  if (postForm) {
    const title = document.getElementById("title");
    const category = document.getElementById("category");
    const budget = document.getElementById("budget");
    const deadline = document.getElementById("deadline");
    const details = document.getElementById("details");
    const submitButton = postForm.querySelector("button[type='submit']");
    const preview = postForm.parentElement?.querySelector(".preview .commission");
    const error = document.getElementById("budget-error");
    const today = new Date().toISOString().split("T")[0];
    if (deadline) deadline.min = today;

    const updatePreview = () => {
      const previewTitle = preview?.querySelector("h3");
      const previewCategory = preview?.querySelector(".commission__cat");
      const previewDescription = preview?.querySelector(".commission__desc");
      const previewBudget = preview?.querySelector(".due--pending");
      const previewDeadline = preview?.querySelector(".commission__meta .due:last-child");
      if (previewTitle) previewTitle.textContent = title?.value.trim() || "Your commission title";
      if (previewCategory) previewCategory.lastChild.textContent = category?.value || "Skill area";
      if (previewDescription) previewDescription.textContent = details?.value.trim() || "Your commission description will appear here.";
      if (previewBudget) previewBudget.textContent = Number(budget?.value) > 0 ? `₱${Number(budget.value).toLocaleString()}` : "Budget pending";
      if (previewDeadline && deadline?.value) {
        const date = new Date(`${deadline.value}T00:00:00`);
        previewDeadline.lastChild.textContent = ` Due ${date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
      }
    };
    const validatePost = () => {
      const validBudget = Number(budget?.value) > 0;
      const validDeadline = Boolean(deadline?.value) && deadline.value >= today;
      const validText = Boolean(title?.value.trim()) && Boolean(details?.value.trim());
      budget?.classList.toggle("input--invalid", !validBudget);
      deadline?.classList.toggle("input--invalid", !validDeadline);
      if (error) error.hidden = validBudget;
      if (submitButton) submitButton.disabled = !(validBudget && validDeadline && validText);
      updatePreview();
      return validBudget && validDeadline && validText;
    };
    [title, category, budget, deadline, details].forEach((field) => field?.addEventListener("input", validatePost));
    document.querySelectorAll(".chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        if (category) category.value = chip.textContent.trim();
        document.querySelectorAll(".chip").forEach((item) => item.setAttribute("aria-pressed", String(item === chip)));
        validatePost();
      });
    });
    postForm.addEventListener("submit", (event) => {
      event.preventDefault();
      if (validatePost()) showMessage("Your commission is ready to publish.", "success");
      else showMessage("Please complete the highlighted fields.", "error");
    });
    postForm.addEventListener("reset", () => window.setTimeout(validatePost));
    validatePost();
  }

  // Commission details: client-side applicant decisions and apply validation.
  document.querySelectorAll(".actions button").forEach((button) => {
    button.addEventListener("click", () => {
      const row = button.closest("tr");
      if (!row) return;
      const name = row.querySelector("strong")?.textContent || "Applicant";
      const accepted = button.textContent.trim() === "Accept";
      const actionCell = button.closest("td");
      if (actionCell) actionCell.innerHTML = `<span class="badge ${accepted ? "badge--open" : "badge--muted"}">${accepted ? "Accepted" : "Rejected"}</span>`;
      showMessage(`${name} was ${accepted ? "accepted" : "rejected"}.`, accepted ? "success" : "error");
    });
  });
  const applyForm = document.getElementById("apply-form");
  if (applyForm) {
    applyForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const rate = Number((document.getElementById("rate")?.value || "").replace(/[^\d.]/g, ""));
      const valid = Boolean(document.getElementById("full-name")?.value.trim())
        && Boolean(document.getElementById("proposal")?.value.trim())
        && rate > 0 && rate <= 500;
      if (valid) showMessage("Application submitted — the client can now review your proposal.", "success");
      else showMessage("Add your name, proposal, and a valid rate up to ₱500.", "error");
    });
  }

  // Dashboard: filter rows and provide a simple status transition for prototypes.
  const dashboardStatus = document.getElementById("mine-status");
  const dashboardRows = Array.from(document.querySelectorAll(".mine__head + .table-wrap tbody tr"));
  if (dashboardStatus) {
    const filterRows = () => {
      const selected = dashboardStatus.value;
      dashboardRows.forEach((row) => {
        const status = row.querySelector(".badge")?.textContent.trim() || "";
        row.hidden = selected !== "All statuses" && status !== selected;
      });
    };
    dashboardStatus.addEventListener("change", filterRows);
    filterRows();
  }
  document.querySelectorAll(".mine__head + .table-wrap .btn--outline").forEach((button) => {
    if (button.textContent.includes("Mark Completed")) {
      button.addEventListener("click", () => {
        const row = button.closest("tr");
        const badge = row?.querySelector(".badge");
        if (badge) {
          badge.textContent = "Completed";
          badge.className = "badge badge--done";
        }
        button.textContent = "View details";
        showMessage("Commission marked as completed.", "success");
      });
    }
  });
});
