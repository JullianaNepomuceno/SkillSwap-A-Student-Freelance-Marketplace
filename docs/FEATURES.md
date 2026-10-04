# Features

## 1. Interactive Gig Posting Form (`post_gig.php`)

Clients create a gig by providing:

| Field | Type | Rules |
| --- | --- | --- |
| Title | Text | Required |
| Category | Dropdown | Required (Graphic Design, Web Development, Writing, Tutoring, ...) |
| Budget | Number (₱) | Required, must be a number greater than 0 |
| Deadline | Date | Required, must not be in the past |
| Details | Textarea | Required |

- **Client-side validation (JavaScript)** checks budget and deadline before submit and shows inline errors (e.g. "Budget must be a number > 0").
- **Live preview (JavaScript)** renders the gig card as the client types.
- **Server-side (PHP)** re-validates and sanitizes input, then inserts using a prepared statement. New gigs default to status **Open**.

## 2. Gig Board with Category Filter & Search (`index.php`)

- Open gigs are rendered from MySQL by a PHP loop as cards in a CSS Grid.
- JavaScript DOM manipulation filters cards by **category**, **keyword**, **budget range**, and **status** without a page reload.
- Each card shows title, category, budget, deadline, applicant count, and a **View & Apply** button.
- Pagination controls are shown for large result sets.

## 3. Application & Status Tracking (`gig.php?id=`)

**Freelancers** apply with:

| Field | Rules |
| --- | --- |
| Name | Required |
| Proposal | Required, short text |
| Proposed rate (₱) | Required, number greater than 0 |

**Clients** see an applicant list with each rate and status and can **Accept** or **Reject** an application.

**Gig lifecycle:**

```
Open ──► In Progress ──► Completed
```

**Application statuses:** `Pending`, `Accepted`, `Rejected`.

## 4. Responsive Dashboard with Activity Chart (`dashboard.php`)

- **Summary cards:** gigs posted, in progress, completed, and total applications.
- **Chart.js bar chart:** applications received per day over the last 7 days.
- **My Gigs list** with status and a **Mark as Completed** action.
- Layout built with CSS Grid and Flexbox, with breakpoints for mobile and laptop screens.

## 5. Security & Data Handling

- All SQL uses **prepared statements**.
- All user input is **sanitized** on the server; output is escaped before rendering.
- Client-side validation is for convenience only; the server is the source of truth.
