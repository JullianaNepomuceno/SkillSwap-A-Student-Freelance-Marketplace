/* Shared SkillSwap interactions. All handlers are guarded so each static page
   can use the same script without console errors. */
document.addEventListener("DOMContentLoaded", () => {
  // Replace the static header placeholder with the authenticated session user.
  const loadCurrentUser = async () => {
    const userChips = Array.from(document.querySelectorAll(".user-chip"));
    if (!userChips.length) return;

    try {
      const response = await fetch("../api/auth/me.php", {
        credentials: "same-origin",
      });
      const result = await response.json();
      if (!response.ok || !result.success || !result.user) {
        if (response.status === 401) {
          window.location.href = "login.php";
        }
        return;
      }

      const fullName = String(result.user.full_name || "").trim();
      const nameParts = fullName.split(/\s+/).filter(Boolean);
      const initials = nameParts
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join("");

      userChips.forEach((chip) => {
        const avatar = chip.querySelector(".avatar");
        const name = chip.querySelector(".user-chip__name");
        if (avatar) {
          avatar.textContent = initials || "?";
          avatar.setAttribute("aria-label", fullName || "Account");
        }
        if (name) name.textContent = fullName ? `Hi, ${fullName}` : "Hi, Nationalian";
      });
    } catch (error) {
      console.error("Unable to load the current user.", error);
    }
  };

  loadCurrentUser();

  const updateNotificationBadge = async () => {
    const notificationLinks = document.querySelectorAll(".icon-btn[href='notifications.php']");
    if (!notificationLinks.length) return;
    try {
      const response = await fetch("../api/notifications/count.php", {
        credentials: "same-origin",
        cache: "no-store",
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || "Unable to load notification count.");
      const unreadCount = Number(result.unread_count) || 0;
      notificationLinks.forEach((link) => {
        let badge = link.querySelector(".notification-badge");
        if (unreadCount > 0) {
          if (!badge) {
            badge = document.createElement("span");
            badge.className = "notification-badge";
            link.append(badge);
          }
          badge.textContent = unreadCount > 99 ? "99+" : String(unreadCount);
          badge.setAttribute("aria-label", `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}`);
          link.setAttribute("aria-label", `Notifications, ${unreadCount} unread`);
        } else {
          badge?.remove();
          link.setAttribute("aria-label", "Notifications");
        }
      });
    } catch (error) {
      console.error("Unable to load notification count.", error);
    }
  };

  updateNotificationBadge();
  window.setInterval(updateNotificationBadge, 30000);

  const loadDashboardData = async () => {
    const bars = document.getElementById("application-bars");
    if (!bars) return;
    const commissionRows = document.getElementById("my-commissions-body");
    if (commissionRows) commissionRows.replaceChildren();
    const commissionSummary = document.getElementById("my-commissions-summary");
    if (commissionSummary) commissionSummary.textContent = "Loading your commissions...";

    try {
      const response = await fetch("../api/dashboard/stats.php", {
        credentials: "same-origin",
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to load dashboard activity.");
      }

      const metrics = result.metrics || {};
      const setText = (id, value) => {
        const element = document.getElementById(id);
        if (element) element.textContent = String(value ?? 0);
      };
      setText("metric-posted", metrics.posted);
      setText("metric-in-progress", metrics.in_progress);
      setText("metric-completed", metrics.completed);
      setText("metric-applications", metrics.total_applications);
      setText("hero-commissions-posted", Number(metrics.posted) + Number(metrics.in_progress) + Number(metrics.completed));
      setText("hero-applications", metrics.total_applications);

      const activity = Array.isArray(result.activity) ? result.activity : [];
      const counts = activity.map((day) => Number(day.count) || 0);
      const maximum = Math.max(...counts, 1);
      const total = counts.reduce((sum, count) => sum + count, 0);
      setText("chart-total", total);

      const range = document.getElementById("chart-range");
      if (range && result.activity_start && result.activity_end) {
        range.textContent = `${result.activity_start}–${result.activity_end}`;
      }

      const barColumns = Array.from(bars.querySelectorAll(".bars__col"));
      barColumns.forEach((column, index) => {
        const count = counts[index] || 0;
        const bar = column.querySelector(".bars__bar");
        column.firstChild.textContent = String(count);
        column.classList.toggle("bars__col--peak", count > 0 && count === maximum);
        if (bar) bar.style.height = `${count ? Math.max((count / maximum) * 78, 8) : 0}%`;
      });

      const labels = document.querySelectorAll("#application-bar-labels span");
      labels.forEach((label, index) => {
        label.textContent = activity[index]?.label || "—";
      });

      const ariaLabel = activity
        .map((day) => `${day.label} ${day.count}`)
        .join(", ");
      bars.setAttribute("aria-label", `Applications per day: ${ariaLabel}`);

      const busiest = activity.reduce(
        (current, day) => (Number(day.count) > Number(current?.count || 0) ? day : current),
        null,
      );
      const chartFoot = document.getElementById("chart-foot");
      if (chartFoot) {
        chartFoot.textContent =
          busiest && Number(busiest.count) > 0
            ? `${busiest.label} was your busiest day with ${busiest.count} application${busiest.count === 1 ? "" : "s"}.`
            : "No applications were received during this period.";
      }

      const rows = document.getElementById("my-commissions-body");
      if (rows) {
        rows.replaceChildren();
        const iconByCategory = {
          "Coding & IT": "code",
          "Arts & Design": "palette",
          "Writing & Research": "pen",
          "Tutoring & Review": "book",
          "Media & Content": "camera",
        };
        const commissions = Array.isArray(result.commissions) ? result.commissions : [];
        commissions.forEach((commission) => {
          const row = document.createElement("tr");
          const cell = document.createElement("td");
          const titleCell = document.createElement("div");
          titleCell.className = "title-cell";
          const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
          icon.className = "ic ic-sm";
          const use = document.createElement("use");
          use.setAttribute("href", `#i-${iconByCategory[commission.category] || "briefcase"}`);
          icon.append(use);
          const titleInfo = document.createElement("div");
          const title = document.createElement("strong");
          title.textContent = commission.title;
          const details = document.createElement("span");
          details.textContent = `${commission.category} · ${commission.application_count} applicants`;
          titleInfo.append(title, details);
          titleCell.append(icon, titleInfo);
          cell.append(titleCell);
          row.append(cell);

          const statusCell = document.createElement("td");
          const status = document.createElement("span");
          status.className = `badge badge--${commission.status === "Open" ? "open" : commission.status === "Completed" ? "done" : "progress"}`;
          status.textContent = commission.status;
          statusCell.append(status);
          row.append(statusCell);

          const budgetCell = document.createElement("td");
          budgetCell.className = "rate";
          budgetCell.textContent = `₱${Number(commission.budget).toLocaleString()}`;
          row.append(budgetCell);

          const deadlineCell = document.createElement("td");
          deadlineCell.textContent = new Date(`${commission.deadline}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" });
          row.append(deadlineCell);

          const actionCell = document.createElement("td");
          const action = document.createElement("a");
          action.className = "btn btn--outline";
          action.href = `commission.php?id=${encodeURIComponent(commission.id)}`;
          action.textContent = commission.status === "In Progress" ? "Mark Completed" : commission.status === "Completed" ? "View details" : "View applicants";
          actionCell.append(action);
          row.append(actionCell);
          rows.append(row);
        });

        const summary = document.getElementById("my-commissions-summary");
        if (summary) summary.textContent = commissions.length ? `Showing ${commissions.length} of ${commissions.length} posted commissions` : "You have not posted any commissions.";
        const upNext = commissions.find((commission) => commission.status === "In Progress") || commissions.find((commission) => commission.status === "Open");
        const upNextName = document.getElementById("upnext-name");
        const upNextDescription = document.getElementById("upnext-description");
        const upNextLink = document.getElementById("upnext-link");
        if (upNext) {
          upNextName.textContent = upNext.title;
          upNextDescription.textContent = `${new Date(`${upNext.deadline}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" })} · ${upNext.application_count} student${Number(upNext.application_count) === 1 ? "" : "s"} waiting to hear from you.`;
          upNextLink.href = `commission.php?id=${encodeURIComponent(upNext.id)}`;
          upNextLink.lastChild.textContent = " Review applicants";
        }
      }
    } catch (error) {
      const chartFoot = document.getElementById("chart-foot");
      if (chartFoot) chartFoot.textContent = "Unable to load application activity.";
      console.error("Unable to load dashboard data.", error);
    }
  };

  loadDashboardData();

  const loadOpenCommissionCount = async () => {
    const countElement = document.getElementById("open-commission-count");
    if (!countElement) return;
    try {
      const response = await fetch("../api/commissions/list.php?limit=50", {
        credentials: "same-origin",
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || "Unable to load commission count.");
      const commissions = Array.isArray(result.commissions) ? result.commissions : [];
      countElement.textContent = String(Number.isFinite(Number(result.total)) ? result.total : commissions.length);
      const skillAreaCount = document.getElementById("open-skill-area-count");
      if (skillAreaCount) {
        const categories = new Set(
          commissions
            .map((commission) => String(commission.category || "").trim())
            .filter(Boolean),
        );
        skillAreaCount.textContent = String(categories.size);
      }
    } catch (error) {
      console.error("Unable to load open commission count.", error);
    }
  };

  loadOpenCommissionCount();

  const loadNotifications = async () => {
    const list = document.getElementById("notifications-list");
    if (!list) return;
    try {
      const response = await fetch("../api/notifications/list.php", { credentials: "same-origin" });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || "Unable to load notifications.");
      list.replaceChildren();
      const iconByType = {
        application_received: ["send", "gold", "New application received"],
        application_accepted: ["check", "green", "Application accepted"],
        application_rejected: ["bell", "red", "Application update"],
        commission_completed: ["check", "green", "Commission completed"],
      };
      (result.notifications || []).forEach((notification) => {
        const [iconName, tone, title] = iconByType[notification.type] || ["bell", "", "Notification"];
        const article = document.createElement("article");
        article.className = `notification${Number(notification.is_read) ? " notification--read" : ""}`;
        const commissionId = Number(notification.commission_id);
        if (Number.isInteger(commissionId) && commissionId > 0) {
          article.classList.add("notification--link");
          article.dataset.notificationId = notification.id;
          article.dataset.commissionId = commissionId;
          article.tabIndex = 0;
          article.setAttribute("role", "link");
          article.setAttribute("aria-label", `${title}: ${notification.message}`);
        }
        const iconWrap = document.createElement("span");
        iconWrap.className = `notification__icon${tone ? ` notification__icon--${tone}` : ""}`;
        const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        icon.setAttribute("class", "ic");
        icon.setAttribute("viewBox", "0 0 24 24");
        icon.setAttribute("aria-hidden", "true");
        const iconReference = `#i-${iconName}`;
        const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
        use.setAttribute("href", iconReference);
        use.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", iconReference);
        icon.append(use);
        iconWrap.append(icon);
        const body = document.createElement("div");
        body.className = "notification__body";
        const heading = document.createElement("strong");
        heading.textContent = title;
        const message = document.createElement("p");
        message.textContent = notification.message;
        const time = document.createElement("span");
        time.className = "notification__time";
        time.textContent = new Date(notification.created_at.replace(" ", "T")).toLocaleString();
        body.append(heading, message, time);
        article.append(iconWrap, body);
        if (!Number(notification.is_read)) {
          const unread = document.createElement("span");
          unread.className = "notification__status";
          unread.setAttribute("aria-label", "Unread");
          article.append(unread);
        }
        list.append(article);
      });
      const openNotification = async (article) => {
        const notificationId = article.dataset.notificationId;
        const commissionId = article.dataset.commissionId;
        if (!commissionId) return;
        try {
          const response = await fetch(`../api/notifications/mark_read.php?id=${encodeURIComponent(notificationId)}`, {
            method: "POST",
            credentials: "same-origin",
          });
          const result = await response.json();
          if (!response.ok || !result.success) {
            throw new Error(result.message || "Unable to mark notification as read.");
          }
        } catch (error) {
          console.error("Unable to mark notification as read.", error);
        } finally {
          window.location.href = `commission.php?id=${encodeURIComponent(commissionId)}`;
        }
      };
      list.addEventListener("click", (event) => {
        const article = event.target.closest(".notification--link");
        if (article) openNotification(article);
      });
      list.addEventListener("keydown", (event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        const article = event.target.closest(".notification--link");
        if (!article) return;
        event.preventDefault();
        openNotification(article);
      });
    } catch (error) {
      list.textContent = "Unable to load notifications.";
      console.error("Unable to load notifications.", error);
    }
  };

  loadNotifications();

  // User menu: keep profile actions keyboard- and pointer-accessible.
  document.querySelectorAll(".user-menu").forEach((menu) => {
    const toggle = menu.querySelector(".user-chip");
    const dropdown = menu.querySelector(".user-menu__dropdown");
    if (!toggle || !dropdown) return;
    dropdown.hidden = false;

    const closeMenu = () => {
      menu.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    };

    toggle.addEventListener("click", () => {
      const isOpen = menu.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(isOpen));
    });

    document.addEventListener("click", (event) => {
      if (!menu.contains(event.target)) closeMenu();
    });

    menu.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeMenu();
        toggle.focus();
      }
    });
  });

  const markAllReadButton = document.querySelector(".notifications-page .btn");
  if (markAllReadButton) {
    markAllReadButton.addEventListener("click", () => {
      document
        .querySelectorAll(".notification")
        .forEach((notification) => notification.classList.add("notification--read"));
      document
        .querySelectorAll(".notification__status[aria-label='Unread']")
        .forEach((status) => {
          status.removeAttribute("aria-label");
          status.setAttribute("aria-hidden", "true");
        });
      markAllReadButton.disabled = true;
      markAllReadButton.textContent = "All caught up";
    });
  }

  // Browse page: search, category, budget, status, sorting, saving, and paging.
  let cards = Array.from(document.querySelectorAll(".card-grid .commission"));
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
    budget: Number(
      (card.querySelector(".price")?.textContent || "0").replace(/[^\d]/g, ""),
    ),
    due: card.querySelector(".due")?.textContent || "",
  });

  const applyBrowseFilters = () => {
    if (!cards.length) return;
    const query = (queryInput?.value || "").trim().toLowerCase();
    const checkedCategories = filters
      ? Array.from(filters.querySelectorAll("input[name='skill']:checked")).map(
          (input) => input.value,
        )
      : [];
    const minBudget = Number(document.getElementById("budget-min")?.value || 0);
    const maxBudget = Number(
      document.getElementById("budget-max")?.value || 2000,
    );
    const status = document.getElementById("status")?.value || "Open";
    const filtered = cards.filter((card) => {
      const data = getCardData(card);
      return (
        (!query || data.text.includes(query)) &&
        (!checkedCategories.length ||
          checkedCategories.includes(data.category)) &&
        data.budget >= minBudget &&
        data.budget <= maxBudget &&
        status === "Open"
      );
    });

    const sort = sortSelect?.value || "Newest first";
    const sorted = [...filtered].sort((a, b) => {
      const aData = getCardData(a);
      const bData = getCardData(b);
      if (sort === "Budget: high to low") return bData.budget - aData.budget;
      if (sort === "Budget: low to high") return aData.budget - bData.budget;
      if (sort === "Deadline: soonest")
        return aData.due.localeCompare(bData.due);
      return cards.indexOf(a) - cards.indexOf(b);
    });

    const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
    currentPage = Math.min(currentPage, totalPages);
    const visibleCards = sorted.slice(
      (currentPage - 1) * pageSize,
      currentPage * pageSize,
    );
    cards.forEach((card) => {
      card.hidden = !visibleCards.includes(card);
    });
    if (resultTitle)
      resultTitle.textContent = `(${filtered.length} result${filtered.length === 1 ? "" : "s"})`;
    if (resultSummary) {
      const start = filtered.length ? (currentPage - 1) * pageSize + 1 : 0;
      const end = Math.min(currentPage * pageSize, filtered.length);
      resultSummary.textContent = `Showing ${start}–${end} of ${filtered.length} commissions`;
    }
    pageLinks.forEach((link) => {
      const label = link.textContent.trim();
      link.classList.toggle(
        "is-disabled",
        (label === "Previous" && currentPage === 1) ||
          (label === "Next" && currentPage === totalPages),
      );
      if (label === "1" || label === "2") {
        link.setAttribute(
          "aria-current",
          Number(label) === currentPage ? "page" : "false",
        );
      }
    });
  };

  if (filters) {
    filters.addEventListener("input", () => {
      currentPage = 1;
      const loadOpenCommissions = async () => {
        const grid = document.getElementById("open-commissions-grid");
        if (!grid) return;

        // Never display the server-rendered sample cards while the database is loading.
        grid.replaceChildren();
        cards = [];
        try {
          const response = await fetch(`../api/commissions/list.php?_=${Date.now()}`, {
            credentials: "same-origin",
            cache: "no-store",
          });
          const result = await response.json();
          if (!response.ok || !result.success) {
            throw new Error(result.message || "Unable to load commissions.");
          }

          const iconByCategory = {
            "Coding & IT": "code",
            "Arts & Design": "palette",
            "Writing & Research": "pen",
            "Tutoring & Review": "book",
            "Media & Content": "camera",
          };
          const commissions = Array.isArray(result.commissions) ? result.commissions : [];
          grid.replaceChildren();
          commissions.forEach((commission) => {
            const card = document.createElement("article");
            card.className = "commission";
            card.dataset.category = commission.category;
            card.dataset.id = commission.id;

            const top = document.createElement("div");
            top.className = "commission__top";
            const category = document.createElement("span");
            category.className = "commission__cat";
            const categoryIcon = document.createElement("span");
            categoryIcon.className = "commission__cat-ic";
            const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            icon.setAttribute("class", "ic");
            icon.setAttribute("aria-hidden", "true");
            const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
            const iconReference = `#i-${iconByCategory[commission.category] || "briefcase"}`;
            use.setAttribute("href", iconReference);
            use.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", iconReference);
            icon.append(use);
            categoryIcon.append(icon);
            category.append(categoryIcon, document.createTextNode(commission.category));
            const save = document.createElement("button");
            save.className = "commission__save";
            save.type = "button";
            save.setAttribute("aria-label", "Save commission");
            const saveIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            saveIcon.setAttribute("class", "ic");
            saveIcon.setAttribute("viewBox", "0 0 24 24");
            const saveUse = document.createElement("use");
            saveUse.setAttribute("href", "#i-bookmark");
            saveIcon.append(saveUse);
            save.append(saveIcon);
            top.append(category, save);

            const title = document.createElement("h3");
            title.textContent = commission.title;
            const owner = document.createElement("p");
            owner.className = "commission__by";
            owner.textContent = commission.owner_name;
            const description = document.createElement("p");
            description.className = "commission__desc";
            description.textContent = commission.description;
            const meta = document.createElement("div");
            meta.className = "commission__meta";
            const price = document.createElement("span");
            price.className = "price";
            price.textContent = `₱${Number(commission.budget).toLocaleString()}`;
            const due = document.createElement("span");
            due.className = "due";
            due.textContent = `Due ${new Date(`${commission.deadline}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
            meta.append(price, due);
            const footer = document.createElement("div");
            footer.className = "commission__foot";
            const applicants = document.createElement("span");
            applicants.className = "pill";
            applicants.textContent = `${commission.applicant_count} applicant${Number(commission.applicant_count) === 1 ? "" : "s"}`;
            const link = document.createElement("a");
            link.className = "btn btn--primary btn--sm";
            link.href = `commission.php?id=${encodeURIComponent(commission.id)}`;
            link.textContent = "View & Apply";
            footer.append(applicants, link);
            card.append(top, title, owner, description, meta, footer);
            grid.append(card);
          });

          cards = Array.from(grid.querySelectorAll(".commission"));
          const countElement = document.getElementById("open-commission-count");
          if (countElement) {
            countElement.textContent = String(Number.isFinite(Number(result.total)) ? result.total : commissions.length);
          }
          if (!commissions.length) {
            if (resultTitle) resultTitle.textContent = "(0 results)";
            if (resultSummary) resultSummary.textContent = "No open commissions have been posted yet.";
          }
          applyBrowseFilters();
        } catch (error) {
          console.error("Unable to load open commissions.", error);
          cards = [];
          if (resultTitle) resultTitle.textContent = "(unable to load)";
          if (resultSummary) resultSummary.textContent = "Unable to load commissions from the database.";
        }
      };

      applyBrowseFilters();
      loadOpenCommissions();
    });
    filters.addEventListener("reset", () =>
      window.setTimeout(() => {
        currentPage = 1;
        applyBrowseFilters();
      }),
    );
    filters.dispatchEvent(new Event("input"));
    window.addEventListener("pageshow", () => {
      currentPage = 1;
      filters.dispatchEvent(new Event("input"));
    });
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
  document
    .querySelectorAll(".commission__save")
    .forEach((button) => {
      button.addEventListener("click", () => {
        const saved = button.classList.toggle("is-saved");
        button.setAttribute("aria-pressed", String(saved));
        button.setAttribute(
          "aria-label",
          saved ? "Remove saved commission" : "Save commission",
        );
        showMessage(
          saved
            ? "Commission saved to your shortlist."
            : "Commission removed from your shortlist.",
        );
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
    const previewAuthor = document.getElementById("pv-author");
    const submitButton = postForm.querySelector("button[type='submit']");
    const preview = postForm.parentElement?.querySelector(
      ".preview .commission",
    );
    const budgetField = budget?.closest(".field");
    const budgetIcon = budget?.closest(".field-wrap")?.querySelector(".ic");
    const error = document.getElementById("budget-error");
    const categoryIcons = {
      "Coding & IT": "#i-code",
      "Arts & Design": "#i-palette",
      "Writing & Research": "#i-pen",
      "Tutoring & Review": "#i-book",
      "Media & Content": "#i-camera",
    };
    const today = new Date().toISOString().split("T")[0];
    if (deadline) deadline.min = today;
    fetch("../api/auth/me.php", { credentials: "same-origin", cache: "no-store" })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok || !result.success || !result.user) {
          throw new Error(result.message || "Unable to load your account details.");
        }
        const fullName = String(result.user.full_name || "").trim();
        if (previewAuthor) previewAuthor.textContent = fullName || "Your name";
      })
      .catch((error) => {
        if (previewAuthor) previewAuthor.textContent = "Your name";
        console.error("Unable to load the preview author.", error);
      });

    const updatePreview = () => {
      const previewTitle = preview?.querySelector("h3");
      const previewCategory = preview?.querySelector(".commission__cat");
      const previewDescription = preview?.querySelector(".commission__desc");
      const previewBudget = document.getElementById("pv-budget");
      const previewDeadline = document.getElementById("pv-due");
      if (previewTitle)
        previewTitle.textContent =
          title?.value.trim() || "Your commission title";
      if (previewCategory)
        previewCategory.lastChild.textContent = category?.value || "Skill area";
      const previewCategoryIcon = previewCategory?.querySelector("use");
      if (previewCategoryIcon) {
        const iconReference =
          categoryIcons[category?.value] || "#i-briefcase";
        previewCategoryIcon.setAttribute(
          "href",
          iconReference,
        );
        previewCategoryIcon.setAttributeNS(
          "http://www.w3.org/1999/xlink",
          "xlink:href",
          iconReference,
        );
      }
      if (previewDescription)
        previewDescription.textContent =
          details?.value.trim() ||
          "Your commission description will appear here.";
      const budgetValue = Number((budget?.value || "").replace(/,/g, "").trim());
      const budgetOk = Number.isFinite(budgetValue) && budgetValue > 0;
      if (previewBudget)
        previewBudget.textContent = budgetOk
          ? `₱${budgetValue.toLocaleString()}`
          : "Budget pending";
      previewBudget?.classList.toggle("due--pending", !budgetOk);
      document.getElementById("pv-note")?.toggleAttribute("hidden", budgetOk);
      const ready =
        budgetOk &&
        Boolean(title?.value.trim()) &&
        Boolean(details?.value.trim()) &&
        Boolean(deadline?.value);
      const stateBadge = document.getElementById("pv-state");
      const draftBadge = document.getElementById("pv-badge");
      if (stateBadge)
        stateBadge.textContent = ready ? "Ready to publish" : "Not published";
      if (draftBadge) draftBadge.textContent = ready ? "Ready" : "Draft";
      const budgetCheck = document.getElementById("ck-budget");
      if (budgetCheck) {
        budgetCheck.classList.toggle("done", budgetOk);
        budgetCheck.classList.toggle("todo", !budgetOk);
        budgetCheck.lastChild.textContent = budgetOk
          ? " Valid ₱ budget added"
          : " Valid ₱ budget still needed";
        budgetCheck
          .querySelector("use")
          ?.setAttribute("href", budgetOk ? "#i-check" : "#i-clock");
      }
      if (previewDeadline && deadline?.value) {
        const date = new Date(`${deadline.value}T00:00:00`);
        previewDeadline.textContent = `Due ${date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
      }
    };
    const validatePost = () => {
      const budgetValue = Number((budget?.value || "").replace(/,/g, "").trim());
      const validBudget = Number.isFinite(budgetValue) && budgetValue > 0;
      const validDeadline = Boolean(deadline?.value) && deadline.value >= today;
      const validTitle = Boolean(title?.value.trim());
      const validCategory = Boolean(category?.value.trim());
      const validDetails = Boolean(details?.value.trim());
      const validText = validTitle && validDetails;
      const setChecklistState = (id, isComplete, incompleteText, completeText) => {
        const item = document.getElementById(id);
        if (!item) return;
        item.classList.toggle("done", isComplete);
        item.classList.toggle("todo", !isComplete);
        const text = item.querySelector("span") || item.lastChild;
        if (text) text.textContent = ` ${isComplete ? completeText : incompleteText}`;
        item.querySelector("use")?.setAttribute("href", isComplete ? "#i-check" : "#i-clock");
      };
      setChecklistState(
        "ck-brief",
        validTitle && validCategory,
        " Clear title and skill area category still needed",
        " Clear title and skill area category added",
      );
      setChecklistState(
        "ck-details",
        validDeadline && validDetails,
        " Deadline and deliverables still needed",
        " Deadline and deliverables added",
      );
      if (budgetField) budgetField.classList.toggle("field--error", !validBudget);
      if (budget) budget.classList.toggle("input--invalid", !validBudget);
      budget?.setAttribute("aria-invalid", String(!validBudget));
      if (budgetIcon) budgetIcon.hidden = validBudget;
      deadline?.classList.toggle("input--invalid", !validDeadline);
      if (error) error.hidden = validBudget;
      if (submitButton)
        submitButton.disabled = !(validBudget && validDeadline && validTitle && validCategory && validDetails);
      updatePreview();
      return validBudget && validDeadline && validTitle && validCategory && validDetails;
    };
    [title, category, budget, deadline, details].forEach((field) => {
      field?.addEventListener("input", validatePost);
      field?.addEventListener("change", validatePost);
    });
    const syncChips = () =>
      document
        .querySelectorAll(".chip")
        .forEach((item) =>
          item.setAttribute(
            "aria-pressed",
            String(item.textContent.trim() === category?.value),
          ),
        );
    category?.addEventListener("change", () => {
      syncChips();
      validatePost();
    });
    syncChips();
    document.querySelectorAll(".chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        if (category) category.value = chip.textContent.trim();
        document
          .querySelectorAll(".chip")
          .forEach((item) =>
            item.setAttribute("aria-pressed", String(item === chip)),
          );
        validatePost();
      });
    });
    postForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!validatePost()) {
        showMessage("Please complete the highlighted fields.", "error");
        return;
      }

      submitButton.disabled = true;
      const data = new FormData(postForm);
      data.set("description", data.get("details") || "");
      try {
        const response = await fetch("../api/commissions/create.php", {
          method: "POST",
          body: data,
          credentials: "same-origin",
        });
        const result = await response.json();
        if (!response.ok || !result.success) {
          throw new Error(result.message || "Unable to publish commission.");
        }
        showMessage("Commission published successfully.", "success");
        window.setTimeout(() => {
          window.location.href = "dashboard.php";
        }, 300);
      } catch (error) {
        submitButton.disabled = false;
        showMessage(
          error instanceof Error ? error.message : "Unable to publish commission.",
          "error",
        );
      }
    });
    postForm.addEventListener("reset", () => window.setTimeout(validatePost));
    validatePost();
  }

  // Commission details: load the posted commission and its applicants.
  const applicantBody = document.getElementById("applicants-body");
  const clientView = document.querySelector(".client-view");
  const applyPanel = document.getElementById("apply-panel");
  const commissionId = new URLSearchParams(window.location.search).get("id");
  if (commissionId && document.querySelector(".detail")) {
    const loadCommission = async () => {
      try {
        const response = await fetch(`../api/commissions/get.php?id=${encodeURIComponent(commissionId)}`, {
          credentials: "same-origin",
        });
        const result = await response.json();
        if (!response.ok || !result.success) throw new Error(result.message || "Unable to load commission.");

        const commission = result.commission;
        const formatDate = (value) => new Date(`${value}T00:00:00`).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
        const setText = (id, value) => {
          const element = document.getElementById(id);
          if (element) element.textContent = String(value);
        };
        const budget = Number(commission.budget);
        setText("commission-category", commission.category);
        setText("commission-status", commission.status);
        const statusBadge = document.getElementById("commission-status");
        if (statusBadge) {
          statusBadge.className = `badge badge--${commission.status === "Open" ? "open" : commission.status === "Completed" ? "done" : "progress"}`;
        }
        setText("commission-title", commission.title);
        setText("commission-owner", commission.owner_name);
        setText("commission-created", formatDate(commission.created_at.slice(0, 10)));
        setText("commission-budget", `₱${budget.toLocaleString()}`);
        setText("commission-deadline", formatDate(commission.deadline));
        setText("commission-description", commission.description);
        const applicationCount = Number(commission.application_count) || 0;
        setText("commission-application-count", `${applicationCount} applicant${applicationCount === 1 ? "" : "s"}`);
        document.title = `${commission.title} · SkillSwap NU Laguna`;
        const budgetHint = document.getElementById("commission-budget-hint");
        if (budgetHint) budgetHint.textContent = `Stay within the ₱${budget.toLocaleString()} project budget.`;
        const rate = document.getElementById("rate");
        if (rate) rate.max = String(budget);

        if (!result.is_owner) {
          if (clientView) clientView.hidden = true;
          const existingApplication = result.my_application;
          if (existingApplication && applyPanel) {
            const alreadyApplied = document.getElementById("already-applied");
            const status = String(existingApplication.status || "Pending").toLowerCase();
            if (alreadyApplied) {
              alreadyApplied.textContent = `You have already applied to this commission. Your application is ${status}.`;
              alreadyApplied.hidden = false;
            }
            if (applyForm) applyForm.hidden = true;
          }
          if (commission.status !== "Open" && !result.accepted_contact && applyPanel) {
            applyPanel.hidden = true;
          }
          const acceptedContact = result.accepted_contact;
          if (acceptedContact && applyPanel) {
            const contact = document.getElementById("accepted-contact");
            if (contact) {
              contact.textContent = `Your application was accepted. Contact ${acceptedContact.owner_name} at ${acceptedContact.owner_email}.`;
              contact.hidden = false;
            }
            if (applyForm) applyForm.hidden = true;
          }
          return;
        }

        if (applyPanel) applyPanel.hidden = true;
        const editButton = document.getElementById("edit-commission-button");
        const editForm = document.getElementById("edit-commission-form");
        if (editButton && editForm && commission.status === "Open") {
          editButton.hidden = false;
          document.getElementById("edit-title").value = commission.title;
          document.getElementById("edit-category").value = commission.category;
          document.getElementById("edit-budget").value = commission.budget;
          document.getElementById("edit-deadline").value = commission.deadline;
          document.getElementById("edit-description").value = commission.description;
          editButton.addEventListener("click", () => {
            editForm.hidden = false;
            editButton.hidden = true;
            document.getElementById("edit-title")?.focus();
          });
          document.getElementById("cancel-edit-commission")?.addEventListener("click", () => {
            editForm.hidden = true;
            editButton.hidden = false;
          });
          editForm.addEventListener("submit", async (event) => {
            event.preventDefault();
            if (!editForm.reportValidity()) return;
            const saveButton = editForm.querySelector("button[type='submit']");
            const message = document.getElementById("edit-commission-message");
            saveButton.disabled = true;
            try {
              const response = await fetch(`../api/commissions/update.php?id=${encodeURIComponent(commissionId)}`, {
                method: "POST",
                body: new FormData(editForm),
                credentials: "same-origin",
              });
              const updateResult = await response.json();
              if (!response.ok || !updateResult.success) {
                throw new Error(updateResult.message || "Unable to update commission.");
              }
              showMessage("Commission updated successfully.", "success");
              window.setTimeout(() => window.location.reload(), 300);
            } catch (error) {
              saveButton.disabled = false;
              if (message) message.textContent = error instanceof Error ? error.message : "Unable to update commission.";
            }
          });
        }
        const applications = Array.isArray(result.applications) ? result.applications : [];
        const count = document.getElementById("applicant-count");
        const countLabel = `${applications.length} applicant${applications.length === 1 ? "" : "s"}`;
        if (count) count.textContent = countLabel;
        const detailCount = document.getElementById("commission-application-count");
        if (detailCount) detailCount.textContent = countLabel;
        applicantBody.replaceChildren();

        if (!applications.length) {
          const row = document.createElement("tr");
          const cell = document.createElement("td");
          cell.colSpan = 4;
          cell.textContent = "No students have applied to this commission yet.";
          row.append(cell);
          applicantBody.append(row);
          return;
        }

        applications.forEach((application) => {
          const row = document.createElement("tr");
          row.dataset.applicationId = application.id;
          const nameCell = document.createElement("td");
          const who = document.createElement("div");
          who.className = "who";
          const avatar = document.createElement("span");
          avatar.className = "avatar";
          avatar.textContent = String(application.applicant_name || "?").split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
          const info = document.createElement("div");
          const name = document.createElement("strong");
          name.textContent = application.applicant_name || "Applicant";
          const proposal = document.createElement("span");
          proposal.textContent = application.proposal || "No proposal provided.";
          info.append(name, proposal);
          who.append(avatar, info);
          nameCell.append(who);
          row.append(nameCell);

          const proposalCell = document.createElement("td");
          proposalCell.textContent = application.status === "Accepted"
            ? (application.applicant_email || "Email unavailable")
            : "Available after acceptance";
          row.append(proposalCell);

          const rateCell = document.createElement("td");
          rateCell.className = "rate";
          rateCell.textContent = `₱${Number(application.proposed_rate).toLocaleString()}`;
          row.append(rateCell);

          const actionCell = document.createElement("td");
          if (application.status === "Pending" && commission.status === "Open") {
            const actions = document.createElement("div");
            actions.className = "actions";
            ["Accepted", "Rejected"].forEach((status) => {
              const button = document.createElement("button");
              button.className = status === "Accepted" ? "btn btn--green" : "btn btn--red-soft";
              button.type = "button";
              button.dataset.status = status;
              button.textContent = status === "Accepted" ? "Accept" : "Reject";
              actions.append(button);
            });
            actionCell.append(actions);
          } else {
            const status = document.createElement("span");
            status.className = `badge ${application.status === "Accepted" ? "badge--open" : "badge--muted"}`;
            status.textContent = application.status;
            actionCell.append(status);
          }
          row.append(actionCell);
          applicantBody.append(row);
        });
      } catch (error) {
        if (clientView) clientView.hidden = true;
        if (applyPanel) applyPanel.hidden = true;
        showMessage(error instanceof Error ? error.message : "Unable to load commission.", "error");
        console.error("Unable to load commission.", error);
      }
    };
    loadCommission();
  }

  applicantBody?.addEventListener("click", async (event) => {
    const button = event.target.closest("button[data-status]");
    const row = button?.closest("tr");
    if (!button || !row) return;
    button.disabled = true;
    try {
      const response = await fetch(`../api/applications/update_status.php?id=${encodeURIComponent(row.dataset.applicationId)}`, {
        method: "POST",
        body: new URLSearchParams({ status: button.dataset.status }),
        credentials: "same-origin",
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || "Unable to update application.");
      window.location.reload();
    } catch (error) {
      button.disabled = false;
      showMessage(error instanceof Error ? error.message : "Unable to update application.", "error");
    }
  });
  const applyForm = document.getElementById("apply-form");
  if (applyForm) {
    const fullNameInput = document.getElementById("full-name");
    const emailInput = document.getElementById("email");
    const rateInput = document.getElementById("rate");
    const rateError = document.getElementById("rate-error");
    fetch("../api/auth/me.php", { credentials: "same-origin", cache: "no-store" })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok || !result.success || !result.user) {
          throw new Error(result.message || "Unable to load your account details.");
        }
        if (fullNameInput) fullNameInput.value = result.user.full_name || "";
        if (emailInput) emailInput.value = result.user.email || "";
      })
      .catch((error) => {
        showMessage(error instanceof Error ? error.message : "Unable to load your account details.", "error");
      });

    const validateRate = () => {
      const budget = Number(rateInput?.max || 0);
      const rate = rateInput?.valueAsNumber || 0;
      let message = "";
      if (!rateInput?.value || !Number.isFinite(rate) || rate <= 0) {
        message = "Enter a rate greater than ₱0.";
      } else if (budget && rate > budget) {
        message = `Rate cannot exceed the ₱${budget.toLocaleString()} project budget.`;
      }
      if (rateError) {
        rateError.textContent = message;
        rateError.hidden = !message;
      }
      rateInput?.classList.toggle("input--invalid", Boolean(message));
      return !message;
    };
    rateInput?.addEventListener("input", validateRate);
    applyForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const submitButton = applyForm.querySelector("button[type='submit']");
      const rate = rateInput?.valueAsNumber || 0;
      const valid =
        Boolean(fullNameInput?.value.trim()) &&
        Boolean(emailInput?.value.trim()) &&
        Boolean(document.getElementById("proposal")?.value.trim()) &&
        validateRate();
      if (!valid || !applyForm.checkValidity()) {
        applyForm.reportValidity();
        showMessage("Complete your account details, proposal, and a valid rate.", "error");
        return;
      }
      if (submitButton) submitButton.disabled = true;
      try {
        const response = await fetch(`../api/applications/create.php?commission_id=${encodeURIComponent(commissionId)}`, {
          method: "POST",
          body: new URLSearchParams({
            proposal: document.getElementById("proposal").value.trim(),
            proposed_rate: String(rate),
          }),
          credentials: "same-origin",
        });
        const result = await response.json();
        if (!response.ok || !result.success) throw new Error(result.message || "Unable to submit application.");
        showMessage("Application submitted — the client can now review your proposal.", "success");
        applyForm.reset();
      } catch (error) {
        showMessage(error instanceof Error ? error.message : "Unable to submit application.", "error");
      } finally {
        if (submitButton) submitButton.disabled = false;
      }
    });
  }

  // Dashboard: filter rows and provide a simple status transition for prototypes.
  const dashboardStatus = document.getElementById("mine-status");
  if (dashboardStatus) {
    const filterRows = () => {
      const selected = dashboardStatus.value;
      document.querySelectorAll("#my-commissions-body tr").forEach((row) => {
        const status = row.querySelector(".badge")?.textContent.trim() || "";
        row.hidden = selected !== "All statuses" && status !== selected;
      });
    };
    dashboardStatus.addEventListener("change", filterRows);
    filterRows();
  }
  const commissionTable = document.getElementById("my-commissions-body");
  commissionTable?.addEventListener("click", async (event) => {
    const button = event.target.closest("a");
    if (!button || !button.textContent.includes("Mark Completed")) return;
    event.preventDefault();
    const id = new URL(button.href, window.location.href).searchParams.get("id");
    if (!id) return;
    button.setAttribute("aria-disabled", "true");
    try {
      const response = await fetch(`../api/commissions/update_status.php?id=${encodeURIComponent(id)}`, {
        method: "POST",
        body: new URLSearchParams({ status: "Completed" }),
        credentials: "same-origin",
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || "Unable to update commission.");
      showMessage("Commission marked as completed.", "success");
      window.setTimeout(() => window.location.reload(), 300);
    } catch (error) {
      button.removeAttribute("aria-disabled");
      showMessage(error instanceof Error ? error.message : "Unable to update commission.", "error");
    }
  });
});

// Profile page: resume builder, skill pills, live preview, and autosave.
(() => {
  'use strict';
  if (!document.getElementById('profile-form')) return;

  const STORAGE_KEY = 'skillswap.profile.v1';
  const SVG_NS = 'http://www.w3.org/2000/svg';

  const SKILLS = {
    'Art & Design': { icon: 'palette', items: ['Logo design', 'Illustration', 'Poster layout', 'Photo editing', 'Branding', 'Social media graphics'] },
    'Writing & Research': { icon: 'pen', items: ['Article writing', 'Editing', 'Proofreading', 'Research', 'Copywriting', 'Transcription'] },
    'Coding & IT': { icon: 'code', items: ['HTML & CSS', 'JavaScript', 'PHP', 'MySQL', 'Python', 'Tech troubleshooting'] },
    'Tutoring & Review': { icon: 'book', items: ['Math', 'Science', 'Programming basics', 'Exam review', 'Thesis consultation'] },
    'Media & Content': { icon: 'camera', items: ['Video editing', 'Photography', 'Social media management', 'Content planning'] }
  };
  const OTHER = 'Other';

  const form = document.getElementById('profile-form');
  const paper = document.getElementById('pf-paper');
  const statusEl = document.getElementById('pf-status');
  const toastEl = document.getElementById('pf-toast');
  const lists = {
    education: document.getElementById('list-education'),
    experience: document.getElementById('list-experience')
  };
  const requiredFields = ['fullName', 'email'];

  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function icon(name, className = 'ic ic-sm') {
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('class', className);
    svg.setAttribute('aria-hidden', 'true');
    const use = document.createElementNS(SVG_NS, 'use');
    use.setAttribute('href', '#i-' + name);
    svg.appendChild(use);
    return svg;
  }

  function buildPill(category, name, checked) {
    const label = el('label', 'pf-pill');
    const input = el('input');
    input.type = 'checkbox';
    input.name = 'skill';
    input.value = name;
    input.dataset.category = category;
    input.checked = Boolean(checked);
    label.append(input, el('span', null, name));
    return label;
  }

  function buildGroup(category, iconName, hidden) {
    const group = el('fieldset', 'pf-skillgroup');
    group.dataset.category = category;
    group.hidden = Boolean(hidden);
    const legend = el('legend', 'pf-skillgroup__title');
    legend.append(icon(iconName), category, el('span', 'pf-skillgroup__count', '0'));
    group.append(legend, el('div', 'pf-pills'));
    return group;
  }

  function buildSkills() {
    const wrap = document.getElementById('skill-groups');
    if (wrap.children.length) return;
    Object.entries(SKILLS).forEach(([category, meta]) => {
      const group = buildGroup(category, meta.icon, false);
      const list = group.querySelector('.pf-pills');
      meta.items.forEach((name) => list.append(buildPill(category, name, false)));
      wrap.append(group);
    });
    wrap.append(buildGroup(OTHER, 'tag', true));
  }

  function addCustomSkill(rawName, checked = true) {
    const name = rawName.trim().replace(/\s+/g, ' ');
    if (!name) return false;
    const existing = $$('input[name="skill"]').find((i) => i.value.toLowerCase() === name.toLowerCase());
    if (existing) {
      existing.checked = true;
      return true;
    }
    const group = document.querySelector('.pf-skillgroup[data-category="' + OTHER + '"]');
    group.hidden = false;
    group.querySelector('.pf-pills').append(buildPill(OTHER, name, checked));
    return true;
  }

  function addEntry(kind, data = {}) {
    const tpl = document.getElementById('tpl-' + kind);
    const node = tpl.content.firstElementChild.cloneNode(true);
    $$('[data-f]', node).forEach((field) => {
      field.value = data[field.dataset.f] || '';
    });
    lists[kind].append(node);
    return node;
  }

  function readEntries(kind) {
    return $$('.pf-entry', lists[kind]).map((entry) => {
      const row = {};
      $$('[data-f]', entry).forEach((field) => { row[field.dataset.f] = field.value.trim(); });
      return row;
    });
  }

  function collect() {
    const f = form.elements;
    return {
      contact: {
        fullName: f.fullName.value.trim(),
        headline: f.headline.value.trim(),
        email: f.email.value.trim(),
        phone: f.phone.value.trim(),
        location: f.location.value.trim(),
        portfolio: f.portfolio.value.trim(),
        summary: f.summary.value.trim()
      },
      education: readEntries('education'),
      experience: readEntries('experience'),
      skills: $$('input[name="skill"]:checked').map((i) => ({ name: i.value, category: i.dataset.category })),
      accomplishments: f.accomplishments.value
    };
  }

  function hasAny(row) {
    return Object.values(row).some(Boolean);
  }

  function lines(text) {
    return text.split('\n').map((l) => l.replace(/^\s*[-•*]\s*/, '').trim()).filter(Boolean);
  }

  function section(title) {
    const wrap = el('section', 'pf-paper__section');
    wrap.append(el('h3', 'pf-paper__title', title));
    return wrap;
  }

  function entryItem(title, when, sub, body) {
    const item = el('div', 'pf-paper__item');
    const row = el('div', 'pf-paper__row');
    row.append(el('strong', null, title || 'Untitled'));
    if (when) row.append(el('span', 'pf-paper__when', when));
    item.append(row);
    if (sub) item.append(el('p', 'pf-paper__sub', sub));
    if (body) item.append(el('p', 'pf-paper__text', body));
    return item;
  }

  function renderPreview(state) {
    const c = state.contact;
    paper.replaceChildren();

    paper.append(el('h3', 'pf-paper__name' + (c.fullName ? '' : ' is-placeholder'), c.fullName || 'Your Name'));
    if (c.headline) paper.append(el('p', 'pf-paper__headline', c.headline));
    const contactBits = [c.email, c.phone, c.location, c.portfolio].filter(Boolean);
    if (contactBits.length) {
      const contact = el('div', 'pf-paper__contact');
      contactBits.forEach((bit) => contact.append(el('span', null, bit)));
      paper.append(contact);
    }

    let hasBody = false;

    if (c.summary) {
      const s = section('Summary');
      s.append(el('p', 'pf-paper__text', c.summary));
      paper.append(s);
      hasBody = true;
    }

    const edu = state.education.filter(hasAny);
    if (edu.length) {
      const s = section('Education');
      edu.forEach((e) => s.append(entryItem(e.school, e.years, e.program, e.details)));
      paper.append(s);
      hasBody = true;
    }

    const exp = state.experience.filter(hasAny);
    if (exp.length) {
      const s = section('Experience');
      exp.forEach((e) => {
        const when = [e.start, e.end].filter(Boolean).join(' – ');
        s.append(entryItem(e.role, when, e.org, e.description));
      });
      paper.append(s);
      hasBody = true;
    }

    if (state.skills.length) {
      const s = section('Skills');
      const order = Object.keys(SKILLS).concat(OTHER);
      order.forEach((category) => {
        const names = state.skills.filter((k) => k.category === category).map((k) => k.name);
        if (!names.length) return;
        const block = el('div', 'pf-paper__skillcat');
        const chips = el('ul', 'pf-paper__chips');
        names.forEach((n) => chips.append(el('li', null, n)));
        block.append(el('span', null, category), chips);
        s.append(block);
      });
      paper.append(s);
      hasBody = true;
    }

    const wins = lines(state.accomplishments);
    if (wins.length) {
      const s = section('Accomplishments');
      const list = el('ul', 'pf-paper__list');
      wins.forEach((w) => list.append(el('li', null, w)));
      s.append(list);
      paper.append(s);
      hasBody = true;
    }

    if (!hasBody) {
      paper.append(el('p', 'pf-paper__empty', 'Fill in the sections on the left and your resume will build itself here.'));
    }
  }

  function renderStrength(state) {
    const c = state.contact;
    const checks = [
      { label: 'Name and email added', done: Boolean(c.fullName && c.email) },
      { label: 'Short summary written', done: c.summary.length >= 20 },
      { label: 'Education added', done: state.education.some((e) => e.school && e.program) },
      { label: 'Experience added', done: state.experience.some((e) => e.role && e.org) },
      { label: 'At least 3 skills picked', done: state.skills.length >= 3 },
      { label: 'Accomplishments listed', done: lines(state.accomplishments).length > 0 },
      { label: 'Portfolio link added', done: Boolean(c.portfolio) }
    ];
    const done = checks.filter((k) => k.done).length;
    const pct = Math.round((done / checks.length) * 100);

    document.getElementById('pf-pct').textContent = pct;
    const meter = document.getElementById('pf-meter');
    meter.setAttribute('aria-valuenow', pct);
    meter.classList.toggle('is-complete', pct === 100);
    document.getElementById('pf-meter-fill').style.width = pct + '%';

    const list = document.getElementById('pf-checklist');
    list.replaceChildren();
    checks.forEach((k) => {
      const li = el('li', k.done ? 'is-done' : '');
      li.append(icon(k.done ? 'check' : 'circle'), el('span', null, k.label));
      list.append(li);
    });
  }

  function renderSkillCounts(state) {
    $$('.pf-skillgroup').forEach((group) => {
      const n = state.skills.filter((k) => k.category === group.dataset.category).length;
      const badge = group.querySelector('.pf-skillgroup__count');
      badge.textContent = n;
      badge.classList.toggle('has-selection', n > 0);
    });
    document.getElementById('skill-total').textContent = state.skills.length;
  }

  function refresh() {
    const state = collect();
    renderPreview(state);
    renderStrength(state);
    renderSkillCounts(state);
    document.getElementById('summary-count').textContent = state.contact.summary.length;
    return state;
  }

  function setError(name, message) {
    const input = form.elements[name];
    const hint = document.getElementById(name + '-error');
    input.setAttribute('aria-invalid', 'true');
    hint.textContent = message;
    hint.hidden = false;
  }

  function clearError(name) {
    const input = form.elements[name];
    const hint = document.getElementById(name + '-error');
    if (!input || !hint) return;
    input.removeAttribute('aria-invalid');
    hint.textContent = '';
    hint.hidden = true;
  }

  function looksLikeUrl(value) {
    try {
      const url = new URL(/^https?:\/\//i.test(value) ? value : 'https://' + value);
      return url.hostname.includes('.');
    } catch (e) {
      return false;
    }
  }

  function validate(state) {
    ['fullName', 'email', 'phone', 'portfolio'].forEach(clearError);
    const c = state.contact;
    const errors = [];
    if (!c.fullName) errors.push(['fullName', 'Enter your full name.']);
    if (!c.email) errors.push(['email', 'Enter your email address.']);
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email)) errors.push(['email', 'Enter a valid email, like name@example.com.']);
    if (c.phone && !/^\+?[\d\s()-]{7,}$/.test(c.phone)) errors.push(['phone', 'Use digits only, for example 0917 123 4567.']);
    if (c.portfolio && !looksLikeUrl(c.portfolio)) errors.push(['portfolio', 'Enter a valid link, like behance.net/yourname.']);
    errors.forEach(([name, message]) => setError(name, message));
    if (errors.length) form.elements[errors[0][0]].focus();
    return errors.length === 0;
  }

  let toastTimer;
  function toast(message, type) {
    toastEl.textContent = message;
    toastEl.className = 'pf-toast pf-toast--' + type;
    toastEl.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toastEl.hidden = true; }, 3200);
  }

  function timeLabel() {
    return new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  }

  function persist(state, label) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      statusEl.textContent = label + ' at ' + timeLabel();
      statusEl.classList.add('is-saved');
      return true;
    } catch (e) {
      statusEl.textContent = 'Could not save on this device';
      statusEl.classList.remove('is-saved');
      return false;
    }
  }

  function fillForm(state) {
    const f = form.elements;
    const c = state.contact || {};
    ['fullName', 'headline', 'email', 'phone', 'location', 'portfolio', 'summary'].forEach((k) => { f[k].value = c[k] || ''; });
    f.accomplishments.value = state.accomplishments || '';

    ['education', 'experience'].forEach((kind) => {
      lists[kind].replaceChildren();
      const rows = (state[kind] || []).filter(hasAny);
      if (rows.length) rows.forEach((row) => addEntry(kind, row));
      else addEntry(kind, kind === 'education' ? { school: 'National University – Laguna' } : {});
    });

    $$('input[name="skill"]').forEach((i) => { i.checked = false; });
    (state.skills || []).forEach((k) => {
      const match = $$('input[name="skill"]').find((i) => i.value === k.name);
      if (match) match.checked = true;
      else if (k.category === OTHER) addCustomSkill(k.name);
    });
  }

  function loadSaved() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function resetAll() {
    if (!window.confirm('Clear everything you have entered? This also removes your saved profile on this device.')) return;
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) { statusEl.textContent = 'Not saved yet'; }
    form.reset();
    $$('.pf-skillgroup[data-category="' + OTHER + '"] .pf-pill').forEach((p) => p.remove());
    document.querySelector('.pf-skillgroup[data-category="' + OTHER + '"]').hidden = true;
    fillForm({});
    ['fullName', 'email', 'phone', 'portfolio'].forEach(clearError);
    statusEl.textContent = 'Not saved yet';
    statusEl.classList.remove('is-saved');
    refresh();
    toast('Profile cleared.', 'info');
  }

  let autosaveTimer;
  function scheduleAutosave() {
    clearTimeout(autosaveTimer);
    autosaveTimer = setTimeout(() => persist(collect(), 'Draft saved'), 600);
  }

  function onFieldChange(event) {
    const name = event.target.name;
    if (requiredFields.includes(name) || name === 'phone' || name === 'portfolio') clearError(name);
    refresh();
    scheduleAutosave();
  }

  function init() {
    buildSkills();
    const saved = loadSaved();
    fillForm(saved || {});

    form.addEventListener('input', onFieldChange);
    form.addEventListener('change', onFieldChange);

    form.addEventListener('click', (event) => {
      const add = event.target.closest('[data-add]');
      if (add) {
        const node = addEntry(add.dataset.add);
        node.querySelector('[data-f]').focus();
        refresh();
        return;
      }
      const remove = event.target.closest('[data-remove]');
      if (remove) {
        const entry = remove.closest('.pf-entry');
        const list = entry.parentElement;
        if (list.children.length > 1) entry.remove();
        refresh();
        scheduleAutosave();
      }
    });

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const state = refresh();
      if (!validate(state)) {
        toast('Please fix the highlighted fields.', 'error');
        return;
      }
      if (persist(state, 'Saved')) toast('Profile saved.', 'success');
      else toast('Could not save your profile on this device.', 'error');
    });

    document.getElementById('btn-custom-skill').addEventListener('click', () => {
      const input = document.getElementById('custom-skill');
      if (addCustomSkill(input.value)) {
        input.value = '';
        refresh();
        scheduleAutosave();
      }
      input.focus();
    });
    document.getElementById('custom-skill').addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        document.getElementById('btn-custom-skill').click();
      }
    });

    document.getElementById('btn-reset').addEventListener('click', resetAll);
    document.getElementById('btn-preview').addEventListener('click', () => {
      const target = document.getElementById('pf-preview');
      window.setTimeout(() => target.focus({ preventScroll: true }), 0);
    });
    document.getElementById('btn-print').addEventListener('click', () => window.print());

    if (saved) {
      statusEl.textContent = 'Loaded your saved profile';
      statusEl.classList.add('is-saved');
    }
    refresh();
  }

  init();
})();