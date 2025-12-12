package org.example.applicationservice.utils;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;
import org.springframework.security.core.Authentication;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

@Component
public class SecurityUtils {

    public Long getCurrentUserId() {
        Jwt jwt = getJwt();
        return jwt.getClaim("userId");
    }

    public String getCurrentUsername() {
        return getJwt().getSubject();
    }

    public List<String> getCurrentUserRoles() {
        Jwt jwt = getJwt();
        // getClaimAsStringList returns List<String> or empty list if null
        return jwt.getClaimAsStringList("roles");
    }

    public List<String> parseRolesHeader(String rolesHeader) {
        if (rolesHeader == null || rolesHeader.isBlank()) {
            return Collections.emptyList();
        }

        return Arrays.stream(rolesHeader.split(","))
                .map(String::trim)      // remove extra spaces
                .filter(s -> !s.isEmpty())
                .toList();              // returns immutable list
    }

    public Jwt getJwt() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth == null || !(auth.getPrincipal() instanceof Jwt jwt)) {
            throw new IllegalStateException("No JWT available in SecurityContext");
        }
        return jwt;
    }
}

