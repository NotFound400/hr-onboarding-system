package org.example.authenticationservice.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "RegistrationToken")
@Getter
@Setter
public class RegistrationToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Long id;

    @Column(name = "Token", nullable = false, unique = true, length = 64)
    private String token;

    @Column(name = "Email", nullable = false, length = 100)
    private String email;

    @Column(name = "ExpirationDate", nullable = false)
    private LocalDateTime expirationDate;

    @ManyToOne(optional = false)
    @JoinColumn(name = "CreateBy", nullable = false)
    private User createdBy;
}
