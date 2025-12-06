-- Sample data: initial roles & HR account
INSERT INTO `Role` (RoleName, RoleDescription)
VALUES 
  ('EMPLOYEE', 'Default employee role'),
  ('HR', 'Human Resources role with admin permissions');

INSERT INTO `User` (Username, Email, Password, ActiveFlag)
VALUES ('hr_admin', 'hr@example.com', 'Password123!', 1);

INSERT INTO `UserRole` (UserID, RoleID, ActiveFlag)
SELECT u.ID, r.ID, 1
FROM `User` u, `Role` r
WHERE u.Username = 'hr_admin' AND r.RoleName IN ('EMPLOYEE','HR');
