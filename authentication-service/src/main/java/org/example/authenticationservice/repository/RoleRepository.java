package org.example.authenticationservice.repository;

import lombok.NonNull;
import org.example.authenticationservice.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RoleRepository extends JpaRepository<@NonNull Role, @NonNull Long> {
    Optional<Role> findByRoleName(String roleName);
}
