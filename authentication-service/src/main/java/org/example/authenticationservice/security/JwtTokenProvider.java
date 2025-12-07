package org.example.authenticationservice.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;
import java.util.List;

@Component
public class JwtTokenProvider {

    @Value("${security.jwt.secret}")
    private String secret;

    @Value("${security.jwt.expiration-ms}")
    private long validityInMs;

    private Key signingKey;

    @PostConstruct
    public void init() {
        /*
         * Here we treat `security.jwt.secret` as a normal text string.
         * Make sure it's long enough (at least 32 characters) to meet HS256 requirements.
         */
        this.signingKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    /**
     * Create a JWT token with:
     * - subject = username
     * - claim "roles" = list of roles
     */
    public String createToken(String username, List<String> roles) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + validityInMs);

        return Jwts.builder()
                .setSubject(username)
                .claim("roles", roles)
                .setIssuedAt(now)
                .setExpiration(expiry)
                .signWith(signingKey, SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * Extract username from JWT token.
     */
    public String getUsernameFromToken(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(signingKey)
                .build()
                .parseClaimsJws(token)
                .getBody();

        return claims.getSubject();
    }

    public long getValidityInMs() {
        return validityInMs;
    }
}
