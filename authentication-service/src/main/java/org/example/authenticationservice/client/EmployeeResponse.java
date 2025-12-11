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
public class EmployeeResponse {

    private String id;  // MongoDB ObjectId

    @JsonProperty("userID")
    private Long userID;

    private String email;

    @JsonProperty("houseID")
    private Long houseID;

    private String firstName;
    private String lastName;
    private String preferredName;
}