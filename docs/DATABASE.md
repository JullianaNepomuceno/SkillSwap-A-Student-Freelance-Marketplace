# Database

**Engine:** MySQL · The full script is in [`database/schema.sql`](../database/schema.sql).

## Entity Relationship

```
┌─────────────────────┐  1        N  ┌──────────────────────────┐
│        gigs         │──────────────│       applications       │
├─────────────────────┤              ├──────────────────────────┤
│ id (PK)             │              │ id (PK)                  │
│ title               │              │ gig_id (FK → gigs.id)    │
│ category            │              │ freelancer_name          │
│ description         │              │ proposal                 │
│ budget              │              │ proposed_rate            │
│ deadline            │              │ status                   │
│ status              │              │ created_at               │
│ created_at          │              └──────────────────────────┘
└─────────────────────┘
```

One gig can have many applications.

## Table: `gigs`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | INT, PK, auto-increment | |
| `title` | VARCHAR(150) | |
| `category` | VARCHAR(50) | e.g. Graphic Design, Web Development, Writing, Tutoring |
| `description` | TEXT | |
| `budget` | DECIMAL(10,2) | Pesos, must be > 0 |
| `deadline` | DATE | |
| `status` | ENUM('Open','In Progress','Completed') | Default `Open` |
| `created_at` | TIMESTAMP | Default current time |

## Table: `applications`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | INT, PK, auto-increment | |
| `gig_id` | INT, FK → `gigs.id` | `ON DELETE CASCADE` |
| `freelancer_name` | VARCHAR(100) | |
| `proposal` | TEXT | |
| `proposed_rate` | DECIMAL(10,2) | Pesos, must be > 0 |
| `status` | ENUM('Pending','Accepted','Rejected') | Default `Pending` |
| `created_at` | TIMESTAMP | Default current time |

> Column types are suggestions based on the proposal's column list. Adjust them to match your final schema.

## Example Queries

Use **prepared statements** in PHP for every query that takes user input.

**Open gigs with applicant counts (Browse Gigs):**
```sql
SELECT g.*, COUNT(a.id) AS applicants
FROM gigs g
LEFT JOIN applications a ON a.gig_id = g.id
WHERE g.status = 'Open'
GROUP BY g.id
ORDER BY g.created_at DESC;
```

**Insert a gig:**
```sql
INSERT INTO gigs (title, category, description, budget, deadline)
VALUES (?, ?, ?, ?, ?);
```

**Insert an application:**
```sql
INSERT INTO applications (gig_id, freelancer_name, proposal, proposed_rate)
VALUES (?, ?, ?, ?);
```

**Applications per day, last 7 days (Dashboard chart):**
```sql
SELECT DATE(created_at) AS day, COUNT(*) AS total
FROM applications
WHERE created_at >= CURDATE() - INTERVAL 6 DAY
GROUP BY DATE(created_at)
ORDER BY day;
```

**Gig counts by status (Dashboard summary):**
```sql
SELECT status, COUNT(*) AS total
FROM gigs
GROUP BY status;
```

**Update gig status:**
```sql
UPDATE gigs SET status = ? WHERE id = ?;
```
