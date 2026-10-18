# Changelog

* All notable changes to SkillSwap will be documented in this file.
---
## 10-18-2026

### Backend and workflows (Summary)

* Connected commission browsing and detail pages to live database data.
* Added owner-only editing with validation; only open commissions can be edited.
* Enforced one application per user per commission.
* Added automatic rejection of other applicants and automatic commission closure after acceptance.
* Added accepted-contact email visibility for the owner and accepted applicant.

### Commission data and lifecycle

* Replaced static commission detail content with live database data, including title, category, owner, status, budget, deadline, description, and application count.
* Updated the open commission board to load only database commissions whose status is `Open`.
* Added live empty and error states for the commission board instead of displaying sample cards.
* Added cache-safe commission requests, no-cache API headers, cache-busting asset versions, and page-show refresh behavior so newly posted commissions appear without stale data.
* Added database application counts to commission queries and synchronized commission detail data with the browse board.
* Added owner-only commission editing for title, category, description, budget, and deadline.
* Restricted commission editing to commissions that are still `Open`; in-progress and completed commissions cannot be edited.
* Added server-side authorization and validation for commission updates.

### Applications and account information

* Connected application submission to the database application API.
* Added authenticated applicant full name and email fields to the application form.
* Changed proposed rate validation to a numeric PHP amount with positive-value validation and a maximum equal to the commission budget.
* Added matching server-side proposed-rate validation so invalid rates cannot bypass the browser.
* Prevented users from applying to their own commissions.
* Enforced one application per user per commission in both the service and database unique constraint.
* Hid the application form after a user has already applied and displayed the current application status.
* Prevented applications and acceptance actions after a commission is no longer `Open`.
* Added owner-side applicant email visibility after applications are submitted.
* Added accepted applicant and commission-owner contact email visibility after acceptance.

### Acceptance workflow

* Added owner controls to accept or reject pending applicants.
* Automatically rejected other pending applicants when one applicant is accepted.
* Created rejection notifications for applicants automatically rejected by another acceptance.
* Prevented multiple applicants from being accepted for the same commission.
* Automatically changed a commission from `Open` to `In Progress` when an application is accepted.
* Added repair logic that closes already-accepted commissions still marked `Open`.
* Hid application actions when a commission has been accepted or otherwise closed.

### Live preview and form validation

* Removed sample title and description values from the post commission form.
* Made the live preview budget update immediately while typing, including decimal and formatted PHP amounts.
* Updated the preview author to use the authenticated account user's name instead of sample text.
* Made the preview category icon follow the selected category using the shared SVG sprite.
* Added live preview updates for title, category, description, deadline, budget, readiness state, and checklist status.
* Updated the “Before you post” checklist so title/category, deadline/description, and budget requirements accurately reflect the form.
* Kept commission posting disabled until all required fields contain valid values.

### Notifications

* Added notification navigation from a notification to its related commission.
* Marked linked notifications as read before redirecting to the related commission.
* Added keyboard support for opening linked notifications with Enter or Space.
* Added unread notification counts to the notification bell.
* Added periodic unread-count refresh so new notifications appear without a full page reload.
* Fixed dynamically generated notification SVG icons with the correct SVG namespace, viewBox, sprite references, and compatibility attributes.
* Added notification styling for application, acceptance, rejection, and completion states.

### Documentation and maintenance

* Updated the README and project documentation to describe the current PHP pages, API modules, database workflows, validation rules, notification behavior, and setup process.
* Updated the architecture, database, features, setup, roadmap, wireframe, and changelog documentation to match the implemented system.
* Added PHP and JavaScript syntax validation coverage during the implementation work.


### Frontend

* Added live post-commission preview updates for title, category, budget, deadline, description, and account owner name.
* Added checklist validation that reflects the actual posting requirements.
* Added notification navigation, unread count badges, periodic refresh, and fixed notification SVG icons.
* Added empty and error states for live commission data and cache-safe refresh behavior.

---
## 10-14-2026

### Frontend

* Reorganized frontend styles and scripts into `app/css/` and `app/js/`.
* Centralized the shared toast helper and completed the commission naming cleanup.
* Fixed the Find Student Help hyperlink in the NavBar.
* Updated schema.
* Updated index.html into a landing page and added in the css.
* Updated CSS into a different file for organization.
* Added the Resume & Profile page, redesigned the dashboard layout, and fixed the Profile link and the Post Commission live preview.

---
## 10-13-2026

### Frontend

* Added Log in and Sign pages.
* Added drop down for log out functionality.
* Updated Index and homepage pages.
* Implemented BootStrap and JavaScript.

---
## 10-12-2026

### Frontend

* Created the initial HTML and CSS files.
* Updated Repo Rulesets.
* Reworked HTML and CSS files.

---

## 10-04-2026

### Documentation and Repo

* Created Documentation Blueprints and planned structure
* Created Repo rulesets.
