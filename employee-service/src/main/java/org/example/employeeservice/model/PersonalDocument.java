package org.example.employeeservice.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Date;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PersonalDocument {
    private String id = UUID.randomUUID().toString();
    private String path;
    private String title;
    private String comment;
    private LocalDateTime createDate;

}
