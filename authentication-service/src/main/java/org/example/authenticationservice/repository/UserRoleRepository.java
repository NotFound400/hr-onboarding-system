package org.example.authenticationservice.repository;

import lombok.NonNull;
import org.example.authenticationservice.entity.User;
import org.example.authenticationservice.entity.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserRoleRepository extends JpaRepository<@NonNull UserRole, @NonNull Long> {
    List<UserRole> findByUser(User user);
    List<UserRole> findByUserId(Long userId);
}
