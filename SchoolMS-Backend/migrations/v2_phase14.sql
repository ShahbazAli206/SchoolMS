-- ============================================================
-- Phase 14 Migration — Principal role + ClassTeacher pivot + Complaint tagging
-- Run this against an existing v1 database to upgrade in place.
-- Idempotent — safe to re-run.
-- ============================================================

-- 1. Add 'principal' to users.role enum
ALTER TABLE `users`
  MODIFY COLUMN `role`
    ENUM('admin','principal','staff','teacher','student','parent')
    NOT NULL DEFAULT 'student';

INSERT IGNORE INTO `roles` (`name`, `description`)
  VALUES ('principal', 'School principal');

-- 2. New class_teachers pivot table
CREATE TABLE IF NOT EXISTS `class_teachers` (
  `id`         INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  `class_id`   INT UNSIGNED    NOT NULL,
  `teacher_id` INT UNSIGNED    NOT NULL,
  `subject_id` INT UNSIGNED    NULL,
  `role`       ENUM('class_teacher','subject_teacher') NOT NULL DEFAULT 'subject_teacher',
  `is_active`  TINYINT(1)      NOT NULL DEFAULT 1,
  `created_at` DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_class_teacher_subject_role` (`class_id`, `teacher_id`, `subject_id`, `role`),
  KEY `idx_class_teachers_class_id`   (`class_id`),
  KEY `idx_class_teachers_teacher_id` (`teacher_id`),
  KEY `idx_class_teachers_subject_id` (`subject_id`),
  CONSTRAINT `fk_class_teachers_class`   FOREIGN KEY (`class_id`)   REFERENCES `classes`  (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_class_teachers_teacher` FOREIGN KEY (`teacher_id`) REFERENCES `users`    (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_class_teachers_subject` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Extend complaints table with tagging + teacher→parent direction
-- Add new columns only if they don't already exist
SET @col_submitter := (SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'complaints' AND COLUMN_NAME = 'submitter_id');
SET @sql := IF(@col_submitter = 0,
  'ALTER TABLE `complaints` ADD COLUMN `submitter_id` INT UNSIGNED NULL AFTER `id`',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Backfill submitter_id from parent_id for existing rows
UPDATE `complaints` SET `submitter_id` = `parent_id` WHERE `submitter_id` IS NULL;

-- Make submitter_id NOT NULL once backfilled
ALTER TABLE `complaints` MODIFY COLUMN `submitter_id` INT UNSIGNED NOT NULL;

-- Make parent_id nullable (it was the old "submitter" but now optional)
ALTER TABLE `complaints` MODIFY COLUMN `parent_id` INT UNSIGNED NULL;

SET @col_type := (SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'complaints' AND COLUMN_NAME = 'complaint_type');
SET @sql := IF(@col_type = 0,
  "ALTER TABLE `complaints` ADD COLUMN `complaint_type` ENUM('parent_to_school','teacher_to_parent') NOT NULL DEFAULT 'parent_to_school' AFTER `student_id`",
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_role := (SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'complaints' AND COLUMN_NAME = 'tagged_role');
SET @sql := IF(@col_role = 0,
  "ALTER TABLE `complaints` ADD COLUMN `tagged_role` ENUM('admin','principal','staff','teacher','parent') NULL AFTER `complaint_type`",
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_tagged := (SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'complaints' AND COLUMN_NAME = 'tagged_user_id');
SET @sql := IF(@col_tagged = 0,
  'ALTER TABLE `complaints` ADD COLUMN `tagged_user_id` INT UNSIGNED NULL AFTER `tagged_role`',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_target := (SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'complaints' AND COLUMN_NAME = 'target_parent_id');
SET @sql := IF(@col_target = 0,
  'ALTER TABLE `complaints` ADD COLUMN `target_parent_id` INT UNSIGNED NULL AFTER `tagged_user_id`',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Indexes (idempotent)
SET @idx_submitter := (SELECT COUNT(*) FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'complaints' AND INDEX_NAME = 'idx_complaints_submitter_id');
SET @sql := IF(@idx_submitter = 0,
  'ALTER TABLE `complaints` ADD INDEX `idx_complaints_submitter_id` (`submitter_id`)',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_type := (SELECT COUNT(*) FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'complaints' AND INDEX_NAME = 'idx_complaints_type');
SET @sql := IF(@idx_type = 0,
  'ALTER TABLE `complaints` ADD INDEX `idx_complaints_type` (`complaint_type`)',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_role := (SELECT COUNT(*) FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'complaints' AND INDEX_NAME = 'idx_complaints_tagged_role');
SET @sql := IF(@idx_role = 0,
  'ALTER TABLE `complaints` ADD INDEX `idx_complaints_tagged_role` (`tagged_role`)',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_tagged := (SELECT COUNT(*) FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'complaints' AND INDEX_NAME = 'idx_complaints_tagged_user');
SET @sql := IF(@idx_tagged = 0,
  'ALTER TABLE `complaints` ADD INDEX `idx_complaints_tagged_user` (`tagged_user_id`)',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_target := (SELECT COUNT(*) FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'complaints' AND INDEX_NAME = 'idx_complaints_target_parent');
SET @sql := IF(@idx_target = 0,
  'ALTER TABLE `complaints` ADD INDEX `idx_complaints_target_parent` (`target_parent_id`)',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 4. events table for scheduled announcements (holidays, exams, PTM, etc.)
CREATE TABLE IF NOT EXISTS `events` (
  `id`          INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  `title`       VARCHAR(200)    NOT NULL,
  `description` TEXT            NULL,
  `event_type`  ENUM('holiday','exam','meeting','event','reminder','other') NOT NULL DEFAULT 'event',
  `audience`    ENUM('all','students','teachers','parents','staff') NOT NULL DEFAULT 'all',
  `start_date`  DATETIME        NOT NULL,
  `end_date`    DATETIME        NULL,
  `location`    VARCHAR(200)    NULL,
  `is_active`   TINYINT(1)      NOT NULL DEFAULT 1,
  `created_by`  INT UNSIGNED    NULL,
  `created_at`  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_events_type`       (`event_type`),
  KEY `idx_events_audience`   (`audience`),
  KEY `idx_events_start_date` (`start_date`),
  KEY `idx_events_active`     (`is_active`),
  CONSTRAINT `fk_events_creator` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
