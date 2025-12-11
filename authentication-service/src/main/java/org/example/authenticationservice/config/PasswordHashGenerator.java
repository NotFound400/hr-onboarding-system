package org.example.authenticationservice.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Generates BCrypt hash for initial HR admin setup.
 * Only runs in dev environment. Remove or disable for production.
 */
@Component
@Profile("dev")
public class PasswordHashGenerator implements CommandLineRunner {

    @Override
    public void run(String... args) {
//        String hash = new BCryptPasswordEncoder().encode("password123");
//        System.out.println("[Setup] HR Admin password hash: " + hash);
    }
}