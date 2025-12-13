package org.example.applicationservice.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "digital_document")
@Data
@ToString(exclude = "application")
@EqualsAndHashCode(exclude = "documents")
@NoArgsConstructor
@AllArgsConstructor
public class DigitalDocument {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String type;
    private Boolean isRequired;
    private String path;
    private String description;
    private String title;
    @ManyToOne
    @JoinColumn(name = "application_id")
    @JsonIgnore
    private ApplicationWorkFlow application;

}
