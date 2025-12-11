package org.example.applicationservice.domain;

import org.example.applicationservice.utils.*;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name="application_work_flow")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationWorkFlow {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDateTime createDate;
    private LocalDateTime lastModificationDate;
    @Enumerated(EnumType.STRING)
    private ApplicationStatus status;
    private String comment;
    @Enumerated(EnumType.STRING)
    private ApplicationType applicationType;
    private String employeeId;
    @OneToMany(mappedBy = "application", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DigitalDocument> documents = new ArrayList<>();



}
