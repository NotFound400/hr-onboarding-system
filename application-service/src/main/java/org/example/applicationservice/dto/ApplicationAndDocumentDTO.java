package org.example.applicationservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.applicationservice.utils.ApplicationStatus;
import org.example.applicationservice.utils.ApplicationType;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationAndDocumentDTO {
    private Long id;
    private String employeeId;
    private LocalDateTime createDate;
    private LocalDateTime lastModificationDate;
    private ApplicationStatus status;
    private String comment;
    private ApplicationType applicationType;
    private List<DigitalDocumentDTO> documents;
}
