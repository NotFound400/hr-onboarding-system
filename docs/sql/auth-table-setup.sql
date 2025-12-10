-- HR Onboarding System - Database Setup Script
-- Run this script to initialize the authentication database

USE hronboarding;

-- Clear existing data
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE RegistrationToken;
TRUNCATE TABLE UserRole;
TRUNCATE TABLE User;
TRUNCATE TABLE Role;
SET FOREIGN_KEY_CHECKS = 1;

-- Insert roles
INSERT INTO Role (RoleName, RoleDescription, CreateDate, LastModificationDate) VALUES
('Employee', 'Default employee role', NOW(), NOW()),
('HR', 'Human Resources role with admin permissions', NOW(), NOW());

-- Insert HR admin (password: password123)
-- Generate hash by running app with dev profile and check console
INSERT INTO User (Username, Email, Password, ActiveFlag, CreateDate, LastModificationDate)
VALUES ('hr_admin', 'hr@example.com', '<PASTE_HASH_HERE>', 1, NOW(), NOW());

-- Assign roles to HR admin
INSERT INTO UserRole (UserID, RoleID, ActiveFlag, CreateDate, LastModificationDate) VALUES
(1, 1, 1, NOW(), NOW()),
(1, 2, 1, NOW(), NOW());