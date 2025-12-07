-- CREATE DATABASE  IF NOT EXISTS `hronboarding` ;
USE `hronboarding`;

DROP TABLE IF EXISTS `application_work_flow`;

CREATE TABLE `application_work_flow` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `create_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `last_modification_date` datetime DEFAULT CURRENT_TIMESTAMP,
  `status` varchar(45) NOT NULL,
  `comment` varchar(200) DEFAULT NULL,
  `application_type` varchar(45) NOT NULL,
  `employeeID` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


LOCK TABLES `application_work_flow` WRITE;
INSERT INTO `application_work_flow` VALUES (1,'2025-12-06 18:46:11','2025-12-06 18:46:11','Open','application pending','STEM OPT',1);
UNLOCK TABLES;


DROP TABLE IF EXISTS `digital_document`;

CREATE TABLE `digital_document` (
  `id` int NOT NULL AUTO_INCREMENT,
  `type` varchar(45) NOT NULL,
  `is_required` tinyint NOT NULL,
  `path` varchar(100) NOT NULL,
  `description` varchar(200) DEFAULT NULL,
  `title` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

LOCK TABLES `digital_document` WRITE;
INSERT INTO `digital_document` VALUES (1,'driver\'s license',1,'https://hr-onboarding-storage.s3.us-east-2.amazonaws.com/placeholder.pdf','upload your driver\'s license','driver\'s license upload');

UNLOCK TABLES;

