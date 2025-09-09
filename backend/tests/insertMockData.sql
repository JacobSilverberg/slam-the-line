-- Insert Mock Data for Slam The Line
-- Run this in MySQL Workbench after creating your database

USE `betting-league`;

-- Insert NFL Teams
INSERT INTO teams (id, city, name, abbr, full_name) VALUES
(1, 'Kansas City', 'Chiefs', 'KC', 'Kansas City Chiefs'),
(2, 'Buffalo', 'Bills', 'BUF', 'Buffalo Bills'),
(3, 'Miami', 'Dolphins', 'MIA', 'Miami Dolphins'),
(4, 'New England', 'Patriots', 'NE', 'New England Patriots'),
(5, 'New York', 'Jets', 'NYJ', 'New York Jets'),
(6, 'Cincinnati', 'Bengals', 'CIN', 'Cincinnati Bengals'),
(7, 'Baltimore', 'Ravens', 'BAL', 'Baltimore Ravens'),
(8, 'Pittsburgh', 'Steelers', 'PIT', 'Pittsburgh Steelers'),
(9, 'Cleveland', 'Browns', 'CLE', 'Cleveland Browns'),
(10, 'Indianapolis', 'Colts', 'IND', 'Indianapolis Colts'),
(11, 'Tennessee', 'Titans', 'TEN', 'Tennessee Titans'),
(12, 'Jacksonville', 'Jaguars', 'JAX', 'Jacksonville Jaguars'),
(13, 'Houston', 'Texans', 'HOU', 'Houston Texans'),
(14, 'Denver', 'Broncos', 'DEN', 'Denver Broncos'),
(15, 'Los Angeles', 'Chargers', 'LAC', 'Los Angeles Chargers'),
(16, 'Las Vegas', 'Raiders', 'LV', 'Las Vegas Raiders'),
(17, 'Dallas', 'Cowboys', 'DAL', 'Dallas Cowboys'),
(18, 'Philadelphia', 'Eagles', 'PHI', 'Philadelphia Eagles'),
(19, 'New York', 'Giants', 'NYG', 'New York Giants'),
(20, 'Washington', 'Commanders', 'WAS', 'Washington Commanders'),
(21, 'Green Bay', 'Packers', 'GB', 'Green Bay Packers'),
(22, 'Minnesota', 'Vikings', 'MIN', 'Minnesota Vikings'),
(23, 'Detroit', 'Lions', 'DET', 'Detroit Lions'),
(24, 'Chicago', 'Bears', 'CHI', 'Chicago Bears'),
(25, 'Tampa Bay', 'Buccaneers', 'TB', 'Tampa Bay Buccaneers'),
(26, 'New Orleans', 'Saints', 'NO', 'New Orleans Saints'),
(27, 'Atlanta', 'Falcons', 'ATL', 'Atlanta Falcons'),
(28, 'Carolina', 'Panthers', 'CAR', 'Carolina Panthers'),
(29, 'Arizona', 'Cardinals', 'ARI', 'Arizona Cardinals'),
(30, 'Los Angeles', 'Rams', 'LAR', 'Los Angeles Rams'),
(31, 'San Francisco', '49ers', 'SF', 'San Francisco 49ers'),
(32, 'Seattle', 'Seahawks', 'SEA', 'Seattle Seahawks')
ON DUPLICATE KEY UPDATE 
city = VALUES(city), 
name = VALUES(name), 
abbr = VALUES(abbr), 
full_name = VALUES(full_name);

-- Insert Sample Games for 2025 Season
-- Week 1 Games
INSERT INTO games (home_team_id, away_team_id, updated_at, week, home_open_spread, home_curr_spread, game_started, home_points, away_points, spread_winner, away_open_spread, away_curr_spread, home_ml_odds, away_ml_odds, game_open_total, game_curr_total, game_over_odds, game_under_odds, api_id, game_completed, nfl_year) VALUES
(1, 2, '2025-09-01 11:59:18', 1, -7.00, -7.50, 0, NULL, NULL, NULL, 7.00, 7.50, -410.00, 320.00, 46.50, 47.50, -110.00, -110.00, 'fake_game_1_1', 0, 2025),
(3, 4, '2025-09-01 11:59:18', 1, -3.00, -3.50, 0, NULL, NULL, NULL, 3.00, 3.50, -180.00, 150.00, 44.00, 44.50, -110.00, -110.00, 'fake_game_1_2', 0, 2025),
(5, 6, '2025-09-01 11:59:18', 1, 2.50, 2.00, 0, NULL, NULL, NULL, -2.50, -2.00, 120.00, -140.00, 48.00, 47.50, -110.00, -110.00, 'fake_game_1_3', 0, 2025),
(7, 8, '2025-09-01 11:59:18', 1, -4.00, -4.50, 0, NULL, NULL, NULL, 4.00, 4.50, -200.00, 170.00, 42.50, 43.00, -110.00, -110.00, 'fake_game_1_4', 0, 2025),
(9, 10, '2025-09-01 11:59:18', 1, 1.50, 1.00, 0, NULL, NULL, NULL, -1.50, -1.00, 110.00, -130.00, 45.00, 45.50, -110.00, -110.00, 'fake_game_1_5', 0, 2025);

