package org.example.employeeservice.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PersonalDocument {
    private String id = UUID.randomUUID().toString();
    private String Path;
    private String Title;
    private String Comment;
    private Date CreateDate;

}
