package org.example.authenticationservice.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "Role")
@Getter
@Setter
public class Role {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "RoleName", nullable = false, unique = true, length = 50)
    private String roleName;

    @Column(name = "RoleDescription", length = 255)
    private String roleDescription;

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
