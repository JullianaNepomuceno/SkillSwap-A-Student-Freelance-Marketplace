# Architecture

SkillSwap uses PHP-rendered pages with browser JavaScript and a JSON API: authenticated browser requests call native PHP endpoints, which validate requests and persist data in MySQL.

## High-Level Overview

```
┌────────────────────────┐        HTTP         ┌────────────────────────┐
│        Browser         │ ◄─────────────────► │   Apache + PHP         │
│  PHP / HTML / CSS / JS │   GET / POST        │   (homepage.php, commission.php, │
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
| **JavaScript** | Form validation, live preview, filter/search, notifications, application actions, and Chart.js rendering |
| **PHP** | Thin JSON endpoints, session authentication, service rules, validation, and prepared queries |
| **MySQL** | Persistent storage of commissions and applications |

## Request Flows

### Browse commissions
1. Browser requests `homepage.php`.
2. JavaScript calls `api/commissions/list.php`.
3. The repository queries only `Open` commissions and includes applicant counts.
4. JavaScript renders cards and applies search, category, and sorting controls.

### Post a commission
1. Client fills in `post_commission.php`; JS validates and updates the live preview.
2. The form is submitted to `api/commissions/create.php`.
3. The service validates the authenticated owner, inserts into `commissions`, and redirects to the dashboard.
4. An owner can update an open commission through `api/commissions/update.php`.

### Apply to a commission
1. Freelancer opens `commission.php?id=<n>`; JavaScript loads commission data and the current user's application state.
2. The service rejects self-applications, duplicate applications, closed commissions, invalid proposals, and rates above budget.
3. PHP inserts a `Pending` application and creates an owner notification.
4. The owner accepts or rejects through `api/applications/update_status.php`.
5. Acceptance rejects other pending applicants, creates notifications, and changes the commission to `In Progress`.

### Notifications
1. Application and status workflows insert notification rows for the relevant user.
2. The notification bell polls `api/notifications/count.php` for unread counts.
3. `notifications.php` loads the full list; opening a linked notification marks it read and redirects to the related commission.

### Dashboard
1. PHP aggregates counts per status and applications per day for the last 7 days.
2. Data is passed to JavaScript (e.g. as JSON) and rendered with Chart.js.

## API Modules

| File | Purpose |
| --- | --- |
| `api/bootstrap.php` | Loads configuration, session authentication, database, repository, and service |
| `api/src/Services/MarketplaceService.php` | Business rules, validation, transactions, and workflow transitions |
| `api/src/Repositories/MarketplaceRepository.php` | Prepared SQL queries and persistence |
| `api/src/Core/Auth.php` / `Validator.php` | Session identity and input validation |
| `app/css/components.css` | Shared layout, components, notifications, and responsive styles |
| `app/js/ui.js` | Shared toast and live-region helper |
| `app/js/app.js` | Marketplace interactions and live preview |
| `app/js/auth.js` | Authentication form validation |

## Design Decisions

- **Server-rendered pages** keep the stack simple and match the course scope (HTML, CSS, JS, PHP, MySQL).
- **Client-side filtering** gives instant results on the board without extra requests.
- **Prepared statements** protect against SQL injection.
- **Normalized relational data** keeps users, commissions, applications, and notifications separate (see [DATABASE.md](DATABASE.md)).
