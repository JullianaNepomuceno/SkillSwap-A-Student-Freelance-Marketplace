# Architecture

SkillSwap uses a static frontend and a JSON API: browser JavaScript calls native PHP endpoints, which validate requests and persist data in MySQL.

## High-Level Overview

```
┌────────────────────────┐        HTTP         ┌────────────────────────┐
│        Browser         │ ◄─────────────────► │   Apache + PHP         │
│  HTML / CSS / JS       │   GET / POST        │   (index.php, commission.php, │
│  Chart.js              │                     │   post_commission.php, ...)   │
└────────────────────────┘                     └───────────┬────────────┘
                                                           │ prepared SQL
                                                           ▼
                                               ┌────────────────────────┐
                                               │        MySQL           │
                                               │  commissions · applications   │
                                               └────────────────────────┘
```

## Responsibilities by Layer

| Layer | Responsibility |
| --- | --- |
| **HTML5** | Semantic page structure and forms |
| **CSS3** | Layout (Grid/Flexbox), status badges, hover effects, responsive breakpoints |
| **JavaScript** | Form validation, live preview, filter/search via DOM manipulation, Chart.js rendering |
| **PHP** | Thin JSON endpoints, session authentication, service rules, validation, and prepared queries |
| **MySQL** | Persistent storage of commissions and applications |

## Request Flows

### Browse commissions
1. Browser requests `index.php`.
2. PHP queries open commissions (with applicant counts) from MySQL.
3. PHP renders commission cards into the HTML.
4. JavaScript attaches filter/search listeners and hides or shows cards client-side.

### Post a commission
1. Client fills in `post_commission.php`; JS validates and updates the live preview.
2. Form is submitted via `POST`.
3. PHP validates and sanitizes, inserts into `commissions` with a prepared statement, and redirects to the board.

### Apply to a commission
1. Freelancer opens `commission.php?id=<n>`; PHP loads the commission and its applicants.
2. Freelancer submits the application form (`POST`).
3. PHP validates, inserts into `applications` with status `Pending`, and reloads the page.
4. The client can accept or reject; PHP updates the application status.

### Dashboard
1. PHP aggregates counts per status and applications per day for the last 7 days.
2. Data is passed to JavaScript (e.g. as JSON) and rendered with Chart.js.

## API Modules

| File | Purpose |
| --- | --- |
| `includes/db.php` | Single place that opens the MySQL connection |
| `includes/header.php` / `footer.php` | Shared navigation and layout |
| `app/css/styles.css` | Shared layout, components, and responsive styles |
| `app/css/auth.css` | Login and signup page styles |
| `app/js/ui.js` | Shared toast and live-region helper |
| `app/js/app.js` | Marketplace interactions and live preview |
| `app/js/auth.js` | Authentication form validation |

## Design Decisions

- **Server-rendered pages** keep the stack simple and match the course scope (HTML, CSS, JS, PHP, MySQL).
- **Client-side filtering** gives instant results on the board without extra requests.
- **Prepared statements** protect against SQL injection.
- **Two-table schema** is small enough to reason about and easy to extend (see [DATABASE.md](DATABASE.md)).
