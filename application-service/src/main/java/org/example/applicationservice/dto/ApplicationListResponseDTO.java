package org.example.applicationservice.dto;

import org.example.applicationservice.utils.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationListResponseDTO {
    private Long id;
    private String employeeId;
    private ApplicationStatus status;
    private String comment;
    private ApplicationType applicationType;
}