-- Week 2 Games
INSERT INTO games (home_team_id, away_team_id, updated_at, week, home_open_spread, home_curr_spread, game_started, home_points, away_points, spread_winner, away_open_spread, away_curr_spread, home_ml_odds, away_ml_odds, game_open_total, game_curr_total, game_over_odds, game_under_odds, api_id, game_completed, nfl_year) VALUES
(11, 12, '2025-09-08 11:59:18', 2, -6.00, -6.50, 0, NULL, NULL, NULL, 6.00, 6.50, -280.00, 230.00, 47.00, 47.50, -110.00, -110.00, 'fake_game_2_1', 0, 2025),
(13, 14, '2025-09-08 11:59:18', 2, -2.50, -3.00, 0, NULL, NULL, NULL, 2.50, 3.00, 130.00, -150.00, 46.00, 46.50, -110.00, -110.00, 'fake_game_2_2', 0, 2025),
(15, 16, '2025-09-08 11:59:18', 2, 3.50, 3.00, 0, NULL, NULL, NULL, -3.50, -3.00, 150.00, -180.00, 49.00, 49.50, -110.00, -110.00, 'fake_game_2_3', 0, 2025),
(17, 18, '2025-09-08 11:59:18', 2, -5.50, -6.00, 0, NULL, NULL, NULL, 5.50, 6.00, -250.00, 210.00, 48.50, 49.00, -110.00, -110.00, 'fake_game_2_4', 0, 2025),
(19, 20, '2025-09-08 11:59:18', 2, 1.00, 0.50, 0, NULL, NULL, NULL, -1.00, -0.50, 100.00, -120.00, 44.50, 45.00, -110.00, -110.00, 'fake_game_2_5', 0, 2025);

-- Week 3 Games
INSERT INTO games (home_team_id, away_team_id, updated_at, week, home_open_spread, home_curr_spread, game_started, home_points, away_points, spread_winner, away_open_spread, away_curr_spread, home_ml_odds, away_ml_odds, game_open_total, game_curr_total, game_over_odds, game_under_odds, api_id, game_completed, nfl_year) VALUES
(21, 22, '2025-09-15 11:59:18', 3, -4.50, -5.00, 0, NULL, NULL, NULL, 4.50, 5.00, -220.00, 180.00, 50.00, 50.50, -110.00, -110.00, 'fake_game_3_1', 0, 2025),
(23, 24, '2025-09-15 11:59:18', 3, -7.50, -8.00, 0, NULL, NULL, NULL, 7.50, 8.00, -350.00, 280.00, 43.50, 44.00, -110.00, -110.00, 'fake_game_3_2', 0, 2025),
(25, 26, '2025-09-15 11:59:18', 3, 2.00, 1.50, 0, NULL, NULL, NULL, -2.00, -1.50, 120.00, -140.00, 47.50, 48.00, -110.00, -110.00, 'fake_game_3_3', 0, 2025),
(27, 28, '2025-09-15 11:59:18', 3, -1.50, -2.00, 0, NULL, NULL, NULL, 1.50, 2.00, 110.00, -130.00, 45.50, 46.00, -110.00, -110.00, 'fake_game_3_4', 0, 2025),
(29, 30, '2025-09-15 11:59:18', 3, 4.00, 3.50, 0, NULL, NULL, NULL, -4.00, -3.50, 160.00, -190.00, 52.00, 52.50, -110.00, -110.00, 'fake_game_3_5', 0, 2025);

-- Insert Sample Leagues for 2025
INSERT INTO leagues (name, type, sport, year, weekly_points, games_select_min, games_select_max) VALUES
('Test League 1', 'league', 'nfl', 2025, 15, 3, 8),
('Test League 2', 'league', 'nfl', 2025, 20, 2, 6),
('Test League 3', 'league', 'nfl', 2025, 12, 4, 10)
ON DUPLICATE KEY UPDATE 
name = VALUES(name), 
type = VALUES(type), 
sport = VALUES(sport), 
year = VALUES(year), 
weekly_points = VALUES(weekly_points), 
games_select_min = VALUES(games_select_min), 
games_select_max = VALUES(games_select_max);

SELECT 'Mock data inserted successfully!' as status;
