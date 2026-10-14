-- SkillSwap: A Student Freelance Marketplace
-- Course: WEBPROG BSCS241A
-- Purpose: Complete MySQL schema and realistic sample data for SkillSwap.
-- Import: Run this file in MySQL or phpMyAdmin; it creates and selects the
-- skillswap database, then recreates all tables and inserts sample records.

CREATE DATABASE IF NOT EXISTS skillswap
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE skillswap;

-- Drop child tables before their parent tables so this file is safe to re-import.
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS applications;
DROP TABLE IF EXISTS commissions;
DROP TABLE IF EXISTS users;

-- Users are the student clients and freelancers who use SkillSwap.
CREATE TABLE users (
  -- Surrogate identifier for each account.
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  -- Display name shown to other users.
  full_name VARCHAR(100) NOT NULL,
  -- Login address; duplicate addresses are not allowed.
  email VARCHAR(150) NOT NULL,
  -- Output of PHP password_hash(); never store a plain-text password here.
  password_hash VARCHAR(255) NOT NULL,
  -- Account goal values offered by signup.html.
  role ENUM('earn', 'find-help', 'both') NOT NULL,
  -- Time when the account was created.
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- Commissions are posted by users who need help with a project.
CREATE TABLE commissions (
  -- Surrogate identifier for each commission.
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  -- User who owns and posted the commission.
  user_id INT UNSIGNED NOT NULL,
  -- Short title displayed in commission cards.
  title VARCHAR(150) NOT NULL,
  -- Exact skill-area values offered by post_commission.html and its filters.
  category ENUM(
    'Coding & IT',
    'Arts & Design',
    'Writing & Research',
    'Tutoring & Review',
    'Media & Content'
  ) NOT NULL,
  -- Full requirements and deliverables for the commission.
  description TEXT NOT NULL,
  -- Positive budget in Philippine pesos.
  budget DECIMAL(10,2) NOT NULL,
  -- Requested completion date.
  deadline DATE NOT NULL,
  -- Current commission workflow state.
  status ENUM('Open', 'In Progress', 'Completed') NOT NULL DEFAULT 'Open',
  -- Time when the commission was posted.
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_commissions_user (user_id),
  KEY idx_commissions_status (status),
  KEY idx_commissions_category (category),
  CONSTRAINT fk_commissions_user
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE CASCADE,
  CHECK (budget > 0)
) ENGINE=InnoDB
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- Applications are submitted by users who want to work on a commission.
CREATE TABLE applications (
  -- Surrogate identifier for each application.
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  -- Commission being applied for.
  commission_id INT UNSIGNED NOT NULL,
  -- User submitting the application.
  user_id INT UNSIGNED NOT NULL,
  -- Applicant's pitch and proposed approach.
  proposal TEXT NOT NULL,
  -- Applicant's proposed rate in Philippine pesos.
  proposed_rate DECIMAL(10,2) NOT NULL,
  -- Current application workflow state.
  status ENUM('Pending', 'Accepted', 'Rejected') NOT NULL DEFAULT 'Pending',
  -- Time when the application was submitted.
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_one_application (commission_id, user_id),
  KEY idx_applications_status (status),
  KEY idx_applications_user (user_id),
  CONSTRAINT fk_applications_commission
    FOREIGN KEY (commission_id) REFERENCES commissions (id)
    ON DELETE CASCADE,
  CONSTRAINT fk_applications_user
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE CASCADE,
  CHECK (proposed_rate > 0)
) ENGINE=InnoDB
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- Notifications inform recipients about application and commission events.
CREATE TABLE notifications (
  -- Surrogate identifier for each notification.
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  -- User who should receive the notification.
  user_id INT UNSIGNED NOT NULL,
  -- Optional commission related to the event.
  commission_id INT UNSIGNED NULL,
  -- Event type used by the notification API.
  type ENUM(
    'application_received',
    'application_accepted',
    'application_rejected',
    'commission_completed'
  ) NOT NULL,
  -- Human-readable notification text.
  message VARCHAR(255) NOT NULL,
  -- Read state used by the notifications page.
  is_read TINYINT(1) NOT NULL DEFAULT 0,
  -- Time when the notification was created.
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_notifications_user_read (user_id, is_read),
  CONSTRAINT fk_notifications_user
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE CASCADE,
  CONSTRAINT fk_notifications_commission
    FOREIGN KEY (commission_id) REFERENCES commissions (id)
    ON DELETE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- Business rule enforced in PHP, not by this schema:
-- A user may not apply to their own commission (applications.user_id must
-- differ from commissions.user_id). This is enforced in PHP, not in the schema.

-- Sample accounts cover every role offered by signup.html. These values are
-- clearly fake placeholders; real hashes must come from PHP password_hash().
INSERT INTO users (id, full_name, email, password_hash, role, created_at) VALUES
  (1, 'Jamie Santos', 'jamie.santos@example.test', 'REPLACE_WITH_PASSWORD_HASH_FROM_PHP', 'find-help', '2026-10-01 09:00:00'),
  (2, 'Mia Santos', 'mia.santos@example.test', 'REPLACE_WITH_PASSWORD_HASH_FROM_PHP', 'earn', '2026-10-02 10:30:00'),
  (3, 'Yana Nepomuceno', 'yana.nepomuceno@example.test', 'REPLACE_WITH_PASSWORD_HASH_FROM_PHP', 'both', '2026-10-03 14:15:00'),
  (4, 'Carlos Rivera', 'carlos.rivera@example.test', 'REPLACE_WITH_PASSWORD_HASH_FROM_PHP', 'both', '2026-10-04 16:45:00');

-- Sample commissions cover all five app categories and all three statuses.
INSERT INTO commissions
  (id, user_id, title, category, description, budget, deadline, status, created_at)
VALUES
  (1, 1, 'Logo for NU Laguna Org Fest', 'Arts & Design',
   'Create two vibrant logo concepts for the annual campus organization fair, with one revision and final SVG and PNG files.',
   500.00, '2026-10-20', 'Open', '2026-10-08 08:30:00'),
  (2, 2, 'Derivative Review Sessions', 'Tutoring & Review',
   'Help a first-year Nationalian review derivatives in two one-hour online sessions.',
   500.00, '2026-10-21', 'Open', '2026-10-08 11:00:00'),
  (3, 3, 'Campus Sustainability Feature', 'Writing & Research',
   'Write and edit a 600-word feature about student-led sustainability projects on campus.',
   800.00, '2026-10-22', 'In Progress', '2026-10-09 09:15:00'),
  (4, 4, 'NU Laguna Student Society Website', 'Coding & IT',
   'Build a responsive one-page website for a student developer community, including a contact section.',
   1500.00, '2026-10-24', 'Open', '2026-10-09 13:20:00'),
  (5, 1, 'Research Abstract Editing', 'Writing & Research',
   'Edit a 300-word research abstract for clarity, grammar, and academic tone before submission.',
   250.00, '2026-10-19', 'Completed', '2026-10-10 10:00:00'),
  (6, 2, 'Event Poster and Social Kit', 'Media & Content',
   'Create a campus event poster and three matching social media graphics in editable format.',
   700.00, '2026-10-26', 'Open', '2026-10-10 15:40:00'),
  (7, 3, 'Student Portfolio Landing Page', 'Coding & IT',
   'Create a polished portfolio landing page with project cards and mobile-friendly layout.',
   1200.00, '2026-10-28', 'In Progress', '2026-10-11 08:45:00'),
  (8, 4, 'Organization Photo Coverage', 'Media & Content',
   'Photograph a two-hour student organization event and provide edited highlight images.',
   900.00, '2026-10-30', 'Open', '2026-10-12 12:10:00'),
  (9, 1, 'Calculus Study Guide', 'Tutoring & Review',
   'Prepare a concise study guide and one review session for an upcoming calculus exam.',
   400.00, '2026-11-02', 'Completed', '2026-10-13 17:25:00');

-- Sample applications use unique commission/applicant pairs and rates accepted
-- by the apply form. No applicant owns the commission they applied to.
INSERT INTO applications
  (id, commission_id, user_id, proposal, proposed_rate, status, created_at)
VALUES
  (1, 1, 3, 'I can provide two clean logo directions and deliver organized SVG and PNG exports.', 450.00, 'Accepted', '2026-10-08 12:20:00'),
  (2, 1, 4, 'I have experience creating student organization branding and can meet the October deadline.', 500.00, 'Rejected', '2026-10-09 09:40:00'),
  (3, 2, 3, 'I can explain derivative rules step by step and provide practice exercises after each session.', 400.00, 'Accepted', '2026-10-09 14:10:00'),
  (4, 2, 4, 'I can prepare a focused review plan for the two online tutoring sessions.', 450.00, 'Rejected', '2026-10-10 08:50:00'),
  (5, 3, 2, 'I can research the campus projects and write a clear, student-focused feature.', 500.00, 'Accepted', '2026-10-10 11:35:00'),
  (6, 3, 4, 'I can edit the draft for structure, tone, and readability while preserving the facts.', 450.00, 'Pending', '2026-10-11 10:05:00'),
  (7, 4, 2, 'I can build a responsive page with clean HTML, CSS, and accessible navigation.', 500.00, 'Pending', '2026-10-11 15:25:00'),
  (8, 4, 3, 'I can create the page structure and refine it for mobile screens.', 500.00, 'Rejected', '2026-10-12 09:15:00'),
  (9, 5, 2, 'I can polish the abstract grammar and academic tone before your submission date.', 250.00, 'Accepted', '2026-10-12 13:45:00'),
  (10, 6, 3, 'I can produce a cohesive poster and social graphics using the organization palette.', 600.00, 'Pending', '2026-10-13 08:30:00'),
  (11, 7, 2, 'I can build a simple portfolio layout with responsive project cards.', 500.00, 'Pending', '2026-10-13 16:10:00'),
  (12, 8, 3, 'I can cover the event and deliver a curated set of edited images.', 450.00, 'Pending', '2026-10-14 09:05:00'),
  (13, 9, 4, 'I can prepare a clear calculus guide and make the review session practical.', 350.00, 'Rejected', '2026-10-14 11:20:00');

-- Sample notifications match the application and commission events above.
INSERT INTO notifications
  (id, user_id, commission_id, type, message, is_read, created_at)
VALUES
  (1, 1, 1, 'application_received', 'Yana Nepomuceno applied to Logo for NU Laguna Org Fest.', 0, '2026-10-08 12:20:00'),
  (2, 3, 1, 'application_accepted', 'Your application for Logo for NU Laguna Org Fest was accepted.', 0, '2026-10-08 13:00:00'),
  (3, 2, 3, 'application_received', 'Carlos Rivera applied to Campus Sustainability Feature.', 1, '2026-10-11 10:05:00'),
  (4, 4, 3, 'application_rejected', 'Your application for Campus Sustainability Feature was not selected.', 0, '2026-10-12 12:00:00'),
  (5, 2, 5, 'application_accepted', 'Your application for Research Abstract Editing was accepted.', 1, '2026-10-12 14:00:00'),
  (6, 3, 7, 'application_received', 'Mia Santos applied to Student Portfolio Landing Page.', 0, '2026-10-13 16:10:00'),
  (7, 2, 5, 'commission_completed', 'Research Abstract Editing has been marked completed.', 1, '2026-10-14 12:00:00');
