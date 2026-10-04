# Architecture

SkillSwap is a classic server-rendered web app: PHP generates pages from MySQL data, and JavaScript enhances them in the browser.

## High-Level Overview

```
┌────────────────────────┐        HTTP         ┌────────────────────────┐
│        Browser         │ ◄─────────────────► │   Apache + PHP         │
│  HTML / CSS / JS       │   GET / POST        │   (index.php, gig.php, │
│  Chart.js              │                     │   post_gig.php, ...)   │
└────────────────────────┘                     └───────────┬────────────┘
                                                           │ prepared SQL
                                                           ▼
                                               ┌────────────────────────┐
                                               │        MySQL           │
                                               │  gigs · applications   │
                                               └────────────────────────┘
```

## Responsibilities by Layer

| Layer | Responsibility |
| --- | --- |
| **HTML5** | Semantic page structure and forms |
| **CSS3** | Layout (Grid/Flexbox), status badges, hover effects, responsive breakpoints |
| **JavaScript** | Form validation, live preview, filter/search via DOM manipulation, Chart.js rendering |
| **PHP** | Request handling, server-side validation, sanitizing, prepared queries, page rendering |
| **MySQL** | Persistent storage of gigs and applications |

## Request Flows

### Browse gigs
1. Browser requests `index.php`.
2. PHP queries open gigs (with applicant counts) from MySQL.
3. PHP renders gig cards into the HTML.
4. JavaScript attaches filter/search listeners and hides or shows cards client-side.

### Post a gig
1. Client fills in `post_gig.php`; JS validates and updates the live preview.
2. Form is submitted via `POST`.
3. PHP validates and sanitizes, inserts into `gigs` with a prepared statement, and redirects to the board.

### Apply to a gig
1. Freelancer opens `gig.php?id=<n>`; PHP loads the gig and its applicants.
2. Freelancer submits the application form (`POST`).
3. PHP validates, inserts into `applications` with status `Pending`, and reloads the page.
4. The client can accept or reject; PHP updates the application status.

### Dashboard
1. PHP aggregates counts per status and applications per day for the last 7 days.
2. Data is passed to JavaScript (e.g. as JSON) and rendered with Chart.js.

## Planned Modules

| File | Purpose |
| --- | --- |
| `includes/db.php` | Single place that opens the MySQL connection |
| `includes/header.php` / `footer.php` | Shared navigation and layout |
| `assets/js/filter.js` | Category filter and keyword search |
| `assets/js/validate.js` | Form validation and live preview |
| `assets/js/chart.js` | Dashboard chart initialization |

## Design Decisions

- **Server-rendered pages** keep the stack simple and match the course scope (HTML, CSS, JS, PHP, MySQL).
- **Client-side filtering** gives instant results on the board without extra requests.
- **Prepared statements** protect against SQL injection.
- **Two-table schema** is small enough to reason about and easy to extend (see [DATABASE.md](DATABASE.md)).
