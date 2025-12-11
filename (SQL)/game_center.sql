/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

CREATE DATABASE IF NOT EXISTS `game_center` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci */;
USE `game_center`;

CREATE TABLE IF NOT EXISTS `algorithm_performance` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `board_size` int(11) NOT NULL,
  `algorithm_name` varchar(50) NOT NULL,
  `time_taken_ms` decimal(10,4) NOT NULL,
  `game_round_id` varchar(100) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `algorithm_performance` (`id`, `board_size`, `algorithm_name`, `time_taken_ms`, `game_round_id`, `created_at`) VALUES
	(1, 6, 'BFS', 0.0246, 'game_1763374099731', '2025-11-17 10:08:19'),
	(2, 6, 'Dijkstra', 0.0481, 'game_1763374099731', '2025-11-17 10:08:19'),
	(3, 6, 'BFS', 0.0398, 'game_1763374145019', '2025-11-17 10:09:05'),
	(4, 6, 'Dijkstra', 0.0713, 'game_1763374145019', '2025-11-17 10:09:05'),
	(5, 6, 'BFS', 0.0155, 'game_1763375239062', '2025-11-17 10:27:19'),
	(6, 6, 'Dijkstra', 0.0439, 'game_1763375239062', '2025-11-17 10:27:19'),
	(7, 6, 'BFS', 0.0219, 'game_1764938203249', '2025-12-05 12:36:43'),
	(8, 6, 'Dijkstra', 0.0419, 'game_1764938203249', '2025-12-05 12:36:43'),
	(9, 6, 'BFS', 0.0254, 'game_1765365083128', '2025-12-10 11:11:23'),
	(10, 6, 'Dijkstra', 0.0600, 'game_1765365083128', '2025-12-10 11:11:23');

CREATE TABLE IF NOT EXISTS `games` (
  `game_id` int(11) NOT NULL AUTO_INCREMENT,
  `game_code` varchar(50) NOT NULL,
  `game_name` varchar(100) NOT NULL,
  `game_description` text DEFAULT NULL,
  `category` varchar(50) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`game_id`),
  UNIQUE KEY `game_code` (`game_code`),
  KEY `idx_game_code` (`game_code`),
  KEY `idx_category` (`category`),
  KEY `idx_is_active` (`is_active`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `games` (`game_id`, `game_code`, `game_name`, `game_description`, `category`, `is_active`, `created_at`) VALUES
	(1, 'tsp', 'Traveling Salesman Problem', 'Find the shortest route through multiple cities', 'optimization', 1, '2025-11-30 04:26:53'),
	(2, 'queens', 'Eight Queens Puzzle', 'Place 8 queens on a chessboard so that no two queens threaten each other. Find all 92 solutions!', 'puzzle', 1, '2025-12-02 08:58:04'),
	(4, 'tsg', 'Traffic Simulation Game', 'Find maximum flow in traffic networks', NULL, 1, '2025-12-11 05:56:58'),
	(5, 'hanoi', 'Tower of Hanoi', 'Move disks between pegs following rules', NULL, 1, '2025-12-11 05:56:58');

CREATE TABLE IF NOT EXISTS `game_sessions` (
  `session_id` int(11) NOT NULL AUTO_INCREMENT,
  `player_id` int(11) NOT NULL,
  `game_id` int(11) NOT NULL,
  `started_at` datetime NOT NULL,
  `completed_at` datetime DEFAULT NULL,
  `session_duration_seconds` int(11) DEFAULT NULL,
  `score` decimal(10,2) DEFAULT NULL,
  `is_completed` tinyint(1) DEFAULT 0,
  `is_successful` tinyint(1) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`session_id`),
  KEY `idx_player_id` (`player_id`),
  KEY `idx_game_id` (`game_id`),
  KEY `idx_started_at` (`started_at`),
  KEY `idx_is_successful` (`is_successful`),
  KEY `idx_is_completed` (`is_completed`),
  CONSTRAINT `game_sessions_ibfk_1` FOREIGN KEY (`player_id`) REFERENCES `players` (`player_id`) ON DELETE CASCADE,
  CONSTRAINT `game_sessions_ibfk_2` FOREIGN KEY (`game_id`) REFERENCES `games` (`game_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `game_sessions` (`session_id`, `player_id`, `game_id`, `started_at`, `completed_at`, `session_duration_seconds`, `score`, `is_completed`, `is_successful`, `created_at`) VALUES
	(1, 2, 1, '2025-11-30 11:04:54', '2025-11-30 11:05:15', 21, NULL, 1, 0, '2025-11-30 05:35:16'),
	(2, 2, 1, '2025-11-30 11:13:17', '2025-11-30 11:13:43', 25, NULL, 1, 0, '2025-11-30 05:43:43'),
	(3, 5, 1, '2025-11-30 16:33:26', '2025-11-30 16:34:08', 41, NULL, 1, 0, '2025-11-30 11:04:09'),
	(4, 2, 1, '2025-11-30 16:49:04', '2025-11-30 16:50:21', 77, NULL, 1, 1, '2025-11-30 11:20:21'),
	(5, 6, 1, '2025-11-30 16:53:11', '2025-11-30 16:55:10', 118, NULL, 1, 0, '2025-11-30 11:25:10'),
	(6, 7, 1, '2025-11-30 21:50:36', '2025-11-30 21:52:11', 94, NULL, 1, 1, '2025-11-30 16:22:12'),
	(7, 2, 1, '2025-11-30 21:57:43', '2025-11-30 21:58:58', 75, NULL, 1, 1, '2025-11-30 16:28:59'),
	(8, 9, 1, '2025-11-30 22:22:01', '2025-11-30 22:22:44', 43, NULL, 1, 0, '2025-11-30 16:52:46'),
	(9, 10, 1, '2025-11-30 22:33:17', '2025-11-30 22:33:37', 19, NULL, 1, 0, '2025-11-30 17:03:37'),
	(10, 11, 1, '2025-11-30 22:50:22', '2025-11-30 22:50:42', 19, NULL, 1, 0, '2025-11-30 17:20:42'),
	(11, 13, 1, '2025-12-01 11:44:12', '2025-12-01 11:44:39', 26, NULL, 1, 0, '2025-12-01 06:14:39'),
	(12, 4, 1, '2025-12-08 23:04:30', '2025-12-08 23:04:42', 12, NULL, 1, 0, '2025-12-08 17:34:44');

CREATE TABLE IF NOT EXISTS `hanoi_scores` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `pegs` int(11) NOT NULL,
  `disks` int(11) NOT NULL,
  `user_moves` int(11) NOT NULL,
  `target_moves` int(11) NOT NULL,
  `is_optimal` tinyint(1) NOT NULL,
  `time_taken_ms` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`)
) ENGINE=MyISAM AUTO_INCREMENT=51 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*!40000 ALTER TABLE `hanoi_scores` DISABLE KEYS */;
INSERT INTO `hanoi_scores` (`id`, `user_id`, `pegs`, `disks`, `user_moves`, `target_moves`, `is_optimal`, `time_taken_ms`, `created_at`) VALUES
	(1, 1, 3, 3, 7, 7, 1, 21400, '2025-12-09 14:56:40'),
	(2, 2, 3, 3, 7, 7, 1, 12760, '2025-12-09 14:57:26'),
	(3, 1, 3, 3, 7, 7, 1, 12467, '2025-12-09 14:57:56'),
	(4, 2, 3, 3, 7, 7, 1, 12945, '2025-12-09 14:59:08'),
	(5, 3, 3, 3, 7, 7, 1, 16569, '2025-12-09 15:19:49'),
	(6, 3, 3, 3, 7, 7, 1, 16769, '2025-12-09 15:24:40'),
	(7, 2, 3, 3, 7, 7, 1, 19157, '2025-12-09 15:30:39'),
	(8, 4, 3, 3, 7, 7, 1, 12033, '2025-12-09 15:40:14'),
	(9, 4, 3, 3, 7, 7, 1, 15024, '2025-12-09 15:44:37'),
	(10, 4, 3, 3, 7, 7, 1, 12281, '2025-12-09 15:50:02'),
	(11, 4, 3, 3, 7, 7, 1, 13070, '2025-12-09 15:54:07'),
	(12, 2, 3, 7, 127, 127, 1, 110211, '2025-12-09 15:57:54'),
	(13, 2, 3, 3, 9, 7, 0, 21441, '2025-12-09 15:58:39'),
	(14, 4, 3, 3, 7, 7, 1, 6389, '2025-12-09 16:02:40'),
	(15, 4, 3, 3, 7, 7, 1, 13731, '2025-12-09 16:04:03'),
	(16, 4, 3, 3, 7, 7, 1, 17238, '2025-12-09 16:13:16'),
	(17, 4, 3, 3, 7, 7, 1, 2300, '2025-12-09 16:18:20'),
	(18, 4, 3, 3, 7, 7, 1, 30172, '2025-12-09 16:26:29'),
	(19, 4, 4, 4, 11, 9, 0, 33044, '2025-12-09 16:28:59'),
	(20, 4, 4, 3, 4, 5, 0, 2338, '2025-12-09 16:29:42'),
	(21, 4, 4, 3, 5, 5, 1, 15904, '2025-12-09 16:30:39'),
	(22, 4, 4, 3, 4, 5, 0, 3735, '2025-12-09 16:30:53'),
	(23, 4, 4, 3, 4, 5, 0, 2940, '2025-12-09 16:36:36'),
	(24, 3, 4, 3, 4, 5, 0, 2255, '2025-12-09 16:41:07'),
	(25, 3, 4, 3, 4, 5, 0, 2907, '2025-12-09 16:47:00'),
	(26, 3, 4, 3, 5, 5, 1, 4217, '2025-12-09 17:01:18'),
	(27, 3, 4, 3, 5, 5, 1, 2399, '2025-12-09 17:02:18'),
	(28, 3, 4, 9, 41, 41, 1, 10768, '2025-12-09 17:12:30'),
	(29, 2, 3, 3, 7, 7, 1, 22041, '2025-12-09 17:34:53'),
	(30, 3, 4, 3, 5, 5, 1, 7893, '2025-12-09 17:43:19'),
	(31, 2, 4, 3, 5, 5, 1, 9190, '2025-12-09 17:58:29'),
	(32, 2, 3, 3, 7, 7, 1, 4358, '2025-12-09 17:58:41'),
	(33, 2, 3, 3, 7, 7, 1, 2756, '2025-12-09 18:24:13'),
	(34, 5, 3, 3, 7, 7, 1, 15528, '2025-12-10 06:24:17'),
	(35, 2, 3, 9, 511, 511, 1, 136492, '2025-12-10 06:55:11'),
	(36, 6, 3, 6, 63, 63, 1, 14998, '2025-12-10 07:03:23'),
	(37, 7, 3, 6, 63, 63, 1, 13913, '2025-12-10 07:09:49'),
	(38, 7, 3, 5, 31, 31, 1, 7392, '2025-12-10 07:10:10'),
	(39, 2, 3, 7, 127, 127, 1, 28568, '2025-12-10 07:16:07'),
	(40, 8, 3, 3, 7, 7, 1, 9718, '2025-12-10 07:18:49'),
	(41, 8, 3, 5, 31, 31, 1, 7876, '2025-12-10 07:19:10'),
	(42, 9, 3, 6, 63, 63, 1, 14366, '2025-12-10 07:31:54'),
	(43, 9, 4, 8, 33, 33, 1, 8811, '2025-12-10 08:07:56'),
	(44, 9, 3, 6, 63, 63, 1, 27765, '2025-12-10 09:22:10'),
	(45, 5, 3, 6, 63, 63, 1, 21320, '2025-12-10 09:32:11'),
	(46, 5, 3, 9, 511, 511, 1, 151479, '2025-12-10 09:35:32'),
	(47, 5, 3, 3, 7, 7, 1, 3475, '2025-12-10 09:54:25'),
	(48, 5, 3, 7, 127, 127, 1, 31182, '2025-12-10 09:55:02'),
	(49, 5, 3, 7, 127, 127, 1, 30945, '2025-12-10 11:09:03'),
	(50, 5, 3, 3, 7, 7, 1, 11259, '2025-12-10 11:09:28');
/*!40000 ALTER TABLE `hanoi_scores` ENABLE KEYS */;

CREATE TABLE IF NOT EXISTS `hanoi_users` (
  `user_id` int(11) NOT NULL AUTO_INCREMENT,
  `player_name` varchar(50) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `player_name` (`player_name`)
) ENGINE=MyISAM AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*!40000 ALTER TABLE `hanoi_users` DISABLE KEYS */;
INSERT INTO `hanoi_users` (`user_id`, `player_name`, `created_at`) VALUES
	(1, 'Jeewantha', '2025-12-09 14:56:40'),
	(2, 'Saman', '2025-12-09 14:57:26'),
	(3, 'Kamal', '2025-12-09 15:19:49'),
	(4, 'Sampath', '2025-12-09 15:40:14'),
	(5, 'Nuwan', '2025-12-10 06:24:17'),
	(6, 'Sayan', '2025-12-10 07:03:23'),
	(7, 'Sanath', '2025-12-10 07:09:49'),
	(8, 'Senula', '2025-12-10 07:18:49'),
	(9, 'Test', '2025-12-10 07:31:54');
/*!40000 ALTER TABLE `hanoi_users` ENABLE KEYS */;

