package org.example.employeeservice.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
@Data
@AllArgsConstructor
@NoArgsConstructor
@Document(collection = "employees")
public class Employee {
    @Id
    private String id;
    private Long userID;
    private String firstName;
    private String lastName;
    private String middleName;
    private String preferredName;
    private String email;
    private String cellPhone;
    private String alternatePhone;
    private String gender;
    private String SSN;
    private LocalDateTime DOB;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private String DriverLicense;
    private LocalDateTime DriverLicenseExpiration;
    private Long houseID;
    private List<Contact> contact;
    private List<Address> address;
    private List<VisaStatus> visaStatus;
    private List<PersonalDocument> personalDocument;
}
