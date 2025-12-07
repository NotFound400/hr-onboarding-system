package org.example.authenticationservice.dto;

import lombok.Data;
import java.util.List;

@Data
public class UserDto {

    /**
     * User ID as String (frontend requires string type for all IDs)
     */
    private String id;

    private String username;

    private String email;

    /**
     * Password field (always empty in responses for security)
     */
    private String password = "";

    /**
     * Active status
     */
    private boolean active;

    /**
     * Create date in ISO format
     */
    private String createDate;

    /**
     * Last modification date in ISO format
     */
    private String lastModificationDate;

    /**
     * List of role names
     */
    private List<String> roles;
}