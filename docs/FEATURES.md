# Features

## 1. Interactive commission posting and editing (`post_commission.php`, `commission.php`)

Clients create a commission by providing:

| Field | Type | Rules |
| --- | --- | --- |
| Title | Text | Required |
| Category | Dropdown | Required (`Coding & IT`, `Arts & Design`, `Writing & Research`, `Tutoring & Review`, or `Media & Content`) |
| Budget | Number (₱) | Required, must be a number greater than 0 |
| Deadline | Date | Required, must not be in the past |
| Details | Textarea | Required |

- **Client-side validation (JavaScript)** checks budget and deadline before submit and shows inline errors (e.g. "Budget must be a number > 0").
- **Live preview (JavaScript)** renders the commission card as the client types.
- The preview uses the authenticated account name and updates title, category icon, description, budget, and deadline live.
- **Server-side (PHP)** re-validates and sanitizes input, then inserts using a prepared statement. New commissions default to status **Open**.
- Owners can edit their own open commissions. In-progress and completed commissions are locked.

## 2. Commission Board with Category Filter & Search (`homepage.php`)

- Only database commissions with status `Open` are returned by the API and rendered as cards in a CSS Grid.
- JavaScript DOM manipulation filters cards by **category**, **keyword**, **budget range**, and **status** without a page reload.
- Each card shows title, category, budget, deadline, applicant count, and a **View & Apply** button.
- Pagination controls are shown for large result sets.

## 3. Application & Status Tracking (`commission.php?id=`)

**Freelancers** apply with:

| Field | Rules |
| --- | --- |
| Name | Required |
| Email | Loaded from the authenticated account and shown read-only |
| Proposal | Required, short text |
| Proposed rate (₱) | Required, greater than 0 and no higher than the commission budget |

**Clients** see an applicant list with each rate and status and can **Accept** or **Reject** an application.

**commission lifecycle:**

```
Open ──► In Progress ──► Completed
```

**Application statuses:** `Pending`, `Accepted`, `Rejected`.

- A user can apply only once to a specific commission. The rule is enforced by the service and the database unique key.
- Users cannot apply to their own commissions or to commissions that are no longer open.
- Accepting one applicant automatically rejects other pending applications, notifies affected applicants, and closes applications by moving the commission to `In Progress`.

## 4. Notifications (`notifications.php`)

- Users receive notifications for received applications, accepted or rejected applications, and completed commissions.
- The notification bell displays the current unread count and refreshes periodically.
- Notifications can link to the related commission; opening one marks it as read.

## 5. Responsive Dashboard with Activity Chart (`dashboard.php`)

- **Summary cards:** commissions posted, in progress, completed, and total applications.
- **Chart.js bar chart:** applications received per day over the last 7 days.
- **My commissions list** with status and a **Mark as Completed** action.
- Layout built with CSS Grid and Flexbox, with breakpoints for mobile and laptop screens.

## 5. Security & Data Handling

- All SQL uses **prepared statements**.
- All user input is **sanitized** on the server; output is escaped before rendering.
- Client-side validation is for convenience only; the server is the source of truth.
