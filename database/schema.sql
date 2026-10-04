-- SkillSwap database schema
-- Usage: mysql -u root -p < database/schema.sql

CREATE DATABASE IF NOT EXISTS skillswap
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE skillswap;

CREATE TABLE IF NOT EXISTS gigs (
  id          INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  title       VARCHAR(150)  NOT NULL,
  category    VARCHAR(50)   NOT NULL,
  description TEXT          NOT NULL,
  budget      DECIMAL(10,2) NOT NULL CHECK (budget > 0),
  deadline    DATE          NOT NULL,
  status      ENUM('Open','In Progress','Completed') NOT NULL DEFAULT 'Open',
  created_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_gigs_status (status),
  INDEX idx_gigs_category (category)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS applications (
  id              INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  gig_id          INT UNSIGNED  NOT NULL,
  freelancer_name VARCHAR(100)  NOT NULL,
  proposal        TEXT          NOT NULL,
  proposed_rate   DECIMAL(10,2) NOT NULL CHECK (proposed_rate > 0),
  status          ENUM('Pending','Accepted','Rejected') NOT NULL DEFAULT 'Pending',
  created_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_applications_gig
    FOREIGN KEY (gig_id) REFERENCES gigs(id) ON DELETE CASCADE,
  INDEX idx_applications_gig (gig_id),
  INDEX idx_applications_created (created_at)
) ENGINE=InnoDB;