/* Shared SkillSwap interactions. All handlers are guarded so each static page
   can use the same script without console errors. */
document.addEventListener("DOMContentLoaded", () => {
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
      applyBrowseFilters();
    });
    filters.addEventListener("reset", () =>
      window.setTimeout(() => {
        currentPage = 1;
        applyBrowseFilters();
      }),
    );
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
    const submitButton = postForm.querySelector("button[type='submit']");
    const preview = postForm.parentElement?.querySelector(
      ".preview .commission",
    );
    const error = document.getElementById("budget-error");
    const today = new Date().toISOString().split("T")[0];
    if (deadline) deadline.min = today;

    const updatePreview = () => {
      const previewTitle = preview?.querySelector("h3");
      const previewCategory = preview?.querySelector(".commission__cat");
      const previewDescription = preview?.querySelector(".commission__desc");
      const previewBudget = preview?.querySelector(".due--pending");
      const previewDeadline = preview?.querySelector(
        ".commission__meta .due:last-child",
      );
      if (previewTitle)
        previewTitle.textContent =
          title?.value.trim() || "Your commission title";
      if (previewCategory)
        previewCategory.lastChild.textContent = category?.value || "Skill area";
      if (previewDescription)
        previewDescription.textContent =
          details?.value.trim() ||
          "Your commission description will appear here.";
      const budgetOk = Number(budget?.value) > 0;
      if (previewBudget)
        previewBudget.textContent = budgetOk
          ? `₱${Number(budget.value).toLocaleString()}`
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
        previewDeadline.lastChild.textContent = ` Due ${date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
      }
    };
    const validatePost = () => {
      const validBudget = Number(budget?.value) > 0;
      const validDeadline = Boolean(deadline?.value) && deadline.value >= today;
      const validText =
        Boolean(title?.value.trim()) && Boolean(details?.value.trim());
      budget?.classList.toggle("input--invalid", !validBudget);
      deadline?.classList.toggle("input--invalid", !validDeadline);
      if (error) error.hidden = validBudget;
      if (submitButton)
        submitButton.disabled = !(validBudget && validDeadline && validText);
      updatePreview();
      return validBudget && validDeadline && validText;
    };
    [title, category, budget, deadline, details].forEach((field) =>
      field?.addEventListener("input", validatePost),
    );
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
    postForm.addEventListener("submit", (event) => {
      event.preventDefault();
      if (validatePost())
        showMessage("Your commission is ready to publish.", "success");
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
      if (actionCell)
        actionCell.innerHTML = `<span class="badge ${accepted ? "badge--open" : "badge--muted"}">${accepted ? "Accepted" : "Rejected"}</span>`;
      showMessage(
        `${name} was ${accepted ? "accepted" : "rejected"}.`,
        accepted ? "success" : "error",
      );
    });
  });
  const applyForm = document.getElementById("apply-form");
  if (applyForm) {
    applyForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const rate = Number(
        (document.getElementById("rate")?.value || "").replace(/[^\d.]/g, ""),
      );
      const valid =
        Boolean(document.getElementById("full-name")?.value.trim()) &&
        Boolean(document.getElementById("proposal")?.value.trim()) &&
        rate > 0 &&
        rate <= 500;
      if (valid)
        showMessage(
          "Application submitted — the client can now review your proposal.",
          "success",
        );
      else
        showMessage(
          "Add your name, proposal, and a valid rate up to ₱500.",
          "error",
        );
    });
  }

  // Dashboard: filter rows and provide a simple status transition for prototypes.
  const dashboardStatus = document.getElementById("mine-status");
  const dashboardRows = Array.from(
    document.querySelectorAll(".mine__head + .table-wrap tbody tr"),
  );
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
  document
    .querySelectorAll(".mine__head + .table-wrap .btn--outline")
    .forEach((button) => {
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