CREATE TABLE IF NOT EXISTS `players` (
  `player_id` int(11) NOT NULL AUTO_INCREMENT,
  `player_name` varchar(100) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `last_active` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`player_id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_player_name` (`player_name`),
  KEY `idx_email` (`email`),
  KEY `idx_last_active` (`last_active`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `players` (`player_id`, `player_name`, `email`, `created_at`, `last_active`) VALUES
	(1, 'gmna', NULL, '2025-11-30 05:08:55', '2025-11-30 05:08:55'),
	(2, 'gimna', NULL, '2025-11-30 05:17:05', '2025-11-30 16:28:59'),
	(3, 'Kavishka', NULL, '2025-11-30 06:17:21', '2025-11-30 06:17:21'),
	(4, 'gk', NULL, '2025-11-30 10:53:03', '2025-12-08 17:34:44'),
	(5, 'gkm', NULL, '2025-11-30 11:03:16', '2025-11-30 11:04:09'),
	(6, 'gimnasd', NULL, '2025-11-30 11:21:57', '2025-11-30 11:25:10'),
	(7, 'hen', NULL, '2025-11-30 16:20:15', '2025-11-30 16:22:12'),
	(8, 'gh', NULL, '2025-11-30 16:49:27', '2025-11-30 16:49:27'),
	(9, 'fdg', NULL, '2025-11-30 16:51:55', '2025-11-30 16:52:46'),
	(10, 'fejf', NULL, '2025-11-30 17:03:12', '2025-11-30 17:03:37'),
	(11, 'dsf', NULL, '2025-11-30 17:19:17', '2025-11-30 17:20:42'),
	(12, 'sdfs', NULL, '2025-11-30 17:19:57', '2025-11-30 17:19:57'),
	(13, 'njk', NULL, '2025-12-01 06:09:35', '2025-12-01 06:14:39'),
	(14, 'jjf', NULL, '2025-12-02 08:59:41', '2025-12-02 08:59:41'),
	(15, 'asd', NULL, '2025-12-02 09:00:30', '2025-12-02 09:00:30'),
	(16, 'new_q', NULL, '2025-12-02 09:16:58', '2025-12-02 09:16:58'),
	(17, 'qwe', NULL, '2025-12-02 09:29:13', '2025-12-02 09:29:13');

CREATE TABLE IF NOT EXISTS `player_scores` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `player_name` varchar(100) NOT NULL,
  `correct_throws` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `player_scores` (`id`, `player_name`, `correct_throws`, `created_at`) VALUES
	(1, 'Riflan', 3, '2025-11-17 10:08:19'),
	(2, 'Riflan', 3, '2025-11-17 10:09:04'),
	(3, 'Riflan', 3, '2025-11-17 10:27:19'),
	(4, 'Nandana', 3, '2025-12-05 12:36:43'),
	(5, 'Gimna', 3, '2025-12-10 11:11:23');

CREATE TABLE IF NOT EXISTS `queens_algorithms` (
  `algorithm_id` int(11) NOT NULL AUTO_INCREMENT,
  `algorithm_name` varchar(100) NOT NULL,
  `algorithm_type` enum('Sequential','Threaded') NOT NULL,
  `complexity` varchar(50) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`algorithm_id`),
  UNIQUE KEY `algorithm_name` (`algorithm_name`),
  KEY `idx_algorithm_type` (`algorithm_type`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `queens_algorithms` (`algorithm_id`, `algorithm_name`, `algorithm_type`, `complexity`, `description`, `created_at`) VALUES
	(1, 'Sequential Backtracking', 'Sequential', 'O(N!)', 'Single-threaded backtracking algorithm that explores the solution space sequentially', '2025-12-02 09:16:21'),
	(2, 'Threaded Backtracking', 'Threaded', 'O(N!)', 'Multi-threaded approach that divides work across first row positions for parallel processing', '2025-12-02 09:16:21');

CREATE TABLE `queens_algorithm_comparison` (
	`algorithm_name` VARCHAR(100) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`algorithm_type` ENUM('Sequential','Threaded') NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`complexity` VARCHAR(50) NULL COLLATE 'utf8mb4_unicode_ci',
	`times_executed` BIGINT(21) NOT NULL,
	`avg_time_ms` DECIMAL(11,4) NULL,
	`min_time_ms` DECIMAL(10,4) NULL,
	`max_time_ms` DECIMAL(10,4) NULL,
	`stddev_time_ms` DOUBLE(21,4) NULL,
	`unique_sessions` BIGINT(21) NOT NULL
) ENGINE=MyISAM;

CREATE TABLE IF NOT EXISTS `queens_algorithm_performance` (
  `performance_id` int(11) NOT NULL AUTO_INCREMENT,
  `session_id` int(11) NOT NULL,
  `algorithm_id` int(11) NOT NULL,
  `time_taken_ms` decimal(10,4) NOT NULL,
  `solutions_found` int(11) DEFAULT 92,
  `memory_usage_mb` decimal(10,2) DEFAULT NULL,
  `executed_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`performance_id`),
  KEY `idx_session_algorithm` (`session_id`,`algorithm_id`),
  KEY `idx_algorithm_performance` (`algorithm_id`,`time_taken_ms`),
  KEY `idx_executed_at` (`executed_at`),
  KEY `idx_performance_algorithm_time` (`algorithm_id`,`time_taken_ms`),
  CONSTRAINT `queens_algorithm_performance_ibfk_1` FOREIGN KEY (`session_id`) REFERENCES `queens_game_sessions` (`session_id`) ON DELETE CASCADE,
  CONSTRAINT `queens_algorithm_performance_ibfk_2` FOREIGN KEY (`algorithm_id`) REFERENCES `queens_algorithms` (`algorithm_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `queens_algorithm_performance` (`performance_id`, `session_id`, `algorithm_id`, `time_taken_ms`, `solutions_found`, `memory_usage_mb`, `executed_at`) VALUES
	(1, 1, 1, 7.6000, 92, NULL, '2025-12-02 09:29:14'),
	(2, 1, 2, 5.3000, 92, NULL, '2025-12-02 09:29:14');

CREATE TABLE IF NOT EXISTS `queens_found_solutions` (
  `found_solution_id` int(11) NOT NULL AUTO_INCREMENT,
  `session_id` int(11) NOT NULL,
  `player_id` int(11) NOT NULL,
  `solution_number` int(11) NOT NULL,
  `solution_board` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`solution_board`)),
  `solution_hash` varchar(64) DEFAULT NULL,
  `found_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `is_duplicate` tinyint(1) DEFAULT 0,
  `attempt_order` int(11) DEFAULT NULL,
  PRIMARY KEY (`found_solution_id`),
  UNIQUE KEY `unique_session_solution` (`session_id`,`solution_number`),
  KEY `idx_session_solutions` (`session_id`,`solution_number`),
  KEY `idx_player_solutions` (`player_id`,`found_at`),
  KEY `idx_solution_hash` (`solution_hash`),
  KEY `idx_duplicate_check` (`session_id`,`solution_number`,`is_duplicate`),
  KEY `idx_solutions_session_duplicate` (`session_id`,`is_duplicate`,`solution_number`),
  CONSTRAINT `queens_found_solutions_ibfk_1` FOREIGN KEY (`session_id`) REFERENCES `queens_game_sessions` (`session_id`) ON DELETE CASCADE,
  CONSTRAINT `queens_found_solutions_ibfk_2` FOREIGN KEY (`player_id`) REFERENCES `players` (`player_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `queens_found_solutions` (`found_solution_id`, `session_id`, `player_id`, `solution_number`, `solution_board`, `solution_hash`, `found_at`, `is_duplicate`, `attempt_order`) VALUES
	(1, 1, 17, 1, '[0,4,7,5,2,6,1,3]', 'ee8482eab75e828546e04aec46d36a7f', '2025-12-02 09:29:25', 0, 1),
	(2, 1, 17, 2, '[0,5,7,2,6,3,1,4]', 'c940ff46158e8073493d5332d95479e8', '2025-12-02 09:32:39', 0, 2),
	(3, 1, 17, 3, '[0,6,3,5,7,1,4,2]', '0357e06d97eb64084a2a14e9640decfd', '2025-12-02 09:32:41', 0, 3);

CREATE TABLE IF NOT EXISTS `queens_game_sessions` (
  `session_id` int(11) NOT NULL AUTO_INCREMENT,
  `player_id` int(11) NOT NULL,
  `game_id` int(11) NOT NULL,
  `started_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `completed_at` timestamp NULL DEFAULT NULL,
  `session_duration_seconds` int(11) DEFAULT NULL,
  `sequential_time_ms` decimal(10,4) DEFAULT NULL,
  `threaded_time_ms` decimal(10,4) DEFAULT NULL,
  `speedup_factor` decimal(10,4) DEFAULT NULL,
  `solutions_count` int(11) DEFAULT 92,
  `total_solutions_found` int(11) DEFAULT 0,
  `is_completed` tinyint(1) DEFAULT 0,
  `completion_percentage` decimal(5,2) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`session_id`),
  KEY `game_id` (`game_id`),
  KEY `idx_player_sessions` (`player_id`,`created_at`),
  KEY `idx_completed` (`is_completed`,`completed_at`),
  KEY `idx_started_at` (`started_at`),
  KEY `idx_session_player_date` (`player_id`,`started_at`),
  CONSTRAINT `queens_game_sessions_ibfk_1` FOREIGN KEY (`player_id`) REFERENCES `players` (`player_id`) ON DELETE CASCADE,
  CONSTRAINT `queens_game_sessions_ibfk_2` FOREIGN KEY (`game_id`) REFERENCES `games` (`game_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `queens_game_sessions` (`session_id`, `player_id`, `game_id`, `started_at`, `completed_at`, `session_duration_seconds`, `sequential_time_ms`, `threaded_time_ms`, `speedup_factor`, `solutions_count`, `total_solutions_found`, `is_completed`, `completion_percentage`, `created_at`, `updated_at`) VALUES
	(1, 17, 2, '2025-12-02 09:29:14', NULL, NULL, 7.6000, 5.3000, 1.4340, 92, 3, 0, 3.26, '2025-12-02 09:29:14', '2025-12-02 09:32:41');

CREATE TABLE `queens_leaderboard` (
	`player_name` VARCHAR(100) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`unique_solutions` BIGINT(21) NOT NULL,
	`total_games` BIGINT(21) NOT NULL,
	`avg_completion_rate` DECIMAL(6,2) NULL,
	`fastest_completion_time` INT(11) NULL,
	`full_completions` DECIMAL(25,0) NULL,
	`last_played` TIMESTAMP NULL,
	`ranking` BIGINT(21) NOT NULL
) ENGINE=MyISAM;

CREATE TABLE IF NOT EXISTS `queens_master_solutions` (
  `master_solution_id` int(11) NOT NULL AUTO_INCREMENT,
  `solution_number` int(11) NOT NULL,
  `solution_board` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`solution_board`)),
  `solution_string` varchar(50) DEFAULT NULL,
  `solution_hash` varchar(64) DEFAULT NULL,
  `symmetry_type` enum('unique','rotation','reflection','both') DEFAULT NULL,
  `difficulty_level` enum('easy','medium','hard') DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`master_solution_id`),
  UNIQUE KEY `solution_number` (`solution_number`),
  UNIQUE KEY `solution_hash` (`solution_hash`),
  KEY `idx_solution_number` (`solution_number`),
  KEY `idx_solution_hash` (`solution_hash`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `queens_master_solutions` (`master_solution_id`, `solution_number`, `solution_board`, `solution_string`, `solution_hash`, `symmetry_type`, `difficulty_level`, `created_at`) VALUES
	(1, 1, '[0,4,7,5,2,6,1,3]', 'A1 E2 H3 F4 C5 G6 B7 D8', 'ee8482eab75e828546e04aec46d36a7f', 'unique', 'medium', '2025-12-02 09:16:21');

CREATE TABLE `queens_player_stats` (
	`player_id` INT(11) NOT NULL,
	`player_name` VARCHAR(100) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`total_games_played` BIGINT(21) NOT NULL,
	`total_solutions_discovered` DECIMAL(32,0) NULL,
	`unique_solutions_found` BIGINT(21) NOT NULL,
	`best_completion_rate` DECIMAL(5,2) NULL,
	`avg_speedup_factor` DECIMAL(14,8) NULL,
	`fastest_sequential_time` DECIMAL(10,4) NULL,
	`fastest_threaded_time` DECIMAL(10,4) NULL,
	`games_completed` DECIMAL(25,0) NULL,
	`last_game_completed` TIMESTAMP NULL
) ENGINE=MyISAM;

CREATE TABLE IF NOT EXISTS `scores` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` varchar(255) NOT NULL,
  `player_name` varchar(100) NOT NULL,
  `pegs` int(11) NOT NULL,
  `disks` int(11) NOT NULL,
  `user_moves` int(11) NOT NULL,
  `target_moves` int(11) DEFAULT NULL,
  `is_optimal` tinyint(1) DEFAULT 0,
  `time_taken_ms` decimal(10,0) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*!40000 ALTER TABLE `scores` DISABLE KEYS */;
INSERT INTO `scores` (`id`, `user_id`, `player_name`, `pegs`, `disks`, `user_moves`, `target_moves`, `is_optimal`, `time_taken_ms`, `created_at`) VALUES
	(1, 'user-pkvleg', 'Anon-ego3', 3, 3, 7, 7, 1, 1202342, '2025-11-30 11:56:42'),
	(2, 'user-1nxbpm', 'Anon-0kmt', 3, 3, 7, 7, 1, 452323, '2025-11-30 12:04:12'),
	(3, 'anonymous', 'Nuwan', 3, 3, 7, 7, 1, 14797, '2025-11-30 14:56:58'),
	(4, 'anonymous', 'Jeewa', 3, 3, 7, 7, 1, 14163, '2025-11-30 15:00:10'),
	(5, 'anonymous', 'Heyja', 3, 3, 7, 7, 1, 14183, '2025-11-30 15:09:01'),
	(6, 'anonymous', 'Sandu', 3, 3, 13, 7, 0, 27907, '2025-11-30 15:11:31'),
	(7, 'anonymous', 'Sandu', 3, 3, 7, 7, 1, 14163, '2025-11-30 15:12:01'),
	(8, 'anonymous', 'SS', 3, 3, 7, 7, 1, 12884, '2025-11-30 15:12:59'),
	(9, 'anonymous', 'Gayana', 3, 3, 7, 7, 1, 17807, '2025-11-30 15:59:38'),
	(10, 'anonymous', 'Geew', 3, 3, 13, 7, 0, 29449, '2025-11-30 16:01:46'),
	(11, 'anonymous', 'Nuwan', 3, 3, 13, 7, 0, 32877, '2025-11-30 16:12:35'),
	(12, 'anonymous', 'Heyja', 3, 3, 7, 7, 1, 11401, '2025-11-30 17:14:38'),
	(13, 'anonymous', 'Heyja', 3, 3, 7, 7, 1, 10682, '2025-11-30 17:15:07');
/*!40000 ALTER TABLE `scores` ENABLE KEYS */;

CREATE TABLE IF NOT EXISTS `tsg_algorithm_performance` (
  `performance_id` int(11) NOT NULL AUTO_INCREMENT,
  `session_id` int(11) NOT NULL,
  `algorithm_name` varchar(100) NOT NULL,
  `execution_time_ms` decimal(10,4) NOT NULL,
  `result_value` int(11) DEFAULT NULL,
  `algorithm_type` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`performance_id`),
  KEY `idx_session_performance` (`session_id`),
  KEY `idx_algorithm_name` (`algorithm_name`),
  CONSTRAINT `tsg_algorithm_performance_ibfk_1` FOREIGN KEY (`session_id`) REFERENCES `tsg_game_sessions` (`session_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


CREATE TABLE IF NOT EXISTS `tsg_game_details` (
  `detail_id` int(11) NOT NULL AUTO_INCREMENT,
  `session_id` int(11) NOT NULL,
  `round_number` int(11) DEFAULT 1,
  `player_answer` int(11) NOT NULL,
  `correct_answer` int(11) NOT NULL,
  `is_correct` tinyint(1) NOT NULL,
  `capacities` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`capacities`)),
  `algorithm_results` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`algorithm_results`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`detail_id`),
  KEY `idx_session_detail` (`session_id`),
  CONSTRAINT `tsg_game_details_ibfk_1` FOREIGN KEY (`session_id`) REFERENCES `tsg_game_sessions` (`session_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


CREATE TABLE IF NOT EXISTS `tsg_game_sessions` (
  `session_id` int(11) NOT NULL AUTO_INCREMENT,
  `player_id` int(11) NOT NULL,
  `game_id` int(11) NOT NULL,
  `started_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `completed_at` timestamp NULL DEFAULT NULL,
  `session_duration_seconds` int(11) DEFAULT NULL,
  `is_completed` tinyint(1) DEFAULT 0,
  `is_successful` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`session_id`),
  KEY `idx_player_session` (`player_id`,`started_at`),
  KEY `idx_game_session` (`game_id`,`started_at`),
  CONSTRAINT `tsg_game_sessions_ibfk_1` FOREIGN KEY (`player_id`) REFERENCES `players` (`player_id`) ON DELETE CASCADE,
  CONSTRAINT `tsg_game_sessions_ibfk_2` FOREIGN KEY (`game_id`) REFERENCES `games` (`game_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


CREATE TABLE IF NOT EXISTS `tsp_algorithms` (
  `algorithm_id` int(11) NOT NULL AUTO_INCREMENT,
  `algorithm_name` varchar(100) NOT NULL,
  `algorithm_type` enum('iterative','recursive','heuristic') NOT NULL,
  `complexity` varchar(50) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`algorithm_id`),
  UNIQUE KEY `algorithm_name` (`algorithm_name`),
  KEY `idx_algorithm_name` (`algorithm_name`),
  KEY `idx_algorithm_type` (`algorithm_type`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `tsp_algorithms` (`algorithm_id`, `algorithm_name`, `algorithm_type`, `complexity`, `description`, `created_at`) VALUES
	(1, 'Nearest Neighbor (Greedy)', 'heuristic', 'O(n²)', 'Greedy algorithm that selects nearest unvisited city at each step', '2025-11-30 04:26:53'),
	(2, 'Brute Force (Recursive)', 'recursive', 'O(n!)', 'Exhaustive search checking all possible route permutations', '2025-11-30 04:26:53'),
	(3, 'Dynamic Programming (Held-Karp)', 'iterative', 'O(n² × 2ⁿ)', 'Optimal algorithm using memoization and bitmask dynamic programming', '2025-11-30 04:26:53');

CREATE TABLE IF NOT EXISTS `tsp_algorithm_performance` (
  `performance_id` int(11) NOT NULL AUTO_INCREMENT,
  `session_id` int(11) NOT NULL,
  `algorithm_id` int(11) NOT NULL,
  `time_taken_ms` decimal(10,4) NOT NULL,
  `distance_found` decimal(10,2) NOT NULL,
  `route_found` varchar(255) NOT NULL,
  `is_optimal_solution` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`performance_id`),
  UNIQUE KEY `unique_algo_per_session` (`session_id`,`algorithm_id`),
  KEY `idx_session_id` (`session_id`),
  KEY `idx_algorithm_id` (`algorithm_id`),
  KEY `idx_time_taken` (`time_taken_ms`),
  CONSTRAINT `tsp_algorithm_performance_ibfk_1` FOREIGN KEY (`session_id`) REFERENCES `game_sessions` (`session_id`) ON DELETE CASCADE,
  CONSTRAINT `tsp_algorithm_performance_ibfk_2` FOREIGN KEY (`algorithm_id`) REFERENCES `tsp_algorithms` (`algorithm_id`)
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `tsp_algorithm_performance` (`performance_id`, `session_id`, `algorithm_id`, `time_taken_ms`, `distance_found`, `route_found`, `is_optimal_solution`, `created_at`) VALUES
	(1, 1, 1, 0.2000, 539.00, 'D → C → E → F → G → H → I → J → A → D', 0, '2025-11-30 05:35:16'),
	(2, 1, 2, 63.0000, 530.00, 'D → C → A → J → I → H → G → F → E → D', 1, '2025-11-30 05:35:16'),
	(3, 1, 3, 3.4000, 530.00, 'D → C → A → J → I → H → G → F → E → D', 1, '2025-11-30 05:35:16'),
	(4, 2, 1, 0.4000, 528.00, 'F → G → H → I → J → A → B → C → D → F', 1, '2025-11-30 05:43:43'),
	(5, 2, 2, 106.6000, 528.00, 'F → D → C → B → A → J → I → H → G → F', 1, '2025-11-30 05:43:43'),
	(6, 2, 3, 5.3000, 528.00, 'F → D → C → B → A → J → I → H → G → F', 1, '2025-11-30 05:43:43'),
	(7, 3, 1, 0.2000, 579.00, 'C → D → E → F → G → H → I → J → A → B → C', 1, '2025-11-30 11:04:09'),
	(8, 3, 2, 494.8000, 579.00, 'C → D → E → F → G → H → I → J → A → B → C', 1, '2025-11-30 11:04:09'),
	(9, 3, 3, 4.2000, 579.00, 'C → D → E → F → G → H → I → J → A → B → C', 1, '2025-11-30 11:04:09'),
	(10, 4, 1, 0.6000, 313.00, 'G → H → J → A → B → G', 1, '2025-11-30 11:20:22'),
	(11, 4, 2, 0.9000, 313.00, 'G → H → J → A → B → G', 1, '2025-11-30 11:20:22'),
	(12, 4, 3, 0.4000, 313.00, 'G → H → J → A → B → G', 1, '2025-11-30 11:20:22'),
	(13, 5, 1, 0.3000, 375.00, 'E → F → G → D → C → B → E', 0, '2025-11-30 11:25:10'),
	(14, 5, 2, 1.4000, 367.00, 'E → F → G → B → C → D → E', 1, '2025-11-30 11:25:10'),
	(15, 5, 3, 0.9000, 367.00, 'E → F → G → B → C → D → E', 1, '2025-11-30 11:25:10'),
	(16, 6, 1, 0.2000, 433.00, 'E → D → F → G → H → J → A → E', 0, '2025-11-30 16:22:12'),
	(17, 6, 2, 1.8000, 425.00, 'E → D → A → J → H → G → F → E', 1, '2025-11-30 16:22:12'),
	(18, 6, 3, 1.3000, 425.00, 'E → D → A → J → H → G → F → E', 1, '2025-11-30 16:22:12'),
	(19, 7, 1, 0.1000, 423.00, 'C → D → E → F → G → A → B → C', 1, '2025-11-30 16:28:59'),
	(20, 7, 2, 4.4000, 423.00, 'C → D → E → F → G → A → B → C', 1, '2025-11-30 16:28:59'),
	(21, 7, 3, 1.1000, 423.00, 'C → D → E → F → G → A → B → C', 1, '2025-11-30 16:28:59'),
	(22, 8, 1, 0.3000, 369.00, 'B → C → D → E → F → J → B', 1, '2025-11-30 16:52:46'),
	(23, 8, 2, 1.6000, 369.00, 'B → C → D → E → F → J → B', 1, '2025-11-30 16:52:46'),
	(24, 8, 3, 1.4000, 369.00, 'B → C → D → E → F → J → B', 1, '2025-11-30 16:52:46'),
	(25, 9, 1, 0.1000, 370.00, 'E → F → G → A → B → C → E', 1, '2025-11-30 17:03:37'),
	(26, 9, 2, 1.0000, 370.00, 'E → F → G → A → B → C → E', 1, '2025-11-30 17:03:37'),
	(27, 9, 3, 0.7000, 370.00, 'E → F → G → A → B → C → E', 1, '2025-11-30 17:03:37'),
	(28, 10, 1, 0.4000, 425.00, 'J → B → C → D → E → F → G → J', 1, '2025-11-30 17:20:42'),
	(29, 10, 2, 3.1000, 425.00, 'J → B → C → D → E → F → G → J', 1, '2025-11-30 17:20:42'),
	(30, 10, 3, 1.2000, 425.00, 'J → B → C → D → E → F → G → J', 1, '2025-11-30 17:20:42'),
	(31, 11, 1, 0.1000, 527.00, 'C → B → A → J → I → H → G → F → E → C', 1, '2025-12-01 06:14:39'),
	(32, 11, 2, 59.2000, 527.00, 'C → E → F → G → H → I → J → A → B → C', 1, '2025-12-01 06:14:39'),
	(33, 11, 3, 3.2000, 527.00, 'C → E → F → G → H → I → J → A → B → C', 1, '2025-12-01 06:14:39'),
	(34, 12, 1, 0.2000, 181.00, 'I → J → A → I', 1, '2025-12-08 17:34:44'),
	(35, 12, 2, 0.2000, 181.00, 'I → J → A → I', 1, '2025-12-08 17:34:44'),
	(36, 12, 3, 0.4000, 181.00, 'I → J → A → I', 1, '2025-12-08 17:34:44');

CREATE TABLE IF NOT EXISTS `tsp_city_distances` (
  `distance_id` int(11) NOT NULL AUTO_INCREMENT,
  `session_id` int(11) NOT NULL,
  `from_city` char(1) NOT NULL,
  `to_city` char(1) NOT NULL,
  `distance` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`distance_id`),
  UNIQUE KEY `unique_distance_pair` (`session_id`,`from_city`,`to_city`),
  KEY `idx_session_id` (`session_id`),
  KEY `idx_from_city` (`from_city`),
  KEY `idx_to_city` (`to_city`),
  CONSTRAINT `tsp_city_distances_ibfk_1` FOREIGN KEY (`session_id`) REFERENCES `game_sessions` (`session_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=549 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `tsp_city_distances` (`distance_id`, `session_id`, `from_city`, `to_city`, `distance`, `created_at`) VALUES
	(1, 1, 'D', 'C', 55, '2025-11-30 05:35:16'),
	(2, 1, 'C', 'D', 55, '2025-11-30 05:35:16'),
	(3, 1, 'D', 'E', 57, '2025-11-30 05:35:16'),
	(4, 1, 'E', 'D', 57, '2025-11-30 05:35:16'),
	(5, 1, 'D', 'F', 67, '2025-11-30 05:35:16'),
	(6, 1, 'F', 'D', 67, '2025-11-30 05:35:16'),
	(7, 1, 'D', 'G', 76, '2025-11-30 05:35:16'),
	(8, 1, 'G', 'D', 76, '2025-11-30 05:35:16'),
	(9, 1, 'D', 'H', 80, '2025-11-30 05:35:16'),
	(10, 1, 'H', 'D', 80, '2025-11-30 05:35:16'),
	(11, 1, 'D', 'I', 82, '2025-11-30 05:35:16'),
	(12, 1, 'I', 'D', 82, '2025-11-30 05:35:16'),
	(13, 1, 'D', 'J', 77, '2025-11-30 05:35:16'),
	(14, 1, 'J', 'D', 77, '2025-11-30 05:35:16'),
	(15, 1, 'D', 'A', 72, '2025-11-30 05:35:16'),
	(16, 1, 'A', 'D', 72, '2025-11-30 05:35:16'),
	(17, 1, 'C', 'E', 62, '2025-11-30 05:35:16'),
	(18, 1, 'E', 'C', 62, '2025-11-30 05:35:16'),
	(19, 1, 'C', 'F', 70, '2025-11-30 05:35:16'),
	(20, 1, 'F', 'C', 70, '2025-11-30 05:35:16'),
	(21, 1, 'C', 'G', 77, '2025-11-30 05:35:16'),
	(22, 1, 'G', 'C', 77, '2025-11-30 05:35:16'),
	(23, 1, 'C', 'H', 80, '2025-11-30 05:35:16'),
	(24, 1, 'H', 'C', 80, '2025-11-30 05:35:16'),
	(25, 1, 'C', 'I', 81, '2025-11-30 05:35:16'),
	(26, 1, 'I', 'C', 81, '2025-11-30 05:35:16'),
	(27, 1, 'C', 'J', 74, '2025-11-30 05:35:16'),
	(28, 1, 'J', 'C', 74, '2025-11-30 05:35:16'),
	(29, 1, 'C', 'A', 68, '2025-11-30 05:35:16'),
	(30, 1, 'A', 'C', 68, '2025-11-30 05:35:16'),
	(31, 1, 'E', 'F', 60, '2025-11-30 05:35:16'),
	(32, 1, 'F', 'E', 60, '2025-11-30 05:35:16'),
	(33, 1, 'E', 'G', 69, '2025-11-30 05:35:16'),
	(34, 1, 'G', 'E', 69, '2025-11-30 05:35:16'),
	(35, 1, 'E', 'H', 74, '2025-11-30 05:35:16'),
	(36, 1, 'H', 'E', 74, '2025-11-30 05:35:16'),
	(37, 1, 'E', 'I', 78, '2025-11-30 05:35:16'),
	(38, 1, 'I', 'E', 78, '2025-11-30 05:35:16'),
	(39, 1, 'E', 'J', 75, '2025-11-30 05:35:16'),
	(40, 1, 'J', 'E', 75, '2025-11-30 05:35:16'),
	(41, 1, 'E', 'A', 72, '2025-11-30 05:35:16'),
	(42, 1, 'A', 'E', 72, '2025-11-30 05:35:16'),
	(43, 1, 'F', 'G', 59, '2025-11-30 05:35:16'),
	(44, 1, 'G', 'F', 59, '2025-11-30 05:35:16'),
	(45, 1, 'F', 'H', 65, '2025-11-30 05:35:16'),
	(46, 1, 'H', 'F', 65, '2025-11-30 05:35:16'),
	(47, 1, 'F', 'I', 70, '2025-11-30 05:35:16'),
	(48, 1, 'I', 'F', 70, '2025-11-30 05:35:16'),
	(49, 1, 'F', 'J', 70, '2025-11-30 05:35:16'),
	(50, 1, 'J', 'F', 70, '2025-11-30 05:35:16'),
	(51, 1, 'F', 'A', 72, '2025-11-30 05:35:16'),
	(52, 1, 'A', 'F', 72, '2025-11-30 05:35:16'),
	(53, 1, 'G', 'H', 56, '2025-11-30 05:35:16'),
	(54, 1, 'H', 'G', 56, '2025-11-30 05:35:16'),
	(55, 1, 'G', 'I', 63, '2025-11-30 05:35:16'),
	(56, 1, 'I', 'G', 63, '2025-11-30 05:35:16'),
	(57, 1, 'G', 'J', 67, '2025-11-30 05:35:16'),
	(58, 1, 'J', 'G', 67, '2025-11-30 05:35:16'),
	(59, 1, 'G', 'A', 72, '2025-11-30 05:35:16'),
	(60, 1, 'A', 'G', 72, '2025-11-30 05:35:16'),
	(61, 1, 'H', 'I', 58, '2025-11-30 05:35:16'),
	(62, 1, 'I', 'H', 58, '2025-11-30 05:35:16'),
	(63, 1, 'H', 'J', 63, '2025-11-30 05:35:16'),
	(64, 1, 'J', 'H', 63, '2025-11-30 05:35:16'),
	(65, 1, 'H', 'A', 71, '2025-11-30 05:35:16'),
	(66, 1, 'A', 'H', 71, '2025-11-30 05:35:16'),
	(67, 1, 'I', 'J', 58, '2025-11-30 05:35:16'),
	(68, 1, 'J', 'I', 58, '2025-11-30 05:35:16'),
	(69, 1, 'I', 'A', 67, '2025-11-30 05:35:16'),
	(70, 1, 'A', 'I', 67, '2025-11-30 05:35:16'),
	(71, 1, 'J', 'A', 59, '2025-11-30 05:35:16'),
	(72, 1, 'A', 'J', 59, '2025-11-30 05:35:16'),
	(73, 2, 'F', 'B', 70, '2025-11-30 05:43:43'),
	(74, 2, 'B', 'F', 70, '2025-11-30 05:43:43'),
	(75, 2, 'F', 'C', 70, '2025-11-30 05:43:43'),
	(76, 2, 'C', 'F', 70, '2025-11-30 05:43:43'),
	(77, 2, 'F', 'D', 66, '2025-11-30 05:43:43'),
	(78, 2, 'D', 'F', 66, '2025-11-30 05:43:43'),
	(79, 2, 'F', 'A', 70, '2025-11-30 05:43:43'),
	(80, 2, 'A', 'F', 70, '2025-11-30 05:43:43'),
	(81, 2, 'F', 'J', 72, '2025-11-30 05:43:43'),
	(82, 2, 'J', 'F', 72, '2025-11-30 05:43:43'),
	(83, 2, 'F', 'I', 70, '2025-11-30 05:43:43'),
	(84, 2, 'I', 'F', 70, '2025-11-30 05:43:43'),
	(85, 2, 'F', 'H', 66, '2025-11-30 05:43:43'),
	(86, 2, 'H', 'F', 66, '2025-11-30 05:43:43'),
	(87, 2, 'F', 'G', 59, '2025-11-30 05:43:43'),
	(88, 2, 'G', 'F', 59, '2025-11-30 05:43:43'),
	(89, 2, 'B', 'C', 56, '2025-11-30 05:43:43'),
	(90, 2, 'C', 'B', 56, '2025-11-30 05:43:43'),
	(91, 2, 'B', 'D', 63, '2025-11-30 05:43:43'),
	(92, 2, 'D', 'B', 63, '2025-11-30 05:43:43'),
	(93, 2, 'B', 'A', 60, '2025-11-30 05:43:43'),
	(94, 2, 'A', 'B', 60, '2025-11-30 05:43:43'),
	(95, 2, 'B', 'J', 69, '2025-11-30 05:43:43'),
	(96, 2, 'J', 'B', 69, '2025-11-30 05:43:43'),
	(97, 2, 'B', 'I', 75, '2025-11-30 05:43:43'),
	(98, 2, 'I', 'B', 75, '2025-11-30 05:43:43'),
	(99, 2, 'B', 'H', 78, '2025-11-30 05:43:43'),
	(100, 2, 'H', 'B', 78, '2025-11-30 05:43:43'),
	(101, 2, 'B', 'G', 75, '2025-11-30 05:43:43'),
	(102, 2, 'G', 'B', 75, '2025-11-30 05:43:43'),
	(103, 2, 'C', 'D', 57, '2025-11-30 05:43:43'),
	(104, 2, 'D', 'C', 57, '2025-11-30 05:43:43'),
	(105, 2, 'C', 'A', 67, '2025-11-30 05:43:43'),
	(106, 2, 'A', 'C', 67, '2025-11-30 05:43:43'),
	(107, 2, 'C', 'J', 75, '2025-11-30 05:43:43'),
	(108, 2, 'J', 'C', 75, '2025-11-30 05:43:43'),
	(109, 2, 'C', 'I', 80, '2025-11-30 05:43:43'),
	(110, 2, 'I', 'C', 80, '2025-11-30 05:43:43'),
	(111, 2, 'C', 'H', 81, '2025-11-30 05:43:43'),
	(112, 2, 'H', 'C', 81, '2025-11-30 05:43:43'),
	(113, 2, 'C', 'G', 77, '2025-11-30 05:43:43'),
	(114, 2, 'G', 'C', 77, '2025-11-30 05:43:43'),
	(115, 2, 'D', 'A', 71, '2025-11-30 05:43:43'),
	(116, 2, 'A', 'D', 71, '2025-11-30 05:43:43'),
	(117, 2, 'D', 'J', 78, '2025-11-30 05:43:43'),
	(118, 2, 'J', 'D', 78, '2025-11-30 05:43:43'),
	(119, 2, 'D', 'I', 81, '2025-11-30 05:43:43'),
	(120, 2, 'I', 'D', 81, '2025-11-30 05:43:43'),
	(121, 2, 'D', 'H', 80, '2025-11-30 05:43:43'),
	(122, 2, 'H', 'D', 80, '2025-11-30 05:43:43'),
	(123, 2, 'D', 'G', 74, '2025-11-30 05:43:43'),
	(124, 2, 'G', 'D', 74, '2025-11-30 05:43:43'),
	(125, 2, 'A', 'J', 58, '2025-11-30 05:43:43'),
	(126, 2, 'J', 'A', 58, '2025-11-30 05:43:43'),
	(127, 2, 'A', 'I', 65, '2025-11-30 05:43:43'),
	(128, 2, 'I', 'A', 65, '2025-11-30 05:43:43'),
	(129, 2, 'A', 'H', 70, '2025-11-30 05:43:43'),
	(130, 2, 'H', 'A', 70, '2025-11-30 05:43:43'),
	(131, 2, 'A', 'G', 70, '2025-11-30 05:43:43'),
	(132, 2, 'G', 'A', 70, '2025-11-30 05:43:43'),
	(133, 2, 'J', 'I', 58, '2025-11-30 05:43:43'),
	(134, 2, 'I', 'J', 58, '2025-11-30 05:43:43'),
	(135, 2, 'J', 'H', 64, '2025-11-30 05:43:43'),
	(136, 2, 'H', 'J', 64, '2025-11-30 05:43:43'),
	(137, 2, 'J', 'G', 68, '2025-11-30 05:43:43'),
	(138, 2, 'G', 'J', 68, '2025-11-30 05:43:43'),
	(139, 2, 'I', 'H', 57, '2025-11-30 05:43:43'),
	(140, 2, 'H', 'I', 57, '2025-11-30 05:43:43'),
	(141, 2, 'I', 'G', 63, '2025-11-30 05:43:43'),
	(142, 2, 'G', 'I', 63, '2025-11-30 05:43:43'),
	(143, 2, 'H', 'G', 57, '2025-11-30 05:43:43'),
	(144, 2, 'G', 'H', 57, '2025-11-30 05:43:43'),
	(145, 3, 'C', 'D', 56, '2025-11-30 11:04:09'),
	(146, 3, 'D', 'C', 56, '2025-11-30 11:04:09'),
	(147, 3, 'C', 'E', 64, '2025-11-30 11:04:09'),
	(148, 3, 'E', 'C', 64, '2025-11-30 11:04:09'),
	(149, 3, 'C', 'F', 71, '2025-11-30 11:04:09'),
	(150, 3, 'F', 'C', 71, '2025-11-30 11:04:09'),
	(151, 3, 'C', 'A', 67, '2025-11-30 11:04:09'),
	(152, 3, 'A', 'C', 67, '2025-11-30 11:04:09'),
	(153, 3, 'C', 'J', 75, '2025-11-30 11:04:09'),
	(154, 3, 'J', 'C', 75, '2025-11-30 11:04:09'),
	(155, 3, 'C', 'B', 58, '2025-11-30 11:04:09'),
	(156, 3, 'B', 'C', 58, '2025-11-30 11:04:09'),
	(157, 3, 'C', 'I', 80, '2025-11-30 11:04:09'),
	(158, 3, 'I', 'C', 80, '2025-11-30 11:04:09'),
	(159, 3, 'C', 'H', 80, '2025-11-30 11:04:09'),
	(160, 3, 'H', 'C', 80, '2025-11-30 11:04:09'),
	(161, 3, 'C', 'G', 78, '2025-11-30 11:04:09'),
	(162, 3, 'G', 'C', 78, '2025-11-30 11:04:09'),
	(163, 3, 'D', 'E', 58, '2025-11-30 11:04:09'),
	(164, 3, 'E', 'D', 58, '2025-11-30 11:04:09'),
	(165, 3, 'D', 'F', 67, '2025-11-30 11:04:09'),
	(166, 3, 'F', 'D', 67, '2025-11-30 11:04:09'),
	(167, 3, 'D', 'A', 70, '2025-11-30 11:04:09'),
	(168, 3, 'A', 'D', 70, '2025-11-30 11:04:09'),
	(169, 3, 'D', 'J', 76, '2025-11-30 11:04:09'),
	(170, 3, 'J', 'D', 76, '2025-11-30 11:04:09'),
	(171, 3, 'D', 'B', 62, '2025-11-30 11:04:09'),
	(172, 3, 'B', 'D', 62, '2025-11-30 11:04:09'),
	(173, 3, 'D', 'I', 79, '2025-11-30 11:04:09'),
	(174, 3, 'I', 'D', 79, '2025-11-30 11:04:09'),
	(175, 3, 'D', 'H', 78, '2025-11-30 11:04:09'),
	(176, 3, 'H', 'D', 78, '2025-11-30 11:04:09'),
	(177, 3, 'D', 'G', 75, '2025-11-30 11:04:09'),
	(178, 3, 'G', 'D', 75, '2025-11-30 11:04:09'),
	(179, 3, 'E', 'F', 60, '2025-11-30 11:04:09'),
	(180, 3, 'F', 'E', 60, '2025-11-30 11:04:09'),
	(181, 3, 'E', 'A', 73, '2025-11-30 11:04:09'),
	(182, 3, 'A', 'E', 73, '2025-11-30 11:04:09'),
	(183, 3, 'E', 'J', 77, '2025-11-30 11:04:09'),
	(184, 3, 'J', 'E', 77, '2025-11-30 11:04:09'),
	(185, 3, 'E', 'B', 68, '2025-11-30 11:04:09'),
	(186, 3, 'B', 'E', 68, '2025-11-30 11:04:09'),
	(187, 3, 'E', 'I', 77, '2025-11-30 11:04:09'),
	(188, 3, 'I', 'E', 77, '2025-11-30 11:04:09'),
	(189, 3, 'E', 'H', 75, '2025-11-30 11:04:09'),
	(190, 3, 'H', 'E', 75, '2025-11-30 11:04:09'),
	(191, 3, 'E', 'G', 70, '2025-11-30 11:04:09'),
	(192, 3, 'G', 'E', 70, '2025-11-30 11:04:09'),
	(193, 3, 'F', 'A', 72, '2025-11-30 11:04:09'),
	(194, 3, 'A', 'F', 72, '2025-11-30 11:04:09'),
	(195, 3, 'F', 'J', 72, '2025-11-30 11:04:09'),
	(196, 3, 'J', 'F', 72, '2025-11-30 11:04:09'),
	(197, 3, 'F', 'B', 72, '2025-11-30 11:04:09'),
	(198, 3, 'B', 'F', 72, '2025-11-30 11:04:09'),
	(199, 3, 'F', 'I', 70, '2025-11-30 11:04:09'),
	(200, 3, 'I', 'F', 70, '2025-11-30 11:04:09'),
	(201, 3, 'F', 'H', 66, '2025-11-30 11:04:09'),
	(202, 3, 'H', 'F', 66, '2025-11-30 11:04:09'),
	(203, 3, 'F', 'G', 60, '2025-11-30 11:04:09'),
	(204, 3, 'G', 'F', 60, '2025-11-30 11:04:09'),
	(205, 3, 'A', 'J', 58, '2025-11-30 11:04:09'),
	(206, 3, 'J', 'A', 58, '2025-11-30 11:04:09'),
	(207, 3, 'A', 'B', 59, '2025-11-30 11:04:09'),
	(208, 3, 'B', 'A', 59, '2025-11-30 11:04:09'),
	(209, 3, 'A', 'I', 66, '2025-11-30 11:04:09'),
	(210, 3, 'I', 'A', 66, '2025-11-30 11:04:09'),
	(211, 3, 'A', 'H', 69, '2025-11-30 11:04:09'),
	(212, 3, 'H', 'A', 69, '2025-11-30 11:04:09'),
	(213, 3, 'A', 'G', 71, '2025-11-30 11:04:09'),
	(214, 3, 'G', 'A', 71, '2025-11-30 11:04:09'),
	(215, 3, 'J', 'B', 67, '2025-11-30 11:04:09'),
	(216, 3, 'B', 'J', 67, '2025-11-30 11:04:09'),
	(217, 3, 'J', 'I', 58, '2025-11-30 11:04:09'),
	(218, 3, 'I', 'J', 58, '2025-11-30 11:04:09'),
	(219, 3, 'J', 'H', 63, '2025-11-30 11:04:09'),
	(220, 3, 'H', 'J', 63, '2025-11-30 11:04:09'),
	(221, 3, 'J', 'G', 67, '2025-11-30 11:04:09'),
	(222, 3, 'G', 'J', 67, '2025-11-30 11:04:09'),
	(223, 3, 'B', 'I', 74, '2025-11-30 11:04:09'),
	(224, 3, 'I', 'B', 74, '2025-11-30 11:04:09'),
	(225, 3, 'B', 'H', 75, '2025-11-30 11:04:09'),
	(226, 3, 'H', 'B', 75, '2025-11-30 11:04:09'),
	(227, 3, 'B', 'G', 75, '2025-11-30 11:04:09'),
	(228, 3, 'G', 'B', 75, '2025-11-30 11:04:09'),
	(229, 3, 'I', 'H', 56, '2025-11-30 11:04:09'),
	(230, 3, 'H', 'I', 56, '2025-11-30 11:04:09'),
	(231, 3, 'I', 'G', 62, '2025-11-30 11:04:09'),
	(232, 3, 'G', 'I', 62, '2025-11-30 11:04:09'),
	(233, 3, 'H', 'G', 56, '2025-11-30 11:04:09'),
	(234, 3, 'G', 'H', 56, '2025-11-30 11:04:09'),
	(235, 4, 'G', 'H', 59, '2025-11-30 11:20:22'),
	(236, 4, 'H', 'G', 59, '2025-11-30 11:20:22'),
	(237, 4, 'G', 'J', 67, '2025-11-30 11:20:22'),
	(238, 4, 'J', 'G', 67, '2025-11-30 11:20:22'),
	(239, 4, 'G', 'A', 71, '2025-11-30 11:20:22'),
	(240, 4, 'A', 'G', 71, '2025-11-30 11:20:22'),
	(241, 4, 'G', 'B', 74, '2025-11-30 11:20:22'),
	(242, 4, 'B', 'G', 74, '2025-11-30 11:20:22'),
	(243, 4, 'H', 'J', 63, '2025-11-30 11:20:22'),
	(244, 4, 'J', 'H', 63, '2025-11-30 11:20:22'),
	(245, 4, 'H', 'A', 71, '2025-11-30 11:20:22'),
	(246, 4, 'A', 'H', 71, '2025-11-30 11:20:22'),
	(247, 4, 'H', 'B', 76, '2025-11-30 11:20:22'),
	(248, 4, 'B', 'H', 76, '2025-11-30 11:20:22'),
	(249, 4, 'J', 'A', 60, '2025-11-30 11:20:22'),
	(250, 4, 'A', 'J', 60, '2025-11-30 11:20:22'),
	(251, 4, 'J', 'B', 68, '2025-11-30 11:20:22'),
	(252, 4, 'B', 'J', 68, '2025-11-30 11:20:22'),
	(253, 4, 'A', 'B', 57, '2025-11-30 11:20:22'),
	(254, 4, 'B', 'A', 57, '2025-11-30 11:20:22'),
	(255, 5, 'E', 'F', 58, '2025-11-30 11:25:10'),
	(256, 5, 'F', 'E', 58, '2025-11-30 11:25:10'),
	(257, 5, 'E', 'G', 67, '2025-11-30 11:25:10'),
	(258, 5, 'G', 'E', 67, '2025-11-30 11:25:10'),
	(259, 5, 'E', 'B', 69, '2025-11-30 11:25:10'),
	(260, 5, 'B', 'E', 69, '2025-11-30 11:25:10'),
	(261, 5, 'E', 'C', 65, '2025-11-30 11:25:10'),
	(262, 5, 'C', 'E', 65, '2025-11-30 11:25:10'),
	(263, 5, 'E', 'D', 58, '2025-11-30 11:25:10'),
	(264, 5, 'D', 'E', 58, '2025-11-30 11:25:10'),
	(265, 5, 'F', 'G', 59, '2025-11-30 11:25:10'),
	(266, 5, 'G', 'F', 59, '2025-11-30 11:25:10'),
	(267, 5, 'F', 'B', 72, '2025-11-30 11:25:10'),
	(268, 5, 'B', 'F', 72, '2025-11-30 11:25:10'),
	(269, 5, 'F', 'C', 71, '2025-11-30 11:25:10'),
	(270, 5, 'C', 'F', 71, '2025-11-30 11:25:10'),
	(271, 5, 'F', 'D', 66, '2025-11-30 11:25:10'),
	(272, 5, 'D', 'F', 66, '2025-11-30 11:25:10'),
	(273, 5, 'G', 'B', 77, '2025-11-30 11:25:10'),
	(274, 5, 'B', 'G', 77, '2025-11-30 11:25:10'),
	(275, 5, 'G', 'C', 78, '2025-11-30 11:25:10'),
	(276, 5, 'C', 'G', 78, '2025-11-30 11:25:10'),
	(277, 5, 'G', 'D', 74, '2025-11-30 11:25:10'),
	(278, 5, 'D', 'G', 74, '2025-11-30 11:25:10'),
	(279, 5, 'B', 'C', 58, '2025-11-30 11:25:10'),
	(280, 5, 'C', 'B', 58, '2025-11-30 11:25:10'),
	(281, 5, 'B', 'D', 64, '2025-11-30 11:25:10'),
	(282, 5, 'D', 'B', 64, '2025-11-30 11:25:10'),
	(283, 5, 'C', 'D', 57, '2025-11-30 11:25:10'),
	(284, 5, 'D', 'C', 57, '2025-11-30 11:25:10'),
	(285, 6, 'E', 'D', 57, '2025-11-30 16:22:12'),
	(286, 6, 'D', 'E', 57, '2025-11-30 16:22:12'),
	(287, 6, 'E', 'A', 71, '2025-11-30 16:22:12'),
	(288, 6, 'A', 'E', 71, '2025-11-30 16:22:12'),
	(289, 6, 'E', 'J', 75, '2025-11-30 16:22:12'),
	(290, 6, 'J', 'E', 75, '2025-11-30 16:22:12'),
	(291, 6, 'E', 'G', 69, '2025-11-30 16:22:12'),
	(292, 6, 'G', 'E', 69, '2025-11-30 16:22:12'),
	(293, 6, 'E', 'F', 59, '2025-11-30 16:22:12'),
	(294, 6, 'F', 'E', 59, '2025-11-30 16:22:12'),
	(295, 6, 'E', 'H', 75, '2025-11-30 16:22:12'),
	(296, 6, 'H', 'E', 75, '2025-11-30 16:22:12'),
	(297, 6, 'D', 'A', 71, '2025-11-30 16:22:12'),
	(298, 6, 'A', 'D', 71, '2025-11-30 16:22:12'),
	(299, 6, 'D', 'J', 77, '2025-11-30 16:22:12'),
	(300, 6, 'J', 'D', 77, '2025-11-30 16:22:12'),
	(301, 6, 'D', 'G', 75, '2025-11-30 16:22:12'),
	(302, 6, 'G', 'D', 75, '2025-11-30 16:22:12'),
	(303, 6, 'D', 'F', 67, '2025-11-30 16:22:12'),
	(304, 6, 'F', 'D', 67, '2025-11-30 16:22:12'),
	(305, 6, 'D', 'H', 80, '2025-11-30 16:22:12'),
	(306, 6, 'H', 'D', 80, '2025-11-30 16:22:12'),
	(307, 6, 'A', 'J', 58, '2025-11-30 16:22:12'),
	(308, 6, 'J', 'A', 58, '2025-11-30 16:22:12'),
	(309, 6, 'A', 'G', 71, '2025-11-30 16:22:12'),
	(310, 6, 'G', 'A', 71, '2025-11-30 16:22:12'),
	(311, 6, 'A', 'F', 70, '2025-11-30 16:22:12'),
	(312, 6, 'F', 'A', 70, '2025-11-30 16:22:12'),
	(313, 6, 'A', 'H', 68, '2025-11-30 16:22:12'),
	(314, 6, 'H', 'A', 68, '2025-11-30 16:22:12'),
	(315, 6, 'J', 'G', 68, '2025-11-30 16:22:12'),
	(316, 6, 'G', 'J', 68, '2025-11-30 16:22:12'),
	(317, 6, 'J', 'F', 71, '2025-11-30 16:22:12'),
	(318, 6, 'F', 'J', 71, '2025-11-30 16:22:12'),
	(319, 6, 'J', 'H', 62, '2025-11-30 16:22:12'),
	(320, 6, 'H', 'J', 62, '2025-11-30 16:22:12'),
	(321, 6, 'G', 'F', 59, '2025-11-30 16:22:12'),
	(322, 6, 'F', 'G', 59, '2025-11-30 16:22:12'),
	(323, 6, 'G', 'H', 59, '2025-11-30 16:22:12'),
	(324, 6, 'H', 'G', 59, '2025-11-30 16:22:12'),
	(325, 6, 'F', 'H', 67, '2025-11-30 16:22:12'),
	(326, 6, 'H', 'F', 67, '2025-11-30 16:22:12'),
	(327, 7, 'C', 'D', 57, '2025-11-30 16:28:59'),
	(328, 7, 'D', 'C', 57, '2025-11-30 16:28:59'),
	(329, 7, 'C', 'E', 64, '2025-11-30 16:28:59'),
	(330, 7, 'E', 'C', 64, '2025-11-30 16:28:59'),
	(331, 7, 'C', 'F', 73, '2025-11-30 16:28:59'),
	(332, 7, 'F', 'C', 73, '2025-11-30 16:28:59'),
	(333, 7, 'C', 'G', 78, '2025-11-30 16:28:59'),
	(334, 7, 'G', 'C', 78, '2025-11-30 16:28:59'),
	(335, 7, 'C', 'B', 58, '2025-11-30 16:28:59'),
	(336, 7, 'B', 'C', 58, '2025-11-30 16:28:59'),
	(337, 7, 'C', 'A', 68, '2025-11-30 16:28:59'),
	(338, 7, 'A', 'C', 68, '2025-11-30 16:28:59'),
	(339, 7, 'D', 'E', 58, '2025-11-30 16:28:59'),
	(340, 7, 'E', 'D', 58, '2025-11-30 16:28:59'),
	(341, 7, 'D', 'F', 69, '2025-11-30 16:28:59'),
	(342, 7, 'F', 'D', 69, '2025-11-30 16:28:59'),
	(343, 7, 'D', 'G', 75, '2025-11-30 16:28:59'),
	(344, 7, 'G', 'D', 75, '2025-11-30 16:28:59'),
	(345, 7, 'D', 'B', 63, '2025-11-30 16:28:59'),
	(346, 7, 'B', 'D', 63, '2025-11-30 16:28:59'),
	(347, 7, 'D', 'A', 71, '2025-11-30 16:28:59'),
	(348, 7, 'A', 'D', 71, '2025-11-30 16:28:59'),
	(349, 7, 'E', 'F', 61, '2025-11-30 16:28:59'),
	(350, 7, 'F', 'E', 61, '2025-11-30 16:28:59'),
	(351, 7, 'E', 'G', 68, '2025-11-30 16:28:59'),
	(352, 7, 'G', 'E', 68, '2025-11-30 16:28:59'),
	(353, 7, 'E', 'B', 68, '2025-11-30 16:28:59'),
	(354, 7, 'B', 'E', 68, '2025-11-30 16:28:59'),
	(355, 7, 'E', 'A', 73, '2025-11-30 16:28:59'),
	(356, 7, 'A', 'E', 73, '2025-11-30 16:28:59'),
	(357, 7, 'F', 'G', 57, '2025-11-30 16:28:59'),
	(358, 7, 'G', 'F', 57, '2025-11-30 16:28:59'),
	(359, 7, 'F', 'B', 74, '2025-11-30 16:28:59'),
	(360, 7, 'B', 'F', 74, '2025-11-30 16:28:59'),
	(361, 7, 'F', 'A', 72, '2025-11-30 16:28:59'),
	(362, 7, 'A', 'F', 72, '2025-11-30 16:28:59'),
	(363, 7, 'G', 'B', 76, '2025-11-30 16:28:59'),
	(364, 7, 'B', 'G', 76, '2025-11-30 16:28:59'),
	(365, 7, 'G', 'A', 72, '2025-11-30 16:28:59'),
	(366, 7, 'A', 'G', 72, '2025-11-30 16:28:59'),
	(367, 7, 'B', 'A', 60, '2025-11-30 16:28:59'),
	(368, 7, 'A', 'B', 60, '2025-11-30 16:28:59'),
	(369, 8, 'B', 'C', 57, '2025-11-30 16:52:46'),
	(370, 8, 'C', 'B', 57, '2025-11-30 16:52:46'),
	(371, 8, 'B', 'D', 63, '2025-11-30 16:52:46'),
	(372, 8, 'D', 'B', 63, '2025-11-30 16:52:46'),
	(373, 8, 'B', 'E', 68, '2025-11-30 16:52:46'),
	(374, 8, 'E', 'B', 68, '2025-11-30 16:52:46'),
	(375, 8, 'B', 'F', 70, '2025-11-30 16:52:46'),
	(376, 8, 'F', 'B', 70, '2025-11-30 16:52:46'),
	(377, 8, 'B', 'J', 68, '2025-11-30 16:52:46'),
	(378, 8, 'J', 'B', 68, '2025-11-30 16:52:46'),
	(379, 8, 'C', 'D', 56, '2025-11-30 16:52:46'),
	(380, 8, 'D', 'C', 56, '2025-11-30 16:52:46'),
	(381, 8, 'C', 'E', 63, '2025-11-30 16:52:46'),
	(382, 8, 'E', 'C', 63, '2025-11-30 16:52:46'),
	(383, 8, 'C', 'F', 69, '2025-11-30 16:52:46'),
	(384, 8, 'F', 'C', 69, '2025-11-30 16:52:46'),
	(385, 8, 'C', 'J', 74, '2025-11-30 16:52:46'),
	(386, 8, 'J', 'C', 74, '2025-11-30 16:52:46'),
	(387, 8, 'D', 'E', 58, '2025-11-30 16:52:46'),
	(388, 8, 'E', 'D', 58, '2025-11-30 16:52:46'),
	(389, 8, 'D', 'F', 66, '2025-11-30 16:52:46'),
	(390, 8, 'F', 'D', 66, '2025-11-30 16:52:46'),
	(391, 8, 'D', 'J', 77, '2025-11-30 16:52:46'),
	(392, 8, 'J', 'D', 77, '2025-11-30 16:52:46'),
	(393, 8, 'E', 'F', 59, '2025-11-30 16:52:46'),
	(394, 8, 'F', 'E', 59, '2025-11-30 16:52:46'),
	(395, 8, 'E', 'J', 76, '2025-11-30 16:52:46'),
	(396, 8, 'J', 'E', 76, '2025-11-30 16:52:46'),
	(397, 8, 'F', 'J', 71, '2025-11-30 16:52:46'),
	(398, 8, 'J', 'F', 71, '2025-11-30 16:52:46'),
	(399, 9, 'E', 'F', 59, '2025-11-30 17:03:37'),
	(400, 9, 'F', 'E', 59, '2025-11-30 17:03:37'),
	(401, 9, 'E', 'A', 71, '2025-11-30 17:03:37'),
	(402, 9, 'A', 'E', 71, '2025-11-30 17:03:37'),
	(403, 9, 'E', 'B', 68, '2025-11-30 17:03:37'),
	(404, 9, 'B', 'E', 68, '2025-11-30 17:03:37'),
	(405, 9, 'E', 'G', 69, '2025-11-30 17:03:37'),
	(406, 9, 'G', 'E', 69, '2025-11-30 17:03:37'),
	(407, 9, 'E', 'C', 63, '2025-11-30 17:03:37'),
	(408, 9, 'C', 'E', 63, '2025-11-30 17:03:37'),
	(409, 9, 'F', 'A', 70, '2025-11-30 17:03:37'),
	(410, 9, 'A', 'F', 70, '2025-11-30 17:03:37'),
	(411, 9, 'F', 'B', 71, '2025-11-30 17:03:37'),
	(412, 9, 'B', 'F', 71, '2025-11-30 17:03:37'),
	(413, 9, 'F', 'G', 60, '2025-11-30 17:03:37'),
	(414, 9, 'G', 'F', 60, '2025-11-30 17:03:37'),
	(415, 9, 'F', 'C', 70, '2025-11-30 17:03:37'),
	(416, 9, 'C', 'F', 70, '2025-11-30 17:03:37'),
	(417, 9, 'A', 'B', 58, '2025-11-30 17:03:37'),
	(418, 9, 'B', 'A', 58, '2025-11-30 17:03:37'),
	(419, 9, 'A', 'G', 71, '2025-11-30 17:03:37'),
	(420, 9, 'G', 'A', 71, '2025-11-30 17:03:37'),
	(421, 9, 'A', 'C', 67, '2025-11-30 17:03:37'),
	(422, 9, 'C', 'A', 67, '2025-11-30 17:03:37'),
	(423, 9, 'B', 'G', 76, '2025-11-30 17:03:37'),
	(424, 9, 'G', 'B', 76, '2025-11-30 17:03:37'),
	(425, 9, 'B', 'C', 59, '2025-11-30 17:03:37'),
	(426, 9, 'C', 'B', 59, '2025-11-30 17:03:37'),
	(427, 9, 'G', 'C', 79, '2025-11-30 17:03:37'),
	(428, 9, 'C', 'G', 79, '2025-11-30 17:03:37'),
	(429, 10, 'J', 'E', 75, '2025-11-30 17:20:42'),
	(430, 10, 'E', 'J', 75, '2025-11-30 17:20:42'),
	(431, 10, 'J', 'F', 71, '2025-11-30 17:20:42'),
	(432, 10, 'F', 'J', 71, '2025-11-30 17:20:42'),
	(433, 10, 'J', 'D', 78, '2025-11-30 17:20:42'),
	(434, 10, 'D', 'J', 78, '2025-11-30 17:20:42'),
	(435, 10, 'J', 'C', 75, '2025-11-30 17:20:42'),
	(436, 10, 'C', 'J', 75, '2025-11-30 17:20:42'),
	(437, 10, 'J', 'B', 67, '2025-11-30 17:20:42'),
	(438, 10, 'B', 'J', 67, '2025-11-30 17:20:42'),
	(439, 10, 'J', 'G', 67, '2025-11-30 17:20:42'),
	(440, 10, 'G', 'J', 67, '2025-11-30 17:20:42'),
	(441, 10, 'E', 'F', 58, '2025-11-30 17:20:42'),
	(442, 10, 'F', 'E', 58, '2025-11-30 17:20:42'),
	(443, 10, 'E', 'D', 58, '2025-11-30 17:20:42'),
	(444, 10, 'D', 'E', 58, '2025-11-30 17:20:42'),
	(445, 10, 'E', 'C', 64, '2025-11-30 17:20:42'),
	(446, 10, 'C', 'E', 64, '2025-11-30 17:20:42'),
	(447, 10, 'E', 'B', 67, '2025-11-30 17:20:42'),
	(448, 10, 'B', 'E', 67, '2025-11-30 17:20:42'),
	(449, 10, 'E', 'G', 69, '2025-11-30 17:20:42'),
	(450, 10, 'G', 'E', 69, '2025-11-30 17:20:42'),
	(451, 10, 'F', 'D', 66, '2025-11-30 17:20:42'),
	(452, 10, 'D', 'F', 66, '2025-11-30 17:20:42'),
	(453, 10, 'F', 'C', 70, '2025-11-30 17:20:42'),
	(454, 10, 'C', 'F', 70, '2025-11-30 17:20:42'),
	(455, 10, 'F', 'B', 71, '2025-11-30 17:20:42'),
	(456, 10, 'B', 'F', 71, '2025-11-30 17:20:42'),
	(457, 10, 'F', 'G', 60, '2025-11-30 17:20:42'),
	(458, 10, 'G', 'F', 60, '2025-11-30 17:20:42'),
	(459, 10, 'D', 'C', 57, '2025-11-30 17:20:42'),
	(460, 10, 'C', 'D', 57, '2025-11-30 17:20:42'),
	(461, 10, 'D', 'B', 64, '2025-11-30 17:20:42'),
	(462, 10, 'B', 'D', 64, '2025-11-30 17:20:42'),
	(463, 10, 'D', 'G', 76, '2025-11-30 17:20:42'),
	(464, 10, 'G', 'D', 76, '2025-11-30 17:20:42'),
	(465, 10, 'C', 'B', 58, '2025-11-30 17:20:42'),
	(466, 10, 'B', 'C', 58, '2025-11-30 17:20:42'),
	(467, 10, 'C', 'G', 78, '2025-11-30 17:20:42'),
	(468, 10, 'G', 'C', 78, '2025-11-30 17:20:42'),
	(469, 10, 'B', 'G', 75, '2025-11-30 17:20:42'),
	(470, 10, 'G', 'B', 75, '2025-11-30 17:20:42'),
	(471, 11, 'C', 'E', 61, '2025-12-01 06:14:39'),
	(472, 11, 'E', 'C', 61, '2025-12-01 06:14:39'),
	(473, 11, 'C', 'F', 69, '2025-12-01 06:14:39'),
	(474, 11, 'F', 'C', 69, '2025-12-01 06:14:39'),
	(475, 11, 'C', 'B', 58, '2025-12-01 06:14:39'),
	(476, 11, 'B', 'C', 58, '2025-12-01 06:14:39'),
	(477, 11, 'C', 'G', 76, '2025-12-01 06:14:39'),
	(478, 11, 'G', 'C', 76, '2025-12-01 06:14:39'),
	(479, 11, 'C', 'H', 80, '2025-12-01 06:14:39'),
	(480, 11, 'H', 'C', 80, '2025-12-01 06:14:39'),
	(481, 11, 'C', 'A', 67, '2025-12-01 06:14:39'),
	(482, 11, 'A', 'C', 67, '2025-12-01 06:14:39'),
	(483, 11, 'C', 'J', 75, '2025-12-01 06:14:39'),
	(484, 11, 'J', 'C', 75, '2025-12-01 06:14:39'),
	(485, 11, 'C', 'I', 79, '2025-12-01 06:14:39'),
	(486, 11, 'I', 'C', 79, '2025-12-01 06:14:39'),
	(487, 11, 'E', 'F', 59, '2025-12-01 06:14:39'),
	(488, 11, 'F', 'E', 59, '2025-12-01 06:14:39'),
	(489, 11, 'E', 'B', 66, '2025-12-01 06:14:39'),
	(490, 11, 'B', 'E', 66, '2025-12-01 06:14:39'),
	(491, 11, 'E', 'G', 68, '2025-12-01 06:14:39'),
	(492, 11, 'G', 'E', 68, '2025-12-01 06:14:39'),
	(493, 11, 'E', 'H', 75, '2025-12-01 06:14:39'),
	(494, 11, 'H', 'E', 75, '2025-12-01 06:14:39'),
	(495, 11, 'E', 'A', 71, '2025-12-01 06:14:39'),
	(496, 11, 'A', 'E', 71, '2025-12-01 06:14:39'),
	(497, 11, 'E', 'J', 76, '2025-12-01 06:14:39'),
	(498, 11, 'J', 'E', 76, '2025-12-01 06:14:39'),
	(499, 11, 'E', 'I', 76, '2025-12-01 06:14:39'),
	(500, 11, 'I', 'E', 76, '2025-12-01 06:14:39'),
	(501, 11, 'F', 'B', 71, '2025-12-01 06:14:39'),
	(502, 11, 'B', 'F', 71, '2025-12-01 06:14:39'),
	(503, 11, 'F', 'G', 59, '2025-12-01 06:14:39'),
	(504, 11, 'G', 'F', 59, '2025-12-01 06:14:39'),
	(505, 11, 'F', 'H', 68, '2025-12-01 06:14:39'),
	(506, 11, 'H', 'F', 68, '2025-12-01 06:14:39'),
	(507, 11, 'F', 'A', 72, '2025-12-01 06:14:39'),
	(508, 11, 'A', 'F', 72, '2025-12-01 06:14:39'),
	(509, 11, 'F', 'J', 73, '2025-12-01 06:14:39'),
	(510, 11, 'J', 'F', 73, '2025-12-01 06:14:39'),
	(511, 11, 'F', 'I', 70, '2025-12-01 06:14:39'),
	(512, 11, 'I', 'F', 70, '2025-12-01 06:14:39'),
	(513, 11, 'B', 'G', 75, '2025-12-01 06:14:39'),
	(514, 11, 'G', 'B', 75, '2025-12-01 06:14:39'),
	(515, 11, 'B', 'H', 76, '2025-12-01 06:14:39'),
	(516, 11, 'H', 'B', 76, '2025-12-01 06:14:39'),
	(517, 11, 'B', 'A', 59, '2025-12-01 06:14:39'),
	(518, 11, 'A', 'B', 59, '2025-12-01 06:14:39'),
	(519, 11, 'B', 'J', 69, '2025-12-01 06:14:39'),
	(520, 11, 'J', 'B', 69, '2025-12-01 06:14:39'),
	(521, 11, 'B', 'I', 74, '2025-12-01 06:14:39'),
	(522, 11, 'I', 'B', 74, '2025-12-01 06:14:39'),
	(523, 11, 'G', 'H', 59, '2025-12-01 06:14:39'),
	(524, 11, 'H', 'G', 59, '2025-12-01 06:14:39'),
	(525, 11, 'G', 'A', 72, '2025-12-01 06:14:39'),
	(526, 11, 'A', 'G', 72, '2025-12-01 06:14:39'),
	(527, 11, 'G', 'J', 69, '2025-12-01 06:14:39'),
	(528, 11, 'J', 'G', 69, '2025-12-01 06:14:39'),
	(529, 11, 'G', 'I', 63, '2025-12-01 06:14:39'),
	(530, 11, 'I', 'G', 63, '2025-12-01 06:14:39'),
	(531, 11, 'H', 'A', 70, '2025-12-01 06:14:39'),
	(532, 11, 'A', 'H', 70, '2025-12-01 06:14:39'),
	(533, 11, 'H', 'J', 63, '2025-12-01 06:14:39'),
	(534, 11, 'J', 'H', 63, '2025-12-01 06:14:39'),
	(535, 11, 'H', 'I', 55, '2025-12-01 06:14:39'),
	(536, 11, 'I', 'H', 55, '2025-12-01 06:14:39'),
	(537, 11, 'A', 'J', 59, '2025-12-01 06:14:39'),
	(538, 11, 'J', 'A', 59, '2025-12-01 06:14:39'),
	(539, 11, 'A', 'I', 66, '2025-12-01 06:14:39'),
	(540, 11, 'I', 'A', 66, '2025-12-01 06:14:39'),
	(541, 11, 'J', 'I', 58, '2025-12-01 06:14:39'),
	(542, 11, 'I', 'J', 58, '2025-12-01 06:14:39'),
	(543, 12, 'I', 'J', 57, '2025-12-08 17:34:44'),
	(544, 12, 'J', 'I', 57, '2025-12-08 17:34:44'),
	(545, 12, 'I', 'A', 66, '2025-12-08 17:34:44'),
	(546, 12, 'A', 'I', 66, '2025-12-08 17:34:44'),
	(547, 12, 'J', 'A', 58, '2025-12-08 17:34:44'),
	(548, 12, 'A', 'J', 58, '2025-12-08 17:34:44');

CREATE TABLE IF NOT EXISTS `tsp_game_details` (
  `tsp_detail_id` int(11) NOT NULL AUTO_INCREMENT,
  `session_id` int(11) NOT NULL,
  `home_city` char(1) NOT NULL,
  `num_cities` int(11) NOT NULL,
  `player_route` varchar(255) NOT NULL,
  `player_distance` decimal(10,2) NOT NULL,
  `optimal_route` varchar(255) NOT NULL,
  `optimal_distance` decimal(10,2) NOT NULL,
  `distance_difference` decimal(10,2) DEFAULT NULL,
  `is_optimal` tinyint(1) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`tsp_detail_id`),
  UNIQUE KEY `session_id` (`session_id`),
  KEY `idx_session_id` (`session_id`),
  KEY `idx_home_city` (`home_city`),
  KEY `idx_num_cities` (`num_cities`),
  KEY `idx_is_optimal` (`is_optimal`),
  CONSTRAINT `tsp_game_details_ibfk_1` FOREIGN KEY (`session_id`) REFERENCES `game_sessions` (`session_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `tsp_game_details` (`tsp_detail_id`, `session_id`, `home_city`, `num_cities`, `player_route`, `player_distance`, `optimal_route`, `optimal_distance`, `distance_difference`, `is_optimal`, `created_at`) VALUES
	(1, 1, 'D', 9, 'D-C-H-G-J-A-E-I-F-D', 88.00, 'D → C → A → J → I → H → G → F → E → D', 530.00, -442.00, 0, '2025-11-30 05:35:16'),
	(2, 2, 'F', 9, 'F-A-I-H-G-D-C-B-J-F', 67.00, 'F → G → H → I → J → A → B → C → D → F', 528.00, -461.00, 0, '2025-11-30 05:43:43'),
	(3, 3, 'C', 10, 'C-J-F-H-B-E-A-G-D-I-C', 44.70, 'C → D → E → F → G → H → I → J → A → B → C', 579.00, -534.30, 0, '2025-11-30 11:04:09'),
	(4, 4, 'G', 5, 'G-H-J-A-B-G', 312.00, 'G → H → J → A → B → G', 313.00, -1.00, 1, '2025-11-30 11:20:21'),
	(5, 5, 'E', 6, 'E-D-C-B-G-F-E', 329.70, 'E → F → G → B → C → D → E', 367.00, -37.30, 0, '2025-11-30 11:25:10'),
	(6, 6, 'E', 7, 'E-D-A-J-H-G-F-E', 424.00, 'E → D → A → J → H → G → F → E', 425.00, -1.00, 1, '2025-11-30 16:22:12'),
	(7, 7, 'C', 7, 'C-D-E-F-G-A-B-C', 422.80, 'C → D → E → F → G → A → B → C', 423.00, -0.20, 1, '2025-11-30 16:28:59'),
	(8, 8, 'B', 6, 'B-D-C-J-F-E-B', 776.80, 'B → C → D → E → F → J → B', 369.00, 407.80, 0, '2025-11-30 16:52:46'),
	(9, 9, 'E', 6, 'E-B-C-A-F-G-E', 393.00, 'E → F → G → A → B → C → E', 370.00, 23.00, 0, '2025-11-30 17:03:37'),
	(10, 10, 'J', 7, 'J-D-F-C-G-E-B-J', 45.00, 'J → B → C → D → E → F → G → J', 425.00, -380.00, 0, '2025-11-30 17:20:42'),
	(11, 11, 'C', 9, 'C-E-J-F-H-A-B-I-G-C', 22.00, 'C → B → A → J → I → H → G → F → E → C', 527.00, -505.00, 0, '2025-12-01 06:14:39'),
	(12, 12, 'I', 3, 'I-J-A-I', 23.00, 'I → J → A → I', 181.00, -158.00, 0, '2025-12-08 17:34:44');

CREATE TABLE IF NOT EXISTS `tsp_selected_cities` (
  `tsp_city_id` int(11) NOT NULL AUTO_INCREMENT,
  `session_id` int(11) NOT NULL,
  `city_name` char(1) NOT NULL,
  `is_home` tinyint(1) DEFAULT 0,
  `visit_order` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`tsp_city_id`),
  UNIQUE KEY `unique_city_per_session` (`session_id`,`city_name`),
  KEY `idx_session_id` (`session_id`),
  KEY `idx_city_name` (`city_name`),
  KEY `idx_is_home` (`is_home`),
  CONSTRAINT `tsp_selected_cities_ibfk_1` FOREIGN KEY (`session_id`) REFERENCES `game_sessions` (`session_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=85 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `tsp_selected_cities` (`tsp_city_id`, `session_id`, `city_name`, `is_home`, `visit_order`, `created_at`) VALUES
	(1, 1, 'D', 1, NULL, '2025-11-30 05:35:16'),
	(2, 1, 'C', 0, NULL, '2025-11-30 05:35:16'),
	(3, 1, 'E', 0, NULL, '2025-11-30 05:35:16'),
	(4, 1, 'F', 0, NULL, '2025-11-30 05:35:16'),
	(5, 1, 'G', 0, NULL, '2025-11-30 05:35:16'),
	(6, 1, 'H', 0, NULL, '2025-11-30 05:35:16'),
	(7, 1, 'I', 0, NULL, '2025-11-30 05:35:16'),
	(8, 1, 'J', 0, NULL, '2025-11-30 05:35:16'),
	(9, 1, 'A', 0, NULL, '2025-11-30 05:35:16'),
	(10, 2, 'F', 1, NULL, '2025-11-30 05:43:43'),
	(11, 2, 'B', 0, NULL, '2025-11-30 05:43:43'),
	(12, 2, 'C', 0, NULL, '2025-11-30 05:43:43'),
	(13, 2, 'D', 0, NULL, '2025-11-30 05:43:43'),
	(14, 2, 'A', 0, NULL, '2025-11-30 05:43:43'),
	(15, 2, 'J', 0, NULL, '2025-11-30 05:43:43'),
	(16, 2, 'I', 0, NULL, '2025-11-30 05:43:43'),
	(17, 2, 'H', 0, NULL, '2025-11-30 05:43:43'),
	(18, 2, 'G', 0, NULL, '2025-11-30 05:43:43'),
	(19, 3, 'C', 1, NULL, '2025-11-30 11:04:09'),
	(20, 3, 'D', 0, NULL, '2025-11-30 11:04:09'),
	(21, 3, 'E', 0, NULL, '2025-11-30 11:04:09'),
	(22, 3, 'F', 0, NULL, '2025-11-30 11:04:09'),
	(23, 3, 'A', 0, NULL, '2025-11-30 11:04:09'),
	(24, 3, 'J', 0, NULL, '2025-11-30 11:04:09'),
	(25, 3, 'B', 0, NULL, '2025-11-30 11:04:09'),
	(26, 3, 'I', 0, NULL, '2025-11-30 11:04:09'),
	(27, 3, 'H', 0, NULL, '2025-11-30 11:04:09'),
	(28, 3, 'G', 0, NULL, '2025-11-30 11:04:09'),
	(29, 4, 'G', 1, NULL, '2025-11-30 11:20:22'),
	(30, 4, 'H', 0, NULL, '2025-11-30 11:20:22'),
	(31, 4, 'J', 0, NULL, '2025-11-30 11:20:22'),
	(32, 4, 'A', 0, NULL, '2025-11-30 11:20:22'),
	(33, 4, 'B', 0, NULL, '2025-11-30 11:20:22'),
	(34, 5, 'E', 1, NULL, '2025-11-30 11:25:10'),
	(35, 5, 'F', 0, NULL, '2025-11-30 11:25:10'),
	(36, 5, 'G', 0, NULL, '2025-11-30 11:25:10'),
	(37, 5, 'B', 0, NULL, '2025-11-30 11:25:10'),
	(38, 5, 'C', 0, NULL, '2025-11-30 11:25:10'),
	(39, 5, 'D', 0, NULL, '2025-11-30 11:25:10'),
	(40, 6, 'E', 1, NULL, '2025-11-30 16:22:12'),
	(41, 6, 'D', 0, NULL, '2025-11-30 16:22:12'),
	(42, 6, 'A', 0, NULL, '2025-11-30 16:22:12'),
	(43, 6, 'J', 0, NULL, '2025-11-30 16:22:12'),
	(44, 6, 'G', 0, NULL, '2025-11-30 16:22:12'),
	(45, 6, 'F', 0, NULL, '2025-11-30 16:22:12'),
	(46, 6, 'H', 0, NULL, '2025-11-30 16:22:12'),
	(47, 7, 'C', 1, NULL, '2025-11-30 16:28:59'),
	(48, 7, 'D', 0, NULL, '2025-11-30 16:28:59'),
	(49, 7, 'E', 0, NULL, '2025-11-30 16:28:59'),
	(50, 7, 'F', 0, NULL, '2025-11-30 16:28:59'),
	(51, 7, 'G', 0, NULL, '2025-11-30 16:28:59'),
	(52, 7, 'B', 0, NULL, '2025-11-30 16:28:59'),
	(53, 7, 'A', 0, NULL, '2025-11-30 16:28:59'),
	(54, 8, 'B', 1, NULL, '2025-11-30 16:52:46'),
	(55, 8, 'C', 0, NULL, '2025-11-30 16:52:46'),
	(56, 8, 'D', 0, NULL, '2025-11-30 16:52:46'),
	(57, 8, 'E', 0, NULL, '2025-11-30 16:52:46'),
	(58, 8, 'F', 0, NULL, '2025-11-30 16:52:46'),
	(59, 8, 'J', 0, NULL, '2025-11-30 16:52:46'),
	(60, 9, 'E', 1, NULL, '2025-11-30 17:03:37'),
	(61, 9, 'F', 0, NULL, '2025-11-30 17:03:37'),
	(62, 9, 'A', 0, NULL, '2025-11-30 17:03:37'),
	(63, 9, 'B', 0, NULL, '2025-11-30 17:03:37'),
	(64, 9, 'G', 0, NULL, '2025-11-30 17:03:37'),
	(65, 9, 'C', 0, NULL, '2025-11-30 17:03:37'),
	(66, 10, 'J', 1, NULL, '2025-11-30 17:20:42'),
	(67, 10, 'E', 0, NULL, '2025-11-30 17:20:42'),
	(68, 10, 'F', 0, NULL, '2025-11-30 17:20:42'),
	(69, 10, 'D', 0, NULL, '2025-11-30 17:20:42'),
	(70, 10, 'C', 0, NULL, '2025-11-30 17:20:42'),
	(71, 10, 'B', 0, NULL, '2025-11-30 17:20:42'),
	(72, 10, 'G', 0, NULL, '2025-11-30 17:20:42'),
	(73, 11, 'C', 1, NULL, '2025-12-01 06:14:39'),
	(74, 11, 'E', 0, NULL, '2025-12-01 06:14:39'),
	(75, 11, 'F', 0, NULL, '2025-12-01 06:14:39'),
	(76, 11, 'B', 0, NULL, '2025-12-01 06:14:39'),
	(77, 11, 'G', 0, NULL, '2025-12-01 06:14:39'),
	(78, 11, 'H', 0, NULL, '2025-12-01 06:14:39'),
	(79, 11, 'A', 0, NULL, '2025-12-01 06:14:39'),
	(80, 11, 'J', 0, NULL, '2025-12-01 06:14:39'),
	(81, 11, 'I', 0, NULL, '2025-12-01 06:14:39'),
	(82, 12, 'I', 1, NULL, '2025-12-08 17:34:44'),
	(83, 12, 'J', 0, NULL, '2025-12-08 17:34:44'),
	(84, 12, 'A', 0, NULL, '2025-12-08 17:34:44');

CREATE TABLE `view_player_statistics` (
	`player_id` INT(11) NOT NULL,
	`player_name` VARCHAR(100) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`email` VARCHAR(255) NULL COLLATE 'utf8mb4_unicode_ci',
	`games_played_count` BIGINT(21) NOT NULL,
	`total_sessions` BIGINT(21) NOT NULL,
	`successful_sessions` DECIMAL(22,0) NULL,
	`success_rate` DECIMAL(6,2) NULL,
	`last_played` DATETIME NULL,
	`member_since` TIMESTAMP NOT NULL
) ENGINE=MyISAM;

CREATE TABLE `view_tsp_algorithm_comparison` (
	`algorithm_id` INT(11) NOT NULL,
	`algorithm_name` VARCHAR(100) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`algorithm_type` ENUM('iterative','recursive','heuristic') NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`complexity` VARCHAR(50) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`times_used` BIGINT(21) NOT NULL,
	`avg_time_ms` DECIMAL(11,4) NULL,
	`min_time_ms` DECIMAL(10,4) NULL,
	`max_time_ms` DECIMAL(10,4) NULL,
	`avg_num_cities` DECIMAL(12,1) NULL,
	`optimal_solutions_found` DECIMAL(22,0) NULL,
	`optimal_percentage` DECIMAL(6,2) NULL
) ENGINE=MyISAM;

CREATE TABLE `view_tsp_leaderboard` (
	`player_id` INT(11) NOT NULL,
	`player_name` VARCHAR(100) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`total_games` BIGINT(21) NOT NULL,
	`optimal_solutions` DECIMAL(22,0) NULL,
	`optimal_percentage` DECIMAL(6,2) NULL,
	`avg_distance_error` DECIMAL(11,2) NULL,
	`avg_duration_seconds` DECIMAL(11,0) NULL,
	`last_played` DATETIME NULL
) ENGINE=MyISAM;

CREATE TABLE `view_tsp_statistics` (
	`session_id` INT(11) NOT NULL,
	`player_id` INT(11) NOT NULL,
	`player_name` VARCHAR(100) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`home_city` CHAR(1) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`num_cities` INT(11) NOT NULL,
	`selected_cities` MEDIUMTEXT NULL COLLATE 'utf8mb4_unicode_ci',
	`player_route` VARCHAR(255) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`player_distance` DECIMAL(10,2) NOT NULL,
	`optimal_route` VARCHAR(255) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`optimal_distance` DECIMAL(10,2) NOT NULL,
	`distance_difference` DECIMAL(10,2) NULL,
	`is_optimal` TINYINT(1) NOT NULL,
	`started_at` DATETIME NOT NULL,
	`completed_at` DATETIME NULL,
	`session_duration_seconds` INT(11) NULL
) ENGINE=MyISAM;

CREATE TABLE `vw_tsg_algorithm_stats` (
	`algorithm_name` VARCHAR(100) NOT NULL COLLATE 'utf8mb4_general_ci',
	`algorithm_type` VARCHAR(50) NULL COLLATE 'utf8mb4_general_ci',
	`execution_count` BIGINT(21) NOT NULL,
	`avg_time_ms` DECIMAL(14,8) NULL,
	`min_time_ms` DECIMAL(10,4) NULL,
	`max_time_ms` DECIMAL(10,4) NULL,
	`stddev_time_ms` DOUBLE(26,8) NULL
) ENGINE=MyISAM;

CREATE TABLE `vw_tsg_player_stats` (
	`player_name` VARCHAR(100) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`total_games` BIGINT(21) NOT NULL,
	`correct_answers` DECIMAL(22,0) NULL,
	`accuracy_percentage` DECIMAL(28,2) NULL,
	`avg_duration_seconds` DECIMAL(14,4) NULL,
	`last_played` TIMESTAMP NULL
) ENGINE=MyISAM;

SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER after_performance_insert
AFTER INSERT ON queens_algorithm_performance
FOR EACH ROW
BEGIN
    DECLARE seq_time DECIMAL(10,4);
    DECLARE thread_time DECIMAL(10,4);
    
    SELECT time_taken_ms INTO seq_time
    FROM queens_algorithm_performance qap
    JOIN queens_algorithms qa ON qap.algorithm_id = qa.algorithm_id
    WHERE qap.session_id = NEW.session_id AND qa.algorithm_type = 'Sequential'
    LIMIT 1;
    
    SELECT time_taken_ms INTO thread_time
    FROM queens_algorithm_performance qap
    JOIN queens_algorithms qa ON qap.algorithm_id = qa.algorithm_id
    WHERE qap.session_id = NEW.session_id AND qa.algorithm_type = 'Threaded'
    LIMIT 1;
    
    IF seq_time IS NOT NULL AND thread_time IS NOT NULL THEN
        UPDATE queens_game_sessions
        SET speedup_factor = seq_time / thread_time
        WHERE session_id = NEW.session_id;
    END IF;
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER after_solution_insert
AFTER INSERT ON queens_found_solutions
FOR EACH ROW
BEGIN
    UPDATE queens_game_sessions
    SET 
        total_solutions_found = (
            SELECT COUNT(DISTINCT solution_number)
            FROM queens_found_solutions
            WHERE session_id = NEW.session_id AND is_duplicate = FALSE
        ),
        completion_percentage = (
            SELECT COUNT(DISTINCT solution_number) / 92.0 * 100
            FROM queens_found_solutions
            WHERE session_id = NEW.session_id AND is_duplicate = FALSE
        ),
        is_completed = (
            SELECT COUNT(DISTINCT solution_number) >= 92
            FROM queens_found_solutions
            WHERE session_id = NEW.session_id AND is_duplicate = FALSE
        )
    WHERE session_id = NEW.session_id;
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

DROP TABLE IF EXISTS `queens_algorithm_comparison`;
CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW `queens_algorithm_comparison` AS SELECT 
    qa.algorithm_name,
    qa.algorithm_type,
    qa.complexity,
    COUNT(qap.performance_id) as times_executed,
    ROUND(AVG(qap.time_taken_ms), 4) as avg_time_ms,
    ROUND(MIN(qap.time_taken_ms), 4) as min_time_ms,
    ROUND(MAX(qap.time_taken_ms), 4) as max_time_ms,
    ROUND(STDDEV(qap.time_taken_ms), 4) as stddev_time_ms,
    COUNT(DISTINCT qap.session_id) as unique_sessions
FROM queens_algorithms qa
LEFT JOIN queens_algorithm_performance qap ON qa.algorithm_id = qap.algorithm_id
GROUP BY qa.algorithm_id, qa.algorithm_name, qa.algorithm_type, qa.complexity ;

DROP TABLE IF EXISTS `queens_leaderboard`;
CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW `queens_leaderboard` AS SELECT 
    p.player_name,
    COUNT(DISTINCT qfs.solution_number) as unique_solutions,
    COUNT(DISTINCT qgs.session_id) as total_games,
    ROUND(AVG(qgs.completion_percentage), 2) as avg_completion_rate,
    MIN(qgs.session_duration_seconds) as fastest_completion_time,
    SUM(qgs.is_completed) as full_completions,
    MAX(qgs.completed_at) as last_played,
    RANK() OVER (ORDER BY COUNT(DISTINCT qfs.solution_number) DESC, 
                          MIN(qgs.session_duration_seconds) ASC) as ranking
FROM players p
JOIN queens_game_sessions qgs ON p.player_id = qgs.player_id
LEFT JOIN queens_found_solutions qfs ON p.player_id = qfs.player_id AND qfs.is_duplicate = FALSE
GROUP BY p.player_id, p.player_name
HAVING total_games >= 1
ORDER BY ranking ;

DROP TABLE IF EXISTS `queens_player_stats`;
CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW `queens_player_stats` AS SELECT 
    p.player_id,
    p.player_name,
    COUNT(DISTINCT qgs.session_id) as total_games_played,
    SUM(qgs.total_solutions_found) as total_solutions_discovered,
    COUNT(DISTINCT qfs.solution_number) as unique_solutions_found,
    MAX(qgs.completion_percentage) as best_completion_rate,
    AVG(qgs.speedup_factor) as avg_speedup_factor,
    MIN(qgs.sequential_time_ms) as fastest_sequential_time,
    MIN(qgs.threaded_time_ms) as fastest_threaded_time,
    SUM(qgs.is_completed) as games_completed,
    MAX(qgs.completed_at) as last_game_completed
FROM players p
LEFT JOIN queens_game_sessions qgs ON p.player_id = qgs.player_id
LEFT JOIN queens_found_solutions qfs ON p.player_id = qfs.player_id AND qfs.is_duplicate = FALSE
GROUP BY p.player_id, p.player_name ;

DROP TABLE IF EXISTS `view_player_statistics`;
CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW `view_player_statistics` AS SELECT 
    p.player_id,
    p.player_name,
    p.email,
    COUNT(DISTINCT gs.game_id) as games_played_count,
    COUNT(gs.session_id) as total_sessions,
    SUM(CASE WHEN gs.is_successful THEN 1 ELSE 0 END) as successful_sessions,
    ROUND(AVG(CASE WHEN gs.is_successful THEN 1 ELSE 0 END) * 100, 2) as success_rate,
    MAX(gs.started_at) as last_played,
    p.created_at as member_since
FROM players p
LEFT JOIN game_sessions gs ON p.player_id = gs.player_id
GROUP BY p.player_id, p.player_name, p.email, p.created_at ;

DROP TABLE IF EXISTS `view_tsp_algorithm_comparison`;
CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW `view_tsp_algorithm_comparison` AS SELECT 
    a.algorithm_id,
    a.algorithm_name,
    a.algorithm_type,
    a.complexity,
    COUNT(ap.performance_id) as times_used,
    ROUND(AVG(ap.time_taken_ms), 4) as avg_time_ms,
    ROUND(MIN(ap.time_taken_ms), 4) as min_time_ms,
    ROUND(MAX(ap.time_taken_ms), 4) as max_time_ms,
    ROUND(AVG(tsp.num_cities), 1) as avg_num_cities,
    SUM(CASE WHEN ap.is_optimal_solution THEN 1 ELSE 0 END) as optimal_solutions_found,
    ROUND(AVG(CASE WHEN ap.is_optimal_solution THEN 1 ELSE 0 END) * 100, 2) as optimal_percentage
FROM tsp_algorithms a
LEFT JOIN tsp_algorithm_performance ap ON a.algorithm_id = ap.algorithm_id
LEFT JOIN tsp_game_details tsp ON ap.session_id = tsp.session_id
GROUP BY a.algorithm_id, a.algorithm_name, a.algorithm_type, a.complexity ;

DROP TABLE IF EXISTS `view_tsp_leaderboard`;
CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW `view_tsp_leaderboard` AS SELECT 
    p.player_id,
    p.player_name,
    COUNT(tsp.tsp_detail_id) as total_games,
    SUM(CASE WHEN tsp.is_optimal THEN 1 ELSE 0 END) as optimal_solutions,
    ROUND(AVG(CASE WHEN tsp.is_optimal THEN 1 ELSE 0 END) * 100, 2) as optimal_percentage,
    ROUND(AVG(tsp.distance_difference), 2) as avg_distance_error,
    ROUND(AVG(gs.session_duration_seconds), 0) as avg_duration_seconds,
    MAX(gs.started_at) as last_played
FROM players p
JOIN game_sessions gs ON p.player_id = gs.player_id
JOIN games g ON gs.game_id = g.game_id
JOIN tsp_game_details tsp ON gs.session_id = tsp.session_id
WHERE g.game_code = 'tsp' AND gs.is_completed = TRUE
GROUP BY p.player_id, p.player_name
HAVING total_games >= 1
ORDER BY optimal_solutions DESC, optimal_percentage DESC, avg_distance_error ASC ;

DROP TABLE IF EXISTS `view_tsp_statistics`;
CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW `view_tsp_statistics` AS SELECT 
    gs.session_id,
    p.player_id,
    p.player_name,
    tsp.home_city,
    tsp.num_cities,
    GROUP_CONCAT(DISTINCT tsc.city_name ORDER BY tsc.city_name SEPARATOR ',') as selected_cities,
    tsp.player_route,
    tsp.player_distance,
    tsp.optimal_route,
    tsp.optimal_distance,
    tsp.distance_difference,
    tsp.is_optimal,
    gs.started_at,
    gs.completed_at,
    gs.session_duration_seconds
FROM game_sessions gs
JOIN players p ON gs.player_id = p.player_id
JOIN games g ON gs.game_id = g.game_id
JOIN tsp_game_details tsp ON gs.session_id = tsp.session_id
LEFT JOIN tsp_selected_cities tsc ON gs.session_id = tsc.session_id
WHERE g.game_code = 'tsp'
GROUP BY gs.session_id, p.player_id, p.player_name, tsp.home_city, tsp.num_cities, 
         tsp.player_route, tsp.player_distance, tsp.optimal_route, tsp.optimal_distance,
         tsp.distance_difference, tsp.is_optimal, gs.started_at, gs.completed_at, gs.session_duration_seconds ;

DROP TABLE IF EXISTS `vw_tsg_algorithm_stats`;
CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW `vw_tsg_algorithm_stats` AS SELECT 
  algorithm_name,
  algorithm_type,
  COUNT(*) AS execution_count,
  AVG(execution_time_ms) AS avg_time_ms,
  MIN(execution_time_ms) AS min_time_ms,
  MAX(execution_time_ms) AS max_time_ms,
  STDDEV(execution_time_ms) AS stddev_time_ms
FROM tsg_algorithm_performance
GROUP BY algorithm_name, algorithm_type ;

DROP TABLE IF EXISTS `vw_tsg_player_stats`;
CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW `vw_tsg_player_stats` AS SELECT 
  p.player_name,
  COUNT(DISTINCT gs.session_id) AS total_games,
  SUM(CASE WHEN gd.is_correct THEN 1 ELSE 0 END) AS correct_answers,
  ROUND(SUM(CASE WHEN gd.is_correct THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) AS accuracy_percentage,
  AVG(gs.session_duration_seconds) AS avg_duration_seconds,
  MAX(gs.completed_at) AS last_played
FROM players p
JOIN tsg_game_sessions gs ON p.player_id = gs.player_id
JOIN tsg_game_details gd ON gs.session_id = gd.session_id
GROUP BY p.player_id, p.player_name ;

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
