-- ============================================================
-- SchoolMS — Complete Database Schema
-- MySQL 8.0+
-- Run this file on a fresh database to create all tables.
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = 'STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- ============================================================
-- 1. roles
-- ============================================================
CREATE TABLE IF NOT EXISTS `roles` (
  `id`          INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  `name`        VARCHAR(50)     NOT NULL,
  `description` VARCHAR(255)    NULL,
  `created_at`  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_roles_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO `roles` (`name`, `description`) VALUES
  ('admin',   'Full system access'),
  ('staff',   'School staff member'),
  ('teacher', 'Class teacher'),
  ('student', 'Enrolled student'),
  ('parent',  'Parent or guardian');

-- ============================================================
-- 2. users
-- ============================================================
CREATE TABLE IF NOT EXISTS `users` (
  `id`                  INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  `name`                VARCHAR(100)    NOT NULL,
  `email`               VARCHAR(150)    NULL,
  `phone`               VARCHAR(20)     NULL,
  `username`            VARCHAR(50)     NULL,
  `password`            VARCHAR(255)    NOT NULL,
  `role`                ENUM('admin','staff','teacher','student','parent') NOT NULL DEFAULT 'student',
  `is_active`           TINYINT(1)      NOT NULL DEFAULT 1,
  `fcm_token`           TEXT            NULL,
  `profile_image`       VARCHAR(500)    NULL,
  `last_login_at`       DATETIME        NULL,
  `last_login_device`   VARCHAR(255)    NULL,
  `created_at`          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_users_email`    (`email`),
  UNIQUE KEY `uq_users_phone`    (`phone`),
  UNIQUE KEY `uq_users_username` (`username`),
  KEY `idx_users_role`           (`role`),
  KEY `idx_users_is_active`      (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 3. sessions
-- ============================================================
CREATE TABLE IF NOT EXISTS `sessions` (
  `id`              INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  `user_id`         INT UNSIGNED    NOT NULL,
  `refresh_token`   VARCHAR(512)    NOT NULL,
  `device_info`     VARCHAR(255)    NULL,
  `ip_address`      VARCHAR(45)     NULL,
  `expires_at`      DATETIME        NOT NULL,
  `is_active`       TINYINT(1)      NOT NULL DEFAULT 1,
  `created_at`      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_sessions_user_id`       (`user_id`),
  KEY `idx_sessions_refresh_token` (`refresh_token`(64)),
  CONSTRAINT `fk_sessions_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 4. otp_verifications
-- ============================================================
CREATE TABLE IF NOT EXISTS `otp_verifications` (
  `id`          INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  `user_id`     INT UNSIGNED    NOT NULL,
  `otp`         VARCHAR(10)     NOT NULL,
  `type`        ENUM('login','password_reset','registration') NOT NULL DEFAULT 'login',
  `expires_at`  DATETIME        NOT NULL,
  `used`        TINYINT(1)      NOT NULL DEFAULT 0,
  `created_at`  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_otp_user_id`    (`user_id`),
  KEY `idx_otp_expires_at` (`expires_at`),
  CONSTRAINT `fk_otp_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 5. classes
-- ============================================================
CREATE TABLE IF NOT EXISTS `classes` (
  `id`           INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  `name`         VARCHAR(100)    NOT NULL,
  `section`      VARCHAR(10)     NULL,
  `academic_year`VARCHAR(10)     NOT NULL,
  `teacher_id`   INT UNSIGNED    NULL  COMMENT 'class teacher',
  `created_at`   DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`   DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_classes_teacher_id` (`teacher_id`),
  CONSTRAINT `fk_classes_teacher` FOREIGN KEY (`teacher_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 6. parents  (must come before students)
-- ============================================================
CREATE TABLE IF NOT EXISTS `parents` (
  `id`           INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  `user_id`      INT UNSIGNED    NOT NULL,
  `occupation`   VARCHAR(100)    NULL,
  `address`      TEXT            NULL,
  `created_at`   DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`   DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_parents_user_id` (`user_id`),
  CONSTRAINT `fk_parents_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 7. students
-- ============================================================
CREATE TABLE IF NOT EXISTS `students` (
  `id`            INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  `user_id`       INT UNSIGNED    NOT NULL,
  `class_id`      INT UNSIGNED    NULL,
  `parent_id`     INT UNSIGNED    NULL,
  `roll_number`   VARCHAR(30)     NULL,
  `date_of_birth` DATE            NULL,
  `gender`        ENUM('male','female','other') NULL,
  `address`       TEXT            NULL,
  `created_at`    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_students_user_id`   (`user_id`),
  KEY `idx_students_class_id`        (`class_id`),
  KEY `idx_students_parent_id`       (`parent_id`),
  CONSTRAINT `fk_students_user`  FOREIGN KEY (`user_id`)  REFERENCES `users`   (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_students_class` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_students_parent` FOREIGN KEY (`parent_id`) REFERENCES `parents` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 8. teachers
-- ============================================================
CREATE TABLE IF NOT EXISTS `teachers` (
  `id`             INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  `user_id`        INT UNSIGNED    NOT NULL,
  `qualification`  VARCHAR(150)    NULL,
  `specialization` VARCHAR(150)    NULL,
  `joining_date`   DATE            NULL,
  `created_at`     DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`     DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_teachers_user_id` (`user_id`),
  CONSTRAINT `fk_teachers_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 9. parent_student_mapping  (many-to-many)
-- ============================================================
CREATE TABLE IF NOT EXISTS `parent_student_mapping` (
  `id`            INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  `parent_id`     INT UNSIGNED    NOT NULL,
  `student_id`    INT UNSIGNED    NOT NULL,
  `relationship`  ENUM('father','mother','guardian','other') NOT NULL DEFAULT 'guardian',
  `is_primary`    TINYINT(1)      NOT NULL DEFAULT 0,
  `created_at`    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_parent_student`       (`parent_id`, `student_id`),
  KEY `idx_psm_parent_id`              (`parent_id`),
  KEY `idx_psm_student_id`             (`student_id`),
  CONSTRAINT `fk_psm_parent`  FOREIGN KEY (`parent_id`)  REFERENCES `parents`  (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_psm_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 10. subjects
-- ============================================================
CREATE TABLE IF NOT EXISTS `subjects` (
  `id`          INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  `name`        VARCHAR(100)    NOT NULL,
  `code`        VARCHAR(20)     NULL,
  `class_id`    INT UNSIGNED    NULL,
  `teacher_id`  INT UNSIGNED    NULL,
  `created_at`  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_subjects_class_id`   (`class_id`),
  KEY `idx_subjects_teacher_id` (`teacher_id`),
  CONSTRAINT `fk_subjects_class`   FOREIGN KEY (`class_id`)   REFERENCES `classes` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_subjects_teacher` FOREIGN KEY (`teacher_id`) REFERENCES `users`   (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 11. assignments
-- ============================================================
CREATE TABLE IF NOT EXISTS `assignments` (
  `id`           INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  `title`        VARCHAR(200)    NOT NULL,
  `description`  TEXT            NULL,
  `teacher_id`   INT UNSIGNED    NOT NULL,
  `class_id`     INT UNSIGNED    NULL  COMMENT 'null = individual assignment',
  `student_id`   INT UNSIGNED    NULL  COMMENT 'null = whole-class assignment',
  `subject_id`   INT UNSIGNED    NULL,
  `due_date`     DATETIME        NOT NULL,
  `file_url`     VARCHAR(500)    NULL,
  `created_at`   DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`   DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_assignments_teacher_id` (`teacher_id`),
  KEY `idx_assignments_class_id`   (`class_id`),
  KEY `idx_assignments_student_id` (`student_id`),
  KEY `idx_assignments_due_date`   (`due_date`),
  CONSTRAINT `fk_assignments_teacher` FOREIGN KEY (`teacher_id`) REFERENCES `users`     (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_assignments_class`   FOREIGN KEY (`class_id`)   REFERENCES `classes`   (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_assignments_student` FOREIGN KEY (`student_id`) REFERENCES `students`  (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_assignments_subject` FOREIGN KEY (`subject_id`) REFERENCES `subjects`  (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 12. materials
-- ============================================================
CREATE TABLE IF NOT EXISTS `materials` (
  `id`          INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  `title`       VARCHAR(200)    NOT NULL,
  `description` TEXT            NULL,
  `file_url`    VARCHAR(500)    NOT NULL,
  `file_type`   ENUM('pdf','video','image','document','other') NOT NULL DEFAULT 'document',
  `file_size`   INT UNSIGNED    NULL COMMENT 'bytes',
  `teacher_id`  INT UNSIGNED    NOT NULL,
  `class_id`    INT UNSIGNED    NULL,
  `subject_id`  INT UNSIGNED    NULL,
  `created_at`  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_materials_teacher_id` (`teacher_id`),
  KEY `idx_materials_class_id`   (`class_id`),
  CONSTRAINT `fk_materials_teacher` FOREIGN KEY (`teacher_id`) REFERENCES `users`    (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_materials_class`   FOREIGN KEY (`class_id`)   REFERENCES `classes`  (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_materials_subject` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 13. marks
-- ============================================================
CREATE TABLE IF NOT EXISTS `marks` (
  `id`            INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  `student_id`    INT UNSIGNED    NOT NULL,
  `subject_id`    INT UNSIGNED    NOT NULL,
  `teacher_id`    INT UNSIGNED    NOT NULL,
  `exam_type`     ENUM('midterm','final','quiz','assignment','practical','other') NOT NULL DEFAULT 'other',
  `marks_obtained`DECIMAL(6,2)    NOT NULL,
  `total_marks`   DECIMAL(6,2)    NOT NULL,
  `remarks`       TEXT            NULL,
  `created_at`    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_marks_student_subject_exam` (`student_id`, `subject_id`, `exam_type`),
  KEY `idx_marks_student_id` (`student_id`),
  KEY `idx_marks_subject_id` (`subject_id`),
  CONSTRAINT `fk_marks_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_marks_subject` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_marks_teacher` FOREIGN KEY (`teacher_id`) REFERENCES `users`    (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 14. attendance
-- ============================================================
CREATE TABLE IF NOT EXISTS `attendance` (
  `id`          INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  `student_id`  INT UNSIGNED    NOT NULL,
  `class_id`    INT UNSIGNED    NOT NULL,
  `teacher_id`  INT UNSIGNED    NOT NULL,
  `date`        DATE            NOT NULL,
  `status`      ENUM('present','absent','late','excused') NOT NULL DEFAULT 'present',
  `remarks`     TEXT            NULL,
  `created_at`  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_attendance_student_date` (`student_id`, `date`),
  KEY `idx_attendance_student_id` (`student_id`),
  KEY `idx_attendance_class_id`   (`class_id`),
  KEY `idx_attendance_date`       (`date`),
  CONSTRAINT `fk_attendance_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_attendance_class`   FOREIGN KEY (`class_id`)   REFERENCES `classes`  (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_attendance_teacher` FOREIGN KEY (`teacher_id`) REFERENCES `users`    (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 15. fees
-- ============================================================
CREATE TABLE IF NOT EXISTS `fees` (
  `id`            INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  `title`         VARCHAR(200)    NOT NULL,
  `fee_type`      ENUM('tuition','transport','exam','library','sports','other') NOT NULL DEFAULT 'tuition',
  `amount`        DECIMAL(10,2)   NOT NULL,
  `due_date`      DATE            NOT NULL,
  `class_id`      INT UNSIGNED    NULL COMMENT 'null = individual fee',
  `student_id`    INT UNSIGNED    NULL COMMENT 'null = class-wide fee',
  `academic_year` VARCHAR(10)     NOT NULL,
  `month`         VARCHAR(20)     NULL,
  `is_recurring`  TINYINT(1)      NOT NULL DEFAULT 0,
  `created_at`    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_fees_class_id`   (`class_id`),
  KEY `idx_fees_student_id` (`student_id`),
  KEY `idx_fees_due_date`   (`due_date`),
  CONSTRAINT `fk_fees_class`   FOREIGN KEY (`class_id`)   REFERENCES `classes`  (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_fees_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 16. payments
-- ============================================================
CREATE TABLE IF NOT EXISTS `payments` (
  `id`              INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  `fee_id`          INT UNSIGNED    NOT NULL,
  `student_id`      INT UNSIGNED    NOT NULL,
  `amount_paid`     DECIMAL(10,2)   NOT NULL,
  `paid_date`       DATE            NOT NULL,
  `payment_method`  ENUM('cash','bank_transfer','online','cheque','other') NOT NULL DEFAULT 'cash',
  `reference_no`    VARCHAR(100)    NULL,
  `remarks`         TEXT            NULL,
  `collected_by`    INT UNSIGNED    NULL COMMENT 'admin user id',
  `status`          ENUM('paid','partial','refunded') NOT NULL DEFAULT 'paid',
  `created_at`      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_payments_fee_id`     (`fee_id`),
  KEY `idx_payments_student_id` (`student_id`),
  KEY `idx_payments_paid_date`  (`paid_date`),
  CONSTRAINT `fk_payments_fee`       FOREIGN KEY (`fee_id`)       REFERENCES `fees`     (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_payments_student`   FOREIGN KEY (`student_id`)   REFERENCES `students` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_payments_collector` FOREIGN KEY (`collected_by`) REFERENCES `users`    (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 17. notifications
-- ============================================================
CREATE TABLE IF NOT EXISTS `notifications` (
  `id`            INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  `recipient_id`  INT UNSIGNED    NOT NULL,
  `sender_id`     INT UNSIGNED    NULL,
  `title`         VARCHAR(200)    NOT NULL,
  `body`          TEXT            NOT NULL,
  `type`          ENUM('assignment','fee','attendance','marks','general','announcement') NOT NULL DEFAULT 'general',
  `data`          JSON            NULL,
  `is_read`       TINYINT(1)      NOT NULL DEFAULT 0,
  `read_at`       DATETIME        NULL,
  `created_at`    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_notifications_recipient_id`       (`recipient_id`),
  KEY `idx_notifications_recipient_is_read`  (`recipient_id`, `is_read`),
  CONSTRAINT `fk_notifications_recipient` FOREIGN KEY (`recipient_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 18. complaints
-- ============================================================
CREATE TABLE IF NOT EXISTS `complaints` (
  `id`           INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  `parent_id`    INT UNSIGNED    NOT NULL,
  `student_id`   INT UNSIGNED    NULL,
  `title`        VARCHAR(200)    NOT NULL,
  `description`  TEXT            NOT NULL,
  `image_url`    VARCHAR(500)    NULL,
  `status`       ENUM('pending','in_review','resolved','rejected') NOT NULL DEFAULT 'pending',
  `admin_reply`  TEXT            NULL,
  `resolved_by`  INT UNSIGNED    NULL,
  `resolved_at`  DATETIME        NULL,
  `created_at`   DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`   DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_complaints_parent_id`  (`parent_id`),
  KEY `idx_complaints_student_id` (`student_id`),
  KEY `idx_complaints_status`     (`status`),
  CONSTRAINT `fk_complaints_parent`   FOREIGN KEY (`parent_id`)   REFERENCES `users`    (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_complaints_student`  FOREIGN KEY (`student_id`)  REFERENCES `students` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_complaints_resolver` FOREIGN KEY (`resolved_by`) REFERENCES `users`    (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 19. conversations  (chats)
-- ============================================================
CREATE TABLE IF NOT EXISTS `conversations` (
  `id`          INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  `type`        ENUM('direct','group') NOT NULL DEFAULT 'direct',
  `name`        VARCHAR(150)    NULL COMMENT 'group name only',
  `created_by`  INT UNSIGNED    NOT NULL,
  `created_at`  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_conversations_created_by` (`created_by`),
  CONSTRAINT `fk_conversations_creator` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 20. conversation_participants
-- ============================================================
CREATE TABLE IF NOT EXISTS `conversation_participants` (
  `id`              INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  `conversation_id` INT UNSIGNED    NOT NULL,
  `user_id`         INT UNSIGNED    NOT NULL,
  `joined_at`       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_conv_participant`         (`conversation_id`, `user_id`),
  KEY `idx_conv_participants_user_id`      (`user_id`),
  CONSTRAINT `fk_cp_conversation` FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_cp_user`         FOREIGN KEY (`user_id`)         REFERENCES `users`         (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 21. messages
-- ============================================================
CREATE TABLE IF NOT EXISTS `messages` (
  `id`              INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  `conversation_id` INT UNSIGNED    NOT NULL,
  `sender_id`       INT UNSIGNED    NOT NULL,
  `body`            TEXT            NULL,
  `type`            ENUM('text','image','file') NOT NULL DEFAULT 'text',
  `attachment_url`  VARCHAR(500)    NULL,
  `read_by`         JSON            NULL COMMENT '{userId: ISODateString}',
  `created_at`      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_messages_conversation_id`      (`conversation_id`),
  KEY `idx_messages_conv_created_at`      (`conversation_id`, `created_at`),
  KEY `idx_messages_sender_id`            (`sender_id`),
  CONSTRAINT `fk_messages_conversation` FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_messages_sender`        FOREIGN KEY (`sender_id`)       REFERENCES `users`         (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Re-enable FK checks
-- ============================================================
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- Summary of tables created:
--  1.  roles
--  2.  users
--  3.  sessions
--  4.  otp_verifications
--  5.  classes
--  6.  students
--  7.  teachers
--  8.  parents
--  9.  parent_student_mapping
-- 10.  subjects
-- 11.  assignments
-- 12.  materials
-- 13.  marks
-- 14.  attendance
-- 15.  fees
-- 16.  payments
-- 17.  notifications
-- 18.  complaints
-- 19.  conversations
-- 20.  conversation_participants
-- 21.  messages
-- ============================================================
