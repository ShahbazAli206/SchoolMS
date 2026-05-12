-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: school_management_db
-- ------------------------------------------------------
-- Server version	10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `school_management_db`
--

/*!40000 DROP DATABASE IF EXISTS `school_management_db`*/;

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `school_management_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci */;

USE `school_management_db`;

--
-- Table structure for table `assignments`
--

DROP TABLE IF EXISTS `assignments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `assignments` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(200) NOT NULL,
  `description` text DEFAULT NULL,
  `teacher_id` int(10) unsigned NOT NULL,
  `class_id` int(10) unsigned DEFAULT NULL COMMENT 'null = individual assignment',
  `student_id` int(10) unsigned DEFAULT NULL COMMENT 'null = whole-class assignment',
  `subject_id` int(10) unsigned DEFAULT NULL,
  `due_date` datetime NOT NULL,
  `max_marks` decimal(5,2) NOT NULL DEFAULT 100.00,
  `file_url` varchar(500) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_assignments_teacher_id` (`teacher_id`),
  KEY `idx_assignments_class_id` (`class_id`),
  KEY `idx_assignments_student_id` (`student_id`),
  KEY `idx_assignments_due_date` (`due_date`),
  KEY `fk_assignments_subject` (`subject_id`),
  CONSTRAINT `fk_assignments_class` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_assignments_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_assignments_subject` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_assignments_teacher` FOREIGN KEY (`teacher_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `assignments`
--

