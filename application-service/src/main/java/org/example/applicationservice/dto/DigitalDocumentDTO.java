package org.example.applicationservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DigitalDocumentDTO {
    private Long id;
    private String type;
    private Boolean isRequired;
    private String path;
    private String description;
    private String title;
    private Long applicationId;
}
