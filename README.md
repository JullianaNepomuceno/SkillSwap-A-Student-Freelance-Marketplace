# SkillSwap: Student Freelance Marketplace

A web platform where students offer their skills for hire and clients post small commissions, then browse and apply for matching opportunities.

> **Course:** WEBPROG Final Project · **Section:** BSCS241A
> **Team:** Arandela, Jherrymei D. · Nepomuceno, Julliana P.
> **Status:** Functional prototype (see [Roadmap](docs/ROADMAP.md) and [Changelog](docs/CHANGELOG.md))

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

Students have skills such as graphic design, programming, writing, and tutoring that classmates, student organizations, and small local businesses need. There is no simple place to post a commission or find a student freelancer, so most people fall back on group chats or large international platforms that are crowded and charge fees.

**SkillSwap** organizes commissions and applications in one searchable board built for the student community.

## Target Users

| User | Description |
| --- | --- |
| **Student Freelancers** | College and high school students who want to earn by offering skills like design, coding, writing, and tutoring. |
| **Clients** | Classmates, student organizations, and small local businesses who need quick, affordable help with a specific task. |

## Features

- **Interactive commission posting and editing:** owners enter or update a title, category, budget, deadline, and description with client- and server-side validation.
- **Persistent Storage (PHP & MySQL):** accounts, commissions, applications, and notifications are stored in MySQL and accessed through authenticated JSON APIs.
- **Live open commission board:** only database commissions with `Open` status are shown; search, category filtering, sorting, empty states, and cache-safe refreshes are supported.
- **Application and status tracking:** freelancers submit one application per commission with a proposal and proposed rate; each commission moves through **Open → In Progress → Completed**.
- **Application workflow:** owners accept or reject applicants. Accepting one applicant rejects other pending applicants and automatically moves the commission to `In Progress`.
- **Notifications:** users receive in-app notifications for applications, acceptance, rejection, and completion. Unread counts appear on the notification bell.
- **Responsive Dashboard with Activity Chart:** CSS Grid/Flexbox layout for mobile and laptop, with a Chart.js bar chart of applications received over the last 7 days.

Full details: [docs/FEATURES.md](docs/FEATURES.md)

## Tech Stack

| Layer | Technology | Used for |
| --- | --- | --- |
| Markup | **HTML5** | Semantic structure (`<header>`, `<main>`, `<section>`, `<form>`, `<table>`) |
| Styling | **CSS3** (Flexbox / Grid / Bootstrap) | commission cards, forms, status badges, hover effects, responsive breakpoints |
| Client logic | **JavaScript** | Form validation, live filtering/search, live preview, Chart.js activity chart |
| Server | **PHP** | Handling submissions, input sanitizing, prepared SQL queries |
| Database | **MySQL** | `commissions` and `applications` tables |
| Charts | **Chart.js** | Weekly applications chart |

## Screens

| # | Screen | File | Highlights |
| --- | --- | --- | --- |
| 1 | Browse commissions | `index.php` | CSS Grid, JS filter/search, PHP/MySQL loop |
| 2 | commission Details & Apply | `commission.php?id=` | PHP POST, JS validation, applicant list (client view) |
| 3 | Post a commission | `post_commission.php` | JS validation + live preview |
| 4 | My Dashboard | `dashboard.php` | Chart.js, status summary, mark as completed |

ASCII wireframes are in [docs/WIREFRAMES.md](docs/WIREFRAMES.md).

## Project Structure

Planned layout:

```
SkillSwap-A-Student-Freelance.../
├── .vscode/
├── app/
│   ├── index.php            # public landing page
│   ├── signup.php
│   ├── login.php
│   ├── homepage.php         # post-login commission board
│   ├── commission.php
│   ├── post_commission.php
│   ├── notifications.php
│   ├── profile.php
│   ├── dashboard.php
│   ├── css/
│   │   ├── styles.css      # shared styles, including the former patch rules
│   │   └── auth.css        # login/signup only
│   ├── js/
│   │   ├── ui.js           # shared showMessage (load first)
│   │   ├── app.js
│   │   └── auth.js
│   └── img/
├── api/
│   ├── auth/             # login, signup, logout, current user
│   ├── commissions/      # list, get, create, update, delete, status
│   ├── applications/     # create, list, review status
│   ├── notifications/    # list, unread count, mark read
│   ├── dashboard/        # dashboard aggregates
│   ├── profile/          # profile data
│   └── src/              # auth, validation, services, repositories
├── database/skillswap.sql   # Database schema
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
   mysql -u root -p < database/skillswap.sql
   ```
4. **Configure the connection** in `api/config/config.php` or with the documented `SKILLSWAP_DB_*` environment variables.
5. **Start Apache and MySQL**, then open `http://localhost/SkillSwap-A-Student-Freelance-Marketplace/app/`.

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
| [docs/CHANGELOG.md](docs/CHANGELOG.md) | Implemented changes and release notes |

## Team

| Name | Section |
| --- | --- |
| Arandela, Jherrymei D. | BSCS241A |
| Nepomuceno, Julliana P. | BSCS241A |

---

*Built as a final project for WEBPROG.*
