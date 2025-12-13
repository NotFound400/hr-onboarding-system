package org.example.applicationservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class VisaDocumentDTO {
    private Long id;
    private String type;     // I-20, OPT_STEM_RECEIPT, OPT_STEM_EAD
    private String title;
    private String path;     // S3 URL
}
