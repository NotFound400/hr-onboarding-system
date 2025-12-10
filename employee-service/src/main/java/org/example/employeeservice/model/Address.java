package org.example.employeeservice.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class Address {
    private String id = UUID.randomUUID().toString();
    private String addressLine1;
    private String addressLine2;
    private String city;
    private String state;
    private String zipCode;
}
