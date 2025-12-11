package org.example.authenticationservice.client;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateEmployeeRequest {

    /**
     * User ID from Auth Service (links Employee to User)
     */
    @JsonProperty("userID")
    private Long userID;

    /**
     * Employee email
     */
    private String email;

    /**
     * Assigned house ID
     */
    @JsonProperty("houseID")
    private Long houseID;
}