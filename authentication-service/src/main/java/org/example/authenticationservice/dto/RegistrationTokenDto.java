package org.example.authenticationservice.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class RegistrationTokenDto {

    /**
     * Token ID as String (frontend requires string type)
     */
    private String id;

    /**
     * Token string
     */
    private String token;

    /**
     * Target email
     */
    private String email;

    /**
     * Expiration date
     */
    private LocalDateTime expirationDate;

    /**
     * Creator user ID as String
     */
    private String createdByUserId;

    /**
     * Alias for createdByUserId to match frontend "createBy" field
     */
    private String createBy;

    /**
     * Create date in ISO format
     */
    private String createDate;
}