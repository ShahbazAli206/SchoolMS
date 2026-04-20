-- =============================================================
--  SchoolMS  —  Complete Database Schema
--  Compatible with: MySQL 8.0+
--  All phases included (Phase 1–10)
-- =============================================================

CREATE DATABASE IF NOT EXISTS school_management_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE school_management_db;

-- ─────────────────────────────────────────────────────────────
--  CORE TABLES
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS roles (
  id          INT PRIMARY KEY AUTO_INCREMENT,
  name        VARCHAR(50) NOT NULL UNIQUE,   -- admin, teacher, student, parent, staff
  description TEXT,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_role_name (name)
);

CREATE TABLE IF NOT EXISTS users (
  id                   INT PRIMARY KEY AUTO_INCREMENT,
  name                 VARCHAR(100) NOT NULL,
  email                VARCHAR(150) UNIQUE,
  phone                VARCHAR(20) UNIQUE,
  username             VARCHAR(50) UNIQUE,
  password             VARCHAR(255) NOT NULL,
  role                 ENUM('admin','teacher','student','parent','staff') NOT NULL DEFAULT 'student',
  is_active            BOOLEAN NOT NULL DEFAULT TRUE,
  fcm_token            TEXT,
  profile_image        VARCHAR(500),
  last_login_at        DATETIME,
  last_login_device    VARCHAR(255),
  created_at           DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at           DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user_email  (email),
  INDEX idx_user_phone  (phone),
  INDEX idx_user_role   (role),
  INDEX idx_user_active (is_active)
);

CREATE TABLE IF NOT EXISTS sessions (
  id            INT PRIMARY KEY AUTO_INCREMENT,
  user_id       INT NOT NULL,
  refresh_token TEXT NOT NULL,
  device_info   VARCHAR(255),
  ip_address    VARCHAR(45),
  expires_at    DATETIME NOT NULL,
  is_active     BOOLEAN DEFAULT TRUE,
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_session_user    (user_id),
  INDEX idx_session_active  (is_active),
  INDEX idx_session_expires (expires_at)
);

CREATE TABLE IF NOT EXISTS password_resets (
  id         INT PRIMARY KEY AUTO_INCREMENT,
  email      VARCHAR(150) NOT NULL,
  otp        VARCHAR(6) NOT NULL,
  is_used    BOOLEAN DEFAULT FALSE,
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_pr_email   (email),
  INDEX idx_pr_expires (expires_at)
);

CREATE TABLE IF NOT EXISTS otp_verifications (
  id           INT PRIMARY KEY AUTO_INCREMENT,
  identifier   VARCHAR(150) NOT NULL,
  otp          VARCHAR(6) NOT NULL,
  type         ENUM('email','sms') DEFAULT 'email',
  purpose      ENUM('login','new_device','forgot_password') DEFAULT 'login',
  resend_count INT DEFAULT 0,
  is_verified  BOOLEAN DEFAULT FALSE,
  expires_at   DATETIME NOT NULL,
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_otp_identifier (identifier),
  INDEX idx_otp_expires    (expires_at)
);

-- ─────────────────────────────────────────────────────────────
--  ACADEMIC STRUCTURE
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS classes (
  id         INT PRIMARY KEY AUTO_INCREMENT,
  name       VARCHAR(100) NOT NULL,
  section    VARCHAR(10),
  grade      VARCHAR(20),
  teacher_id INT,
  is_active  BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_class_teacher (teacher_id)
);

