package org.example.applicationservice.dto;

import org.example.applicationservice.utils.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationFlowDTO {
    private Long id;
    private String employeeId;
    private LocalDateTime createDate;
    private LocalDateTime lastModificationDate;
    private ApplicationStatus status;
    private String comment;
    private ApplicationType applicationType;

}
