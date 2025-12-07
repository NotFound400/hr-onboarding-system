package org.example.authenticationservice.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "UserRole")
@Getter
@Setter
public class UserRole {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "UserID", nullable = false)
    private User user;

    @ManyToOne(optional = false)
    @JoinColumn(name = "RoleID", nullable = false)
    private Role role;

    @Column(name = "ActiveFlag", nullable = false)
    private boolean activeFlag = true;

    @Column(name = "CreateDate", nullable = false)
    private LocalDateTime createDate;

    @Column(name = "LastModificationDate", nullable = false)
    private LocalDateTime lastModificationDate;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        if (createDate == null) {
            createDate = now;
        }
        if (lastModificationDate == null) {
            lastModificationDate = now;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        lastModificationDate = LocalDateTime.now();
    }
}
