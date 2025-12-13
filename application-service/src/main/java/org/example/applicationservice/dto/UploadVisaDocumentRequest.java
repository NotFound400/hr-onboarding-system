package org.example.applicationservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UploadVisaDocumentRequest {
    private String documentPath;    // S3 URL of the uploaded document
    private String title;
    private String description;
    private String documentType;    // I-20, OPT_STEM_RECEIPT, OPT_STEM_EAD
}
