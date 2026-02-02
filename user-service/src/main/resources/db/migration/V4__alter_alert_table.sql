ALTER TABLE `alert` 
  ADD COLUMN `type` VARCHAR(50),
  ADD COLUMN `severity` VARCHAR(20),
  ADD COLUMN `message` TEXT,
  ADD COLUMN `value` DOUBLE,
  ADD COLUMN `threshold` DOUBLE,
  ADD COLUMN `expected_value` DOUBLE,
  ADD COLUMN `average_value` DOUBLE,
  ADD COLUMN `device` VARCHAR(255),
  ADD COLUMN `timestamp` TIMESTAMP,
  ADD COLUMN `acknowledged` TINYINT(1) NOT NULL DEFAULT 0,
  ADD COLUMN `email` VARCHAR(255);
