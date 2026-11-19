-- Survive the Horde - MySQL schema
-- Run once, e.g.:  mysql -u root -p < schema.sql
-- (api.php also creates the table automatically if it is missing,
--  but the database itself must exist.)

CREATE DATABASE IF NOT EXISTS survive_the_horde
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE survive_the_horde;

CREATE TABLE IF NOT EXISTS scores (
  id               INT UNSIGNED      NOT NULL AUTO_INCREMENT,
  run_id           VARCHAR(40)       NOT NULL,            -- client-generated, prevents duplicate saves
  player_name      VARCHAR(16)       NOT NULL,
  champion         VARCHAR(16)       NOT NULL,            -- lyra | kael | ignis | vespera
  survival_seconds INT UNSIGNED      NOT NULL,            -- score: time survived
  kills            INT UNSIGNED      NOT NULL,            -- score: enemies defeated
  `level`          SMALLINT UNSIGNED NOT NULL DEFAULT 1,
  created_at       TIMESTAMP         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_run (run_id),
  KEY idx_player (player_name),
  KEY idx_kills (kills, survival_seconds),
  KEY idx_time (survival_seconds, kills)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Handy queries
-- Top 10 by kills:   SELECT player_name, kills, survival_seconds FROM scores ORDER BY kills DESC, survival_seconds DESC LIMIT 10;
-- Top 10 by time:    SELECT player_name, survival_seconds, kills FROM scores ORDER BY survival_seconds DESC, kills DESC LIMIT 10;
