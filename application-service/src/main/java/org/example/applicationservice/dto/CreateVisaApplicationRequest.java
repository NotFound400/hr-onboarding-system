package org.example.applicationservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CreateVisaApplicationRequest {
    private String employeeId;
    private String applicationType;  // OPT, OPT_STEM
    private String comment;
}