LOCK TABLES `assignments` WRITE;
/*!40000 ALTER TABLE `assignments` DISABLE KEYS */;
INSERT INTO `assignments` VALUES (1,'Algebra Practice Set 1','Solve problems from Chapter 3, Exercise 3.1-3.5. Show complete working.',1,1,NULL,1,'2026-04-25 00:00:00',100.00,NULL,'2026-04-24 12:00:39','2026-04-24 12:00:39'),(2,'Geometry Worksheet','Complete worksheet on triangles and quadrilaterals. Diagrams are required.',1,1,NULL,1,'2026-04-28 00:00:00',100.00,NULL,'2026-04-24 12:00:39','2026-04-24 12:00:39'),(3,'Laws of Motion Problems','Solve numerical problems from Chapter 4. Write all formulas before solving.',2,2,NULL,2,'2026-04-26 00:00:00',100.00,NULL,'2026-04-24 12:00:39','2026-04-24 12:00:39'),(4,'Essay: My Future Goals','Write a 500-word essay on your future career goals and how you plan to achieve them.',3,3,NULL,3,'2026-04-30 00:00:00',100.00,NULL,'2026-04-24 12:00:39','2026-04-24 12:00:39'),(5,'Grammar Exercise — Tenses','Complete all tense exercises in grammar workbook pages 45-52.',3,3,NULL,3,'2026-05-02 00:00:00',100.00,NULL,'2026-04-24 12:00:39','2026-04-24 12:00:39'),(6,'Test homework','Auto-generated',2,2,NULL,NULL,'2026-05-20 00:00:00',100.00,NULL,'2026-05-12 06:48:40','2026-05-12 06:48:40'),(7,'Ff','Hchcjf',2,2,NULL,2,'2026-07-12 00:00:00',100.00,NULL,'2026-05-12 06:49:01','2026-05-12 06:49:01'),(8,'Fufy','Fhffug',2,2,NULL,NULL,'2026-05-14 00:00:00',100.00,NULL,'2026-05-12 06:54:35','2026-05-12 06:54:35'),(9,'Chfydgjygigiyfkhkg','9 Class',2,2,NULL,NULL,'2026-05-12 00:00:00',100.00,NULL,'2026-05-12 06:55:09','2026-05-12 06:55:09'),(10,'Hfg','Vjuf',2,2,NULL,2,'2026-05-12 00:00:00',100.00,NULL,'2026-05-12 06:55:31','2026-05-12 06:55:31');
/*!40000 ALTER TABLE `assignments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `attendance`
--

DROP TABLE IF EXISTS `attendance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `attendance` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `student_id` int(10) unsigned NOT NULL,
  `class_id` int(10) unsigned NOT NULL,
  `teacher_id` int(10) unsigned NOT NULL,
  `date` date NOT NULL,
  `status` enum('present','absent','late','excused') NOT NULL DEFAULT 'present',
  `remarks` text DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_attendance_student_date` (`student_id`,`date`),
  KEY `idx_attendance_student_id` (`student_id`),
  KEY `idx_attendance_class_id` (`class_id`),
  KEY `idx_attendance_date` (`date`),
  KEY `fk_attendance_teacher` (`teacher_id`),
  CONSTRAINT `fk_attendance_class` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_attendance_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_attendance_teacher` FOREIGN KEY (`teacher_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `attendance`
--

LOCK TABLES `attendance` WRITE;
/*!40000 ALTER TABLE `attendance` DISABLE KEYS */;
INSERT INTO `attendance` VALUES (1,1,1,1,'2026-04-18','present',NULL,'2026-04-24 12:00:40','2026-04-24 12:00:40'),(2,2,1,1,'2026-04-18','present',NULL,'2026-04-24 12:00:40','2026-04-24 12:00:40'),(3,3,2,1,'2026-04-18','present',NULL,'2026-04-24 12:00:40','2026-04-24 12:00:40'),(4,4,2,1,'2026-04-18','present',NULL,'2026-04-24 12:00:40','2026-04-24 12:00:40'),(5,5,3,1,'2026-04-18','absent',NULL,'2026-04-24 12:00:40','2026-04-24 12:00:40'),(6,1,1,1,'2026-04-19','present',NULL,'2026-04-24 12:00:40','2026-04-24 12:00:40'),(7,2,1,1,'2026-04-19','present',NULL,'2026-04-24 12:00:40','2026-04-24 12:00:40'),(8,3,2,1,'2026-04-19','absent',NULL,'2026-04-24 12:00:40','2026-04-24 12:00:40'),(9,4,2,1,'2026-04-19','present',NULL,'2026-04-24 12:00:40','2026-04-24 12:00:40'),(10,5,3,1,'2026-04-19','present',NULL,'2026-04-24 12:00:40','2026-04-24 12:00:40'),(11,1,1,1,'2026-04-20','present',NULL,'2026-04-24 12:00:40','2026-04-24 12:00:40'),(12,2,1,1,'2026-04-20','absent',NULL,'2026-04-24 12:00:40','2026-04-24 12:00:40'),(13,3,2,1,'2026-04-20','present',NULL,'2026-04-24 12:00:40','2026-04-24 12:00:40'),(14,4,2,1,'2026-04-20','present',NULL,'2026-04-24 12:00:40','2026-04-24 12:00:40'),(15,5,3,1,'2026-04-20','present',NULL,'2026-04-24 12:00:40','2026-04-24 12:00:40'),(16,1,1,1,'2026-04-21','absent',NULL,'2026-04-24 12:00:40','2026-04-24 12:00:40'),(17,2,1,1,'2026-04-21','present',NULL,'2026-04-24 12:00:40','2026-04-24 12:00:40'),(18,3,2,1,'2026-04-21','present',NULL,'2026-04-24 12:00:40','2026-04-24 12:00:40'),(19,4,2,1,'2026-04-21','present',NULL,'2026-04-24 12:00:40','2026-04-24 12:00:40'),(20,5,3,1,'2026-04-21','present',NULL,'2026-04-24 12:00:40','2026-04-24 12:00:40'),(21,1,1,1,'2026-04-22','present',NULL,'2026-04-24 12:00:40','2026-04-24 12:00:40'),(22,2,1,1,'2026-04-22','present',NULL,'2026-04-24 12:00:40','2026-04-24 12:00:40'),(23,3,2,1,'2026-04-22','present',NULL,'2026-04-24 12:00:40','2026-04-24 12:00:40'),(24,4,2,1,'2026-04-22','present',NULL,'2026-04-24 12:00:40','2026-04-24 12:00:40'),(25,5,3,1,'2026-04-22','present',NULL,'2026-04-24 12:00:40','2026-04-24 12:00:40'),(26,1,1,1,'2026-04-23','present',NULL,'2026-04-24 12:00:40','2026-04-24 12:00:40'),(27,2,1,1,'2026-04-23','present',NULL,'2026-04-24 12:00:40','2026-04-24 12:00:40'),(28,3,2,1,'2026-04-23','absent',NULL,'2026-04-24 12:00:40','2026-04-24 12:00:40'),(29,4,2,1,'2026-04-23','present',NULL,'2026-04-24 12:00:40','2026-04-24 12:00:40'),(30,5,3,1,'2026-04-23','present',NULL,'2026-04-24 12:00:40','2026-04-24 12:00:40'),(31,1,1,1,'2026-04-24','present',NULL,'2026-04-24 12:00:40','2026-04-24 12:00:40'),(32,2,1,1,'2026-04-24','present',NULL,'2026-04-24 12:00:40','2026-04-24 12:00:40'),(33,3,2,1,'2026-04-24','present',NULL,'2026-04-24 12:00:40','2026-04-24 12:00:40'),(34,4,2,1,'2026-04-24','present',NULL,'2026-04-24 12:00:40','2026-04-24 12:00:40'),(35,5,3,1,'2026-04-24','present',NULL,'2026-04-24 12:00:40','2026-04-24 12:00:40');
/*!40000 ALTER TABLE `attendance` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `classes`
--

DROP TABLE IF EXISTS `classes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `classes` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `section` varchar(10) DEFAULT NULL,
  `grade` varchar(20) DEFAULT NULL,
  `academic_year` varchar(10) NOT NULL,
  `teacher_id` int(10) unsigned DEFAULT NULL COMMENT 'class teacher',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  KEY `idx_classes_teacher_id` (`teacher_id`),
  CONSTRAINT `fk_classes_teacher` FOREIGN KEY (`teacher_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `classes`
--

LOCK TABLES `classes` WRITE;
/*!40000 ALTER TABLE `classes` DISABLE KEYS */;
INSERT INTO `classes` VALUES (1,'Class 9','A','9','2025-2026',1,'2026-04-24 12:00:39','2026-05-12 10:29:22',1),(2,'Class 9','B','9','2025-2026',2,'2026-04-24 12:00:39','2026-05-12 10:29:22',1),(3,'Class 10','A','10','2025-2026',3,'2026-04-24 12:00:39','2026-05-12 10:29:22',1);
/*!40000 ALTER TABLE `classes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `complaints`
--

DROP TABLE IF EXISTS `complaints`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `complaints` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `parent_id` int(10) unsigned NOT NULL,
  `student_id` int(10) unsigned DEFAULT NULL,
  `title` varchar(200) NOT NULL,
  `description` text NOT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `status` enum('pending','in_review','resolved','rejected') NOT NULL DEFAULT 'pending',
  `admin_reply` text DEFAULT NULL,
  `resolved_by` int(10) unsigned DEFAULT NULL,
  `resolved_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_complaints_parent_id` (`parent_id`),
  KEY `idx_complaints_student_id` (`student_id`),
  KEY `idx_complaints_status` (`status`),
  KEY `fk_complaints_resolver` (`resolved_by`),
  CONSTRAINT `fk_complaints_parent` FOREIGN KEY (`parent_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_complaints_resolver` FOREIGN KEY (`resolved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_complaints_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `complaints`
--

LOCK TABLES `complaints` WRITE;
/*!40000 ALTER TABLE `complaints` DISABLE KEYS */;
INSERT INTO `complaints` VALUES (1,1,1,'School Bus Arriving Late','The school bus regularly arrives 15-20 minutes late in the morning, causing my child to miss the first period. This has been happening for the past 2 weeks and is affecting his studies.',NULL,'in_review','We have noted the issue and are coordinating with the transport department. Expect resolution by end of this week.',NULL,NULL,'2026-04-24 12:00:40','2026-04-24 12:00:40'),(2,2,3,'Excessive Homework Load','My child is getting 4-5 hours of homework daily across all subjects. This is severely affecting his sleep and health. I request a more balanced homework approach.',NULL,'pending',NULL,NULL,NULL,'2026-04-24 12:00:40','2026-04-24 12:00:40'),(3,3,5,'Request for Extra Physics Coaching','My son Hamza is struggling with Physics concepts. Can the school arrange extra help sessions or study groups for students who need additional academic support?',NULL,'resolved','Extra Physics coaching has been arranged every Tuesday and Thursday from 2-3 PM. Please ask Hamza to attend starting next week. We are happy to support our students.',NULL,NULL,'2026-04-24 12:00:40','2026-04-24 12:00:40');
/*!40000 ALTER TABLE `complaints` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `conversation_participants`
--

DROP TABLE IF EXISTS `conversation_participants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `conversation_participants` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `conversation_id` int(10) unsigned NOT NULL,
  `user_id` int(10) unsigned NOT NULL,
  `joined_at` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_conv_participant` (`conversation_id`,`user_id`),
  KEY `idx_conv_participants_user_id` (`user_id`),
  CONSTRAINT `fk_cp_conversation` FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_cp_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `conversation_participants`
--

LOCK TABLES `conversation_participants` WRITE;
/*!40000 ALTER TABLE `conversation_participants` DISABLE KEYS */;
INSERT INTO `conversation_participants` VALUES (1,1,10,'2026-04-24 12:00:40'),(2,1,2,'2026-04-24 12:00:40');
/*!40000 ALTER TABLE `conversation_participants` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `conversations`
--

DROP TABLE IF EXISTS `conversations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `conversations` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `type` enum('direct','group') NOT NULL DEFAULT 'direct',
  `name` varchar(150) DEFAULT NULL COMMENT 'group name only',
  `created_by` int(10) unsigned NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_conversations_created_by` (`created_by`),
  CONSTRAINT `fk_conversations_creator` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `conversations`
--

LOCK TABLES `conversations` WRITE;
/*!40000 ALTER TABLE `conversations` DISABLE KEYS */;
INSERT INTO `conversations` VALUES (1,'direct',NULL,10,'2026-04-24 12:00:40','2026-04-24 12:00:40');
/*!40000 ALTER TABLE `conversations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fees`
--

DROP TABLE IF EXISTS `fees`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `fees` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(200) NOT NULL,
  `fee_type` enum('tuition','transport','exam','library','sports','other') NOT NULL DEFAULT 'tuition',
  `amount` decimal(10,2) NOT NULL,
  `due_date` date NOT NULL,
  `class_id` int(10) unsigned DEFAULT NULL COMMENT 'null = individual fee',
  `student_id` int(10) unsigned DEFAULT NULL COMMENT 'null = class-wide fee',
  `academic_year` varchar(10) NOT NULL,
  `month` varchar(20) DEFAULT NULL,
  `is_recurring` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_fees_class_id` (`class_id`),
  KEY `idx_fees_student_id` (`student_id`),
  KEY `idx_fees_due_date` (`due_date`),
  CONSTRAINT `fk_fees_class` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_fees_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fees`
--

LOCK TABLES `fees` WRITE;
/*!40000 ALTER TABLE `fees` DISABLE KEYS */;
INSERT INTO `fees` VALUES (1,'Tuition Fee — April 2026','tuition',5000.00,'2026-04-15',1,NULL,'2025-2026','April',1,'2026-04-24 12:00:40','2026-04-24 12:00:40'),(2,'Exam Fee — Mid Term','exam',1500.00,'2026-04-20',1,NULL,'2025-2026','April',1,'2026-04-24 12:00:40','2026-04-24 12:00:40'),(3,'Tuition Fee — April 2026','tuition',5000.00,'2026-04-15',2,NULL,'2025-2026','April',1,'2026-04-24 12:00:40','2026-04-24 12:00:40'),(4,'Tuition Fee — April 2026','tuition',5000.00,'2026-04-15',3,NULL,'2025-2026','April',1,'2026-04-24 12:00:40','2026-04-24 12:00:40');
/*!40000 ALTER TABLE `fees` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `marks`
--

DROP TABLE IF EXISTS `marks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `marks` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `student_id` int(10) unsigned NOT NULL,
  `subject_id` int(10) unsigned NOT NULL,
  `teacher_id` int(10) unsigned NOT NULL,
  `exam_type` enum('midterm','final','quiz','assignment','practical','other') NOT NULL DEFAULT 'other',
  `marks_obtained` decimal(6,2) NOT NULL,
  `total_marks` decimal(6,2) NOT NULL,
  `remarks` text DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_marks_student_subject_exam` (`student_id`,`subject_id`,`exam_type`),
  KEY `idx_marks_student_id` (`student_id`),
  KEY `idx_marks_subject_id` (`subject_id`),
  KEY `fk_marks_teacher` (`teacher_id`),
  CONSTRAINT `fk_marks_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_marks_subject` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_marks_teacher` FOREIGN KEY (`teacher_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `marks`
--

LOCK TABLES `marks` WRITE;
/*!40000 ALTER TABLE `marks` DISABLE KEYS */;
INSERT INTO `marks` VALUES (1,1,1,1,'midterm',78.00,100.00,NULL,'2026-04-24 12:00:40','2026-04-24 12:00:40'),(2,1,2,1,'midterm',82.00,100.00,NULL,'2026-04-24 12:00:40','2026-04-24 12:00:40'),(3,1,3,1,'midterm',88.00,100.00,NULL,'2026-04-24 12:00:40','2026-04-24 12:00:40'),(4,2,1,1,'midterm',92.00,100.00,NULL,'2026-04-24 12:00:40','2026-04-24 12:00:40'),(5,2,2,1,'midterm',85.00,100.00,NULL,'2026-04-24 12:00:40','2026-04-24 12:00:40'),(6,2,3,1,'midterm',90.00,100.00,NULL,'2026-04-24 12:00:40','2026-04-24 12:00:40'),(7,3,1,1,'midterm',65.00,100.00,NULL,'2026-04-24 12:00:40','2026-04-24 12:00:40'),(8,3,2,1,'midterm',70.00,100.00,NULL,'2026-04-24 12:00:40','2026-04-24 12:00:40'),(9,3,3,1,'midterm',72.00,100.00,NULL,'2026-04-24 12:00:40','2026-04-24 12:00:40'),(10,4,1,1,'midterm',95.00,100.00,NULL,'2026-04-24 12:00:40','2026-04-24 12:00:40'),(11,4,2,1,'midterm',91.00,100.00,NULL,'2026-04-24 12:00:40','2026-04-24 12:00:40'),(12,4,3,1,'midterm',88.00,100.00,NULL,'2026-04-24 12:00:40','2026-04-24 12:00:40'),(13,5,1,1,'midterm',74.00,100.00,NULL,'2026-04-24 12:00:40','2026-04-24 12:00:40'),(14,5,2,1,'midterm',68.00,100.00,NULL,'2026-04-24 12:00:40','2026-04-24 12:00:40'),(15,5,3,1,'midterm',80.00,100.00,NULL,'2026-04-24 12:00:40','2026-04-24 12:00:40');
/*!40000 ALTER TABLE `marks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `materials`
--

DROP TABLE IF EXISTS `materials`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `materials` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(200) NOT NULL,
  `description` text DEFAULT NULL,
  `file_url` varchar(500) NOT NULL,
  `file_name` varchar(255) DEFAULT NULL,
  `file_type` enum('pdf','video','image','document','other') NOT NULL DEFAULT 'document',
  `file_size` int(10) unsigned DEFAULT NULL COMMENT 'bytes',
  `teacher_id` int(10) unsigned NOT NULL,
  `class_id` int(10) unsigned DEFAULT NULL,
  `subject_id` int(10) unsigned DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_materials_teacher_id` (`teacher_id`),
  KEY `idx_materials_class_id` (`class_id`),
  KEY `fk_materials_subject` (`subject_id`),
  CONSTRAINT `fk_materials_class` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_materials_subject` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_materials_teacher` FOREIGN KEY (`teacher_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `materials`
--

LOCK TABLES `materials` WRITE;
/*!40000 ALTER TABLE `materials` DISABLE KEYS */;
INSERT INTO `materials` VALUES (1,'Uu','Jjju','http://localhost:5000/uploads/videos/1778565726181-741834.mp4','instagram_1778517211184(360p).mp4','video',1355254,2,2,2,'2026-05-12 06:02:06','2026-05-12 06:02:06'),(2,'Kgudy','GdfugJfu jguvjg  ugug','http://localhost:5000/uploads/videos/1778565778495-120062.mp4','VID_20260511_153823.mp4','video',27453020,2,2,2,'2026-05-12 06:03:09','2026-05-12 06:03:09');
/*!40000 ALTER TABLE `materials` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `messages`
--

DROP TABLE IF EXISTS `messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `messages` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `conversation_id` int(10) unsigned NOT NULL,
  `sender_id` int(10) unsigned NOT NULL,
  `body` text DEFAULT NULL,
  `type` enum('text','image','file') NOT NULL DEFAULT 'text',
  `attachment_url` varchar(500) DEFAULT NULL,
  `read_by` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT '{userId: ISODateString}' CHECK (json_valid(`read_by`)),
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_messages_conversation_id` (`conversation_id`),
  KEY `idx_messages_conv_created_at` (`conversation_id`,`created_at`),
  KEY `idx_messages_sender_id` (`sender_id`),
  CONSTRAINT `fk_messages_conversation` FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_messages_sender` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `messages`
--

LOCK TABLES `messages` WRITE;
/*!40000 ALTER TABLE `messages` DISABLE KEYS */;
INSERT INTO `messages` VALUES (1,1,10,'Assalam-o-Alaikum Sir, how is Zain performing in Mathematics?','text',NULL,NULL,'2026-04-24 12:00:40','2026-04-24 12:00:40'),(2,1,2,'Walaikum Assalam! Zain scored 78/100 in mid terms. Consistent practice will help him improve further.','text',NULL,NULL,'2026-04-24 12:00:40','2026-04-24 12:00:40'),(3,1,10,'JazakAllah khair. We will encourage him to study harder.','text',NULL,NULL,'2026-04-24 12:00:40','2026-04-24 12:00:40');
/*!40000 ALTER TABLE `messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `notifications` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `recipient_id` int(10) unsigned NOT NULL,
  `sender_id` int(10) unsigned DEFAULT NULL,
  `title` varchar(200) NOT NULL,
  `body` text NOT NULL,
  `type` enum('assignment','fee','attendance','marks','general','announcement') NOT NULL DEFAULT 'general',
  `data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`data`)),
  `is_read` tinyint(1) NOT NULL DEFAULT 0,
  `read_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_notifications_recipient_id` (`recipient_id`),
  KEY `idx_notifications_recipient_is_read` (`recipient_id`,`is_read`),
  CONSTRAINT `fk_notifications_recipient` FOREIGN KEY (`recipient_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=71 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (1,1,1,'Mid Term Results Published','Mid-term results for Class 9 and 10 are now available. Check the marks section.','marks',NULL,0,NULL,'2026-04-24 12:00:40','2026-04-24 12:00:40'),(2,2,1,'Mid Term Results Published','Mid-term results for Class 9 and 10 are now available. Check the marks section.','marks',NULL,0,NULL,'2026-04-24 12:00:40','2026-04-24 12:00:40'),(3,3,1,'Mid Term Results Published','Mid-term results for Class 9 and 10 are now available. Check the marks section.','marks',NULL,0,NULL,'2026-04-24 12:00:40','2026-04-24 12:00:40'),(4,4,1,'Mid Term Results Published','Mid-term results for Class 9 and 10 are now available. Check the marks section.','marks',NULL,0,NULL,'2026-04-24 12:00:40','2026-04-24 12:00:40'),(5,5,1,'Mid Term Results Published','Mid-term results for Class 9 and 10 are now available. Check the marks section.','marks',NULL,0,NULL,'2026-04-24 12:00:40','2026-04-24 12:00:40'),(6,6,1,'Mid Term Results Published','Mid-term results for Class 9 and 10 are now available. Check the marks section.','marks',NULL,0,NULL,'2026-04-24 12:00:40','2026-04-24 12:00:40'),(7,7,1,'Mid Term Results Published','Mid-term results for Class 9 and 10 are now available. Check the marks section.','marks',NULL,0,NULL,'2026-04-24 12:00:40','2026-04-24 12:00:40'),(8,8,1,'Mid Term Results Published','Mid-term results for Class 9 and 10 are now available. Check the marks section.','marks',NULL,0,NULL,'2026-04-24 12:00:40','2026-04-24 12:00:40'),(9,9,1,'Mid Term Results Published','Mid-term results for Class 9 and 10 are now available. Check the marks section.','marks',NULL,0,NULL,'2026-04-24 12:00:40','2026-04-24 12:00:40'),(10,10,1,'Mid Term Results Published','Mid-term results for Class 9 and 10 are now available. Check the marks section.','marks',NULL,0,NULL,'2026-04-24 12:00:40','2026-04-24 12:00:40'),(11,11,1,'Mid Term Results Published','Mid-term results for Class 9 and 10 are now available. Check the marks section.','marks',NULL,0,NULL,'2026-04-24 12:00:40','2026-04-24 12:00:40'),(12,12,1,'Mid Term Results Published','Mid-term results for Class 9 and 10 are now available. Check the marks section.','marks',NULL,0,NULL,'2026-04-24 12:00:40','2026-04-24 12:00:40'),(13,1,1,'Parent-Teacher Meeting','Annual PTM scheduled for April 30, 2026 at 10:00 AM. All parents are requested to attend.','announcement',NULL,0,NULL,'2026-04-24 12:00:40','2026-04-24 12:00:40'),(14,2,1,'Parent-Teacher Meeting','Annual PTM scheduled for April 30, 2026 at 10:00 AM. All parents are requested to attend.','announcement',NULL,0,NULL,'2026-04-24 12:00:40','2026-04-24 12:00:40'),(15,3,1,'Parent-Teacher Meeting','Annual PTM scheduled for April 30, 2026 at 10:00 AM. All parents are requested to attend.','announcement',NULL,0,NULL,'2026-04-24 12:00:40','2026-04-24 12:00:40'),(16,4,1,'Parent-Teacher Meeting','Annual PTM scheduled for April 30, 2026 at 10:00 AM. All parents are requested to attend.','announcement',NULL,0,NULL,'2026-04-24 12:00:40','2026-04-24 12:00:40'),(17,5,1,'Parent-Teacher Meeting','Annual PTM scheduled for April 30, 2026 at 10:00 AM. All parents are requested to attend.','announcement',NULL,0,NULL,'2026-04-24 12:00:40','2026-04-24 12:00:40'),(18,6,1,'Parent-Teacher Meeting','Annual PTM scheduled for April 30, 2026 at 10:00 AM. All parents are requested to attend.','announcement',NULL,0,NULL,'2026-04-24 12:00:40','2026-04-24 12:00:40'),(19,7,1,'Parent-Teacher Meeting','Annual PTM scheduled for April 30, 2026 at 10:00 AM. All parents are requested to attend.','announcement',NULL,0,NULL,'2026-04-24 12:00:40','2026-04-24 12:00:40'),(20,8,1,'Parent-Teacher Meeting','Annual PTM scheduled for April 30, 2026 at 10:00 AM. All parents are requested to attend.','announcement',NULL,0,NULL,'2026-04-24 12:00:40','2026-04-24 12:00:40'),(21,9,1,'Parent-Teacher Meeting','Annual PTM scheduled for April 30, 2026 at 10:00 AM. All parents are requested to attend.','announcement',NULL,0,NULL,'2026-04-24 12:00:40','2026-04-24 12:00:40'),(22,10,1,'Parent-Teacher Meeting','Annual PTM scheduled for April 30, 2026 at 10:00 AM. All parents are requested to attend.','announcement',NULL,0,NULL,'2026-04-24 12:00:40','2026-04-24 12:00:40'),(23,11,1,'Parent-Teacher Meeting','Annual PTM scheduled for April 30, 2026 at 10:00 AM. All parents are requested to attend.','announcement',NULL,0,NULL,'2026-04-24 12:00:40','2026-04-24 12:00:40'),(24,12,1,'Parent-Teacher Meeting','Annual PTM scheduled for April 30, 2026 at 10:00 AM. All parents are requested to attend.','announcement',NULL,0,NULL,'2026-04-24 12:00:40','2026-04-24 12:00:40'),(25,1,1,'Eid Holiday Announcement','School will remain closed April 28 – May 5 for Eid holidays. Classes resume May 6.','announcement',NULL,0,NULL,'2026-04-24 12:00:40','2026-04-24 12:00:40'),(26,2,1,'Eid Holiday Announcement','School will remain closed April 28 – May 5 for Eid holidays. Classes resume May 6.','announcement',NULL,0,NULL,'2026-04-24 12:00:40','2026-04-24 12:00:40'),(27,3,1,'Eid Holiday Announcement','School will remain closed April 28 – May 5 for Eid holidays. Classes resume May 6.','announcement',NULL,0,NULL,'2026-04-24 12:00:40','2026-04-24 12:00:40'),(28,4,1,'Eid Holiday Announcement','School will remain closed April 28 – May 5 for Eid holidays. Classes resume May 6.','announcement',NULL,0,NULL,'2026-04-24 12:00:40','2026-04-24 12:00:40'),(29,5,1,'Eid Holiday Announcement','School will remain closed April 28 – May 5 for Eid holidays. Classes resume May 6.','announcement',NULL,0,NULL,'2026-04-24 12:00:40','2026-04-24 12:00:40'),(30,6,1,'Eid Holiday Announcement','School will remain closed April 28 – May 5 for Eid holidays. Classes resume May 6.','announcement',NULL,0,NULL,'2026-04-24 12:00:40','2026-04-24 12:00:40'),(31,7,1,'Eid Holiday Announcement','School will remain closed April 28 – May 5 for Eid holidays. Classes resume May 6.','announcement',NULL,0,NULL,'2026-04-24 12:00:40','2026-04-24 12:00:40'),(32,8,1,'Eid Holiday Announcement','School will remain closed April 28 – May 5 for Eid holidays. Classes resume May 6.','announcement',NULL,0,NULL,'2026-04-24 12:00:40','2026-04-24 12:00:40'),(33,9,1,'Eid Holiday Announcement','School will remain closed April 28 – May 5 for Eid holidays. Classes resume May 6.','announcement',NULL,0,NULL,'2026-04-24 12:00:40','2026-04-24 12:00:40'),(34,10,1,'Eid Holiday Announcement','School will remain closed April 28 – May 5 for Eid holidays. Classes resume May 6.','announcement',NULL,0,NULL,'2026-04-24 12:00:40','2026-04-24 12:00:40'),(35,11,1,'Eid Holiday Announcement','School will remain closed April 28 – May 5 for Eid holidays. Classes resume May 6.','announcement',NULL,0,NULL,'2026-04-24 12:00:40','2026-04-24 12:00:40'),(36,12,1,'Eid Holiday Announcement','School will remain closed April 28 – May 5 for Eid holidays. Classes resume May 6.','announcement',NULL,0,NULL,'2026-04-24 12:00:40','2026-04-24 12:00:40'),(37,1,1,'Fee Submission Reminder','Last date to submit April fees is April 25. Late fee of Rs.200 applies after deadline.','fee',NULL,0,NULL,'2026-04-24 12:00:40','2026-04-24 12:00:40'),(38,2,1,'Fee Submission Reminder','Last date to submit April fees is April 25. Late fee of Rs.200 applies after deadline.','fee',NULL,0,NULL,'2026-04-24 12:00:40','2026-04-24 12:00:40'),(39,3,1,'Fee Submission Reminder','Last date to submit April fees is April 25. Late fee of Rs.200 applies after deadline.','fee',NULL,0,NULL,'2026-04-24 12:00:40','2026-04-24 12:00:40'),(40,4,1,'Fee Submission Reminder','Last date to submit April fees is April 25. Late fee of Rs.200 applies after deadline.','fee',NULL,0,NULL,'2026-04-24 12:00:40','2026-04-24 12:00:40'),(41,5,1,'Fee Submission Reminder','Last date to submit April fees is April 25. Late fee of Rs.200 applies after deadline.','fee',NULL,0,NULL,'2026-04-24 12:00:40','2026-04-24 12:00:40'),(42,6,1,'Fee Submission Reminder','Last date to submit April fees is April 25. Late fee of Rs.200 applies after deadline.','fee',NULL,0,NULL,'2026-04-24 12:00:40','2026-04-24 12:00:40'),(43,7,1,'Fee Submission Reminder','Last date to submit April fees is April 25. Late fee of Rs.200 applies after deadline.','fee',NULL,0,NULL,'2026-04-24 12:00:40','2026-04-24 12:00:40'),(44,8,1,'Fee Submission Reminder','Last date to submit April fees is April 25. Late fee of Rs.200 applies after deadline.','fee',NULL,0,NULL,'2026-04-24 12:00:40','2026-04-24 12:00:40'),(45,9,1,'Fee Submission Reminder','Last date to submit April fees is April 25. Late fee of Rs.200 applies after deadline.','fee',NULL,0,NULL,'2026-04-24 12:00:40','2026-04-24 12:00:40'),(46,10,1,'Fee Submission Reminder','Last date to submit April fees is April 25. Late fee of Rs.200 applies after deadline.','fee',NULL,0,NULL,'2026-04-24 12:00:40','2026-04-24 12:00:40'),(47,11,1,'Fee Submission Reminder','Last date to submit April fees is April 25. Late fee of Rs.200 applies after deadline.','fee',NULL,0,NULL,'2026-04-24 12:00:40','2026-04-24 12:00:40'),(48,12,1,'Fee Submission Reminder','Last date to submit April fees is April 25. Late fee of Rs.200 applies after deadline.','fee',NULL,0,NULL,'2026-04-24 12:00:40','2026-04-24 12:00:40'),(49,1,1,'Science Fair 2026','Annual Science Fair on May 15, 2026. All students are encouraged to participate.','general',NULL,0,NULL,'2026-04-24 12:00:40','2026-04-24 12:00:40'),(50,2,1,'Science Fair 2026','Annual Science Fair on May 15, 2026. All students are encouraged to participate.','general',NULL,0,NULL,'2026-04-24 12:00:40','2026-04-24 12:00:40'),(51,3,1,'Science Fair 2026','Annual Science Fair on May 15, 2026. All students are encouraged to participate.','general',NULL,0,NULL,'2026-04-24 12:00:40','2026-04-24 12:00:40'),(52,4,1,'Science Fair 2026','Annual Science Fair on May 15, 2026. All students are encouraged to participate.','general',NULL,0,NULL,'2026-04-24 12:00:40','2026-04-24 12:00:40'),(53,5,1,'Science Fair 2026','Annual Science Fair on May 15, 2026. All students are encouraged to participate.','general',NULL,0,NULL,'2026-04-24 12:00:40','2026-04-24 12:00:40'),(54,6,1,'Science Fair 2026','Annual Science Fair on May 15, 2026. All students are encouraged to participate.','general',NULL,0,NULL,'2026-04-24 12:00:40','2026-04-24 12:00:40'),(55,7,1,'Science Fair 2026','Annual Science Fair on May 15, 2026. All students are encouraged to participate.','general',NULL,0,NULL,'2026-04-24 12:00:40','2026-04-24 12:00:40'),(56,8,1,'Science Fair 2026','Annual Science Fair on May 15, 2026. All students are encouraged to participate.','general',NULL,0,NULL,'2026-04-24 12:00:40','2026-04-24 12:00:40'),(57,9,1,'Science Fair 2026','Annual Science Fair on May 15, 2026. All students are encouraged to participate.','general',NULL,0,NULL,'2026-04-24 12:00:40','2026-04-24 12:00:40'),(58,10,1,'Science Fair 2026','Annual Science Fair on May 15, 2026. All students are encouraged to participate.','general',NULL,0,NULL,'2026-04-24 12:00:40','2026-04-24 12:00:40'),(59,11,1,'Science Fair 2026','Annual Science Fair on May 15, 2026. All students are encouraged to participate.','general',NULL,0,NULL,'2026-04-24 12:00:40','2026-04-24 12:00:40'),(60,12,1,'Science Fair 2026','Annual Science Fair on May 15, 2026. All students are encouraged to participate.','general',NULL,0,NULL,'2026-04-24 12:00:40','2026-04-24 12:00:40'),(61,7,2,'New Assignment: Test homework','Due: 2026-05-20','assignment','{\"assignment_id\":\"6\",\"type\":\"assignment\"}',0,NULL,'2026-05-12 06:48:40','2026-05-12 06:48:40'),(62,8,2,'New Assignment: Test homework','Due: 2026-05-20','assignment','{\"assignment_id\":\"6\",\"type\":\"assignment\"}',0,NULL,'2026-05-12 06:48:40','2026-05-12 06:48:40'),(63,7,2,'New Assignment: Ff','Due: 2026-07-12','assignment','{\"assignment_id\":\"7\",\"type\":\"assignment\"}',0,NULL,'2026-05-12 06:49:01','2026-05-12 06:49:01'),(64,8,2,'New Assignment: Ff','Due: 2026-07-12','assignment','{\"assignment_id\":\"7\",\"type\":\"assignment\"}',0,NULL,'2026-05-12 06:49:01','2026-05-12 06:49:01'),(65,7,2,'New Assignment: Fufy','Due: 2026-05-14','assignment','{\"assignment_id\":\"8\",\"type\":\"assignment\"}',0,NULL,'2026-05-12 06:54:35','2026-05-12 06:54:35'),(66,8,2,'New Assignment: Fufy','Due: 2026-05-14','assignment','{\"assignment_id\":\"8\",\"type\":\"assignment\"}',0,NULL,'2026-05-12 06:54:35','2026-05-12 06:54:35'),(67,7,2,'New Assignment: Chfydgjygigiyfkhkg','Due: 2026-05-12','assignment','{\"assignment_id\":\"9\",\"type\":\"assignment\"}',0,NULL,'2026-05-12 06:55:09','2026-05-12 06:55:09'),(68,8,2,'New Assignment: Chfydgjygigiyfkhkg','Due: 2026-05-12','assignment','{\"assignment_id\":\"9\",\"type\":\"assignment\"}',0,NULL,'2026-05-12 06:55:09','2026-05-12 06:55:09'),(69,7,2,'New Assignment: Hfg','Due: 2026-05-12','assignment','{\"assignment_id\":\"10\",\"type\":\"assignment\"}',0,NULL,'2026-05-12 06:55:31','2026-05-12 06:55:31'),(70,8,2,'New Assignment: Hfg','Due: 2026-05-12','assignment','{\"assignment_id\":\"10\",\"type\":\"assignment\"}',0,NULL,'2026-05-12 06:55:31','2026-05-12 06:55:31');
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `otp_verifications`
--

DROP TABLE IF EXISTS `otp_verifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `otp_verifications` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(10) unsigned NOT NULL,
  `otp` varchar(10) NOT NULL,
  `type` enum('login','password_reset','registration') NOT NULL DEFAULT 'login',
  `expires_at` datetime NOT NULL,
  `used` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_otp_user_id` (`user_id`),
  KEY `idx_otp_expires_at` (`expires_at`),
  CONSTRAINT `fk_otp_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `otp_verifications`
--

LOCK TABLES `otp_verifications` WRITE;
/*!40000 ALTER TABLE `otp_verifications` DISABLE KEYS */;
/*!40000 ALTER TABLE `otp_verifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `parent_student_mapping`
--

DROP TABLE IF EXISTS `parent_student_mapping`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `parent_student_mapping` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `parent_id` int(10) unsigned NOT NULL,
  `student_id` int(10) unsigned NOT NULL,
  `relationship` enum('father','mother','guardian','other') NOT NULL DEFAULT 'guardian',
  `is_primary` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_parent_student` (`parent_id`,`student_id`),
  KEY `idx_psm_parent_id` (`parent_id`),
  KEY `idx_psm_student_id` (`student_id`),
  CONSTRAINT `fk_psm_parent` FOREIGN KEY (`parent_id`) REFERENCES `parents` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_psm_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `parent_student_mapping`
--

LOCK TABLES `parent_student_mapping` WRITE;
/*!40000 ALTER TABLE `parent_student_mapping` DISABLE KEYS */;
INSERT INTO `parent_student_mapping` VALUES (1,1,1,'guardian',0,'2026-04-24 12:00:39'),(2,1,2,'guardian',0,'2026-04-24 12:00:39'),(3,2,3,'guardian',0,'2026-04-24 12:00:39'),(4,2,4,'guardian',0,'2026-04-24 12:00:39'),(5,3,5,'guardian',0,'2026-04-24 12:00:39');
/*!40000 ALTER TABLE `parent_student_mapping` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `parents`
--

DROP TABLE IF EXISTS `parents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `parents` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(10) unsigned NOT NULL,
  `occupation` varchar(100) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_parents_user_id` (`user_id`),
  CONSTRAINT `fk_parents_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `parents`
--

LOCK TABLES `parents` WRITE;
/*!40000 ALTER TABLE `parents` DISABLE KEYS */;
INSERT INTO `parents` VALUES (1,10,'Business','House 5, Block A, Lahore','2026-04-24 12:00:39','2026-04-24 12:00:39'),(2,11,'Doctor','Flat 7, Gulberg III, Lahore','2026-04-24 12:00:39','2026-04-24 12:00:39'),(3,12,'Engineer','House 9, Model Town, Lahore','2026-04-24 12:00:39','2026-04-24 12:00:39');
/*!40000 ALTER TABLE `parents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `password_resets`
--

DROP TABLE IF EXISTS `password_resets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `password_resets` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `email` varchar(150) NOT NULL,
  `otp` varchar(6) NOT NULL,
  `is_used` tinyint(1) NOT NULL DEFAULT 0,
  `expires_at` datetime NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_password_resets_email` (`email`),
  KEY `idx_password_resets_expires` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_resets`
--

LOCK TABLES `password_resets` WRITE;
/*!40000 ALTER TABLE `password_resets` DISABLE KEYS */;
/*!40000 ALTER TABLE `password_resets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `payments` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `fee_id` int(10) unsigned NOT NULL,
  `student_id` int(10) unsigned NOT NULL,
  `amount_paid` decimal(10,2) NOT NULL,
  `paid_date` date NOT NULL,
  `payment_method` enum('cash','bank_transfer','online','cheque','other') NOT NULL DEFAULT 'cash',
  `reference_no` varchar(100) DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `collected_by` int(10) unsigned DEFAULT NULL COMMENT 'admin user id',
  `status` enum('paid','partial','refunded') NOT NULL DEFAULT 'paid',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_payments_fee_id` (`fee_id`),
  KEY `idx_payments_student_id` (`student_id`),
  KEY `idx_payments_paid_date` (`paid_date`),
  KEY `fk_payments_collector` (`collected_by`),
  CONSTRAINT `fk_payments_collector` FOREIGN KEY (`collected_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_payments_fee` FOREIGN KEY (`fee_id`) REFERENCES `fees` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_payments_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
INSERT INTO `payments` VALUES (1,1,1,5000.00,'2026-04-10','cash',NULL,NULL,1,'paid','2026-04-24 12:00:40','2026-04-24 12:00:40'),(2,2,1,1500.00,'2026-04-10','cash',NULL,NULL,1,'paid','2026-04-24 12:00:40','2026-04-24 12:00:40'),(3,1,2,5000.00,'2026-04-11','online',NULL,NULL,1,'paid','2026-04-24 12:00:40','2026-04-24 12:00:40'),(4,3,4,5000.00,'2026-04-12','cash',NULL,NULL,1,'paid','2026-04-24 12:00:40','2026-04-24 12:00:40');
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `roles` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_roles_name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'admin','Full system access','2026-04-18 20:42:07','2026-04-18 20:42:07'),(2,'staff','School staff member','2026-04-18 20:42:07','2026-04-18 20:42:07'),(3,'teacher','Class teacher','2026-04-18 20:42:07','2026-04-18 20:42:07'),(4,'student','Enrolled student','2026-04-18 20:42:07','2026-04-18 20:42:07'),(5,'parent','Parent or guardian','2026-04-18 20:42:07','2026-04-18 20:42:07');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sessions` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(10) unsigned NOT NULL,
  `refresh_token` varchar(512) NOT NULL,
  `device_info` varchar(255) DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `expires_at` datetime NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_sessions_user_id` (`user_id`),
  KEY `idx_sessions_refresh_token` (`refresh_token`(64)),
  CONSTRAINT `fk_sessions_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions`
--

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
INSERT INTO `sessions` VALUES (1,1,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZSI6ImFkbWluIiwibmFtZSI6IlNhcmFoIEFobWVkIiwianRpIjoiMDAzZGFjYzAtNmNhMC00MzU3LTg2YjQtZDljNTQwYzM0OWNjIiwiaWF0IjoxNzc4MjY5ODM5LCJleHAiOjE3Nzg4NzQ2Mzl9.N04rjf1QAadYaTPO3hkMjQeF01PCAL9j873JGWXkoBI','okhttp/4.9.2','::ffff:192.168.100.98','2026-05-15 19:50:39',0,'2026-05-08 19:50:39','2026-05-08 20:06:00'),(2,1,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZSI6ImFkbWluIiwibmFtZSI6IlNhcmFoIEFobWVkIiwianRpIjoiYjY0ZWIzN2EtM2NhMS00NmRmLWExYTMtYmY3ZmRhYzUxNDY4IiwiaWF0IjoxNzc4MjcwNzYwLCJleHAiOjE3Nzg4NzU1NjB9.zvJn8n07xBs20XupKNwEzciKJmf7PP4M_5_l8RlLS04','okhttp/4.9.2','::ffff:192.168.100.98','2026-05-15 20:06:00',0,'2026-05-08 20:06:00','2026-05-09 00:02:18'),(3,1,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZSI6ImFkbWluIiwibmFtZSI6IlNhcmFoIEFobWVkIiwianRpIjoiYjVlMTc0MWItYzRjNi00OTA2LWFjYzctYTk3MmNmODM5NTU1IiwiaWF0IjoxNzc4Mjg0OTM4LCJleHAiOjE3Nzg4ODk3Mzh9.nDHd2Rs0-m0gyB8RAuqvrcSqwq_LJOAsgKdOuC9-RfU','okhttp/4.9.2','::ffff:192.168.100.98','2026-05-16 00:02:18',0,'2026-05-09 00:02:18','2026-05-09 00:17:45'),(4,1,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZSI6ImFkbWluIiwibmFtZSI6IlNhcmFoIEFobWVkIiwianRpIjoiNjU4NTNhZWItMzgwMi00MjkzLThlMTctNTkyMmUwYjM2N2I3IiwiaWF0IjoxNzc4Mjg1ODY1LCJleHAiOjE3Nzg4OTA2NjV9.4ghqcg1cqm8h376Fw41TPmQNmtGIcqhFnUFcfZo0Eb8','okhttp/4.9.2','::ffff:192.168.100.98','2026-05-16 00:17:45',0,'2026-05-09 00:17:45','2026-05-09 00:17:46'),(5,1,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZSI6ImFkbWluIiwibmFtZSI6IlNhcmFoIEFobWVkIiwianRpIjoiMGUzNDhlOWItNDQ5Yy00MWViLTliOWUtNjQ0NzljOGI0NWI3IiwiaWF0IjoxNzc4Mjg1ODY2LCJleHAiOjE3Nzg4OTA2NjZ9.3fzQjn-N5wRYjPQvPeelfvcK2BZaxY-6oETsssCqzE8','okhttp/4.9.2','::ffff:192.168.100.98','2026-05-16 00:17:46',1,'2026-05-09 00:17:46','2026-05-09 00:17:46'),(6,1,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZSI6ImFkbWluIiwibmFtZSI6IlNhcmFoIEFobWVkIiwianRpIjoiMWFhNTA3NTUtOTVkYS00NjVlLTk4MTQtMjRiMDQ4MjI2OWFkIiwiaWF0IjoxNzc4NTI4NDkyLCJleHAiOjE3NzkxMzMyOTJ9.VP-TnICJZ_D2vVYjoiS91yJ_Qdot-q34gkivkzZ7mLA','curl/8.12.1','::ffff:127.0.0.1','2026-05-18 19:41:32',1,'2026-05-11 19:41:32','2026-05-11 19:41:32'),(7,2,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZSI6InRlYWNoZXIiLCJuYW1lIjoiTXIuIEFsaSBIYXNzYW4iLCJqdGkiOiI3MDdjMzk2OC00NWQ0LTQ5NDItOGNlOS01OTUyNDg1OGI4ZTgiLCJpYXQiOjE3Nzg1Mjg1MTIsImV4cCI6MTc3OTEzMzMxMn0.YvsWnDzp9rNeFZku1bczIcj7hYxAQujoronQ_uJICFQ','okhttp/4.9.2','::ffff:127.0.0.1','2026-05-18 19:41:52',0,'2026-05-11 19:41:52','2026-05-11 20:04:32'),(8,2,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZSI6InRlYWNoZXIiLCJuYW1lIjoiTXIuIEFsaSBIYXNzYW4iLCJqdGkiOiI4OGViMmNkMi02NWRhLTRjZjEtYjBkNS02YzkyZTc2OThhMDUiLCJpYXQiOjE3Nzg1Mjk4NzIsImV4cCI6MTc3OTEzNDY3Mn0.UQvjktEqePyS7adambZGKTIRJsRJaqlbWpB_NPyq8kk','okhttp/4.9.2','::ffff:127.0.0.1','2026-05-18 20:04:32',0,'2026-05-11 20:04:32','2026-05-12 05:19:33'),(9,2,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZSI6InRlYWNoZXIiLCJuYW1lIjoiTXIuIEFsaSBIYXNzYW4iLCJqdGkiOiI3ZTAzODYwNi0xOGRiLTRkMTUtYmUxNi04NWVjNzU4NDU2YTQiLCJpYXQiOjE3Nzg1MzAxMTMsImV4cCI6MTc3OTEzNDkxM30.KFcC_tcLPZWg6UQhgdU6TAk4S5hmxJutA5dZS4GCUjw','curl/8.12.1','::ffff:127.0.0.1','2026-05-18 20:08:33',1,'2026-05-11 20:08:33','2026-05-11 20:08:33'),(10,2,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZSI6InRlYWNoZXIiLCJuYW1lIjoiTXIuIEFsaSBIYXNzYW4iLCJqdGkiOiIwMWIyNjQ1NC1lNmFkLTQzNGMtYWNlZC01NjhlNjcyYzA5MmIiLCJpYXQiOjE3Nzg1NjMxNzMsImV4cCI6MTc3OTE2Nzk3M30.bGr0pJVOqRGVzLN6aig0MdrB1K4vmS2XEF6EQk_pABQ','okhttp/4.9.2','::ffff:127.0.0.1','2026-05-19 05:19:33',0,'2026-05-12 05:19:33','2026-05-12 05:35:02'),(11,2,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZSI6InRlYWNoZXIiLCJuYW1lIjoiTXIuIEFsaSBIYXNzYW4iLCJqdGkiOiJhODVlYTY3NC1mMDgyLTQwNGEtYmY1Yi1mNGM2NDRjZDI4MWMiLCJpYXQiOjE3Nzg1NjM2MTYsImV4cCI6MTc3OTE2ODQxNn0.fg1BtcDuCRFlJrGKOF6Wpy3GOQrh3hiICFDtpGkuLEo','curl/8.12.1','::ffff:127.0.0.1','2026-05-19 05:26:56',1,'2026-05-12 05:26:56','2026-05-12 05:26:56'),(12,2,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZSI6InRlYWNoZXIiLCJuYW1lIjoiTXIuIEFsaSBIYXNzYW4iLCJqdGkiOiI5MTVlOWM5Ny05YzQzLTQzMTMtYWMyNi0yNDFhNzg0Mjc1YzgiLCJpYXQiOjE3Nzg1NjM3MTAsImV4cCI6MTc3OTE2ODUxMH0.GHdzUHeeAJLcvUpuQzBNXcR_a_6Mky6110hhBD5jD-w','curl/8.12.1','::ffff:127.0.0.1','2026-05-19 05:28:30',1,'2026-05-12 05:28:30','2026-05-12 05:28:30'),(13,2,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZSI6InRlYWNoZXIiLCJuYW1lIjoiTXIuIEFsaSBIYXNzYW4iLCJqdGkiOiIwMWUyMmU3ZS1mNzRiLTRjZjAtOTI3MS04ZmMwODUyYjdkMWQiLCJpYXQiOjE3Nzg1NjM3NzUsImV4cCI6MTc3OTE2ODU3NX0.T82LuSuvDGPRGglTynaunrRorTmrRlWWbpZKRQ40SAM','curl/8.12.1','::ffff:127.0.0.1','2026-05-19 05:29:35',1,'2026-05-12 05:29:35','2026-05-12 05:29:35'),(14,2,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZSI6InRlYWNoZXIiLCJuYW1lIjoiTXIuIEFsaSBIYXNzYW4iLCJqdGkiOiJmNWNjNzhjOS04Y2QwLTRmOTctYjY0ZC1lOTJlNDczZjkyNjAiLCJpYXQiOjE3Nzg1NjQxMDIsImV4cCI6MTc3OTE2ODkwMn0.15mfPoa-SmcBQ_Jupq5or2VxOfd4DX8g8bhk4r-_mzs','okhttp/4.9.2','::ffff:127.0.0.1','2026-05-19 05:35:02',0,'2026-05-12 05:35:02','2026-05-12 05:58:53'),(15,2,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZSI6InRlYWNoZXIiLCJuYW1lIjoiTXIuIEFsaSBIYXNzYW4iLCJqdGkiOiI4ZTJmMGZiMC04MjU4LTRlM2EtOTRkMy02Zjg5MjFjNGI0MjkiLCJpYXQiOjE3Nzg1NjU1MzMsImV4cCI6MTc3OTE3MDMzM30.JC8xvHM8alb9QLsQOAhhTgMeKLKhQjwyHhQwtZPd4OU','okhttp/4.9.2','::ffff:127.0.0.1','2026-05-19 05:58:53',0,'2026-05-12 05:58:53','2026-05-12 06:21:51'),(16,2,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZSI6InRlYWNoZXIiLCJuYW1lIjoiTXIuIEFsaSBIYXNzYW4iLCJqdGkiOiIwYzQ2ZjYzZS0yYjEwLTQ4NmYtYmM5Yi03ZDEyY2MyMTA1NjUiLCJpYXQiOjE3Nzg1NjU2ODEsImV4cCI6MTc3OTE3MDQ4MX0.W6nx1RMSwgeJHyOVNnVj_Gsm5CGRBFGHeuI-rM613ic','curl/8.12.1','::ffff:127.0.0.1','2026-05-19 06:01:21',1,'2026-05-12 06:01:21','2026-05-12 06:01:21'),(17,2,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZSI6InRlYWNoZXIiLCJuYW1lIjoiTXIuIEFsaSBIYXNzYW4iLCJqdGkiOiI3MjE2ZmFjYS0yODZmLTQ2OTktYTU0Yy03ZGRhYzM5MzlkOTQiLCJpYXQiOjE3Nzg1NjY5MTEsImV4cCI6MTc3OTE3MTcxMX0.DDLXR18mhpQlXcjDmDtVe5csmwr0htbaXUiDcU7N6C8','okhttp/4.9.2','::ffff:127.0.0.1','2026-05-19 06:21:51',0,'2026-05-12 06:21:51','2026-05-12 06:46:14'),(18,2,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZSI6InRlYWNoZXIiLCJuYW1lIjoiTXIuIEFsaSBIYXNzYW4iLCJqdGkiOiJjMDI5YzYxMy0wOTNmLTQ3YzgtOThmNy05NzAzYzYyMzU0OGYiLCJpYXQiOjE3Nzg1NjgzNzQsImV4cCI6MTc3OTE3MzE3NH0.gdp4ReQe2vf4nac9JrYd-TBZC1-xV-kPhWyflA-m8U8','okhttp/4.9.2','::ffff:127.0.0.1','2026-05-19 06:46:14',1,'2026-05-12 06:46:14','2026-05-12 06:46:14'),(19,2,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZSI6InRlYWNoZXIiLCJuYW1lIjoiTXIuIEFsaSBIYXNzYW4iLCJqdGkiOiIxYTBjZWYxMS05ZTlkLTQ4NjItOGRhYS1iNzcxZGQzNTlkZWUiLCJpYXQiOjE3Nzg1Njg1MjAsImV4cCI6MTc3OTE3MzMyMH0.U1ASmiLT4G4NPonpiewTaBe-YV6Ami5m3ZwtuMweI5o','curl/8.12.1','::ffff:127.0.0.1','2026-05-19 06:48:40',1,'2026-05-12 06:48:40','2026-05-12 06:48:40');
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `students`
--

DROP TABLE IF EXISTS `students`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `students` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(10) unsigned NOT NULL,
  `class_id` int(10) unsigned DEFAULT NULL,
  `parent_id` int(10) unsigned DEFAULT NULL,
  `roll_number` varchar(30) DEFAULT NULL,
  `admission_no` varchar(50) DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `gender` enum('male','female','other') DEFAULT NULL,
  `address` text DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_students_user_id` (`user_id`),
  KEY `idx_students_class_id` (`class_id`),
  KEY `idx_students_parent_id` (`parent_id`),
  CONSTRAINT `fk_students_class` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_students_parent` FOREIGN KEY (`parent_id`) REFERENCES `parents` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_students_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `students`
--

LOCK TABLES `students` WRITE;
/*!40000 ALTER TABLE `students` DISABLE KEYS */;
INSERT INTO `students` VALUES (1,5,1,NULL,'2024001','ADM-001','2009-03-15','male','House 5, Block A, Lahore','2026-04-24 12:00:39','2026-04-24 12:00:39'),(2,6,1,NULL,'2024002','ADM-002','2009-07-22','female','House 12, DHA Phase 3, Lahore','2026-04-24 12:00:39','2026-04-24 12:00:39'),(3,7,2,NULL,'2024003','ADM-003','2008-11-10','male','Flat 7, Gulberg III, Lahore','2026-04-24 12:00:39','2026-04-24 12:00:39'),(4,8,2,NULL,'2024004','ADM-004','2009-01-30','female','House 3, Johar Town, Lahore','2026-04-24 12:00:39','2026-04-24 12:00:39'),(5,9,3,NULL,'2024005','ADM-005','2008-06-18','male','House 9, Model Town, Lahore','2026-04-24 12:00:39','2026-04-24 12:00:39');
/*!40000 ALTER TABLE `students` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `subjects`
--

DROP TABLE IF EXISTS `subjects`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `subjects` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `code` varchar(20) DEFAULT NULL,
  `class_id` int(10) unsigned DEFAULT NULL,
  `teacher_id` int(10) unsigned DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_subjects_class_id` (`class_id`),
  KEY `idx_subjects_teacher_id` (`teacher_id`),
  CONSTRAINT `fk_subjects_class` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_subjects_teacher` FOREIGN KEY (`teacher_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subjects`
--

LOCK TABLES `subjects` WRITE;
/*!40000 ALTER TABLE `subjects` DISABLE KEYS */;
INSERT INTO `subjects` VALUES (1,'Mathematics','MATH',1,1,'2026-04-24 12:00:39','2026-04-24 12:00:39'),(2,'Physics','PHY',2,2,'2026-04-24 12:00:39','2026-04-24 12:00:39'),(3,'English','ENG',3,3,'2026-04-24 12:00:39','2026-04-24 12:00:39'),(4,'Computer Science','CS',1,1,'2026-04-24 12:00:39','2026-04-24 12:00:39'),(5,'Biology','BIO',2,2,'2026-04-24 12:00:39','2026-04-24 12:00:39');
/*!40000 ALTER TABLE `subjects` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `teachers`
--

DROP TABLE IF EXISTS `teachers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `teachers` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(10) unsigned NOT NULL,
  `qualification` varchar(150) DEFAULT NULL,
  `specialization` varchar(150) DEFAULT NULL,
  `joining_date` date DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_teachers_user_id` (`user_id`),
  CONSTRAINT `fk_teachers_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `teachers`
--

LOCK TABLES `teachers` WRITE;
/*!40000 ALTER TABLE `teachers` DISABLE KEYS */;
INSERT INTO `teachers` VALUES (1,2,'M.Sc Mathematics','Mathematics','2020-01-10','2026-04-24 12:00:39','2026-04-24 12:00:39'),(2,3,'M.Sc Physics','Physics','2020-01-10','2026-04-24 12:00:39','2026-04-24 12:00:39'),(3,4,'M.A English','English Language','2020-01-10','2026-04-24 12:00:39','2026-04-24 12:00:39');
/*!40000 ALTER TABLE `teachers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(150) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `username` varchar(50) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','staff','teacher','student','parent') NOT NULL DEFAULT 'student',
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `fcm_token` text DEFAULT NULL,
  `profile_image` varchar(500) DEFAULT NULL,
  `last_login_at` datetime DEFAULT NULL,
  `last_login_device` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_users_email` (`email`),
  UNIQUE KEY `uq_users_phone` (`phone`),
  UNIQUE KEY `uq_users_username` (`username`),
  KEY `idx_users_role` (`role`),
  KEY `idx_users_is_active` (`is_active`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Sarah Ahmed','admin@schoolms.com','03001234567','admin','$2b$10$9CLpObjFFE42dxc09niUT.ynn7GjxRsBNXUmP0mkjb4pVZjHaOqWC','admin',1,NULL,NULL,'2026-05-11 19:41:32','curl/8.12.1','2026-04-24 12:00:39','2026-05-11 19:41:32'),(2,'Mr. Ali Hassan','ali.hassan@schoolms.com','03011111001','ali_teacher','$2b$10$9CLpObjFFE42dxc09niUT.ynn7GjxRsBNXUmP0mkjb4pVZjHaOqWC','teacher',1,NULL,NULL,'2026-05-12 06:48:40','curl/8.12.1','2026-04-24 12:00:39','2026-05-12 06:48:40'),(3,'Ms. Ayesha Khan','ayesha.khan@schoolms.com','03011111002','ayesha_teacher','$2b$10$9CLpObjFFE42dxc09niUT.ynn7GjxRsBNXUmP0mkjb4pVZjHaOqWC','teacher',1,NULL,NULL,NULL,NULL,'2026-04-24 12:00:39','2026-04-24 12:00:39'),(4,'Mr. Bilal Raza','bilal.raza@schoolms.com','03011111003','bilal_teacher','$2b$10$9CLpObjFFE42dxc09niUT.ynn7GjxRsBNXUmP0mkjb4pVZjHaOqWC','teacher',1,NULL,NULL,NULL,NULL,'2026-04-24 12:00:39','2026-04-24 12:00:39'),(5,'Zain Malik','zain@schoolms.com','03021111001','zain_student','$2b$10$9CLpObjFFE42dxc09niUT.ynn7GjxRsBNXUmP0mkjb4pVZjHaOqWC','student',1,NULL,NULL,NULL,NULL,'2026-04-24 12:00:39','2026-04-24 12:00:39'),(6,'Sara Iqbal','sara@schoolms.com','03021111002','sara_student','$2b$10$9CLpObjFFE42dxc09niUT.ynn7GjxRsBNXUmP0mkjb4pVZjHaOqWC','student',1,NULL,NULL,NULL,NULL,'2026-04-24 12:00:39','2026-04-24 12:00:39'),(7,'Omar Sheikh','omar@schoolms.com','03021111003','omar_student','$2b$10$9CLpObjFFE42dxc09niUT.ynn7GjxRsBNXUmP0mkjb4pVZjHaOqWC','student',1,NULL,NULL,NULL,NULL,'2026-04-24 12:00:39','2026-04-24 12:00:39'),(8,'Fatima Butt','fatima@schoolms.com','03021111004','fatima_student','$2b$10$9CLpObjFFE42dxc09niUT.ynn7GjxRsBNXUmP0mkjb4pVZjHaOqWC','student',1,NULL,NULL,NULL,NULL,'2026-04-24 12:00:39','2026-04-24 12:00:39'),(9,'Hamza Javed','hamza@schoolms.com','03021111005','hamza_student','$2b$10$9CLpObjFFE42dxc09niUT.ynn7GjxRsBNXUmP0mkjb4pVZjHaOqWC','student',1,NULL,NULL,NULL,NULL,'2026-04-24 12:00:39','2026-04-24 12:00:39'),(10,'Mr. Tariq Malik','tariq@schoolms.com','03031111001','tariq_parent','$2b$10$9CLpObjFFE42dxc09niUT.ynn7GjxRsBNXUmP0mkjb4pVZjHaOqWC','parent',1,NULL,NULL,NULL,NULL,'2026-04-24 12:00:39','2026-04-24 12:00:39'),(11,'Mrs. Nadia Iqbal','nadia@schoolms.com','03031111002','nadia_parent','$2b$10$9CLpObjFFE42dxc09niUT.ynn7GjxRsBNXUmP0mkjb4pVZjHaOqWC','parent',1,NULL,NULL,NULL,NULL,'2026-04-24 12:00:39','2026-04-24 12:00:39'),(12,'Mr. Kamran Sheikh','kamran@schoolms.com','03031111003','kamran_parent','$2b$10$9CLpObjFFE42dxc09niUT.ynn7GjxRsBNXUmP0mkjb4pVZjHaOqWC','parent',1,NULL,NULL,NULL,NULL,'2026-04-24 12:00:39','2026-04-24 12:00:39');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'school_management_db'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed
