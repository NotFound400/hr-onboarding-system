package org.example.housingservice.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "landlord")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Landlord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "first_name", nullable = false, length = 100)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 100)
    private String lastName;

    @Column(name = "email", length = 100)
    private String email;

    @Column(name = "cell_phone", length = 20)
    private String cellPhone;

    public String getFullName() {
        return firstName + " " + lastName;
    }
}
