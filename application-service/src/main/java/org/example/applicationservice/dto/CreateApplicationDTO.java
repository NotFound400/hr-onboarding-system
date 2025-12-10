package org.example.applicationservice.dto;

import com.example.common.ApplicationType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateApplicationDTO {
    private String employeeId;
    private ApplicationType applicationType;
    private String comment;
}