CREATE TABLE IF NOT EXISTS subjects (
  id         INT PRIMARY KEY AUTO_INCREMENT,
  name       VARCHAR(100) NOT NULL,
  code       VARCHAR(20) UNIQUE,
  class_id   INT,
  teacher_id INT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
  FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS students (
  id           INT PRIMARY KEY AUTO_INCREMENT,
  user_id      INT NOT NULL UNIQUE,
  class_id     INT,
  roll_number  VARCHAR(20) UNIQUE,
  admission_no VARCHAR(30) UNIQUE,
  date_of_birth DATE,
  address      TEXT,
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE SET NULL,
  INDEX idx_student_class (class_id)
);

CREATE TABLE IF NOT EXISTS teachers (
  id              INT PRIMARY KEY AUTO_INCREMENT,
  user_id         INT NOT NULL UNIQUE,
  employee_id     VARCHAR(30) UNIQUE,
  qualification   VARCHAR(200),
  specialization  VARCHAR(200),
  joining_date    DATE,
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS parents (
  id         INT PRIMARY KEY AUTO_INCREMENT,
  user_id    INT NOT NULL UNIQUE,
  occupation VARCHAR(100),
  address    TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS parent_student_mapping (
  id         INT PRIMARY KEY AUTO_INCREMENT,
  parent_id  INT NOT NULL,
  student_id INT NOT NULL,
  relation   VARCHAR(50) DEFAULT 'parent',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_parent_student (parent_id, student_id),
  FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- ─────────────────────────────────────────────────────────────
--  ACADEMIC ACTIVITY TABLES
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS materials (
  id          INT PRIMARY KEY AUTO_INCREMENT,
  title       VARCHAR(200) NOT NULL,
  description TEXT,
  file_url    VARCHAR(500) NOT NULL,
  file_type   ENUM('pdf','video','image','document') NOT NULL,
  file_size   INT,
  teacher_id  INT NOT NULL,
  class_id    INT,
  subject_id  INT,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE SET NULL,
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE SET NULL,
  INDEX idx_material_class (class_id),
  INDEX idx_material_teacher (teacher_id)
);

CREATE TABLE IF NOT EXISTS assignments (
  id           INT PRIMARY KEY AUTO_INCREMENT,
  title        VARCHAR(200) NOT NULL,
  description  TEXT,
  file_url     VARCHAR(500),
  teacher_id   INT NOT NULL,
  class_id     INT,
  student_id   INT,             -- NULL means whole class
  subject_id   INT,
  due_date     DATETIME NOT NULL,
  max_marks    DECIMAL(5,2) DEFAULT 100,
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE SET NULL,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE SET NULL,
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE SET NULL,
  INDEX idx_assignment_class   (class_id),
  INDEX idx_assignment_student (student_id),
  INDEX idx_assignment_due     (due_date)
);

CREATE TABLE IF NOT EXISTS marks (
  id           INT PRIMARY KEY AUTO_INCREMENT,
  student_id   INT NOT NULL,
  subject_id   INT NOT NULL,
  teacher_id   INT NOT NULL,
  exam_type    ENUM('unit_test','mid_term','final','assignment','quiz') NOT NULL,
  marks        DECIMAL(5,2) NOT NULL,
  max_marks    DECIMAL(5,2) NOT NULL DEFAULT 100,
  remarks      TEXT,
  exam_date    DATE,
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
  FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_marks_student (student_id),
  INDEX idx_marks_subject (subject_id)
);

CREATE TABLE IF NOT EXISTS attendance (
  id         INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  class_id   INT NOT NULL,
  teacher_id INT NOT NULL,
  date       DATE NOT NULL,
  status     ENUM('present','absent','late','excused') NOT NULL DEFAULT 'present',
  remarks    TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_attendance (student_id, date),
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
  FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_attendance_date    (date),
  INDEX idx_attendance_student (student_id)
);

-- ─────────────────────────────────────────────────────────────
--  FEES MANAGEMENT
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS fees (
  id           INT PRIMARY KEY AUTO_INCREMENT,
  name         VARCHAR(150) NOT NULL,
  amount       DECIMAL(10,2) NOT NULL,
  fee_type     ENUM('monthly','quarterly','annual','one_time') NOT NULL,
  class_id     INT,
  due_day      INT,              -- Day of month when fee is due
  description  TEXT,
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS payments (
  id             INT PRIMARY KEY AUTO_INCREMENT,
  student_id     INT NOT NULL,
  fee_id         INT NOT NULL,
  amount_paid    DECIMAL(10,2) NOT NULL,
  payment_date   DATETIME NOT NULL,
  payment_method ENUM('cash','bank_transfer','online','cheque') NOT NULL DEFAULT 'cash',
  status         ENUM('pending','paid','overdue','partial') NOT NULL DEFAULT 'pending',
  transaction_id VARCHAR(100),
  remarks        TEXT,
  recorded_by    INT,
  created_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (fee_id) REFERENCES fees(id) ON DELETE CASCADE,
  FOREIGN KEY (recorded_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_payment_student (student_id),
  INDEX idx_payment_status  (status),
  INDEX idx_payment_date    (payment_date)
);

-- ─────────────────────────────────────────────────────────────
--  NOTIFICATIONS
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS notifications (
  id           INT PRIMARY KEY AUTO_INCREMENT,
  title        VARCHAR(200) NOT NULL,
  body         TEXT NOT NULL,
  type         VARCHAR(50) NOT NULL,   -- fee_reminder, assignment, marks, general
  target_role  VARCHAR(20),            -- NULL = all roles
  target_user  INT,                    -- NULL = broadcast
  is_read      BOOLEAN DEFAULT FALSE,
  data         JSON,                   -- extra payload
  sent_at      DATETIME,
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (target_user) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_notification_user (target_user),
  INDEX idx_notification_read (is_read)
);

-- ─────────────────────────────────────────────────────────────
--  COMPLAINTS
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS complaints (
  id           INT PRIMARY KEY AUTO_INCREMENT,
  submitted_by INT NOT NULL,
  subject      VARCHAR(200) NOT NULL,
  description  TEXT NOT NULL,
  image_url    VARCHAR(500),
  status       ENUM('pending','in_review','resolved','closed') DEFAULT 'pending',
  assigned_to  INT,
  resolution   TEXT,
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (submitted_by) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_complaint_status (status),
  INDEX idx_complaint_user   (submitted_by)
);

-- ─────────────────────────────────────────────────────────────
--  CHAT SYSTEM
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS chats (
  id            INT PRIMARY KEY AUTO_INCREMENT,
  participant_1 INT NOT NULL,
  participant_2 INT NOT NULL,
  last_message  TEXT,
  last_msg_at   DATETIME,
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_chat_participants (participant_1, participant_2),
  FOREIGN KEY (participant_1) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (participant_2) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS messages (
  id          INT PRIMARY KEY AUTO_INCREMENT,
  chat_id     INT NOT NULL,
  sender_id   INT NOT NULL,
  content     TEXT,
  image_url   VARCHAR(500),
  msg_type    ENUM('text','image','file') DEFAULT 'text',
  is_read     BOOLEAN DEFAULT FALSE,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE,
  FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_message_chat   (chat_id),
  INDEX idx_message_sender (sender_id),
  INDEX idx_message_read   (is_read)
);

-- ─────────────────────────────────────────────────────────────
--  SEED DATA
-- ─────────────────────────────────────────────────────────────

INSERT IGNORE INTO roles (name, description) VALUES
  ('admin',   'Full system access'),
  ('teacher', 'Academic management'),
  ('student', 'Student portal'),
  ('parent',  'Parent portal'),
  ('staff',   'Administrative staff');

-- Default admin user (password: Admin@12345)
-- bcrypt hash of 'Admin@12345' with 12 rounds
INSERT IGNORE INTO users (name, email, username, password, role) VALUES
(
  'System Admin',
  'admin@schoolms.com',
  'admin',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj2FBGjXinvu',
  'admin'
);
