# SkillSwap: Student Freelance Marketplace

A web platform where students offer their skills for hire and clients post small gigs, then browse and apply for matching opportunities.

> **Course:** WEBPROG Final Project · **Section:** BSCS241A
> **Team:** Arandela, Jherrymei D. · Nepomuceno, Julliana P.
> **Status:** In development (see [Roadmap](docs/ROADMAP.md))

---

## Table of Contents

- [Overview](#overview)
- [Target Users](#target-users)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Screens](#screens)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Documentation](#documentation)
- [Team](#team)

---

## Overview

Students have skills such as graphic design, programming, writing, and tutoring that classmates, student organizations, and small local businesses need. There is no simple place to post a gig or find a student freelancer, so most people fall back on group chats or large international platforms that are crowded and charge fees.

**SkillSwap** organizes gigs and applications in one searchable board built for the student community.

## Target Users

| User | Description |
| --- | --- |
| **Student Freelancers** | College and high school students who want to earn by offering skills like design, coding, writing, and tutoring. |
| **Clients** | Classmates, student organizations, and small local businesses who need quick, affordable help with a specific task. |

## Features

- **Interactive Gig Posting Form:** clients enter a title, category, budget, deadline, and description.
- **Persistent Storage (PHP & MySQL):** gigs and applications are saved securely and retrieved from a MySQL database.
- **Gig Board with Category Filter & Search:** browse open gigs as cards and filter or search by keyword dynamically using JavaScript DOM manipulation.
- **Application & Status Tracking:** freelancers apply with a short proposal and proposed rate; each gig moves through **Open → In Progress → Completed**.
- **Responsive Dashboard with Activity Chart:** CSS Grid/Flexbox layout for mobile and laptop, with a Chart.js bar chart of applications received over the last 7 days.

Full details: [docs/FEATURES.md](docs/FEATURES.md)

## Tech Stack

| Layer | Technology | Used for |
| --- | --- | --- |
| Markup | **HTML5** | Semantic structure (`<header>`, `<main>`, `<section>`, `<form>`, `<table>`) |
| Styling | **CSS3** (Flexbox / Grid / Bootstrap) | Gig cards, forms, status badges, hover effects, responsive breakpoints |
| Client logic | **JavaScript** | Form validation, live filtering/search, live preview, Chart.js activity chart |
| Server | **PHP** | Handling submissions, input sanitizing, prepared SQL queries |
| Database | **MySQL** | `gigs` and `applications` tables |
| Charts | **Chart.js** | Weekly applications chart |

## Screens

| # | Screen | File | Highlights |
| --- | --- | --- | --- |
| 1 | Browse Gigs | `index.php` | CSS Grid, JS filter/search, PHP/MySQL loop |
| 2 | Gig Details & Apply | `gig.php?id=` | PHP POST, JS validation, applicant list (client view) |
| 3 | Post a Gig | `post_gig.php` | JS validation + live preview |
| 4 | My Dashboard | `dashboard.php` | Chart.js, status summary, mark as completed |

ASCII wireframes are in [docs/WIREFRAMES.md](docs/WIREFRAMES.md).

## Project Structure

Planned layout (adjust to match your final code):

```
skillswap/
├── index.php            # Screen 1: Browse gigs
├── gig.php              # Screen 2: Gig details & apply
├── post_gig.php         # Screen 3: Post a gig
├── dashboard.php        # Screen 4: Dashboard
├── includes/
│   ├── db.php           # MySQL connection
│   ├── header.php       # Shared navigation
│   └── footer.php
├── assets/
│   ├── css/style.css
│   └── js/
│       ├── filter.js    # Category filter & search
│       ├── validate.js  # Form validation & live preview
│       └── chart.js     # Dashboard chart setup
├── database/
│   └── schema.sql       # Database schema
├── docs/                # Project documentation
└── README.md
```

## Getting Started

### Prerequisites

- PHP 8.0+
- MySQL 8.0+ (or MariaDB 10.4+)
- A local server stack such as [XAMPP](https://www.apachefriends.org/) or WAMP

### Quick setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/<your-username>/skillswap.git
   ```
2. **Move it into your web root** (e.g. `C:\xampp\htdocs\skillswap`).
3. **Create the database**
   ```bash
   mysql -u root -p < database/schema.sql
   ```
4. **Configure the connection** in `includes/db.php` (host, database name, user, password).
5. **Start Apache and MySQL**, then open `http://localhost/skillswap/`.

See [docs/SETUP.md](docs/SETUP.md) for detailed steps and troubleshooting.

## Documentation

| Document | Description |
| --- | --- |
| [docs/FEATURES.md](docs/FEATURES.md) | Feature specifications and validation rules |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | System design and request flow |
| [docs/DATABASE.md](docs/DATABASE.md) | Schema, tables, and example queries |
| [docs/WIREFRAMES.md](docs/WIREFRAMES.md) | Screen layouts |
| [docs/SETUP.md](docs/SETUP.md) | Installation and configuration |
| [docs/ROADMAP.md](docs/ROADMAP.md) | Timeline and milestones |

## Team

| Name | Section |
| --- | --- |
| Arandela, Jherrymei D. | BSCS241A |
| Nepomuceno, Julliana P. | BSCS241A |

---

*Built as a final project for WEBPROG.*