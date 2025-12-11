package org.example.applicationservice.dto;

import org.example.applicationservice.utils.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateApplicationStatusDTO {
//    private Long id;
    private ApplicationStatus status;
    private String comment;
}
