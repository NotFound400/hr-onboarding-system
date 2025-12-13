package org.example.applicationservice.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeDTO {
    private String id;

    @JsonProperty("userID")  // Match the field name in Employee model
    private Long userId;

    private Long userID;
    private String firstName;
    private String lastName;
    private String middleName;
    private String preferredName;
    private String email;
    private String cellPhone;
    private String gender;
    private LocalDateTime DOB;
    private LocalDateTime startDate;
    private Long houseID;

    public String getDisplayName() {
        if (preferredName != null && !preferredName.isBlank()) {
            return preferredName;
        }
        return firstName != null ? firstName : "Employee";
    }

    public String getFullName() {
        StringBuilder name = new StringBuilder();
        if (firstName != null) name.append(firstName);
        if (middleName != null && !middleName.isBlank()) name.append(" ").append(middleName);
        if (lastName != null) name.append(" ").append(lastName);
        return name.toString().trim();
    }
}