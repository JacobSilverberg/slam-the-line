-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: monorail.proxy.rlwy.net    Database: railway
-- ------------------------------------------------------
-- Server version	9.0.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `games`
--

DROP TABLE IF EXISTS `games`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `games` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `home_team_id` bigint unsigned NOT NULL,
  `away_team_id` bigint unsigned NOT NULL,
  `updated_at` datetime NOT NULL,
  `week` bigint NOT NULL,
  `home_open_spread` decimal(8,2) NOT NULL,
  `home_curr_spread` decimal(8,2) NOT NULL,
  `game_started` tinyint(1) NOT NULL,
  `home_points` int DEFAULT NULL,
  `away_points` int DEFAULT NULL,
  `spread_winner` enum('home','away','push') DEFAULT NULL,
  `away_open_spread` decimal(8,2) NOT NULL,
  `away_curr_spread` decimal(8,2) NOT NULL,
  `home_ml_odds` decimal(8,2) NOT NULL,
  `away_ml_odds` decimal(8,2) NOT NULL,
  `game_open_total` decimal(8,2) NOT NULL,
  `game_curr_total` decimal(8,2) NOT NULL,
  `game_over_odds` decimal(8,2) NOT NULL,
  `game_under_odds` decimal(8,2) NOT NULL,
  `api_id` varchar(255) DEFAULT NULL,
  `game_completed` tinyint(1) DEFAULT '0',
  `game_start_time` datetime DEFAULT NULL,
  `nfl_year` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `api_id` (`api_id`),
  KEY `games_home_team_id_foreign` (`home_team_id`),
  KEY `games_away_team_id_foreign` (`away_team_id`),
  CONSTRAINT `games_away_team_id_foreign` FOREIGN KEY (`away_team_id`) REFERENCES `teams` (`id`),
  CONSTRAINT `games_home_team_id_foreign` FOREIGN KEY (`home_team_id`) REFERENCES `teams` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=819 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `league_statistics`
--

DROP TABLE IF EXISTS `league_statistics`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `league_statistics` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `league_id` bigint unsigned NOT NULL,
  `user_id` bigint unsigned NOT NULL,
  `games_selected` int NOT NULL,
  `average_points` decimal(8,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `league_statistics_league_id_foreign` (`league_id`),
  KEY `league_statistics_user_id_foreign` (`user_id`),
  CONSTRAINT `league_statistics_league_id_foreign` FOREIGN KEY (`league_id`) REFERENCES `leagues` (`id`),
  CONSTRAINT `league_statistics_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `leagues`
--

DROP TABLE IF EXISTS `leagues`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `leagues` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `type` enum('league','pickem','survivor') NOT NULL,
  `sport` enum('nfl','nhl','nba','mlb','mls','pl') NOT NULL,
  `year` year NOT NULL,
  `weekly_points` bigint DEFAULT NULL,
  `games_select_min` bigint DEFAULT NULL,
  `games_select_max` bigint DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=80 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `leagues_have_users`
--

DROP TABLE IF EXISTS `leagues_have_users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `leagues_have_users` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `league_id` bigint unsigned NOT NULL,
  `league_role` enum('commish','cocommish','owner','coowner') NOT NULL,
  `team_name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `leagues_have_users_user_id_foreign` (`user_id`),
  KEY `leagues_have_users_league_id_foreign` (`league_id`),
  CONSTRAINT `leagues_have_users_league_id_foreign` FOREIGN KEY (`league_id`) REFERENCES `leagues` (`id`),
  CONSTRAINT `leagues_have_users_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=593 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `team_statistics`
--

DROP TABLE IF EXISTS `team_statistics`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `team_statistics` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `team_id` bigint unsigned NOT NULL,
  `year` year NOT NULL,
  `spread_losses` int NOT NULL,
  `spread_wins` int NOT NULL,
  `spread_pushes` int NOT NULL,
  `h_under_wins` int NOT NULL,
  `h_fav_wins` int NOT NULL,
  `a_under_wins` int NOT NULL,
  `a_fav_wins` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `team_statistics_team_id_foreign` (`team_id`),
  CONSTRAINT `team_statistics_team_id_foreign` FOREIGN KEY (`team_id`) REFERENCES `teams` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `teams`
--

DROP TABLE IF EXISTS `teams`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `teams` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `city` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `abbr` varchar(10) NOT NULL,
  `full_name` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `role` enum('admin','user') NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `password` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=85 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `users_have_scores`
--

DROP TABLE IF EXISTS `users_have_scores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users_have_scores` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `league_id` bigint unsigned NOT NULL,
  `week` bigint NOT NULL,
  `updated_at` datetime NOT NULL,
  `points` decimal(10,1) DEFAULT NULL,
  `perfect` tinyint(1) NOT NULL,
  `overdog_correct` int NOT NULL,
  `underdog_correct` int NOT NULL,
  `curr_streak` bigint DEFAULT NULL,
  `max_streak` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `users_have_scores_league_id_foreign` (`league_id`),
  KEY `users_have_scores_user_id_foreign` (`user_id`),
  CONSTRAINT `users_have_scores_league_id_foreign` FOREIGN KEY (`league_id`) REFERENCES `leagues` (`id`),
  CONSTRAINT `users_have_scores_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1004 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `users_select_games`
--

DROP TABLE IF EXISTS `users_select_games`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users_select_games` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `league_id` bigint unsigned NOT NULL,
  `game_id` bigint unsigned NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `points` bigint NOT NULL,
  `team_id` bigint unsigned DEFAULT NULL,
  `week` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `users_select_games_user_id_foreign` (`user_id`),
  KEY `users_select_games_game_id_foreign` (`game_id`),
  KEY `users_select_games_league_id_foreign` (`league_id`),
  KEY `team_id` (`team_id`),
  CONSTRAINT `users_select_games_game_id_foreign` FOREIGN KEY (`game_id`) REFERENCES `games` (`id`),
  CONSTRAINT `users_select_games_ibfk_1` FOREIGN KEY (`team_id`) REFERENCES `teams` (`id`),
  CONSTRAINT `users_select_games_league_id_foreign` FOREIGN KEY (`league_id`) REFERENCES `leagues` (`id`),
  CONSTRAINT `users_select_games_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5013 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-09-09 18:52:20
