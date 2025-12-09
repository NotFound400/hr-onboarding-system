package org.example.applicationservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UploadDocumentRequest {
    private String type;
    private String title;
    private String description;
    private Long applicationId;
}

