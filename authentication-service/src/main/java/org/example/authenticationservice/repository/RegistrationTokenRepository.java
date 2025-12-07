package org.example.authenticationservice.repository;

import org.example.authenticationservice.entity.RegistrationToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.Optional;

public interface RegistrationTokenRepository extends JpaRepository<RegistrationToken, Long> {
    Optional<RegistrationToken> findByToken(String token);
    Optional<RegistrationToken> findByTokenAndEmail(String token, String email);

    // Optional cleanup helper to purge old tokens
    long deleteByExpirationDateBefore(LocalDateTime time);
}
