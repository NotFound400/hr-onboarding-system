USE hronboarding;

CREATE TABLE `Role` (
    `ID` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `RoleName` VARCHAR(50) NOT NULL,
    `RoleDescription` VARCHAR(255) NULL,
    `CreateDate` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `LastModificationDate` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `PK_Role` PRIMARY KEY (`ID`),
    CONSTRAINT `UQ_Role_RoleName` UNIQUE (`RoleName`)
) ENGINE=InnoDB;

CREATE TABLE `User` (
    `ID` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `Username` VARCHAR(50) NOT NULL,
    `Email` VARCHAR(100) NOT NULL,
    `Password` VARCHAR(255) NOT NULL,
    `ActiveFlag` TINYINT(1) NOT NULL DEFAULT 1,             -- 1 = active, 0 = disabled
    `CreateDate` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `LastModificationDate` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `PK_User` PRIMARY KEY (`ID`),
    CONSTRAINT `UQ_User_Username` UNIQUE (`Username`),
    CONSTRAINT `UQ_User_Email` UNIQUE (`Email`)
) ENGINE=InnoDB;

CREATE TABLE `UserRole` (
    `ID` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `UserID` BIGINT UNSIGNED NOT NULL,
    `RoleID` BIGINT UNSIGNED NOT NULL,
    `ActiveFlag` TINYINT(1) NOT NULL DEFAULT 1,
    `CreateDate` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `LastModificationDate` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `PK_UserRole` PRIMARY KEY (`ID`),
    CONSTRAINT `FK_UserRole_User` FOREIGN KEY (`UserID`)
        REFERENCES `User`(`ID`)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT `FK_UserRole_Role` FOREIGN KEY (`RoleID`)
        REFERENCES `Role`(`ID`)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    -- prevent duplicate (User, Role) combinations
    CONSTRAINT `UQ_UserRole_User_Role` UNIQUE (`UserID`, `RoleID`)
) ENGINE=InnoDB;

-- RegistrationToken table (UPDATED with HouseId)
CREATE TABLE `RegistrationToken` (
    `ID` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `Token` VARCHAR(64) NOT NULL,
    `Email` VARCHAR(100) NOT NULL,
    `ExpirationDate` DATETIME NOT NULL,
    `CreateBy` BIGINT UNSIGNED NOT NULL,
    `HouseId` BIGINT NULL COMMENT 'House ID assigned to employee during token generation',

    CONSTRAINT `PK_RegistrationToken` PRIMARY KEY (`ID`),

    -- each token string must be unique
    CONSTRAINT `UQ_RegistrationToken_Token` UNIQUE (`Token`),

    -- prevent duplicate token for same email
    CONSTRAINT `UQ_RegistrationToken_Email_Token` UNIQUE (`Email`, `Token`),

    -- who created the token: FK to User(ID)
    CONSTRAINT `FK_RegistrationToken_CreateBy_User` FOREIGN KEY (`CreateBy`)
        REFERENCES `User`(`ID`)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    -- house assignment: FK to house(id)
    CONSTRAINT `FK_RegistrationToken_House` FOREIGN KEY (`HouseId`)
        REFERENCES `house`(`id`)
        ON DELETE SET NULL
        ON UPDATE CASCADE,

    -- index for faster house lookups
    INDEX `idx_RegistrationToken_HouseId` (`HouseId`)
) ENGINE=InnoDB;