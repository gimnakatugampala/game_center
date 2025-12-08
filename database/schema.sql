-- Game Center Database Schema
-- Run this SQL script to create all required tables

CREATE DATABASE IF NOT EXISTS game_center;
USE game_center;

-- Players table (shared across all games)
CREATE TABLE IF NOT EXISTS players (
  player_id INT AUTO_INCREMENT PRIMARY KEY,
  player_name VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_player_name (player_name)
);

-- Games table (catalog of all games)
CREATE TABLE IF NOT EXISTS games (
  game_id INT AUTO_INCREMENT PRIMARY KEY,
  game_name VARCHAR(100) NOT NULL,
  game_code VARCHAR(20) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_game_code (game_code)
);

-- Insert game records
INSERT IGNORE INTO games (game_name, game_code, description) VALUES
('Traffic Simulation Game', 'tsg', 'Find maximum flow in traffic networks'),
('Traveling Salesman Problem', 'tsp', 'Find shortest route visiting all cities'),
('N-Queens Problem', 'queens', 'Place N queens on chessboard without conflicts'),
('Tower of Hanoi', 'hanoi', 'Move disks between pegs following rules');

-- TSG Game Sessions
CREATE TABLE IF NOT EXISTS tsg_game_sessions (
  session_id INT AUTO_INCREMENT PRIMARY KEY,
  player_id INT NOT NULL,
  game_id INT NOT NULL,
  started_at TIMESTAMP NOT NULL,
  completed_at TIMESTAMP NULL,
  session_duration_seconds INT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  is_successful BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (player_id) REFERENCES players(player_id) ON DELETE CASCADE,
  FOREIGN KEY (game_id) REFERENCES games(game_id) ON DELETE CASCADE,
  INDEX idx_player_session (player_id, started_at),
  INDEX idx_game_session (game_id, started_at)
);

-- TSG Game Details
CREATE TABLE IF NOT EXISTS tsg_game_details (
  detail_id INT AUTO_INCREMENT PRIMARY KEY,
  session_id INT NOT NULL,
  round_number INT DEFAULT 1,
  player_answer INT NOT NULL,
  correct_answer INT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  capacities JSON NOT NULL,
  algorithm_results JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES tsg_game_sessions(session_id) ON DELETE CASCADE,
  INDEX idx_session_detail (session_id)
);

-- TSG Algorithm Performance
CREATE TABLE IF NOT EXISTS tsg_algorithm_performance (
  performance_id INT AUTO_INCREMENT PRIMARY KEY,
  session_id INT NOT NULL,
  algorithm_name VARCHAR(100) NOT NULL,
  execution_time_ms DECIMAL(10, 4) NOT NULL,
  result_value INT NULL,
  algorithm_type VARCHAR(50) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES tsg_game_sessions(session_id) ON DELETE CASCADE,
  INDEX idx_session_performance (session_id),
  INDEX idx_algorithm_name (algorithm_name)
);

-- View correct answers and player performance
CREATE OR REPLACE VIEW vw_tsg_player_stats AS
SELECT 
  p.player_name,
  COUNT(DISTINCT gs.session_id) AS total_games,
  SUM(CASE WHEN gd.is_correct THEN 1 ELSE 0 END) AS correct_answers,
  ROUND(SUM(CASE WHEN gd.is_correct THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) AS accuracy_percentage,
  AVG(gs.session_duration_seconds) AS avg_duration_seconds,
  MAX(gs.completed_at) AS last_played
FROM players p
JOIN tsg_game_sessions gs ON p.player_id = gs.player_id
JOIN tsg_game_details gd ON gs.session_id = gd.session_id
GROUP BY p.player_id, p.player_name;

-- View algorithm performance statistics
CREATE OR REPLACE VIEW vw_tsg_algorithm_stats AS
SELECT 
  algorithm_name,
  algorithm_type,
  COUNT(*) AS execution_count,
  AVG(execution_time_ms) AS avg_time_ms,
  MIN(execution_time_ms) AS min_time_ms,
  MAX(execution_time_ms) AS max_time_ms,
  STDDEV(execution_time_ms) AS stddev_time_ms
FROM tsg_algorithm_performance
GROUP BY algorithm_name, algorithm_type;
